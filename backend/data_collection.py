import pandas as pd
import json

ground_truth_path = './data/all_job_post.csv'
output_json_path = './ground_truth/processed_job.json'

# Load open the file
df = pd.read_csv(ground_truth_path)

df['unified_document'] = df.apply(
    lambda row: f"Job Title: {row['job_title']}. "
                f"Job Description: {row['job_description']}. "
                f"Required Skills: {row['job_skill_set']}.",
    axis=1
)

# Switch it to json
df.to_json(output_json_path, orient='records', indent=4)

# Display the new column for a few rows
print(f"Json file has stored successfully!")
print(f'Rows: {df.shape[0]} rows')
print(f'Columns: {df.shape[1]} columns')