from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image
import io
import base64
import openai
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Set CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

API_BASE = "https://api.lingyiwanwu.com/v1"
API_KEY = "xxxx"
client = OpenAI(
    api_key=API_KEY,
    base_url=API_BASE
)

class ImageData(BaseModel):
    image: str

@app.post("/calculate")
async def calculate(image_data: ImageData):
    image_str = image_data.image.split(",")[1]
    image_bytes = base64.b64decode(image_str)
    image = Image.open(io.BytesIO(image_bytes))

    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    response = client.chat.completions.create(
        model="yi-vision",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Give the answer to this math equation. Only respond with the answer. Only respond with numbers. NEVER Words. Only answer unanswered expressions. Look for equal sign with nothing on the right of it. If it has an answer already. DO NOT ANSWER it."},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_str}",},
                    },
                ],
            }
        ],
        max_tokens=300,
    )

    if not response.choices:
        raise HTTPException(status_code=500, detail="Calculation failed")

    answer = response.choices[0].message.content
    return {"answer": answer}
