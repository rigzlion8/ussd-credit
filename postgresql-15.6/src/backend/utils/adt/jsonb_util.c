/*-------------------------------------------------------------------------
 *
 * jsonb_util.c
 *	  converting between Jsonb and JsonbValues, and iterating.
 *
 * Copyright (c) 2014-2022, PostgreSQL Global Development Group
 *
 *
 * IDENTIFICATION
 *	  src/backend/utils/adt/jsonb_util.c
 *
 *-------------------------------------------------------------------------
 */
#include "postgres.h"

#include "catalog/pg_collation.h"
#include "catalog/pg_type.h"
#include "common/hashfn.h"
#include "common/jsonapi.h"
#include "miscadmin.h"
#include "port/pg_bitutils.h"
#include "utils/builtins.h"
#include "utils/datetime.h"
#include "utils/json.h"
#include "utils/jsonb.h"
#include "utils/memutils.h"
#include "utils/varlena.h"

/*
 * Maximum number of elements in an array (or key/value pairs in an object).
 * This is limited by two things: the size of the JEntry array must fit
 * in MaxAllocSize, and the number of elements (or pairs) must fit in the bits
 * reserved for that in the JsonbContainer.header field.
 *
 * (The total size of an array's or object's elements is also limited by
 * JENTRY_OFFLENMASK, but we're not concerned about that here.)
 */
#define JSONB_MAX_ELEMS (Min(MaxAllocSize / sizeof(JsonbValue), JB_CMASK))
#define JSONB_MAX_PAIRS (Min(MaxAllocSize / sizeof(JsonbPair), JB_CMASK))

static void fillJsonbValue(JsonbContainer *container, int index,
						   char *base_addr, uint32 offset,
						   JsonbValue *result);
static bool equalsJsonbScalarValue(JsonbValue *a, JsonbValue *b);
static int	compareJsonbScalarValue(JsonbValue *a, JsonbValue *b);
static Jsonb *convertToJsonb(JsonbValue *val);
static void convertJsonbValue(StringInfo buffer, JEntry *header, JsonbValue *val, int level);
static void convertJsonbArray(StringInfo buffer, JEntry *header, JsonbValue *val, int level);
static void convertJsonbObject(StringInfo buffer, JEntry *header, JsonbValue *val, int level);
static void convertJsonbScalar(StringInfo buffer, JEntry *header, JsonbValue *scalarVal);

static int	reserveFromBuffer(StringInfo buffer, int len);
static void appendToBuffer(StringInfo buffer, const char *data, int len);
static void copyToBuffer(StringInfo buffer, int offset, const char *data, int len);
static short padBufferToInt(StringInfo buffer);

static JsonbIterator *iteratorFromContainer(JsonbContainer *container, JsonbIterator *parent);
static JsonbIterator *freeAndGetParent(JsonbIterator *it);
static JsonbParseState *pushState(JsonbParseState **pstate);
static void appendKey(JsonbParseState *pstate, JsonbValue *scalarVal);
static void appendValue(JsonbParseState *pstate, JsonbValue *scalarVal);
static void appendElement(JsonbParseState *pstate, JsonbValue *scalarVal);
static int	lengthCompareJsonbStringValue(const void *a, const void *b);
static int	lengthCompareJsonbString(const char *val1, int len1,
									 const char *val2, int len2);
static int	lengthCompareJsonbPair(const void *a, const void *b, void *arg);
static void uniqueifyJsonbObject(JsonbValue *object);
static JsonbValue *pushJsonbValueScalar(JsonbParseState **pstate,
										JsonbIteratorToken seq,
										JsonbValue *scalarVal);

void
JsonbToJsonbValue(Jsonb *jsonb, JsonbValue *val)
{
	val->type = jbvBinary;
	val->val.binary.data = &jsonb->root;
	val->val.binary.len = VARSIZE(jsonb) - VARHDRSZ;
}

