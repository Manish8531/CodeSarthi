# app.py - Code Helping Buddy

import os
from flask import Flask, render_template, request, jsonify, flash
from dotenv import load_dotenv
import openai # Using OpenAI API
import json # To handle structured JSON output from LLM
import datetime # Import datetime to get the current year

from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage


from langchain.chains import LLMChain



# Load environment variables from .env file
load_dotenv()

# --- Flask App Configuration ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a_very_secret_key_for_dev_only')

app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


print("OpenAI API Key:", os.getenv("OPENAI_API_KEY"))

# --- OpenAI API Key Setup ---
# Get API key from environment variable
openai_api_key_loaded = os.getenv('OPENAI_API_KEY')
if not openai_api_key_loaded:
    print("WARNING: OPENAI_API_KEY not found in .env. LLM features will not work.")
else:
    # Configure OpenAI API with the loaded key
    # Important: Set the base_url for OpenRouter.ai
    openai.api_key = openai_api_key_loaded
    openai.base_url = "https://openrouter.ai/api/v1/" # <<-- THIS IS THE NEW LINE FOR OPENROUTER.AI

# --- Helper Function for LLM Content Generation ---
def analyze_code_with_openai(user_code):
    """
    Generates concept explanation, mnemonics, and 20% core concepts for the given code
    using OpenAI LLM.
    """
    global openai_api_key_loaded
    if not openai_api_key_loaded:
        return {
            "error": "OpenAI API key is not configured. LLM features are disabled."
        }

    # Truncate code if too long for the model's context window (e.g., gpt-3.5-turbo has 16k tokens)
    # Using a conservative limit for safety to avoid exceeding token limits and costs.
    max_code_length = 15000 # Adjusted for gpt-3.5-turbo's typical context window
    if len(user_code) > max_code_length:
        user_code = user_code[:max_code_length] + "\n\n... (Code truncated due to length)"
        flash("Code truncated due to length. Analysis might be less comprehensive.", 'info')
        print(f"DEBUG: Code truncated. New length: {len(user_code)}")

    try:
        # Using OpenAI's chat completions API
        # model="gpt-3.5-turbo" is a good default, or "gpt-4" for higher quality (but more cost)
        # OpenRouter.ai par available models ki list unki documentation mein dekh lena.
        # Example: "openai/gpt-3.5-turbo", "google/gemini-pro"
        model_name = "openai/gpt-4.1-nano" # OpenRouter.ai par yeh model "openai/gpt-3.5-turbo" ho sakta hai. 
                                     # Agar ye kaam na kare toh "openai/gpt-3.5-turbo" try karna.

        print(f"DEBUG: Attempting to generate content with OpenAI API using model '{model_name}' via OpenRouter.ai...")

        # Combined prompt for all required outputs in a structured JSON format
        combined_prompt = f"""
Hey AI, you're my 'Code Sarthi Code Buddy' — my bro who breaks down code like we're two homies chillin' at 2 AM, coding and sipping chai.

Your mission: analyze the provided code snippet and deliver a fun, deeply detailed, JSON-formatted breakdown. 
Each section in the JSON should be **at least 5 full lines**, written in a crisp, clear, and super chill tone — like you're explaining code to your bestie, not a boardroom. 
Make it informal, use analogies, jokes, Gen Z humor, even rap bars if it fits — just keep the learning fun and fire. 
Treat Data Structures and Algorithms like they're the DMC (Delhi Metro Cypher) of programming.

### Return the following keys in the JSON:

{{
  "concept_explanation": {{
    "why": "Explain in 5+ detailed lines: what's the core problem this code solves? Why was this written ?",
    "what": "Describe in 5+ lines: what this code actually does at a high level purpose behind this code — in fun, friendly terms.",
    "how": "Step-by-step expalnation is point format, walk through how the code works in 5+ points — like you're narrating a chill tutorial.",
    "where": "Mention in 5+ lines where this logic or concept is used in real-world apps or dev situations."
  }},
  "mnemonics": [
    "At least 2-3 funny or creative memory tricks for remembering core syntax or ideas."
  ],
  "core_concepts_20_percent": [
    "List the most important 20% of the code or logic that helps understand 80% of it. Minimum 4-5 items, briefly explained."
  ]
}}

Respond only in JSON. No extra text. Format it perfectly.

Now here's the code:
```java
{user_code}
"""

        
        response = openai.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are an AI code assistant that provides structured analysis."},
                {"role": "user", "content": combined_prompt}
            ],
            response_format={"type": "json_object"}, # Request JSON object
            max_tokens=1500 # Adjust max_tokens as needed for comprehensive response
        )
        
        # Fix: Add null check for response content
        if response.choices[0].message.content is None:
            return {
                "error": "OpenAI returned empty response. Please try again."
            }
            
        raw_text = response.choices[0].message.content.strip()
        print("DEBUG: Raw LLM response received.")

        # OpenAI's response_format directly gives JSON content, no need to strip markdown block
        json_string = raw_text

        try:
            parsed_data = json.loads(json_string)
            print("DEBUG: LLM response parsed as JSON.")
            
            # Basic validation of the parsed structure
            if not all(k in parsed_data for k in ["concept_explanation", "mnemonics", "core_concepts_20_percent"]):
                raise ValueError("LLM response missing expected keys.")
            if not all(k in parsed_data["concept_explanation"] for k in ["why", "what", "how", "where"]):
                raise ValueError("LLM concept_explanation missing expected keys.")
            if not isinstance(parsed_data["mnemonics"], list):
                raise ValueError("LLM mnemonics not a list.")
            if not isinstance(parsed_data["core_concepts_20_percent"], list):
                raise ValueError("LLM core_concepts_20_percent not a list.")

            return parsed_data

        except json.JSONDecodeError as e:
            print(f"ERROR: JSONDecodeError from OpenAI response: {e}. Raw text: {raw_text}")
            return {
                "error": "Could not parse OpenAI's response. Please try again.",
                "raw_response": raw_text # Include raw response for debugging
            }
        except ValueError as e:
            print(f"ERROR: Structured data validation failed: {e}. Parsed data: {parsed_data}")
            return {
                "error": "OpenAI's response format was unexpected. Please try again.",
                "raw_response": raw_text
            }

    except openai.APIError as e: # Catch specific OpenAI API errors
        print(f"DEBUG: An OpenAI API ERROR occurred during LLM generation: {e}")
        return {
            "error": f"An OpenAI API error occurred: {e}"
        }
    except Exception as e:
        print(f"DEBUG: An unexpected ERROR occurred during LLM generation (OpenAI): {e}")
        return {
            "error": f"An unexpected error occurred during LLM generation: {e}"
        }

