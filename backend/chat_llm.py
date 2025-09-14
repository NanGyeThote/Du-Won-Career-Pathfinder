import os
from mistralai import Mistral
from dotenv import load_dotenv
import json

load_dotenv()

api_key = os.getenv("MISTRAL_API_KEY")
model = "ft:ministral-3b-latest:9b8fa9c6:20250902:e97f6b36"

client = Mistral(api_key=api_key)

chat_response = client.chat.complete(
    model= model,
    messages = [
        {
            "role": "user",
            "content": "What skills are required for the role of Senior Human Resources Generalist?",
        },
    ]
)
print(chat_response.choices[0].message.content)

answer = chat_response.choices[0].message.content
with open('chat_answer.txt', 'w', encoding='utf-8') as f:
    f.write(answer)
