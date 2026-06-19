from fastapi import APIRouter
from app.supabase_verify import verify_supabase_connection

router = APIRouter(prefix="/api/supabase", tags=["supabase"])

@router.get("/verify-connection")
def verify_connection():
    result = verify_supabase_connection()
    return result

@router.get("/rls-policies")
def get_rls_policies():
    with open("supabase/migrations/20260619_rls_policies.sql", "r") as f:
        sql = f.read()
    return {"migration_file": "20260619_rls_policies.sql", "sql": sql}