/*
 * Turn an in-memory JsonbValue into a Jsonb for on-disk storage.
 *
 * Generally we find it more convenient to directly iterate through the Jsonb
 * representation and only really convert nested scalar values.
 * JsonbIteratorNext() does this, so that clients of the iteration code don't
 * have to directly deal with the binary representation (JsonbDeepContains() is
 * a notable exception, although all exceptions are internal to this module).
 * In general, functions that accept a JsonbValue argument are concerned with
 * the manipulation of scalar values, or simple containers of scalar values,
 * where it would be inconvenient to deal with a great amount of other state.
 */
Jsonb *
JsonbValueToJsonb(JsonbValue *val)
{
	Jsonb	   *out;

	if (IsAJsonbScalar(val))
	{
		/* Scalar value */
		JsonbParseState *pstate = NULL;
		JsonbValue *res;
		JsonbValue	scalarArray;

		scalarArray.type = jbvArray;
		scalarArray.val.array.rawScalar = true;
		scalarArray.val.array.nElems = 1;

		pushJsonbValue(&pstate, WJB_BEGIN_ARRAY, &scalarArray);
		pushJsonbValue(&pstate, WJB_ELEM, val);
		res = pushJsonbValue(&pstate, WJB_END_ARRAY, NULL);

		out = convertToJsonb(res);
	}
	else if (val->type == jbvObject || val->type == jbvArray)
	{
		out = convertToJsonb(val);
	}
	else
	{
		Assert(val->type == jbvBinary);
		out = palloc(VARHDRSZ + val->val.binary.len);
		SET_VARSIZE(out, VARHDRSZ + val->val.binary.len);
		memcpy(VARDATA(out), val->val.binary.data, val->val.binary.len);
	}

	return out;
}

/*
 * Get the offset of the variable-length portion of a Jsonb node within
 * the variable-length-data part of its container.  The node is identified
 * by index within the container's JEntry array.
 */
uint32
getJsonbOffset(const JsonbContainer *jc, int index)
{
	uint32		offset = 0;
	int			i;

	/*
	 * Start offset of this entry is equal to the end offset of the previous
	 * entry.  Walk backwards to the most recent entry stored as an end
	 * offset, returning that offset plus any lengths in between.
	 */
	for (i = index - 1; i >= 0; i--)
	{
		offset += JBE_OFFLENFLD(jc->children[i]);
		if (JBE_HAS_OFF(jc->children[i]))
			break;
	}

	return offset;
}

/*
 * Get the length of the variable-length portion of a Jsonb node.
 * The node is identified by index within the container's JEntry array.
 */
uint32
getJsonbLength(const JsonbContainer *jc, int index)
{
	uint32		off;
	uint32		len;

	/*
	 * If the length is stored directly in the JEntry, just return it.
	 * Otherwise, get the begin offset of the entry, and subtract that from
	 * the stored end+1 offset.
	 */
	if (JBE_HAS_OFF(jc->children[index]))
	{
		off = getJsonbOffset(jc, index);
		len = JBE_OFFLENFLD(jc->children[index]) - off;
	}
	else
		len = JBE_OFFLENFLD(jc->children[index]);

	return len;
}

/*
 * BT comparator worker function.  Returns an integer less than, equal to, or
 * greater than zero, indicating whether a is less than, equal to, or greater
 * than b.  Consistent with the requirements for a B-Tree operator class
 *
 * Strings are compared lexically, in contrast with other places where we use a
 * much simpler comparator logic for searching through Strings.  Since this is
 * called from B-Tree support function 1, we're careful about not leaking
 * memory here.
 */
