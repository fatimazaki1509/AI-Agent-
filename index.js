import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const History = [];
const ai = new GoogleGenAI({
  apiKey: "AIzaSyD9FP2spZQZ0PAL9LVAZhDiKeSsicJCy78",
});

// ---------- Tools ----------
function sum({ num1, num2 }) {
  return num1 + num2;
}
function prime({ num }) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
  return true;
}
async function getCryptoPrice({ coin }) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`
  );
  return await response.json();
}
const availableTools = { sum, prime, getCryptoPrice };

// ---------- AI Agent ----------
async function runAgent(userProblem) {
  History.push({ role: "user", parts: [{ text: userProblem }] });
  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: History,
      config: {
        systemInstruction: `You are an AI Agent. Use tools for sum, prime, or crypto prices.You are an ai agent who can answer user queries. You have access to the following tools:
1. sum: Takes two numbers and returns their sum.
2. prime: Takes a number and returns true if it's prime, false otherwise.
3. getCryptoPrice: Takes a cryptocurrency name (e.g., bitcoin) and returns its current price in USD.Also if youser asks something else please answer it as well.`,
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: "sum",
              parameters: {
                type: "OBJECT",
                properties: {
                  num1: { type: "NUMBER" },
                  num2: { type: "NUMBER" },
                },
                required: ["num1", "num2"],
              },
            },
            {
              name: "prime",
              parameters: {
                type: "OBJECT",
                properties: { num: { type: "NUMBER" } },
                required: ["num"],
              },
            },
            {
              name: "getCryptoPrice",
              parameters: {
                type: "OBJECT",
                properties: { coin: { type: "STRING" } },
                required: ["coin"],
              },
            },
          ],
        },
      ],
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const { name, args } = response.functionCalls[0];
      const funCall = availableTools[name];
      const result = await funCall(args);
      History.push({ role: "model", parts: [{ functionCall: response.functionCalls[0] }] });
      History.push({ role: "user", parts: [{ functionResponse: { name, response: { result } } }] });
    } else {
      History.push({ role: "model", parts: [{ text: response.text }] });
      return response.text;
    }
  }
}

// ---------- API Route ----------
app.post("/ask", async (req, res) => {
  const { query } = req.body;
  const answer = await runAgent(query);
  res.json({ answer });
});

// ---------- Frontend ----------
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>AI Agent Chat</title>
<style>
  body {
    margin:0;
    font-family:'Segoe UI', Arial, sans-serif;
    background: radial-gradient(circle at top left, #0f172a, #1e293b, rgb(41, 85, 151));
    overflow:hidden;
    height:100vh;
    display:flex;
    flex-direction:column;
    color:white;
  }
  body.light {
    background: #f0f0f0;
    color: #111;
  }
  canvas {
    position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1;
  }
  .header {
    text-align:center;
    padding:15px;
    font-size:22px;
    font-weight:bold;
    background:rgba(0, 0, 0, 0.5);
    backdrop-filter:blur(6px);
    border-bottom:1px solid rgba(255,255,255,0.1);
  }
  .toggle-btn {
    float:right;
    margin-right: 15px;
    padding: 5px 10px;
    font-size: 14px;
    background: #555;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  .chat-container {
    flex:1;
    padding:20px;
    overflow-y:auto;
    display:flex;
    flex-direction:column;
    gap:12px;
  }
  .message {
    max-width:70%;
    padding:12px 15px;
    border-radius:18px;
    line-height:1.4;
    word-wrap:break-word;
    animation:fadeIn 0.3s ease;
    position: relative;
    transition: background 0.3s;
  }
  .message:hover::after {
    content: attr(data-time);
    font-size: 11px;
    position: absolute;
    bottom: -18px;
    right: 8px;
    opacity: 0.7;
  }
  .user {
    align-self:flex-end;
    background:#2563eb;
    color:white;
  }
  .bot {
    align-self:flex-start;
    background:#374151;
    color:white;
  }
  .typing {
    display:flex;
    gap:5px;
    align-self:flex-start;
    margin:5px 0;
  }
  .dot {
    width:8px;
    height:8px;
    background:white;
    border-radius:50%;
    animation:bounce 0.6s infinite alternate;
  }
  .dot:nth-child(2){animation-delay:0.2s;}
  .dot:nth-child(3){animation-delay:0.4s;}
  @keyframes bounce {
    from{transform:translateY(0);opacity:0.6;}
    to{transform:translateY(-6px);opacity:1;}
  }
  .input-container {
    display:flex;
    padding:12px;
    background:rgba(0,0,0,0.5);
    border-top:1px solid rgba(255,255,255,0.1);
    backdrop-filter:blur(6px);
  }
  .input-container input {
    flex:1;
    padding:12px;
    border:none;
    border-radius:12px;
    outline:none;
    font-size:15px;
    background:rgba(255,255,255,0.9);
    color:#111;
  }
  .input-container button {
    margin-left:10px;
    padding:12px 18px;
    border:none;
    border-radius:12px;
    background:linear-gradient(45deg,#2563eb,#1d4ed8);
    color:white;
    font-weight:bold;
    cursor:pointer;
    transition:transform 0.2s;
  }
  .input-container button:hover {
    transform:scale(1.05);
  }
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="header">
  🤖 AI Agent Chat
  <button class="toggle-btn" onclick="toggleTheme()">Toggle Theme</button>
</div>
<div class="chat-container" id="chat-box"></div>
<div class="input-container">
  <button onclick="startListening()">🎤</button>
  <input type="text" id="user-input" placeholder="Type your message..."/>
  <button onclick="sendMessage()">Send</button>
</div>
<script>
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");

  function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.setAttribute("data-time", formatTime());
    msg.textContent = (sender === "user" ? "🧑‍💻 " : "🤖 ") + text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    saveChat();
  }

  function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("typing");
    typingDiv.id = "typing";
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function removeTyping() {
    const typingDiv = document.getElementById("typing");
    if (typingDiv) typingDiv.remove();
  }

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage(text, "user");
    userInput.value = "";
    showTyping();
    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      removeTyping();
      appendMessage(data.answer, "bot");
    } catch (err) {
      removeTyping();
      appendMessage("⚠️ Error connecting to AI agent.", "bot");
    }
  }
    userInput.focus();


  userInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  // --------- Speech-to-text -----------
  function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
    };
  }

  // --------- Chat Persistence ---------
  function saveChat() {
    localStorage.setItem("chat", chatBox.innerHTML);
  }
  function loadChat() {
    const saved = localStorage.getItem("chat");
    if (saved) chatBox.innerHTML = saved;
  }

  // --------- Theme Toggle -------------
  function toggleTheme() {
    document.body.classList.toggle("light");
  }

  loadChat();

  // Background particle animation
  const canvas = document.getElementById("bg"), ctx = canvas.getContext("2d");
  let particles = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener("resize", resize); resize();
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.r = Math.random() * 2 + 1;
      this.dx = (Math.random() - 0.5) * 0.5;
      this.dy = (Math.random() - 0.5) * 0.5;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
    }
    update() {
      this.x += this.dx; this.y += this.dy;
      if (this.x < 0 || this.x > canvas.width) this.dx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.dy *= -1;
      this.draw();
    }
  }
  for (let i = 0; i < 100; i++) particles.push(new Particle());
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => p.update());
    requestAnimationFrame(animate);
  }
  animate();
</script>
</body>
</html>
  `);
});

// ---------- Start Server ----------
app.listen(5000, () => console.log("🚀 AI Agent running at http://localhost:5000"));
