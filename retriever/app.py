"""
Helen AI - Vector Retrieval Service
FastAPI service for semantic search and contextual memory using ChromaDB
"""

from fastapi import FastAPI, HTTPException, Request, Header, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings
import json
import os
from datetime import datetime
import uuid
from pathlib import Path
import stripe
from supabase import create_client, Client
from functools import lru_cache
from jose import jwt
import requests

app = FastAPI(title="Helen Vector Retrieval Service", version="1.0.0")

# Set up persistent storage directory with absolute path
DATA_DIR = Path(__file__).parent / "data" / "chroma_db"
DATA_DIR.mkdir(parents=True, exist_ok=True)

print(f"💾 Persistent storage directory: {DATA_DIR.absolute()}")

# Initialize ChromaDB client with persistent storage
chroma_client = chromadb.PersistentClient(
    path=str(DATA_DIR.absolute()),
    settings=Settings(
        anonymized_telemetry=False,
        allow_reset=False  # Prevent accidental data loss
    )
)

# Pydantic models for API
class QueryRequest(BaseModel):
    query_text: str
    collection_name: str = "helen_contexts"
    n_results: int = 5
    filters: Optional[Dict[str, Any]] = None

class AddContextRequest(BaseModel):
    documents: List[str]
    metadatas: Optional[List[Dict[str, Any]]] = None
    ids: Optional[List[str]] = None
    collection_name: str = "helen_contexts"

class ConversationContext(BaseModel):
    user_message: str
    ai_response: str
    session_id: str
    previous_activity: Optional[str] = None
    crisis_level: str = "none"
    attention_status: str = "focused"
    emotional_state: str = "neutral"
    timestamp: Optional[str] = None

class RetrievalResponse(BaseModel):
    documents: List[str]
    ids: List[str]
    distances: List[float]
    metadatas: List[Dict[str, Any]]
    query_context: Dict[str, Any]

# Initialize collections
@app.on_event("startup")
async def startup_event():
    """Initialize ChromaDB collections on startup"""
    collections = {
        "helen_contexts": {
            "description": "Conversational contexts and patterns",
            "metadata": {"type": "conversation_memory"}
        },
        "therapeutic_responses": {
            "description": "ADHD-adapted therapeutic responses and interventions",
            "metadata": {"type": "therapeutic_knowledge"}
        },
        "user_patterns": {
            "description": "User-specific behavioral and attention patterns",
            "metadata": {"type": "user_modeling"}
        },
        "intervention_library": {
            "description": "Evidence-based interventions and techniques",
            "metadata": {"type": "intervention_knowledge"}
        }
    }
    
    for name, config in collections.items():
        try:
            collection = chroma_client.get_or_create_collection(
                name=name,
                metadata=config["metadata"]
            )
            print(f"✅ Collection '{name}' ready: {config['description']}")
        except Exception as e:
            print(f"❌ Error creating collection '{name}': {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "helen-retrieval", 
        "timestamp": datetime.now().isoformat(),
        "persistent_storage": str(DATA_DIR.absolute()),
        "storage_exists": DATA_DIR.exists()
    }

# ===== Stripe & Supabase Billing Integration =====
stripe.api_key = os.getenv("STRIPE_SECRET_KEY") or ""
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET") or ""

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✅ Supabase client initialized for billing upserts")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
else:
    print("⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set; billing upserts will be skipped")

# ===== Clerk JWT Verification =====
CLERK_ISSUER = os.getenv("CLERK_ISSUER") or os.getenv("CLERK_JWT_ISSUER")
CLERK_AUDIENCE = os.getenv("API_JWT_AUDIENCE")

@lru_cache(maxsize=1)
def get_clerk_jwks():
    if not CLERK_ISSUER:
        raise RuntimeError("CLERK_ISSUER not configured")
    jwks_url = f"{CLERK_ISSUER.rstrip('/')}/.well-known/jwks.json"
    resp = requests.get(jwks_url, timeout=5)
    resp.raise_for_status()
    return resp.json()

def verify_clerk_jwt(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        jwks = get_clerk_jwks()
        key = None
        for k in jwks.get("keys", []):
            if k.get("kid") == kid:
                key = k
                break
        if not key:
            raise HTTPException(status_code=401, detail="Unable to find matching JWK")
        options = {"verify_aud": bool(CLERK_AUDIENCE)}
        payload = jwt.decode(
            token,
            key,
            algorithms=[unverified_header.get("alg", "RS256")],
            audience=CLERK_AUDIENCE if CLERK_AUDIENCE else None,
            issuer=CLERK_ISSUER,
            options=options,
        )
        return payload  # claims
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"JWT verification failed: {e}")

