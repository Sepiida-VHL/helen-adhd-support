from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Helen API")

# Fetch JWKS from Clerk
JWKS = requests.get("https://clerk.dev/.well-known/jwks.json").json()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="none")


def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        decoded = jwt.decode(
            token,
            JWKS,
            algorithms=["RS256"],
            audience=os.getenv("CLERK_PUBLISHABLE_KEY"),
        )
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing bearer token")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/private")
async def private_route(claims: dict = Depends(verify_token)):
    return {"message": "authorized", "claims_sub": claims.get("sub")}

