from fastapi import FastAPI
from backend.routes import contacto

app = FastAPI()
app.include_router(contacto.router)