async def upsert_plan_to_supabase(user_id: str, plan: Optional[str], current_period_end_iso: Optional[str], subscription_id: Optional[str]):
    if not supabase:
        print("⚠️ Supabase client unavailable; skipping upsert")
        return
    try:
        payload = {
            "user_id": user_id,
            "plan": plan,
            "current_period_end": current_period_end_iso,
            "stripe_subscription_id": subscription_id,
            "updated_at": datetime.now().isoformat()
        }
        # Assumes a table named 'subscriptions' with a unique constraint on user_id
        res = supabase.table("subscriptions").upsert(payload, on_conflict="user_id").execute()
        print(f"✅ Upserted billing for user {user_id}: {res}")
    except Exception as e:
        print(f"❌ Supabase upsert failed: {e}")

@app.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature")):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Stripe webhook secret not configured")
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        try:
            session = data_object
            user_id = session.get("client_reference_id") or (session.get("metadata") or {}).get("user_id")
            plan = (session.get("metadata") or {}).get("plan")
            subscription_id = session.get("subscription")
            current_period_end_iso = None
            if subscription_id:
                sub = stripe.Subscription.retrieve(subscription_id)
                cpe = sub.get("current_period_end")
                if cpe:
                    current_period_end_iso = datetime.fromtimestamp(int(cpe)).isoformat()
            if user_id:
                await upsert_plan_to_supabase(user_id, plan, current_period_end_iso, subscription_id)
            else:
                print("⚠️ checkout.session.completed missing user_id; skipping upsert")
        except Exception as e:
            print(f"❌ Error processing checkout.session.completed: {e}")

    return {"received": True}

# ===== SendGrid Email Test (Protected) =====
try:
    from .services.email import send_template  # package-relative import
except Exception:
    # Fallback for environments running without package context
    from services.email import send_template  # type: ignore

