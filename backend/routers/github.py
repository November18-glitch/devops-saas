from fastapi import APIRouter

router = APIRouter()

@router.post("/connect")
def connect_github(token: str):
    return {"status": "connected"}

@router.get("/repos")
def get_repos():
    return {
        "repos": [
            {"name": "api-service", "status": "active"},
            {"name": "frontend", "status": "active"},
        ]
    }
