"""Root conftest — sets the test JWT secret before any app code imports it."""

import os

TEST_JWT_SECRET = "test-jwt-secret-for-unit-tests-only-must-be-32-bytes-minimum"
os.environ.setdefault("SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
