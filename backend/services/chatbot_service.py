import os
from groq import Groq

# SAHI
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are KisanAI — an expert agriculture advisor, plant doctor, and farming consultant.
You help farmers with crop diseases, pest control, soil health, irrigation, and farming best practices.

Core Rules:
- ALWAYS reply in the SAME language as the user's question
- If user writes in Hindi → reply in Hindi
- If user writes in Hinglish (Hindi-English mix) → reply in Hinglish
- If user writes in English → reply in English
- Keep answers simple, practical, and farmer-friendly
- Avoid overly technical jargon

When analyzing plant problems, always structure your response as:

🌱 **Plant Name / Crop:** [identified plant or Unknown]
⚠️ **Problem / Disease:** [what's wrong]
🔍 **Cause:** [why it's happening — fungal, bacterial, pest, deficiency, etc.]
🌿 **Organic Solution:** [natural home remedies farmers can use]
💊 **Chemical Solution:** [specific pesticide/fungicide with dosage if needed]
💡 **Prevention Tip:** [how to avoid this in future]

If the image is unclear or insufficient info, politely ask for a better image or more details.
If it's a general farming question (not disease), answer helpfully without the above format.
"""

def get_agri_response(question: str, image_description: str = "") -> str:
    """Get agriculture AI response using Groq."""
    
    # Build user message
    user_content = f"User Question: {question}"
    if image_description:
        user_content += f"\n\nPlant Image Analysis: {image_description}"

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_content}
        ],
        max_tokens=1000,
        temperature=0.7
    )
    return response.choices[0].message.content