int
compareJsonbContainers(JsonbContainer *a, JsonbContainer *b)
{
	JsonbIterator *ita,
			   *itb;
	int			res = 0;

	ita = JsonbIteratorInit(a);
	itb = JsonbIteratorInit(b);

	do
	{
		JsonbValue	va,
					vb;
		JsonbIteratorToken ra,
					rb;

		ra = JsonbIteratorNext(&ita, &va, false);
		rb = JsonbIteratorNext(&itb, &vb, false);

		if (ra == rb)
		{
			if (ra == WJB_DONE)
			{
				/* Decisively equal */
				break;
			}

			if (ra == WJB_END_ARRAY || ra == WJB_END_OBJECT)
			{
				/*
				 * There is no array or object to compare at this stage of
				 * processing.  jbvArray/jbvObject values are compared
				 * initially, at the WJB_BEGIN_ARRAY and WJB_BEGIN_OBJECT
				 * tokens.
				 */
				continue;
			}

			if (va.type == vb.type)
			{
				switch (va.type)
				{
					case jbvString:
					case jbvNull:
					case jbvNumeric:
					case jbvBool:
						res = compareJsonbScalarValue(&va, &vb);
						break;
					case jbvArray:

						/*
						 * This could be a "raw scalar" pseudo array.  That's
						 * a special case here though, since we still want the
						 * general type-based comparisons to apply, and as far
						 * as we're concerned a pseudo array is just a scalar.
						 */
						if (va.val.array.rawScalar != vb.val.array.rawScalar)
							res = (va.val.array.rawScalar) ? -1 : 1;
						if (va.val.array.nElems != vb.val.array.nElems)
							res = (va.val.array.nElems > vb.val.array.nElems) ? 1 : -1;
						break;
					case jbvObject:
						if (va.val.object.nPairs != vb.val.object.nPairs)
							res = (va.val.object.nPairs > vb.val.object.nPairs) ? 1 : -1;
						break;
					case jbvBinary:
						elog(ERROR, "unexpected jbvBinary value");
						break;
					case jbvDatetime:
						elog(ERROR, "unexpected jbvDatetime value");
						break;
				}
			}
			else
			{
				/* Type-defined order */
				res = (va.type > vb.type) ? 1 : -1;
			}
		}
		else
		{
			/*
			 * It's safe to assume that the types differed, and that the va
			 * and vb values passed were set.
			 *
			 * If the two values were of the same container type, then there'd
			 * have been a chance to observe the variation in the number of
			 * elements/pairs (when processing WJB_BEGIN_OBJECT, say). They're
			 * either two heterogeneously-typed containers, or a container and
			 * some scalar type.
			 *
			 * We don't have to consider the WJB_END_ARRAY and WJB_END_OBJECT
			 * cases here, because we would have seen the corresponding
			 * WJB_BEGIN_ARRAY and WJB_BEGIN_OBJECT tokens first, and
			 * concluded that they don't match.
			 */
			Assert(ra != WJB_END_ARRAY && ra != WJB_END_OBJECT);
			Assert(rb != WJB_END_ARRAY && rb != WJB_END_OBJECT);

			Assert(va.type != vb.type);
			Assert(va.type != jbvBinary);
			Assert(vb.type != jbvBinary);
			/* Type-defined order */
			res = (va.type > vb.type) ? 1 : -1;
		}
	}
	while (res == 0);

	while (ita != NULL)
	{
		JsonbIterator *i = ita->parent;

		pfree(ita);
		ita = i;
	}
	while (itb != NULL)
	{
		JsonbIterator *i = itb->parent;

		pfree(itb);
		itb = i;
	}

	return res;
}

/*
 * Find value in object (i.e. the "value" part of some key/value pair in an
 * object), or find a matching element if we're looking through an array.  Do
 * so on the basis of equality of the object keys only, or alternatively
 * element values only, with a caller-supplied value "key".  The "flags"
 * argument allows the caller to specify which container types are of interest.
 *
 * This exported utility function exists to facilitate various cases concerned
 * with "containment".  If asked to look through an object, the caller had
 * better pass a Jsonb String, because their keys can only be strings.
 * Otherwise, for an array, any type of JsonbValue will do.
 *
 * In order to proceed with the search, it is necessary for callers to have
 * both specified an interest in exactly one particular container type with an
 * appropriate flag, as well as having the pointed-to Jsonb container be of
 * one of those same container types at the top level. (Actually, we just do
 * whichever makes sense to save callers the trouble of figuring it out - at
 * most one can make sense, because the container either points to an array
 * (possibly a "raw scalar" pseudo array) or an object.)
 *
 * Note that we can return a jbvBinary JsonbValue if this is called on an
 * object, but we never do so on an array.  If the caller asks to look through
 * a container type that is not of the type pointed to by the container,
 * immediately fall through and return NULL.  If we cannot find the value,
 * return NULL.  Otherwise, return palloc()'d copy of value.
 */