@app.post("/api/email/test")
async def email_test(body: Dict[str, Any], claims: Dict[str, Any] = Depends(verify_clerk_jwt)):
    to = body.get("to") or body.get("to_email")
    template_id = body.get("template_id")
    dynamic_data = body.get("dynamic_data") or {}
    if not to or not template_id:
        raise HTTPException(status_code=400, detail="Required: to, template_id")
    try:
        result = send_template(to_email=to, template_id=template_id, dynamic_data=dynamic_data)
        return {"status": "sent", "to": to, "template_id": template_id, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SendGrid error: {e}")

@app.post("/retrieve", response_model=RetrievalResponse)
async def retrieve_context(request: QueryRequest):
    """
    Retrieve semantically similar contexts for a given query
    """
    try:
        collection = chroma_client.get_collection(name=request.collection_name)
        
        # Perform semantic search
        results = collection.query(
            query_texts=[request.query_text],
            n_results=request.n_results,
            where=request.filters
        )
        
        # Extract and format results
        documents = results['documents'][0] if results['documents'] else []
        ids = results['ids'][0] if results['ids'] else []
        distances = results['distances'][0] if results['distances'] else []
        metadatas = results['metadatas'][0] if results['metadatas'] else []
        
        # Build query context for analysis
        query_context = {
            "query_length": len(request.query_text),
            "collection_used": request.collection_name,
            "results_found": len(documents),
            "avg_similarity": sum(distances) / len(distances) if distances else 0,
            "timestamp": datetime.now().isoformat()
        }
        
        return RetrievalResponse(
            documents=documents,
            ids=ids,
            distances=distances,
            metadatas=metadatas,
            query_context=query_context
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval error: {str(e)}")

@app.post("/add_context")
async def add_context(request: AddContextRequest):
    """
    Add new context to the vector store
    """
    try:
        collection = chroma_client.get_or_create_collection(name=request.collection_name)
        
        # Generate IDs if not provided
        if not request.ids:
            request.ids = [str(uuid.uuid4()) for _ in request.documents]
        
        # Add default metadata if not provided
        if not request.metadatas:
            request.metadatas = [{"timestamp": datetime.now().isoformat()} for _ in request.documents]
        
        collection.upsert(
            documents=request.documents,
            metadatas=request.metadatas,
            ids=request.ids
        )
        
        return {
            "status": "success",
            "added_count": len(request.documents),
            "collection": request.collection_name,
            "ids": request.ids
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Add context error: {str(e)}")

@app.post("/store_conversation")
async def store_conversation(context: ConversationContext):
    """
    Store a conversation turn for future retrieval
    """
    try:
        collection = chroma_client.get_or_create_collection(name="helen_contexts")
        
        # Create rich document from conversation context
        document = f"User: {context.user_message}\nHelen: {context.ai_response}"
        
        metadata = {
            "session_id": context.session_id,
            "previous_activity": context.previous_activity,
            "crisis_level": context.crisis_level,
            "attention_status": context.attention_status,
            "emotional_state": context.emotional_state,
            "timestamp": context.timestamp or datetime.now().isoformat(),
            "user_message_length": len(context.user_message),
            "ai_response_length": len(context.ai_response),
            "type": "conversation_turn"
        }
        
        doc_id = f"{context.session_id}_{datetime.now().timestamp()}"
        
        collection.upsert(
            documents=[document],
            metadatas=[metadata],
            ids=[doc_id]
        )
        
        return {
            "status": "stored",
            "document_id": doc_id,
            "collection": "helen_contexts"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Store conversation error: {str(e)}")

@app.get("/collections")
async def list_collections():
    """
    List all available collections and their stats
    """
    try:
        collections = chroma_client.list_collections()
        collection_info = []
        
        for collection in collections:
            count = collection.count()
            collection_info.append({
                "name": collection.name,
                "count": count,
                "metadata": collection.metadata
            })
        
        return {"collections": collection_info}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"List collections error: {str(e)}")

@app.delete("/collection/{collection_name}")
async def clear_collection(collection_name: str):
    """
    Clear all documents from a collection (use with caution!)
    """
    try:
        collection = chroma_client.get_collection(name=collection_name)
        collection.delete()
        
        return {
            "status": "cleared",
            "collection": collection_name,
            "message": "All documents removed from collection"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clear collection error: {str(e)}")

class ADHDContextRequest(BaseModel):
    query_text: str
    user_patterns: Optional[Dict[str, Any]] = None
    session_context: Optional[Dict[str, Any]] = None

# Enhanced retrieval for ADHD-specific patterns
@app.post("/retrieve_adhd_context")
async def retrieve_adhd_context(request: ADHDContextRequest):
    """
    Specialized retrieval for ADHD-specific contextual responses
    """
    try:
        # Multi-collection search for comprehensive context
        collections_to_search = [
            "helen_contexts",
            "therapeutic_responses", 
            "intervention_library"
        ]
        
        all_results = {}
        
        for coll_name in collections_to_search:
            try:
                collection = chroma_client.get_collection(name=coll_name)
                
                # Build filters based on context
                filters = {}
                if request.user_patterns:
                    if request.user_patterns.get("attention_status"):
                        filters["attention_status"] = request.user_patterns["attention_status"]
                    if request.user_patterns.get("crisis_level"):
                        filters["crisis_level"] = request.user_patterns["crisis_level"]
                
                results = collection.query(
                    query_texts=[request.query_text],
                    n_results=3,
                    where=filters if filters else None
                )
                
                all_results[coll_name] = {
                    "documents": results['documents'][0] if results['documents'] else [],
                    "metadatas": results['metadatas'][0] if results['metadatas'] else [],
                    "distances": results['distances'][0] if results['distances'] else []
                }
                
            except Exception as e:
                print(f"Warning: Could not search collection {coll_name}: {e}")
                all_results[coll_name] = {"documents": [], "metadatas": [], "distances": []}
        
        # Analyze and synthesize results
        context_synthesis = {
            "query": request.query_text,
            "retrieved_contexts": all_results,
            "synthesis": {
                "total_contexts_found": sum(len(r["documents"]) for r in all_results.values()),
                "best_match_collection": max(all_results.keys(), 
                    key=lambda k: len(all_results[k]["documents"])) if all_results else None,
                "attention_adaptations_needed": request.user_patterns.get("attention_status") == "fading" if request.user_patterns else False,
                "crisis_context_available": any("crisis" in str(meta).lower() 
                    for results in all_results.values() 
                    for meta in results["metadatas"]),
                "timestamp": datetime.now().isoformat()
            }
        }
        
        return context_synthesis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ADHD context retrieval error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
