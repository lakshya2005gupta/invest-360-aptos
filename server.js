const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Aptos } = require("@aptos-labs/ts-sdk");

const app = express();
const PORT = 3000;

// Middleware: enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Aptos SDK (using testnet; change to "mainnet" if needed)
const aptos = new Aptos({ network: "testnet" });

// Replace this with your actual Move AI API endpoint
const MOVE_AI_API = "https://your-move-ai-endpoint.com/analyze";

// Home route: just a welcome message
app.get("/", (req, res) => {
  res.send("Welcome to the Move Agent Chatbot API. Use /process_query to interact.");
});

// Main chatbot endpoint
app.post("/process_query", async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }

  let reply = "Sorry, I couldn't understand.";

  try {
    // If query starts with "aptos balance", handle it with the Aptos SDK
    if (query.toLowerCase().startsWith("aptos balance")) {
      const parts = query.split(" ");
      if (parts.length < 3) {
        reply = "Please provide an Aptos address after 'aptos balance'.";
      } else {
        const address = parts[2];
        // Fetch the account resources from Aptos blockchain
        const resources = await aptos.getAccountResources({ accountAddress: address });
        // Look for the coin balance resource (it usually includes '::coin::CoinStore')
        const coin = resources.find((r) => r.type.includes("::coin::CoinStore"));
        if (coin) {
          reply = `Aptos Balance for ${address}: ${coin.data.coin.value} APT`;
        } else {
          reply = `No balance found for ${address}.`;
        }
      }
    } else {
      // For all other queries, forward to Move AI
      const moveAIResponse = await axios.post(MOVE_AI_API, { query });
      reply = moveAIResponse.data?.reply || "Move AI couldn't process this.";
    }
  } catch (error) {
    console.error("Error processing query:", error);
    reply = "An error occurred while processing your request.";
  }

  res.json({ reply });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
