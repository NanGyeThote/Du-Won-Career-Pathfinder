import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from scipy.sparse import hstack
import numpy as np
import pickle
import os

# --- Loading the Preprocessing Tools and Model ---
print("--- Loading Preprocessing Tools and Model ---")

# Get the absolute path to the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))
tools_path = os.path.join(current_dir, 'preprocessing_tools.pkl')
model_path = os.path.join(current_dir, 'career_model.pkl')


# This assumes you have already saved these files from your training script.
try:
    with open(tools_path, 'rb') as f:
        tools = pickle.load(f)

    with open(model_path, 'rb') as f:
        loaded_model = pickle.load(f)

    # Extract the necessary tools
    skill_mapping = tools['skill_mapping']
    vectorizer_domain = tools['vectorizer_domain']
    vectorizer_projects = tools['vectorizer_projects']
    major_columns = tools['major_columns']
    label_encoder = tools['label_encoder']

    print("Tools and model loaded successfully.")
except FileNotFoundError:
    print("Error: Required files not found. Please run the training script first to create them.")
    exit()

def predict_career(user_answers):
    """
    Predicts a career based on user's answers to a quiz.

    Args:
        user_answers (dict): A dictionary containing the user's answers.

    Returns:
        str: The predicted career title.
    """

    # --- The Preprocessing Pipeline for New Data ---
    print("\n--- Preprocessing Quiz Answers for the Model ---")

    # Combine Interested Domain answers into a single string for vectorization
    user_domain_text = ' '.join([user_answers[f'Interested Domain_{i}'] for i in range(1, 3)])

    # Combine Projects answers into a single string for vectorization
    user_projects_text = ' '.join([user_answers[f'Projects_{i}'] for i in range(1, 4)])

    # Create a DataFrame from the user's answers
    user_data_processed = pd.DataFrame([{
        'GPA': user_answers['GPA'],
        'Python': skill_mapping[user_answers['Python']],
        'SQL': skill_mapping[user_answers['SQL']],
        'Java': skill_mapping[user_answers['Java']]
    }])

    # Process 'Major' with one-hot encoding, ensuring it matches the training columns
    user_major_encoded = pd.get_dummies([user_answers['Major']], drop_first=True, prefix='Major')
    final_major_cols = pd.DataFrame(0, index=[0], columns=major_columns)
    for col in user_major_encoded.columns:
        if col in final_major_cols.columns:
            final_major_cols[col] = 1

    # Apply TF-IDF vectorization to the user's text answers
    user_domain_vector = vectorizer_domain.transform([user_domain_text])
    user_projects_vector = vectorizer_projects.transform([user_projects_text])

    # Combine all processed features into a single sparse matrix
    user_features_combined = hstack([
        user_data_processed.values,
        final_major_cols.values,
        user_domain_vector,
        user_projects_vector
    ])

    # --- Making a Prediction ---
    print("\n--- Making a Prediction... ---")

    # Make a prediction with the loaded model
    prediction_numeric = loaded_model.predict(user_features_combined)

    # Convert the numerical prediction back to a career title
    predicted_career = label_encoder.inverse_transform(prediction_numeric)

    return predicted_career[0]

if __name__ == '__main__':
    # --- Simulating a User's 10-15 MCQ Answers ---
    print("--- User Quiz Answers ---")

    # Replace the values in this dictionary with your own user's answers.
    # These values are designed to be collected from a 10-15 question quiz.
    user_answers = {
        'GPA': 3.8,
        'Major': 'Computer Science',
        'Python': 'Strong',
        'SQL': 'Strong',
        'Java': 'Weak',
        'Interested Domain_1': 'Web Development',
        'Interested Domain_2': 'Machine Learning',
        'Projects_1': 'Image Recognition',
        'Projects_2': 'E-commerce Website',
        'Projects_3': 'Deep Learning Models'
    }

    predicted_career = predict_career(user_answers)
    print(f"\nBased on your answers, your predicted future career is: {predicted_career}")
