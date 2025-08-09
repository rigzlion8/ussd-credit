def normalize_msisdn(phone: str) -> str:
    phone = str(phone or "").strip()
    if not phone:
        return phone
    # Convert numbers like 0712... or +254712... to 254712...
    if phone.startswith("+"):
        phone = phone[1:]
    if phone.startswith("0") and len(phone) == 10:
        return "254" + phone[1:]
    return phone


