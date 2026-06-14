"""
main.py - The entry point (front door) of the Unified Resume Builder API.

WHY THIS FILE EXISTS:
When you start the backend server, THIS is the first file Python runs.
It creates the FastAPI "app" object that listens for web requests
(like when someone visits your website or clicks a button).

ANALOGY:
Think of FastAPI as a receptionist. When someone walks in (makes a request),
the receptionist checks what they want and routes them to the right department.
"""

# Import the FastAPI class from the fastapi library
# WHY: FastAPI is the framework that handles all web requests
from fastapi import FastAPI
from dotenv import load_dotenv

# Load .env file so HUGGINGFACE_API_KEY (and future keys) are available
# WHY HERE: load_dotenv() must run before any route imports that read env vars.
# .env lives in the backend/ directory alongside main.py.
load_dotenv()

# Import our API routers
# WHY IMPORT HERE: main.py is the app's entry point. All routes must be
# registered on the `app` object so FastAPI knows about them.
from app.api.routes import analyze, score, gap, compliance, summary, rewrite, export

# Import CORS middleware
# CORS = Cross-Origin Resource Sharing
# WHY: Your React frontend (localhost:3000) and Python backend (localhost:8000)
#      run on different "origins" (ports). Browsers block cross-origin requests
#      by default for security. CORS middleware tells the browser: "It's okay,
#      I trust requests from localhost:3000."
from fastapi.middleware.cors import CORSMiddleware

# ============================================================
# Create the FastAPI Application
# ============================================================
# WHY these parameters:
# - title: Shows up in the auto-generated API docs
# - description: Explains what your API does (visible at /docs)
# - version: Helps track which version of the API is running
app = FastAPI(
    title="Unified Resume Builder API",
    description="ATS scoring, keyword analysis, and AI-powered resume optimization",
    version="0.1.0",
)

# ============================================================
# Configure CORS (Allow Frontend to Connect)
# ============================================================
# WHY: Without this, when your React app tries to call your API,
#      the browser will block it with a CORS error. This is the #1
#      beginner mistake when building frontend + backend separately.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React dev server (default port)
        "http://localhost:5173",   # Vite dev server (alternative)
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],   # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],   # Allow any headers
)


# ============================================================
# API Endpoints (Routes)
# ============================================================

# WHAT IS AN ENDPOINT?
# An endpoint is a specific URL that your API responds to.
# Think of it like a menu item at a restaurant — each endpoint
# serves a different "dish" (data or action).

# The @app.get("/") is a "decorator" — it tells FastAPI:
# "When someone visits the root URL (/), run this function."
# ============================================================
# Register API Routers
# ============================================================
# WHY include_router?
# Each router is a mini-app with its own routes. include_router() "mounts" it
# onto the main app at a given prefix. All routes in analyze.py become
# available under /api/v1/ automatically.
#
# tags=["Analysis"] groups these endpoints together in the /docs UI.
app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(score.router, prefix="/api/v1", tags=["Scoring"])
app.include_router(gap.router, prefix="/api/v1", tags=["Gap Analysis"])
app.include_router(compliance.router, prefix="/api/v1", tags=["Compliance"])
app.include_router(summary.router, prefix="/api/v1", tags=["AI Summary"])
app.include_router(rewrite.router, prefix="/api/v1", tags=["AI Rewriter"])
app.include_router(export.router, prefix="/api/v1", tags=["PDF Export"])


@app.get("/")
async def root():
    """
    Root endpoint - the homepage of your API.
    Visit http://localhost:8000/ to see this response.
    """
    return {
        "message": "Welcome to the Unified Resume Builder API",
        "status": "healthy",
        "version": "0.1.0",
        "docs": "Visit /docs for interactive API documentation",
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    WHY: Hosting platforms (like Render) ping this endpoint to verify
    your server is still alive. If it stops responding, they restart it.
    """
    return {"status": "ok"}


# ============================================================
# Run the Server
# ============================================================
# WHY: This block only runs when you execute "python main.py" directly.
# It does NOT run when another file imports this module.
# The "if __name__" pattern is a Python convention you'll see everywhere.
if __name__ == "__main__":
    import uvicorn

    # uvicorn.run() starts the web server
    # - "main:app" means "in the file main.py, find the variable called app"
    # - host="0.0.0.0" means "accept connections from any IP" (needed for deployment)
    # - port=8000 means "listen on port 8000"
    # - reload=True means "restart the server when I save a code change" (dev convenience)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
