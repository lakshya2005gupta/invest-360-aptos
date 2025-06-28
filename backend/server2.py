from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import requests
from data import get_user_portfolio  # Import the database functions
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for frontend

def get_live_price(stock_name):
    """Fetch live price from Yahoo Finance."""
    try:
        stock_symbol = stock_name.replace(" ", "").upper() + ".NS"  # Convert name to NSE ticker
        stock = yf.Ticker(stock_symbol)
        live_data = stock.history(period="1d")

        if live_data.empty:
            return None  # If no data found, return None
        return round(live_data["Close"].iloc[-1], 2)  # Return latest closing price
    except Exception as e:
        print(f"Error fetching price for {stock_name}: {e}")
        return None  # Handle API errors gracefully

# Create a persistent session with headers mimicking a real browser.
session = requests.Session()
headers = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/115.0.0.0 Safari/537.36"),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/",
    "Connection": "keep-alive",
}
session.headers.update(headers)

# Prime the session by calling the NSE homepage so that cookies are set.
try:
    session.get("https://www.nseindia.com", timeout=10)
except Exception as e:
    print("Error priming NSE session:", e)

# Simple caching to avoid making too many requests (60-second expiry)
CACHE_EXPIRATION = 60  # seconds
cache = {}

def get_quote_nse(symbol):
    """
    Retrieve the quote for a given NSE symbol using NSE's API.
    This function caches the result for CACHE_EXPIRATION seconds.
    """
    current_time = time.time()
    if symbol in cache and (current_time - cache[symbol]["time"]) < CACHE_EXPIRATION:
        return cache[symbol]["data"]
    
    url = f"https://www.nseindia.com/api/quote-equity?symbol={symbol}"
    try:
        response = session.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        cache[symbol] = {"data": data, "time": current_time}
        return data
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return None

def get_etf_price(symbol, fallback_price):
    """
    Fetch live ETF price from NSE using a custom API call.
    Returns the last traded price as a float, or the fallback if data isn't available.
    """
    data = get_quote_nse(symbol)
    if data and "priceInfo" in data and "lastPrice" in data["priceInfo"]:
        return float(data["priceInfo"]["lastPrice"])
    print(f"No data found for {symbol}, using fallback.")
    return fallback_price

def get_live_nav(mutual_fund_name):
    """Fetch latest NAV for mutual funds using AMFI API."""
    try:
        url = "https://www.amfiindia.com/spages/NAVAll.txt"
        response = requests.get(url)
        response_text = response.text.split("\n")

        for line in response_text:
            columns = line.split(";")
            if len(columns) > 4:
                fund_name_amfi = columns[3].strip().lower()  # Normalize AMFI name
                fund_name_input = mutual_fund_name.strip().lower()  # Normalize input name

                if fund_name_input in fund_name_amfi:  # Substring match
                    return float(columns[4])  

        return None  
    except Exception as e:
        print(f"Error fetching NAV for {mutual_fund_name}: {e}")
        return None

def calculate_fd_maturity(principal, rate, time):
    """Calculate FD maturity using simple interest formula."""
    return round(principal + (principal * rate * time / 1200), 2)

def calculate_government_scheme_maturity(investment, rate, time):
    """Calculate Government Scheme maturity using simple interest formula."""
    return round(investment + (investment * rate * time / 1200), 2)

def calculate_rd_maturity(monthly_deposit, rate, months):
    """Calculate RD maturity using compound interest formula."""
    R = rate / 100  # Convert rate to decimal
    N = 12  # Monthly compounding
    t = months / 12  # Convert months to years

    maturity_value = monthly_deposit * ((1 + R / N) ** (N * t) - 1) / (1 - (1 + R / N) ** -1)
    return round(maturity_value, 2)