JsonbValue *
findJsonbValueFromContainer(JsonbContainer *container, uint32 flags,
							JsonbValue *key)
{
	JEntry	   *children = container->children;
	int			count = JsonContainerSize(container);

	Assert((flags & ~(JB_FARRAY | JB_FOBJECT)) == 0);

	/* Quick out without a palloc cycle if object/array is empty */
	if (count <= 0)
		return NULL;

	if ((flags & JB_FARRAY) && JsonContainerIsArray(container))
	{
		JsonbValue *result = palloc(sizeof(JsonbValue));
		char	   *base_addr = (char *) (children + count);
		uint32		offset = 0;
		int			i;

		for (i = 0; i < count; i++)
		{
			fillJsonbValue(container, i, base_addr, offset, result);

			if (key->type == result->type)
			{
				if (equalsJsonbScalarValue(key, result))
					return result;
			}

			JBE_ADVANCE_OFFSET(offset, children[i]);
		}

		pfree(result);
	}
	else if ((flags & JB_FOBJECT) && JsonContainerIsObject(container))
	{
		/* Object key passed by caller must be a string */
		Assert(key->type == jbvString);

		return getKeyJsonValueFromContainer(container, key->val.string.val,
											key->val.string.len, NULL);
	}

	/* Not found */
	return NULL;
}

/*
 * Find value by key in Jsonb object and fetch it into 'res', which is also
 * returned.
 *
 * 'res' can be passed in as NULL, in which case it's newly palloc'ed here.
 */
JsonbValue *
getKeyJsonValueFromContainer(JsonbContainer *container,
							 const char *keyVal, int keyLen, JsonbValue *res)
{
	JEntry	   *children = container->children;
	int			count = JsonContainerSize(container);
	char	   *baseAddr;
	uint32		stopLow,
				stopHigh;

	Assert(JsonContainerIsObject(container));

	/* Quick out without a palloc cycle if object is empty */
	if (count <= 0)
		return NULL;

	/*
	 * Binary search the container. Since we know this is an object, account
	 * for *Pairs* of Jentrys
	 */
	baseAddr = (char *) (children + count * 2);
	stopLow = 0;
	stopHigh = count;
	while (stopLow < stopHigh)
	{
		uint32		stopMiddle;
		int			difference;
		const char *candidateVal;
		int			candidateLen;

		stopMiddle = stopLow + (stopHigh - stopLow) / 2;

		candidateVal = baseAddr + getJsonbOffset(container, stopMiddle);
		candidateLen = getJsonbLength(container, stopMiddle);

		difference = lengthCompareJsonbString(candidateVal, candidateLen,
											  keyVal, keyLen);

		if (difference == 0)
		{
			/* Found our key, return corresponding value */
			int			index = stopMiddle + count;

			if (!res)
				res = palloc(sizeof(JsonbValue));

			fillJsonbValue(container, index, baseAddr,
						   getJsonbOffset(container, index),
						   res);

			return res;
		}
		else
		{
			if (difference < 0)
				stopLow = stopMiddle + 1;
			else
				stopHigh = stopMiddle;
		}
	}

	/* Not found */
	return NULL;
}

/*
 * Get i-th value of a Jsonb array.
 *
 * Returns palloc()'d copy of the value, or NULL if it does not exist.
 */
