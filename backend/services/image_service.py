import os
import base64
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY"))

def describe_plant_image(filepath: str) -> str:
    """Use Groq LLaMA vision to describe a plant image."""
    with open(filepath, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    ext = filepath.rsplit(".", 1)[-1].lower()
    media_type_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
                      "webp": "image/webp", "gif": "image/gif"}
    media_type = media_type_map.get(ext, "image/jpeg")

    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{media_type};base64,{image_data}"}
                    },
                    {
                        "type": "text",
                        "text": (
                            "You are an expert plant pathologist and agriculture specialist. "
                            "Analyze this plant/crop image and describe: "
                            "1. Plant/crop type (if identifiable) "
                            "2. Visible symptoms: spots, discoloration, wilting, lesions, pests, etc. "
                            "3. Overall health status. "
                            "4. Any visible insects or pest damage. "
                            "Be concise and specific. If image is unclear, say so."
                        )
                    }
                ]
            }
        ],
        max_tokens=400
    )
    return response.choices[0].message.content
