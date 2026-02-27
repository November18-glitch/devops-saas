from fastapi import APIRouter, Depends
from backend.oauth2 import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/")
def dashboard(user=Depends(get_current_user)):
    return {
        "welcome": f"Welcome {user.username}",
        "stats": {
            "projects": 0,
            "deployments": 0,
            "pipelines": 0,
        },
    }
