"""Supabase client — singleton for reuse across requests"""

from supabase import create_client, Client
from app.core.config import settings

# Anon client (for user-facing operations, respects RLS)
# Uses publishable key (sb_publishable_xxx) or legacy anon key
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.effective_publishable_key,
)

# Admin/service client (bypasses RLS — use only in trusted server-side code)
# Uses secret key (sb_secret_xxx) or legacy service_role key
supabase_admin: Client = create_client(
    settings.SUPABASE_URL,
    settings.effective_secret_key,
)
