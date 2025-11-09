# Vanna AI Service

FastAPI service that uses Groq to generate SQL queries from natural language questions.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
export GROQ_API_KEY="your-groq-api-key"
export CORS_ORIGIN="http://localhost:3000"
```

## Running

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Or with Docker:

```bash
docker build -t vanna-service .
docker run -p 8000:8000 --env-file .env vanna-service
```

## API

- `GET /health` - Health check
- `POST /query` - Generate and execute SQL from natural language question

### Query Request

```json
{
  "question": "What's the total spend in the last 90 days?"
}
```

### Query Response

```json
{
  "sql": "SELECT SUM(total) FROM Invoice WHERE invoiceDate >= ...",
  "columns": ["sum"],
  "rows": [[123456.78]]
}
```

