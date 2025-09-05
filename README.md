# 🤖 AI Agent Chat

An interactive AI-powered chat interface using **Node.js**, **Express**, and **Google Gemini API**, complete with a beautiful UI, dark/light theme toggle, speech-to-text input, and persistent local chat history.

![AI Agent Chat Demo](./screenshot.png<img width="1919" height="1002" alt="Screenshot 2025-09-05 235034" src="https://github.com/user-attachments/assets/350ceabc-3de5-4e5c-a006-8f4d60f33c18" />
)

---

## ✨ Features

- 💬 Conversational AI powered by **Google Gemini 2.5 Flash**
- 🌓 **Dark/Light theme switcher**
- 🧠 **Persistent chat history** (via localStorage)
- 🕒 **Timestamps** for every message
- 🎙️ **Speech-to-text** input using Web Speech API
- 🔢 Built-in tools:
  - Sum of two numbers
  - Prime number check
  - Live cryptocurrency prices (via CoinGecko API)
- 🎨 Smooth UI with typing animation and particle background

---

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI API**: [Google Gemini API](https://ai.google.dev/)
- **Extras**: CoinGecko API, Web Speech API

---

## 🚀 Getting Started

### Prerequisites

- Node.js v14+
- Google Gemini API Key (get one [here](https://ai.google.dev/))

### Installation

```bash
git clone https://github.com/your-username/ai-agent-chat.git
cd ai-agent-chat
npm install

### 🔧 Installation & Run

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ai-agent-chat.git
cd ai-agent-chat

# 2. Install dependencies
npm install

# 3. Start the server
node index.js





###🔐 API Key Setup

The Gemini API key is currently hardcoded in index.js for quick use:

const ai = new GoogleGenAI({ apiKey: "your-api-key-here" });


For production, it’s recommended to use an environment variable:

GEMINI_API_KEY=your-api-key


And load it using the dotenv package.

### 📂 Project Structure
ai-agent-chat/
├── index.js           # Backend server (Express + Gemini API)
├── public/            # Optional static assets
└── README.md

📸 UI Preview

Replace this with an actual screenshot once pushed.

🧠 Future Improvements

 Save chat history to file or database

 Add avatars/profile images

 Export chat logs (PDF/Markdown)

 Deploy to Render, Vercel, or Netlify

 Add user authentication

📄 License

MIT License

💬 Feedback

Feel free to open issues or contribute via pull requests!

Built with 💻 + 🤖 + ☕


