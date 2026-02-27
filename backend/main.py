from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/login")
def login(username: str = "admin", password: str = "admin"):
    # Normally you'd validate the user — but keeping it simple here.
    return {"access_token": "test-token", "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme)):
    if token != "test-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
        )
    return {"username": "admin"}


@app.get("/dashboard")
def dashboard(user=Depends(get_current_user)):
    return {"message": "Welcome to the dashboard!"}


@app.get("/")
def root():
    return {"message": "Backend is running"}
