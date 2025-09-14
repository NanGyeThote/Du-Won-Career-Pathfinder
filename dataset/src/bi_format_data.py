import json
import ast
# Load the raw job data
with open('data/raw/processed_job.json', 'r', encoding='utf-8') as file:
    raw_data = json.load(file)

# Function to generate a bilingual conversation for each job (English and Burmese)
def generate_conversation(job):
    job_title = job.get("job_title")
    job_skills = job.get("job_skill_set", [])
    
    # If job_skills is a string that looks like a list, convert it to a proper list
    if isinstance(job_skills, str):
        try:
            job_skills = ast.literal_eval(job_skills)
        except Exception as e:
            print(f"Error converting job_skills to list: {e}")
            job_skills = []

    # Join the skills into a string for the conversation
    job_skills_str = ", ".join(job_skills)
    job_description = job.get("job_description", "No description available.")

    # Initialize conversation as a list of dictionaries (first entry: system)
    conversation = []
    
    # Add English conversation for system context
    conversation.append({
        "role": "system",
        "content": "You are a helpful career recommendation chatbot. Provide clear, actionable advice and be supportive."
    })
    
    # Add English conversation for skills
    conversation.append({
        "role": "user",
        "content": f"What skills are required for the role of {job_title}?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"For the role of {job_title}, the required skills include: {job_skills_str}."
    })
    
    # Add English conversation for responsibilities
    conversation.append({
        "role": "user",
        "content": f"What are the main responsibilities of an {job_title}?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"An {job_title} is responsible for {job_description}. This includes managing tasks related to project planning, execution, and delivery, ensuring requirements are met."
    })
    
    # Add English conversation for experience needed
    conversation.append({
        "role": "user",
        "content": f"What experience is needed to become an {job_title}?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"To become an {job_title}, you typically need experience in project management, leadership, and skills related to {job_skills_str}. Consider certifications like PMP for project management."
    })
    
    # ---- Add Burmese conversation ----
    # Add Burmese conversation for skills
    conversation.append({
        "role": "user",
        "content": f"{job_title} အတွက် လိုအပ်သော ကျွမ်းကျင်မှုများက ဘာများလဲ?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"{job_title} အတွက် လိုအပ်သော ကျွမ်းကျင်မှုများမှာ {job_skills_str} တို့ဖြစ်သည်။"
    })
    
    # Add Burmese conversation for responsibilities
    conversation.append({
        "role": "user",
        "content": f"{job_title} ရဲ့ အဓိကတာဝန်များက ဘာများလဲ?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"{job_title} သည် {job_description} အတွက်တာဝန်ရှိသည်။ ၎င်းသည် အစီအစဉ်အစီအစဉ်၊ လုပ်ငန်းအပေါ် အကောင်အထည်ဖော်ခြင်းနှင့် သတ်မှတ်ထားသော ရည်မှန်းချက်များကို ဖြည့်ဆည်းခြင်း စသည်တို့ကို ထိန်းသိမ်းရန်အတွက်တာဝန်ယူ။"
    })
    
    # Add Burmese conversation for experience needed
    conversation.append({
        "role": "user",
        "content": f"{job_title} ဖြစ်ဖို့ အတွေ့အကြုံ ဘယ်လိုလိုအပ်သလဲ?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"{job_title} ဖြစ်ရန်၊ သင်သည် ပရိုဂျက်စီမံခန့်ခွဲမှု၊ ခေါင်းဆောင်မှုနှင့် {job_skills_str} သက်ဆိုင်သော ကျွမ်းကျင်မှုများရှိရန်လိုအပ်သည်။ PMP အဖြစ် ပရိုဂျက်စီမံခန့်ခွဲမှု အတတ်ပညာအထောက်အထားများကို ရယူခြင်းသည် သင်၏လက်ရှိတင်စားမှုကို အားပေးစေပါသည်။"
    })
    
    return conversation

# Transform all jobs in the dataset
chatbot_conversations = []
for job in raw_data:
    chatbot_conversations.append({
        "messages": generate_conversation(job)
    })

# Save the transformed data to a new JSONL file (English and Burmese)
with open('data/processed/chatbot_data_bilingual.jsonl', 'w', encoding='utf-8') as outfile:
    for conversation in chatbot_conversations:
        # Write each conversation as a single line (JSONL format)
        outfile.write(json.dumps(conversation, ensure_ascii=False) + "\n")

print(f"Transformed bilingual data has been saved to 'chatbot_data_bilingual.jsonl'.")