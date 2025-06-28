import { useState } from "react";
import axios from "axios";
import { MessageCircle, Bot, Send, X } from "lucide-react";

const Chatbot = () => {
  const API_KEY = "AIzaSyCsA7wL-Xusb21c8oS37CQ9FpwlSGtQf_k";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle chatbot visibility
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Fetch blockchain data
  const fetchBlockchainData = async (query) => {
    try {
      if (/balance/i.test(query)) {
        const address = query.match(/0x[a-fA-F0-9]+/)[0];
        const response = await axios.get(
          `https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}`
        );
        return response.data.balances
          ? `Your wallet balance is ${response.data.balances[0].amount / 1e8} APT.`
          : "No balance data found.";
      }
      if (/transaction/i.test(query)) {
        const address = query.match(/0x[a-fA-F0-9]+/)[0];
        const response = await axios.get(
          `https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}/transactions`
        );
        return response.data.length
          ? `Latest transaction: Sent ${response.data[0].payload.arguments[1] / 1e8} APT to ${response.data[0].payload.arguments[0]}.`
          : "No transactions found.";
      }
      if (/smart contract/i.test(query)) {
        const address = query.match(/0x[a-fA-F0-9]+/)[0];
        const response = await axios.get(
          `https://fullnode.mainnet.aptoslabs.com/v1/accounts/${address}/resources`
        );
        return response.data.length
          ? `Smart contract name: ${response.data[0].data.name}, Supply: ${response.data[0].data.supply}`
          : "No smart contract found.";
      }
      if (/blockchain stats/i.test(query)) {
        const response = await axios.get("https://fullnode.mainnet.aptoslabs.com/v1");
        return `Aptos blockchain is at Epoch ${response.data.epoch}, with ${response.data.ledger_version} ledger versions processed.`;
      }
    } catch (error) {
      return "Error fetching blockchain data.";
    }
  };

  // Handle user message submission
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let botReply = "";

      if (/balance|transaction|blockchain|smart contract/i.test(input)) {
        botReply = await fetchBlockchainData(input);
      } else {
        const enrichedQuery = `
You are Move AI, an expert in finance, investment strategies, portfolio management, and Aptos blockchain transactions. 
You provide insights into Indian finance, asset allocation, AI-driven financial advisory, and blockchain-based financial services. 
Only respond to finance and blockchain queries. If a question is outside these areas, reply: "Move AI specializes in finance and blockchain only."

User Query: ${input}`;

        const response = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY,
          {
            contents: [{ parts: [{ text: enrichedQuery }] }],
          },
          { headers: { "Content-Type": "application/json" } }
        );

        botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't understand.";
        botReply = botReply.replace(/\bAI\b|Gemini/gi, "Move AI");
        botReply = botReply.replace(/\bI am an AI\b/gi, "I am Move AI, your financial assistant.");
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Move AI is currently experiencing issues. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button onClick={toggleChat} className="bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition">
          <Bot size={40} />
        </button>
      )}
      {isOpen && (
        <div className="w-80 bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-xl shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b border-blue-600">
            <h2 className="text-lg font-semibold">Move AI - Finance & Blockchain</h2>
            <button onClick={toggleChat} className="text-gray-300 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 space-y-3 h-64 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`p-2 rounded-lg text-sm ${msg.sender === "user" ? "bg-blue-500 ml-auto w-fit" : "bg-gray-800 w-fit"}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-gray-300">Move AI is typing...</div>}
          </div>
          <div className="p-3 border-t border-blue-600 flex items-center">
            <input
              type="text"
              placeholder="Ask about finance or blockchain..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 bg-blue-800 text-white rounded-lg outline-none"
            />
            <button onClick={sendMessage} className="ml-2 bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