# --- Routes ---

@app.route('/')
def home():
    """Renders the homepage for the Code Helping Buddy."""
    current_year = datetime.datetime.now().year
    return render_template('index.html', current_year=current_year)

@app.route('/analyze_code', methods=['POST'])
def analyze_code():
    """
    Receives user code, sends to LLM for analysis, and returns results.
    This route is called via AJAX from the homepage.
    """
    user_code = request.form.get('user_code')

    if not user_code or len(user_code.strip()) == 0:
        return jsonify({"error": "Please paste some code to analyze."}), 400

    print(f"DEBUG: Received code (first 100 chars): {user_code[:100]}...")

    analysis_results = analyze_code_with_openai(user_code)

    if "error" in analysis_results:
        flash(analysis_results["error"], 'danger')
        return jsonify(analysis_results), 500

    return jsonify({
        "success": True,
        "analysis": analysis_results
    })

@app.route('/tutor')
def tutor_page():
    return render_template('tutor.html')


#-CHAT BOT IMPLEMENTATION -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Setup LLM & memory (Session-wide memory)
# ✅ FIX 1: Declare LLM + Memory + Conversation globally (so they persist)




llm = ChatOpenAI(model="openai/gpt-4.1-nano", temperature=0.7,  openai_api_base=os.getenv("OPENAI_API_BASE"),   max_tokens=1024)
memory = ConversationBufferMemory()
conversation = ConversationChain(llm=llm, memory=memory, verbose=False)  # 🔄 Reused across requests
# Inside app.py (global init area)
if not memory.chat_memory.messages:
    memory.chat_memory.add_user_message("Your name is Code Sarthi You are a helpful AI coding tutor. Help the user with their code questions.")

# ✅ FIX 2: Upload route - clear memory and inject new file content
@app.route('/upload-analysis', methods=['POST'])
def upload_analysis():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.txt'):
        return jsonify({'error': 'Please upload a valid .txt file'}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    with open(filepath, 'r') as f:
        file_content = f.read()

    memory.clear()  # ✅ Clears old chat memory
    memory.chat_memory.add_user_message("Here's the analysis file:\n" + file_content)  # ✅ Inject file into memory

    return jsonify({'message': 'File uploaded successfully!', 'start_message': 'AI is ready to tutor you now.'})


# ✅ FIX 3: Chat route - use persistent conversation object
@app.route('/chat', methods=['POST'])
def chat():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    request_json = request.get_json()
    user_input = request_json.get('message')
    if not user_input:
        return jsonify({'error': 'Empty message'}), 400

    response = conversation.run(user_input)  # ✅ Use the global persistent memory
    return jsonify({'response': response})


# ✅ FIX 4: Optional code explanation route (not chatbot-specific)
@app.route('/explain-code', methods=['POST'])
def explain_code():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    request_json = request.get_json()
    code = request_json.get('code')
    if not code:
        return jsonify({'error': 'Code not found'}), 400

    prompt = PromptTemplate(
        input_variables=["code"],
        template="You are a coding tutor. Explain this code in simple terms with step-by-step reasoning:\n\n{code}"
    )

    chain = LLMChain(llm=llm, prompt=prompt)
    explanation = chain.run(code)
    return jsonify({'explanation': explanation})





# --- Main Run Block ---
if __name__ == '__main__':
    app.run(debug=True)