JsonbValue *
getIthJsonbValueFromContainer(JsonbContainer *container, uint32 i)
{
	JsonbValue *result;
	char	   *base_addr;
	uint32		nelements;

	if (!JsonContainerIsArray(container))
		elog(ERROR, "not a jsonb array");

	nelements = JsonContainerSize(container);
	base_addr = (char *) &container->children[nelements];

	if (i >= nelements)
		return NULL;

	result = palloc(sizeof(JsonbValue));

	fillJsonbValue(container, i, base_addr,
				   getJsonbOffset(container, i),
				   result);

	return result;
}

/*
 * A helper function to fill in a JsonbValue to represent an element of an
 * array, or a key or value of an object.
 *
 * The node's JEntry is at container->children[index], and its variable-length
 * data is at base_addr + offset.  We make the caller determine the offset
 * since in many cases the caller can amortize that work across multiple
 * children.  When it can't, it can just call getJsonbOffset().
 *
 * A nested array or object will be returned as jbvBinary, ie. it won't be
 * expanded.
 */
static void
fillJsonbValue(JsonbContainer *container, int index,
			   char *base_addr, uint32 offset,
			   JsonbValue *result)
{
	JEntry		entry = container->children[index];

	if (JBE_ISNULL(entry))
	{
		result->type = jbvNull;
	}
	else if (JBE_ISSTRING(entry))
	{
		result->type = jbvString;
		result->val.string.val = base_addr + offset;
		result->val.string.len = getJsonbLength(container, index);
		Assert(result->val.string.len >= 0);
	}
	else if (JBE_ISNUMERIC(entry))
	{
		result->type = jbvNumeric;
		result->val.numeric = (Numeric) (base_addr + INTALIGN(offset));
	}
	else if (JBE_ISBOOL_TRUE(entry))
	{
		result->type = jbvBool;
		result->val.boolean = true;
	}
	else if (JBE_ISBOOL_FALSE(entry))
	{
		result->type = jbvBool;
		result->val.boolean = false;
	}
	else
	{
		Assert(JBE_ISCONTAINER(entry));
		result->type = jbvBinary;
		/* Remove alignment padding from data pointer and length */
		result->val.binary.data = (JsonbContainer *) (base_addr + INTALIGN(offset));
		result->val.binary.len = getJsonbLength(container, index) -
			(INTALIGN(offset) - offset);
	}
}

/*
 * Push JsonbValue into JsonbParseState.
 *
 * Used when parsing JSON tokens to form Jsonb, or when converting an in-memory
 * JsonbValue to a Jsonb.
 *
 * Initial state of *JsonbParseState is NULL, since it'll be allocated here
 * originally (caller will get JsonbParseState back by reference).
 *
 * Only sequential tokens pertaining to non-container types should pass a
 * JsonbValue.  There is one exception -- WJB_BEGIN_ARRAY callers may pass a
 * "raw scalar" pseudo array to append it - the actual scalar should be passed
 * next and it will be added as the only member of the array.
 *
 * Values of type jbvBinary, which are rolled up arrays and objects,
 * are unpacked before being added to the result.
 */
JsonbValue *
pushJsonbValue(JsonbParseState **pstate, JsonbIteratorToken seq,
			   JsonbValue *jbval)
{
	JsonbIterator *it;
	JsonbValue *res = NULL;
	JsonbValue	v;
	JsonbIteratorToken tok;
	int			i;

	if (jbval && (seq == WJB_ELEM || seq == WJB_VALUE) && jbval->type == jbvObject)
	{
		pushJsonbValue(pstate, WJB_BEGIN_OBJECT, NULL);
		for (i = 0; i < jbval->val.object.nPairs; i++)
		{
			pushJsonbValue(pstate, WJB_KEY, &jbval->val.object.pairs[i].key);
			pushJsonbValue(pstate, WJB_VALUE, &jbval->val.object.pairs[i].value);
		}

		return pushJsonbValue(pstate, WJB