import json
import random

# Load the original chatbot data (bilingual JSONL)
with open('data/raw/chatbot_data.jsonl', 'r', encoding='utf-8') as file:
    data = [json.loads(line.strip()) for line in file]  # Read line by line and parse as JSON

# Shuffle the data to ensure randomness
random.shuffle(data)

# Calculate the split index (80% training, 20% testing)
split_index = int(len(data) * 0.8)

# Split the data into training and testing sets
train_data = data[:split_index]
test_data = data[split_index:]

# Save the training data to a new JSONL file
with open('data/processed/chatbot_data_train.jsonl', 'w', encoding='utf-8') as train_file:
    for conversation in train_data:
        train_file.write(json.dumps(conversation, ensure_ascii=False) + "\n")

# Save the testing data to a new JSONL file
with open('data/processed/chatbot_data_test.jsonl', 'w', encoding='utf-8') as test_file:
    for conversation in test_data:
        test_file.write(json.dumps(conversation, ensure_ascii=False) + "\n")

print("Training and testing data have been saved.")