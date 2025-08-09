from marshmallow import Schema, fields


class InfluencerSchema(Schema):
    id = fields.Int()
    phone = fields.Str(allow_none=True)
    name = fields.Str()
    image_url = fields.Str(allow_none=True)
    ussd_shortcode = fields.Str(allow_none=True)
    received = fields.Int()


class SubscriptionSchema(Schema):
    id = fields.Int()
    fan_phone = fields.Str(allow_none=True)
    influencer_id = fields.Int()
    amount = fields.Int()
    frequency = fields.Str()
    is_active = fields.Bool()


class UserSchema(Schema):
    id = fields.Int()
    phone = fields.Str()
    pin = fields.Str(allow_none=True)
    balance = fields.Int(allow_none=True)


