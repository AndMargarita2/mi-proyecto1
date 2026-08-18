from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, run_migrations
from routers import admin_router, auth_router, presentations_router

Base.metadata.create_all(bind=engine)
run_migrations()

app = FastAPI(title="mi-proyecto1 API")

app.add_middleware(
    CORSMiddleware,
    # TODO: agregar el origen de producción cuando el backend tenga dónde desplegarse
    # (Cloudflare Pages solo sirve el frontend estático, no corre FastAPI).
    allow_origins=["http://localhost:4200", "http://localhost:4201"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
app.include_router(presentations_router.router, prefix="/presentaciones", tags=["presentaciones"])
app.include_router(admin_router.router, prefix="/admin", tags=["admin"])


@app.get("/")
def read_root():
    return {"mensaje": "mi-proyecto1 API"}