def calculate_portfolio(pan):
    """Dynamically fetch prices and calculate portfolio value."""
    portfolio = get_user_portfolio(pan)  # Fetch portfolio from database
    if not portfolio:
        return None

    total_portfolio_value = 0

    gold_etf_ticker = "GOLDBEES"    # Gold ETF on NSE
    silver_etf_ticker = "SILVERBEES" # Silver ETF on NSE

    gold_price = get_etf_price(gold_etf_ticker, 6000)
    silver_price = get_etf_price(silver_etf_ticker, 75)

    for category, details in portfolio["assets"].items():
        total_category_value = 0
        for item in details["holdings"]:
            if "name" in item and category == "Stocks":
                live_price = get_live_price(item["name"])
                item["price_per_share"] = live_price if live_price is not None else 0
                item["total_value"] = item["quantity"] * item["price_per_share"]
            
            elif "name" in item and category == "Mutual Funds":
                live_nav = get_live_nav(item["name"])
                item["nav"] = live_nav if live_nav is not None else 0
                item["total_value"] = item["units"] * item["nav"]

            elif "type" in item and category == "ETF":  # ✅ Fixed Gold & Silver
                item["price_per_unit"] = gold_price if item["type"] == "Gold" else silver_price
                item["total_value"] = item["quantity"] * item["price_per_unit"]


            elif category == "Fixed Deposits":  
                item["total_value"] = calculate_fd_maturity(item["investment"], item["interest_rate"], item["duration"])

            elif category == "Recurring Deposits":  
                item["total_value"] = calculate_rd_maturity(item["monthly_deposit"], item["interest_rate"], item["duration"])

            elif category == "Government Schemes":  
                item["total_value"] = calculate_government_scheme_maturity(item["investment"], item["interest_rate"], item["duration"])

            else:
                item["total_value"] = 0

            total_category_value += item["total_value"]

        details["total_value"] = total_category_value
        total_portfolio_value += total_category_value

    # ✅ Calculate Allocation %
    if total_portfolio_value > 0:
        for category, details in portfolio["assets"].items():
            for item in details["holdings"]:
                item["allocation"] = f"{(item['total_value'] / total_portfolio_value) * 100:.2f}%"

    return {"assets": portfolio["assets"], "total_portfolio_value": total_portfolio_value}

def calculate_risk_analysis(portfolio_data):
    risk_weights = {
        "Stocks": 0.9,
        "Mutual Funds": 0.65,
        "ETF": 0.6,
        "Fixed Deposits": 0.2,
        "Recurring Deposits": 0.2,
        "Government Schemes": 0.1
    }

    total_value = portfolio_data["total_portfolio_value"]
    risk_score = 0

    for category, details in portfolio_data["assets"].items():
        category_value = details.get("total_value", 0)
        allocation_ratio = category_value / total_value if total_value else 0
        risk_score += allocation_ratio * risk_weights.get(category, 0)

    if risk_score >= 0.75:
        risk_level = "High Risk"
    elif risk_score >= 0.5:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    return {"risk_score": round(risk_score, 2), "risk_level": risk_level}

def generate_recommendations(portfolio_data, risk_analysis):
    recommendations = []
    risk_level = risk_analysis.get("risk_level")
    
    # Recommendation based on risk level
    if risk_level == "High Risk":
        recommendations.append("Consider reducing exposure to high-volatility assets like stocks and aggressive mutual funds.")
        recommendations.append("Increase allocation in Fixed Deposits, Recurring Deposits, or Government Schemes for stability.")
    elif risk_level == "Moderate Risk":
        recommendations.append("Maintain a balanced portfolio by ensuring a mix of equities and fixed-income instruments.")
        recommendations.append("Rebalance periodically to adjust to market changes and protect against market volatility.")
    else:  # Low Risk
        recommendations.append("Your portfolio is conservative. Consider adding a small allocation to growth-oriented assets for higher returns.")
        recommendations.append("Review opportunities in equity-linked savings schemes or diversified equity mutual funds.")
    
    # Additional recommendation based on asset allocation
    total_assets = portfolio_data["total_portfolio_value"]
    if total_assets > 0:
        # Example: Check if stocks form a very high portion of the portfolio.
        stocks_value = portfolio_data["assets"].get("Stocks", {}).get("total_value", 0)
        if stocks_value / total_assets > 0.7:
            recommendations.append("Stocks constitute over 70% of your portfolio. Diversify by reducing equity exposure.")
    
    return recommendations

