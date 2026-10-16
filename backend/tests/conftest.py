import os

# Use a fixed, test-only JWT secret so importing app.utils.auth neither warns
# (development) nor refuses to start (production). Tests never touch a real database.
os.environ.setdefault("JWT_SECRET", "test-only-secret-not-for-production")
os.environ.setdefault("ENV", "development")
