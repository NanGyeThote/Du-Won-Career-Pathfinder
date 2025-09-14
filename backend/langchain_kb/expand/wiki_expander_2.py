import wikipedia
import json
import random
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import os

# ===================== Load API Key =====================
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

# ===================== LLM Setup =====================
model = "openai/gpt-4.1-nano"
base_url = "https://openrouter.ai/api/v1"

llm = ChatOpenAI(
    temperature=0,
    model_name=model,
    openai_api_base=base_url,
)

# ===================== Prompt Setup =====================
prompt_text = """
You are an AI knowledge extractor. 
Given the job title "{career_title}", extract structured job knowledge.

Here is some Wikipedia text about the career:
\"\"\" {wiki_text} \"\"\" 

Respond ONLY in valid JSON format as a list with exactly {num_sections} entries.  
Each entry must match this schema:

{{
  "job_id": "<random will be filled in later>",
  "category": "{category}",
  "job_title": "{career_title}",
  "job_description": "<2-3 sentence summary of the role>",
  "job_skill_set": ["skill1", "skill2", "skill3", ...],
  "unified_document": "Job Title: {career_title}. Job Description: <2-3 sentence summary of the role>. Required Skills: [<list all key skills>]."
}}

Rules:
- Return a JSON array with {num_sections} elements.
- Each element should vary slightly in job_description or skills phrasing.
- Leave job_id as a placeholder (we will generate it in Python).
- Respond only with JSON, no explanations.
- In `unified_document`, include **full job description summary** and **all skills** exactly like this example:

Job Title: Business Development (Sales) Manager. Job Description: ABOUT THIS OPPORTUNITY ... [detailed description]. Required Skills: ['CRM', 'Market Intelligence', 'Sales Negotiation', ...]
""".strip()

def get_combined_text(job_title):
    # Wikipedia text
    try:
        wiki_text = wikipedia.page(job_title).content
    except Exception:
        wiki_text = ""
    
    # Example: load local job postings or files
    job_portal_text = ""
    try:
        with open(f"jobs/{job_title}.txt", "r", encoding="utf-8") as f:
            job_portal_text = f.read()
    except FileNotFoundError:
        pass

    return wiki_text + "\n\n" + job_portal_text


prompt = PromptTemplate(
    input_variables=["career_title", "wiki_text", "num_sections", "category"],
    template=prompt_text
)

# New style: pipe operator (PromptTemplate → LLM)
chain = prompt | llm

# ===================== Main Function =====================
def expand_job_to_kb(job_title: str, num_sections: int = 30):
    # Format category properly
    category = job_title.upper().replace(" ", "-")

    # Get Wikipedia content
    try:
        wiki_text = get_combined_text(job_title) 
    except Exception:
        wiki_text = ""

    # Call the LLM
    response = chain.invoke({
        "career_title": job_title,
        "wiki_text": wiki_text,
        "num_sections": num_sections,
        "category": category,
    })

    # Parse JSON
    try:
        dict_json = json.loads(response.content)
    except json.JSONDecodeError:
        dict_json = []

    # Fill in random job_id if missing and ensure string
    for entry in dict_json:
        if "job_id" not in entry or not str(entry["job_id"]).isdigit():
            entry["job_id"] = str(random.randint(10**9, 10**10 - 1))

    # Create chunks dictionary
    chunks_file = {}
    for items in dict_json:
        career = items['job_title']
        texts = items.get('unified_document', '')
        if career not in chunks_file:
            chunks_file[career] = texts
        else:
            chunks_file[career] += ' ' + texts

    return chunks_file, dict_json  # <-- now returns 2 values

# ===================== Example Run =====================
if __name__ == "__main__":
    chunks_dict, new_docs = expand_job_to_kb("AI/ML Engineer", num_sections=3)
    print(json.dumps(new_docs, indent=2, ensure_ascii=False))
