import json
import ast
# Load the raw job data
with open('data/processed/cleaned_processed_job.json', 'r', encoding='utf-8') as file:
    raw_data = json.load(file)

# Function to generate a conversation for each job (English only)
def generate_conversation(job):
    job_title = job.get("job_title", "Unknown Role")
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

    # Initialize conversation as a list of dictionaries
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
    
    # Add more questions for career path and salary
    conversation.append({
        "role": "user",
        "content": f"What is the typical career path for an {job_title}?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"Typically, an {job_title} can advance to roles like Senior Project Manager, Program Manager, or even IT Director or VP of Technology."
    })
    
    conversation.append({
        "role": "user",
        "content": f"How can I advance in my career as an {job_title}?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"To advance as an {job_title}, focus on developing leadership skills, expand your expertise in project management frameworks (e.g., Agile, Scrum), and take on more complex projects."
    })
    
    conversation.append({
        "role": "user",
        "content": f"What is the job outlook for an {job_title}?"
    })
    conversation.append({
        "role": "assistant",
        "content": f"The job outlook for {job_title}s is strong, as more companies seek to manage complex IT projects efficiently."
    })
    
    return conversation

# Transform all jobs in the dataset into conversations
chatbot_conversations = []
for job in raw_data:
    # Each conversation is a dictionary with the "messages" key
    chatbot_conversations.append({
        "messages": generate_conversation(job)
    })

# Save the transformed data to a new JSONL file (one line per job)
with open('data/processed/chatbot_data.jsonl', 'w', encoding='utf-8') as outfile:
    for conversation in chatbot_conversations:
        # Write each conversation as a single line in JSONL format
        outfile.write(json.dumps(conversation, ensure_ascii=False) + "\n")

print(f"Transformed data has been saved to 'chatbot_data.jsonl'.")