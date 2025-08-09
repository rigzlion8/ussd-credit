# Flask API for USSD Auto-Credit

## Quick start

1. Create and activate a virtualenv
```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies
```bash
pip install -r server/requirements.txt
```

3. Configure environment
```bash
cp server/.env.example server/.env
# edit server/.env with your DATABASE_URL and secrets
```

4. Initialize DB and seed from frontend `db.json`
```bash
python -m server.seed
```

5. Run API
```bash
python -m server.wsgi
```

API base URL: http://localhost:8000

### Endpoints (initial)
- GET/POST `/api/influencers`
- GET/POST `/api/subscribers`
- GET/POST `/api/users`
- POST `/api/auth/otp/request`
- POST `/api/auth/otp/verify`
- POST `/webhooks/ussd` (Africa's Talking)
- POST `/webhooks/mpesa` (Daraja callbacks)


