from flask import Blueprint, request, jsonify
import os
from groq import Groq

chatbot_bp = Blueprint('chatbot', __name__)

SYSTEM_PROMPT = """You are KisanAI — an expert agriculture advisor and plant doctor.

LANGUAGE RULE (MOST IMPORTANT):
- User Hindi or Hinglish mein likhe → SIRF HINDI SCRIPT mein jawab do (Devanagari)
- User English mein likhe → English mein jawab do
- User Punjabi → Punjabi, Tamil → Tamil, Bengali → Bengali
- Language KABHI mat badlo

QUESTION TYPE DETECT KARO:
- General question (mausam, greetings, math) → seedha simple jawab do
- Plant/crop/disease question → format use karo:
  Paudha: [naam]
  Samasya: [kya hai]
  Karan: [kyun]
  Desi Upay: [solution]
  Dawai: [dose ke saath]
  Bachav: [tips]
- Farming general → normal paragraph mein jawab do

TONE: Koi emoji nahi. Koi bhai/yaar nahi. Simple, clear, warm. Max 150 words."""

@chatbot_bp.route('/ask', methods=['POST'])
def ask():
    data         = request.get_json()
    question     = data.get('question', '').strip()
    image_text   = data.get('image_description', '')
    history      = data.get('history', [])

    if not question:
        return jsonify({"success": False, "error": "Question required"}), 400

    try:
        client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        # Add history (last 10)
        for msg in history[-10:]:
            messages.append(msg)

        user_content = question
        if image_text:
            user_content += f"\n\nImage Analysis: {image_text}"

        messages.append({"role": "user", "content": user_content})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=600,
            temperature=0.85
        )
        answer = response.choices[0].message.content
        return jsonify({"success": True, "answer": answer})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@chatbot_bp.route('/analyze-image', methods=['POST'])
def analyze_image():
    data     = request.get_json()
    base64   = data.get('base64', '')
    mimetype = data.get('mimeType', 'image/jpeg')

    if not base64:
        return jsonify({"success": False, "error": "No image"}), 400

    try:
        client = Groq(api_key=os.environ.get('GROQ_API_KEY'))
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:{mimetype};base64,{base64}"}},
                    {"type": "text", "text": "Plant pathologist: describe 1) Plant type 2) Symptoms visible 3) Health status. Be concise, 3-4 sentences."}
                ]
            }],
            max_tokens=300
        )
        return jsonify({"success": True, "description": response.choices[0].message.content})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
