from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "HireSense AI Backend Running Successfully"
    }