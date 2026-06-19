#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# 🚀 TUREEP AI+ AUTOMATED GITHUB SECRETS INJECTION SIDECAR
# Document Reference: SEC_SIDECAR_2026_02
# ==============================================================================
# This script uses the official GitHub CLI (gh) to securely program these exact 
# Enterprise 2026 Mandate secrets into your active remote GitHub repository.
#
# Requirements:
#   1. GitHub CLI installed (`brew install gh` or `apt-get install gh`)
#   2. Authenticated with `gh auth login`
# ==============================================================================

TARGET_REPO="SezoR12/pixel-perfect-preview"

echo "================================================================================"
echo "🔒 Starting Automated GitHub Repository Secrets Injection for: ${TARGET_REPO}"
echo "================================================================================"

# 1. SUPABASE_URL
echo "[1/3] Configuring Secret: SUPABASE_URL ..."
gh secret set SUPABASE_URL --repo "${TARGET_REPO}" --body "https://bkwajecszulriwqivqnd.supabase.co"
echo "   ↳ ✅ Secret SUPABASE_URL securely programmed."

# 2. SUPABASE_PUBLISHABLE_KEY
echo "[2/3] Configuring Secret: SUPABASE_PUBLISHABLE_KEY ..."
gh secret set SUPABASE_PUBLISHABLE_KEY --repo "${TARGET_REPO}" --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrd2FqZWNzenVscml3cWl2cW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTk0OTQsImV4cCI6MjA5NzM5NTQ5NH0.Z8X_k9P2m7q_R5W0bK1vE3mZ9Q7xL4pP2wW1m9V8b7c"
echo "   ↳ ✅ Secret SUPABASE_PUBLISHABLE_KEY securely programmed."

# 3. DATABASE_URL
echo "[3/3] Configuring Secret: DATABASE_URL ..."
gh secret set DATABASE_URL --repo "${TARGET_REPO}" --body "postgresql://postgres.bkwajecszulriwqivqnd:Tureep%23Enterprise2026%21Secured%2399xL@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
echo "   ↳ ✅ Secret DATABASE_URL securely programmed."

echo "================================================================================"
echo "🎉 SUCCESS: All 3 Enterprise Production Secrets successfully injected!"
echo "Your GitHub Actions CI/CD pipeline is fully equipped to build and deploy."
echo "================================================================================"
