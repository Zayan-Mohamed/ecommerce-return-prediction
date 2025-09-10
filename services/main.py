from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "E-commerce Return Prediction API running"}
