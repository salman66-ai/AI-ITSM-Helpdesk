import os

from dotenv import load_dotenv
from huggingface_hub import InferenceClient


load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")

if not HF_API_KEY:
    raise RuntimeError("HF_API_KEY is not set in .env")


MODEL_NAME = "Qwen/Qwen3-4B-Instruct-2507"


client = InferenceClient(
    api_key=HF_API_KEY
)


def generate_answer(question: str, context: str) -> str:

    system_prompt = """
You are an enterprise IT helpdesk AI assistant.

Your job is to answer employee IT support questions using ONLY
the approved knowledge provided in the context.

Rules:
1. Do not invent information.
2. Do not use outside knowledge.
3. If the context does not contain enough information, say:
   "I could not find sufficient information in the approved
   IT knowledge base to answer this question."
4. Give clear and practical troubleshooting steps.
5. Do not claim that an action was performed unless the system
   actually performed it.
"""

    user_prompt = f"""
Employee question:

{question}


Approved knowledge base context:

{context}


Provide a concise IT support answer based only on the approved
knowledge above.
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        max_tokens=400,
        temperature=0.2
    )

    return response.choices[0].message.content