from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import psycopg
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import re

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGIN", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

DB_URL = os.environ.get("DATABASE_URL", "").replace("postgresql+psycopg://", "postgresql://")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY not set. Chat functionality will not work.")

# Initialize Groq client
llm = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Schema information for the database
SCHEMA_INFO = """
Database schema:
- Vendor: id, name, taxId, email, city, country, categoryId
- Customer: id, name, email, city, country
- Category: id, name
- Invoice: id, invoiceNumber, vendorId, customerId, categoryId, invoiceDate, dueDate, status, currency, subtotal, tax, discount, total, paidAmount
- InvoiceLineItem: id, invoiceId, description, quantity, unitPrice, total
- Payment: id, invoiceId, paymentDate, amount, method, reference
- Document: id, invoiceId, url, kind

Invoice status values: PENDING, APPROVED, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
"""

def generate_sql(question: str) -> str:
    """Generate SQL query from natural language question using Groq."""
    if not llm:
        raise HTTPException(500, detail="Groq API key not configured")
    
    prompt = f"""
You are a SQL expert. Given the following database schema and a question, generate a valid PostgreSQL SELECT query.

{SCHEMA_INFO}

Question: {question}

Generate a SQL query that answers this question. Only return the SQL query, nothing else.
The query should:
1. Only use SELECT statements (read-only queries)
2. ALWAYS use double-quoted table names: "Invoice", "Vendor", "Customer", "Category", "Payment", "Document", "InvoiceLineItem"
3. ALWAYS use double-quoted column names when they match the schema (e.g., "invoiceDate", "vendorId")
4. Include appropriate JOINs when needed
5. Use proper date functions for filtering
6. Limit results to a reasonable number (e.g., LIMIT 100)

IMPORTANT: Table names MUST be quoted with double quotes because they are case-sensitive in PostgreSQL.

SQL Query:
"""
    
    try:
        response = llm.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a SQL expert. Generate only valid PostgreSQL SELECT queries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
        )
        
        sql = response.choices[0].message.content.strip()
        
        # Clean up SQL - remove markdown code blocks if present
        sql = re.sub(r"^```sql\s*", "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"^```\s*", "", sql)
        sql = re.sub(r"```\s*$", "", sql)
        sql = sql.strip()
        
        # Security: Only allow SELECT queries
        if not sql.lower().strip().startswith(("select", "with")):
            raise HTTPException(400, detail="Only SELECT queries are allowed")
        
        # Remove semicolons and multiple statements
        sql = sql.split(";")[0].strip()
        
        # Add LIMIT if not present and query doesn't have aggregation
        if "limit" not in sql.lower() and "group by" not in sql.lower():
            sql += " LIMIT 100"
        
        return sql
    except Exception as e:
        raise HTTPException(500, detail=f"Error generating SQL: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/query")
async def query(q: Query):
    try:
        if not DB_URL:
            raise HTTPException(500, detail="DATABASE_URL not configured")
        
        # Generate SQL
        sql = generate_sql(q.question)
        
        # Execute query
        with psycopg.connect(DB_URL) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                
                # Get column names
                cols = [desc[0] for desc in cur.description] if cur.description else []
                
                # Fetch results (limit to 10k rows for safety)
                rows = cur.fetchmany(10000)
        
        return {
            "sql": sql,
            "columns": cols,
            "rows": [list(row) for row in rows],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))

