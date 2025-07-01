

# 🚀 Code Sarthi — Your AI-Powered Coding Sidekick

> "Built with zero chill, infinite Google tabs, and late-night chai."

Code Sarthi isn't just a project — it's a **journey from noob to deploy**. A Flask-powered, OpenAI-fueled code analyzer that deciphers your code like your bestfriend/bhai explaining it over midnight Maggi.

---

## 🧠 Tech Stack (Real-World Tools for Real Devs)

| Layer      | Tech                                            |
| ---------- | ----------------------------------------------- |
| Brain      | OpenRouter (GPT-4.1-nano)                      |
| Server     | Flask (Python)                                  |
| Frontend   | HTML + CSS + Bootstrap + JS                     |
| Styling    | Custom CSS with animations                      |
| AI Magic   | LangChain (planned integration)                 |
| Security   | Dotenv for env management                       |
| Deployment | Gunicorn + Render                               |
| Domain     | (https://code-sarthi111.onrender.com)           |

---

## ✨ Features That Hit Different

### 1. Code Analyzer

Paste your code. Click analyze. Boom:

* What it does (non-boring way)
* Why it exists
* How it works (step-by-step)
* Where it's used in real life
* Mnemonics to remember it
* The 20% logic that delivers 80% understanding

> Not just AI mumbo-jumbo. Actual explanation like your chillest senior would give.

### 2. AI Chatbot (Frontend + Backend)

* GPT-4.1-nano via OpenRouter
* AJAX-powered chat interface
* Prompt designed like: "Explain this like we're on a terrace, sipping chai at 2am."
* Response feels human, not robotic

### 3. AI Tutor Mode (LangChain + GPT-4.1 Nano)
  *  Powered by LangChain and OpenRouter’s GPT-4.1 Nano
    
  * Memory-enabled conversations that feel like a real mentor's guiding you
    
  *  Built for deep dives into code, concepts, logic, and those “why tho?” questions
    
  *  Still vibing on: “Explain this like we’re bunking class and figuring out DSA together”
    
  * File upload (PDF/TXT) coming soon — imagine feeding it your professor’s notes and getting back quiz-ready answers
    
  *  🔥 Think of it as your digital coding buddy — sharp, chill, and always down to help.

### 4. Deployment + Domain

* Hosted on Render (because Flask + Vercel = 😵)

* DNS configs done like a true DevOps bhakt (CNAME, ALIAS, SSL)

* Free Render subdomain: code-sarthi111.onrender.com

🕐 Note: Since it's hosted on Render’s free plan, it goes to sleep when inactive.
Expect 30–50 seconds of loading time on first hit. Just vibe, wait, and it’ll wake up like a slow-loading genius.

### 5. Developer-Friendly Routes

| Route           | Purpose                      |
| --------------- | ---------------------------- |
| `/`             | Home - code analyzer UI      |
| `/analyze_code` | POST endpoint to hit GPT API |
| `/tutor`        | Reserved for AI tutor magic  |

### 6. Prompt Engineering (Underrated but 🔥)

* Structured, witty, and vibe-based prompts
* Results that actually make sense and don’t sound like Wikipedia clones

---

## 🧰 How to Use (Clone and Run Like a Pro)

```bash
git clone 
cd code-sarthi
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

> Add your `.env` with `OPENAI_API_KEY` and `SECRET_KEY`

```bash
python app.py
```

Visit: `http://localhost:5000`

---

## 🤯 What I Learned (AKA The Real Dev Life)

* `.env` should *never* be pushed (oops, once)
* OpenRouter models need proper headers
* Vercel hates Flask
* LangChain isn’t plug-and-play — but it’s worth it
* Deployment will break. Then it works. Then breaks again.

---

## 🔥 Built With

* 💻 ChatGPT + Claude (for coding help)
* 🔍 StackOverflow (every 10 mins)
* 🧪 Trial and Error (mostly errors)
* 🎨 CapCut-style coding (cut > paste > test > repeat)
* 😭 Crying in terminal logs

---

## 📚 Future Plans


* Auth + Chat History
* PDF summarizer + question generator

---

## 🧑‍💻 About Me

> **MANISH MAHTO** | 20 y/o | Self-taught Dev | IITM BS Data Science Student

I built Code Sarthi to level up — not just my code, but my career. From reading docs I didn’t understand to deploying apps people can use.

Next goals:

* ✅ Build more tools
* ✅ Write a killer resume
* 🔜 Apply to freelancing sites and jobs

> "Main aaya nahi, main banaya gaya hoon — Code Sarthi style."

---

## 🛐 Final Thoughts

You don’t need to know everything. You need to keep going.
AI didn’t do this alone. I didn’t do this alone. **We** (me + AI + curiosity + ChatGPT + late-night vibes) made this happen.

**Jai Jagannath 🙏**
**Radhe Radhe 🙏**
**JAI SHREE RAM 🙏** 
