# Chatbot Fine-Tuning Project

This project contains scripts to process data, fine-tune a chatbot model, and interact with it.

## Project Structure

The project is organized as follows:

```
.
├── .env
├── data
│   ├── processed
│   │   ├── chatbot_data_bilingual_test.jsonl
│   │   ├── chatbot_data_bilingual_train.jsonl
│   │   ├── chatbot_data.jsonl
│   │   ├── chatbot_data_test.jsonl
│   │   ├── chatbot_data_train.jsonl
│   │   └── cleaned_processed_job.json
│   ├── raw
│   │   ├── chatbot_data_bilingual.jsonl
│   │   ├── chatbot_data.jsonl
│   │   └── processed_job.json
│   └── example.json
└── src
    ├── bi_format_data.py
    ├── chat_llm.py
    ├── cleaned_skill_set.py
    ├── count_lines.py
    ├── format_data.py
    └── train_test_split.py
```

## Getting Started

### Prerequisites

- Python 3.x
- Pip for package installation

### Installation

1.  Clone the repository.
2.  Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

### Usage

#### 1. Data Processing

The following scripts are used to process the data:

-   `src/cleaned_skill_set.py`: Cleans the `job_skill_set` in `data/raw/processed_job.json` and saves the cleaned file to `data/processed/cleaned_processed_job.json`.
-   `src/format_data.py`: Generates English-only training data from `data/processed/cleaned_processed_job.json` and saves it to `data/processed/chatbot_data.jsonl`.
-   `src/bi_format_data.py`: Generates bilingual (English and Burmese) training data from `data/raw/processed_job.json` and saves it to `data/processed/chatbot_data_bilingual.jsonl`.
-   `src/train_test_split.py`: Splits `data/raw/chatbot_data.jsonl` into training and testing sets and saves them to `data/processed/`.

To process the data, run the scripts in the following order:

```bash
python src/cleaned_skill_set.py
python src/format_data.py
python src/bi_format_data.py
python src/train_test_split.py
```

#### 2. Training

*(Instructions for training the model would go here. This project only contains the data processing and inference scripts.)*

#### 3. Chatting with the model

To chat with the fine-tuned model, run the following command:

```bash
python src/chat_llm.py
```

The script will load the fine-tuned model and you can start a conversation. The answer will be saved to `chat_answer.txt`.

### Scripts

-   `src/bi_format_data.py`: Generates bilingual (English and Burmese) training data.
-   `src/chat_llm.py`: Script to chat with the fine-tuned model.
-   `src/cleaned_skill_set.py`: Cleans the `job_skill_set` data.
-   `src/count_lines.py`: A utility script to count lines in a data file.
-   `src/format_data.py`: Generates English-only training data.
-   `src/train_test_split.py`: Splits data into training and testing sets.
