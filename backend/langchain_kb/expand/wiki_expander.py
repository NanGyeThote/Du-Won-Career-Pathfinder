import warnings
from bs4 import GuessedAtParserWarning
warnings.filterwarnings("ignore", category=GuessedAtParserWarning)

import wikipedia
import asyncio
from langchain.prompts import PromptTemplate
from langchain_ollama import OllamaLLM # pyright: ignore[reportMissingImports]

class WikiKBGenerator:
    def __init__(self, llm: OllamaLLM):
        self.llm = llm
        self.prompt_template = """
You are an AI knowledge extractor. Your task is to generate a section of a knowledge base for a specific job title based on a provided Wikipedia article summary.

Job Title: "{topic}"
Section to Generate: "{section}"

Wikipedia Summary:
{wiki_text}


Instructions:
- Based on the Wikipedia summary, generate the content for the specified section.
- The content should be a concise and informative paragraph.
- Respond ONLY with the raw text content for the section. Do not add any extra titles, formatting, or explanations.
"""
        self.prompt = PromptTemplate(
            input_variables=["topic", "section", "wiki_text"],
            template=self.prompt_template
        )
        self.chain = self.prompt | self.llm

    async def _get_section_content(self, topic: str, section: str, wiki_text: str) -> str:
        """Generates content for a single section using the LLM."""
        try:
            response = await self.chain.ainvoke({
                "topic": topic,
                "section": section,
                "wiki_text": wiki_text,
            })
            return response if isinstance(response, str) else response.content
        except Exception as e:
            print(f"Error generating section '{section}' for topic '{topic}': {e}")
            return ""

    def _fetch_wiki_content(self, topic: str) -> str:
        """Fetches Wikipedia content in a synchronous manner."""
        try:
            return wikipedia.page(topic, auto_suggest=False, redirect=True).content
        except wikipedia.exceptions.PageError:
            print(f"Could not find Wikipedia page for '{topic}'.")
            return ""
        except wikipedia.exceptions.DisambiguationError as e:
            print(f"Disambiguation error for '{topic}'. Trying to find a better option.")
            # Attempt to find a more relevant page
            for option in e.options:
                if any(keyword in option for keyword in ["(profession)", "(occupation)", "(job title)"]):
                    try:
                        return wikipedia.page(option, auto_suggest=False, redirect=True).content
                    except (wikipedia.exceptions.PageError, wikipedia.exceptions.DisambiguationError):
                        continue  # Try next option if this one fails
            # Fallback to the first option if no better one is found
            try:
                return wikipedia.page(e.options[0], auto_suggest=False, redirect=True).content
            except (wikipedia.exceptions.PageError, wikipedia.exceptions.DisambiguationError):
                return ""
        except Exception as e:
            print(f"An unexpected error occurred while fetching content for '{topic}': {e}")
            return ""

    async def generate_kb_for_topic(self, topic: str, sections: list[str], num_entries: int = 1) -> list[dict]:
        """
        Generates multiple knowledge base entries for a single topic, each with different content.
        """
        print(f"Generating {num_entries} KB entries for topic: {topic}")
        
        # Run the synchronous Wikipedia fetch in a separate thread
        full_wiki_text = await asyncio.to_thread(self._fetch_wiki_content, topic)
        
        if not full_wiki_text:
            print(f"Skipping topic '{topic}' due to lack of Wikipedia content.")
            return []

        # Split the article into chunks of 4000 characters
        chunk_size = 4000
        text_chunks = [full_wiki_text[i:i + chunk_size] for i in range(0, len(full_wiki_text), chunk_size)]

        if not text_chunks:
            return []

        all_kb_entries = []
        for i in range(num_entries):
            # Use a different chunk for each entry, looping if necessary
            wiki_text_chunk = text_chunks[i % len(text_chunks)]
            
            kb_entry = {"title": topic, "sections": []}
            
            tasks = []
            for section_title in sections:
                print(f"  - Scheduling section: {section_title} for entry {i+1}")
                tasks.append(self._get_section_content(topic, section_title, wiki_text_chunk))
            
            section_contents = await asyncio.gather(*tasks)

            for j, section_title in enumerate(sections):
                kb_entry["sections"].append({
                    "title": section_title,
                    "content": section_contents[j].strip()
                })
            
            all_kb_entries.append(kb_entry)
            
        return all_kb_entries