let timeout = null;
let controller = new AbortController();
let selectedStockSymbol = ""; // Stores the selected stock symbol (Yahoo Finance ID)

async function fetchStockSuggestions() {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    const stockInput = document.getElementById("stock");
    const stockListDiv = document.getElementById("stock-list");
    const query = stockInput.value.trim();

    if (query.length < 2) {
      stockListDiv.style.display = "none";
      return;
    }

    controller.abort(); // Abort any ongoing request
    controller = new AbortController();

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/get_stock_suggestions?q=${query}`,
        { signal: controller.signal }
      );
      const data = await response.json();
      renderStockSuggestions(data.stocks, query);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching stock suggestions:", error);
      }
      stockListDiv.style.display = "none";
    }
  }, 300);
}

function renderStockSuggestions(stocks, query) {
  const stockListDiv = document.getElementById("stock-list");
  stockListDiv.innerHTML = "";

  if (stocks.length > 0) {
    stocks.forEach(stock => {
      const stockItem = document.createElement("div");
      stockItem.classList.add("stock-item");
      stockItem.dataset.symbol = stock.symbol; // Store symbol (Yahoo Finance ID)

      // Highlight matched part of query
      const regex = new RegExp(`(${query})`, "i");
      const highlightedName = stock.name.replace(regex, "<strong>$1</strong>");
      stockItem.innerHTML = highlightedName; // Use innerHTML to allow formatting

      stockListDiv.appendChild(stockItem);
    });
    stockListDiv.style.display = "block";
  } else {
    stockListDiv.style.display = "none";
  }
}

function selectStock(stockSymbol, stockName) {
  selectedStockSymbol = stockSymbol.trim();
  document.getElementById("stock").value = stockName; // Show only name in input
  document.getElementById("stock-list").style.display = "none";
  console.log("Selected stock:", stockSymbol);
}

async function predictStock() {
  if (!selectedStockSymbol) {
    document.getElementById("result").textContent = "❌ Please select a stock!";
    return;
  }
  const predictionPeriod = document.getElementById("prediction_period").value.trim();
  if (!predictionPeriod || isNaN(predictionPeriod) || parseInt(predictionPeriod) <= 0) {
    document.getElementById("result").textContent = "❌ Please enter a valid prediction period!";
    return;
  }
  document.getElementById("result").textContent = "⏳ Predicting...";

  const requestData = {
    stock: selectedStockSymbol,
    prediction_period: parseInt(predictionPeriod)
  };
  console.log("Sending request data:", requestData);

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();
    console.log("Received response:", data);

    if (data.error) {
      document.getElementById("result").textContent = `❌ Error: ${data.error}`;
    } else {
      // Ensure positive numbers have a "+" sign
      const growth = data.predicted_growth_percent;
      const formattedGrowth = growth >= 0 ? `+${growth}` : `${growth}`;
      document.getElementById("result").textContent = `✅ Predicted Growth: ${formattedGrowth}%`;
    }
  } catch (error) {
    document.getElementById("result").textContent = "❌ Failed to fetch prediction!";
    console.error("Error:", error);
  }
}

// Event delegation for suggestion click
document.getElementById("stock-list").addEventListener("click", (event) => {
  if (event.target.classList.contains("stock-item")) {
    selectStock(event.target.dataset.symbol, event.target.textContent);
  }
});

// Hide suggestion dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (!document.getElementById("stock-list").contains(event.target) &&
      event.target !== document.getElementById("stock")) {
    document.getElementById("stock-list").style.display = "none";
  }
});

// Reset stock symbol if user types manually
document.getElementById("stock").addEventListener("input", () => {
  selectedStockSymbol = "";
});