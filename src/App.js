import { useState, useRef, useEffect } from 'react';
// import LlamaAI from 'llamaai';
import axios from 'axios';
import './App.css';
import chatbotIcon from './assets/chatbot.png';

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatWindowRef = useRef(null);
  // const apiToken = 'LA-389777b4310b454989a3bb34e69d225d1ee5cc7ff74a426e8b4ca40de5a29de9';
  // const llamaAPI = new LlamaAI(apiToken);


  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  function formatResponse(response) {
    return `\n${response}`;
  }

  async function generateAnswer() {
    if (!question.trim()) return;

    const userMessage = { sender: 'You', text: question, time: getCurrentTime() };
    setChatHistory((prevHistory) => [...prevHistory, userMessage]);
    setQuestion('');
    setIsChatting(true);

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBFX5InT-rrYl8FHS79BbjsVumPunVnrDE',
        { contents: [{ parts: [{ text: `You are an empathetic, helpful, and respectful senior general practitioner.\n\nCollect Chief Complaint, Basic Health Information, and Related Symptoms in a structured conversation. Keep messages short and concise. Politely refuse non-medical questions.\n\nUser: ${userMessage.text}` }] }] }
      );

      let botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn’t understand that.';
      const formattedResponse = formatResponse(botResponse);
      const botMessage = { sender: 'CareSync', text: formattedResponse, time: getCurrentTime() };
      setChatHistory((prevHistory) => [...prevHistory, botMessage]);
    } catch (error) {
      setChatHistory((prevHistory) => [...prevHistory, { sender: 'CareSync', text: 'Error fetching response', time: getCurrentTime() }]);
      console.error(error);
    }
    setIsChatting(false);
  }

  useEffect(() => {
    const welcomeMessage = {
      sender: "CareSync",
      text: "Hello! How can I assist you today? Please describe your symptoms.",
      time: getCurrentTime(),
    };
    setChatHistory([welcomeMessage]);
  }, []);
  

  useEffect(() => {
    chatWindowRef.current?.scrollTo({
      top: chatWindowRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  <div className="chat-container">
  <div className="chat-window" ref={chatWindowRef}>
    {chatHistory.map((msg, index) => (
      <div key={index} className={msg.sender === 'You' ? 'user-box' : 'bot-box'}>
        <strong>{msg.sender}:</strong><br /> {msg.text}
        <div className="timestamp">{msg.time}</div>
      </div>
    ))}
  </div>

  <input
    className="chat-input"
    type="text"
    placeholder="Describe your symptoms..."
    value={question}
    onChange={(e) => setQuestion(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && generateAnswer()}
    disabled={isChatting}
  />
  
</div>


  return (
    <div className="app-container">
      <div className="chatbot-icon-wrapper">
        <img src={chatbotIcon} alt="Chatbot" className="chatbot-icon" />
        <span className="ai-doctor-logo">CareSync</span>
      </div>

      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          {chatHistory.map((msg, index) => (
            <div key={index} className={msg.sender === 'You' ? 'user-box' : 'bot-box'}>
              <strong>{msg.sender}:</strong><br /> {msg.text}
              <div className="timestamp">{msg.time}</div>
            </div>
          ))}
        </div>

        <input
          className="chat-input"
          type="text"
          placeholder="Describe your symptoms..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateAnswer()}
          disabled={isChatting}
        />
      </div>
    </div>
  );
}

export default App;