def check_bad_stock(stock_name):
    """Checks if a stock is 'bad' based on price drop and historical performance."""
    try:
        stock_symbol = stock_name.replace(" ", "").upper() + ".NS"  # Convert name to NSE ticker
        stock = yf.Ticker(stock_symbol)
        historical_data = stock.history(period="3mo")  # Check the past 3 months

        if historical_data.empty:
            return {"status": "error", "message": "No data available for this stock"}

        # Check if the stock price has been consistently falling over the last 3 months
        initial_price = historical_data["Close"].iloc[0]
        current_price = historical_data["Close"].iloc[-1]
        price_change_percentage = ((current_price - initial_price) / initial_price) * 100

        if price_change_percentage < -10:  # If the stock has fallen more than 10%
            return {
                "status": "bad",
                "message": f"The stock {stock_name} has dropped by {price_change_percentage:.2f}% over the last 3 months."
            }
        else:
            return {
                "status": "good",
                "message": f"The stock {stock_name} is performing well with a change of {price_change_percentage:.2f}% over the last 3 months."
            }
    except Exception as e:
        return {"status": "error", "message": f"Error checking stock data: {e}"}

def check_bad_mutual_fund(mutual_fund_name):
    """Checks if a mutual fund is 'bad' based on NAV, expense ratio, and AUM."""
    try:
        url = "https://www.amfiindia.com/spages/NAVAll.txt"
        response = requests.get(url)
        response_text = response.text.split("\n")

        if not response_text:
            return {"status": "error", "message": "No data returned from AMFI."}

        for line in response_text:
            columns = line.split(";")
            if len(columns) > 4:
                fund_name_amfi = columns[3].strip().lower()
                fund_name_input = mutual_fund_name.strip().lower()

                if fund_name_input in fund_name_amfi:  # Substring match for mutual fund name
                    try:
                        nav = float(columns[4].strip())
                        expense_ratio = float(columns[7].strip())
                        aum = float(columns[8].strip())

                        # Check if NAV is too low (indicating potential underperformance)
                        if nav < 10:
                            return {
                                "status": "bad",
                                "message": f"The mutual fund {mutual_fund_name} has a low NAV: {nav:.2f}, indicating potential underperformance."
                            }

                        # Check if expense ratio is too high (greater than 2%)
                        if expense_ratio > 2:
                            return {
                                "status": "bad",
                                "message": f"The mutual fund {mutual_fund_name} has a high expense ratio: {expense_ratio:.2f}%, which may be too costly."
                            }

                        # Check if AUM is too low (less than 100 crore)
                        if aum < 100:
                            return {
                                "status": "bad",
                                "message": f"The mutual fund {mutual_fund_name} has a low AUM: {aum:.2f} crore, indicating lack of investor confidence."
                            }

                    except ValueError as e:
                        continue  # Skip lines with missing or invalid data

        return {"status": "good", "message": "The mutual fund is performing well."}
    
    except Exception as e:
        return {"status": "error", "message": f"Error checking mutual fund data: {e}"}


@app.route("/getPortfolio", methods=["POST"])
def get_portfolio():
    try:
        data = request.get_json()
        if not data or "pan" not in data:
            return jsonify({"error": "PAN number is required"}), 400

        pan = data["pan"].upper()  # Convert PAN to uppercase
        portfolio = calculate_portfolio(pan)

        if portfolio:
            return jsonify(portfolio)  # ✅ Now includes total_portfolio_value
        else:
            return jsonify({"error": "No portfolio found for the given PAN"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/getRecommendations", methods=["POST"])
def get_recommendations():
    try:
        data = request.get_json()
        if not data or "pan" not in data:
            return jsonify({"error": "PAN number is required"}), 400
        pan = data["pan"].upper()
        portfolio = calculate_portfolio(pan)
        if not portfolio:
            return jsonify({"error": "No portfolio found for the given PAN"}), 404
        
        risk_analysis = calculate_risk_analysis(portfolio)
        recommendations = generate_recommendations(portfolio, risk_analysis)
        
        return jsonify({
            "risk_analysis": risk_analysis,
            "recommendations": recommendations
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/checkBadStock", methods=["POST"])
def check_stock():
    try:
        data = request.get_json()
        if not data or "stock_name" not in data:
            return jsonify({"error": "Stock name is required"}), 400

        stock_name = data["stock_name"]
        result = check_bad_stock(stock_name)

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/checkBadMutualFund", methods=["POST"])
def check_mutual_fund():
    try:
        data = request.get_json()
        if not data or "mutual_fund_name" not in data:
            return jsonify({"error": "Mutual fund name is required"}), 400

        mutual_fund_name = data["mutual_fund_name"]
        result = check_bad_mutual_fund(mutual_fund_name)

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)