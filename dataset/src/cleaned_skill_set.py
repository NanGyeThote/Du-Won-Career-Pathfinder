import json
import ast

def clean_job_skills(job_skills):
    """
    Cleans the 'job_skill_set' field, which could be a string representation of a list.
    This function attempts to convert the string to a list. If it fails, it manually fixes it.
    """
    if isinstance(job_skills, str):
        # Try to evaluate the string as a literal list (safe)
        try:
            job_skills = ast.literal_eval(job_skills)
        except (ValueError, SyntaxError):
            # If evaluation fails, clean the string manually
            job_skills = job_skills.strip("[]").replace("'", "").split(", ")
    
    # If it's already a list, do nothing
    elif isinstance(job_skills, list):
        pass
    else:
        # If it's neither a string nor a list, default to an empty list
        job_skills = []
        
    return job_skills

# Load the raw job data from the file
with open('data/raw/processed_job.json', 'r', encoding='utf-8') as file:
    raw_data = json.load(file)

# Clean the job_skill_set field for all jobs in raw_data
for job in raw_data:
    job['job_skill_set'] = clean_job_skills(job.get('job_skill_set', ''))

# Save the cleaned data to a new file (optional)
with open('data/processed/cleaned_processed_job.json', 'w', encoding='utf-8') as outfile:
    json.dump(raw_data, outfile, indent=4, ensure_ascii=False)

# Print the cleaned data to check
count = 0
for job in raw_data:
    print(f"Job Title: {job['job_title']}, Skills: {job['job_skill_set']}")
    count += 1

print(f"\n\n --- {count} ---

") # 1944