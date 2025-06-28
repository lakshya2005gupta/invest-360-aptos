from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import requests
from data import get_user_portfolio  # Import the database functions
import time
from database import save_user_portfolio, get_cached_portfolio  # Import database functions
import datetime
import numpy as np
import pandas as pd
import ta  # Technical Analysis indicators
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, StackingRegressor
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.svm import SVR
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.impute import SimpleImputer
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

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


CACHE_EXPIRATION_SECONDS = 3600  # 1 hour

def calculate_portfolio(pan):
    """Fetch live prices and store portfolio in DB to avoid repeated API calls."""
    portfolio = get_user_portfolio(pan)  # Fetch from database
    if not portfolio:
        return None

    last_updated = portfolio.get("last_updated")
    current_time = datetime.datetime.now().timestamp()

    # Check if the last update was within CACHE_EXPIRATION_SECONDS
    if last_updated and (current_time - last_updated) < CACHE_EXPIRATION_SECONDS:
        return portfolio  # Return cached portfolio if recent

    total_portfolio_value = 0
    gold_price = get_etf_price("GOLDBEES", 73.95)
    silver_price = get_etf_price("SILVERBEES", 94.18)

    for category, details in portfolio["assets"].items():
        total_category_value = 0
        for item in details["holdings"]:
            if category == "Stocks":
                live_price = get_live_price(item["name"])
                item["price_per_share"] = live_price if live_price is not None else 0
                item["total_value"] = item["quantity"] * item["price_per_share"]
            
            elif category == "Mutual Funds":
                live_nav = get_live_nav(item["name"])
                item["nav"] = live_nav if live_nav is not None else 0
                item["total_value"] = item["units"] * item["nav"]

            elif category == "ETF":
                item["price_per_unit"] = gold_price if item["type"] == "Gold" else silver_price
                item["total_value"] = item["quantity"] * item["price_per_unit"]

            elif category == "Fixed Deposits":
                item["total_value"] = calculate_fd_maturity(item["investment"], item["interest_rate"], item["duration"])

            elif category == "Recurring Deposits":
                item["total_value"] = calculate_rd_maturity(item["monthly_deposit"], item["interest_rate"], item["duration"])

            elif category == "Government Schemes":
                item["total_value"] = calculate_government_scheme_maturity(item["investment"], item["interest_rate"], item["duration"])

            total_category_value += item["total_value"]

        details["total_value"] = total_category_value
        total_portfolio_value += total_category_value

    portfolio["total_portfolio_value"] = total_portfolio_value
    portfolio["last_updated"] = current_time  # Store timestamp

    if total_portfolio_value > 0:
        for category, details in portfolio["assets"].items():
            for item in details["holdings"]:
                item["allocation"] = f"{(item['total_value'] / total_portfolio_value) * 100:.2f}%"

    save_user_portfolio(pan, portfolio)  # Save updated portfolio to database

    return portfolio

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
            return jsonify(portfolio)
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
        portfolio = get_cached_portfolio(pan)  # Fetch from database
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


# Assumed base returns and worst-case drawdowns for asset classes.
ASSET_CLASSES = {
    "stocks": {"avg_return": 0.15, "worst_drawdown": -0.40},
    "mutualFunds": {"avg_return": 0.09, "worst_drawdown": -0.30},
    "FDs": {"avg_return": 0.06, "worst_drawdown": 0.00},
    "ETFs": {"avg_return": 0.10, "worst_drawdown": -0.25},
    "govtSchemes": {"avg_return": 0.07, "worst_drawdown": -0.05},
}

def calculate_cagr(current_wealth, target_wealth, time_frame):
    """Calculate the required CAGR to reach the target wealth."""
    return (target_wealth / current_wealth) ** (1 / time_frame) - 1

def simulate_market_scenarios(cagr):
    """Generate different CAGR projections for Optimistic, Neutral, and Pessimistic cases."""
    return {
        "Optimistic": round(cagr * 1.2, 4),
        "Neutral": round(cagr, 4),
        "Pessimistic": round(cagr * 0.8, 4)
    }

def estimate_drawdown(risk_category):
    """
    Estimate worst-case drawdown:
      - Low risk: ~10% loss
      - Medium risk: ~30% loss
      - High risk: ~60% loss
    """
    risk_mapping = {"Low": 0.10, "Medium": 0.30, "High": 0.60}
    return round(risk_mapping.get(risk_category, 0.3) * 100, 2)

def normalize_allocation(allocation):
    """Normalize an allocation dictionary so that the sum equals 100%."""
    total = sum(allocation.values())
    return {k: round((v / total) * 100, 2) for k, v in allocation.items()}

def dynamic_allocation(risk_category, required_cagr, investment_type):
    """
    Generate a dynamic asset allocation based on:
      - risk_category: "Low", "Medium", or "High"
      - required_cagr: overall CAGR required to meet the target
      - investment_type: "Lump-Sum" or "SIP"
    
    The allocation is adjusted continuously relative to a risk-category–specific baseline.
    """
    if risk_category == "Low":
        base = {"stocks": 5, "mutualFunds": 10, "FDs": 60, "ETFs": 5, "govtSchemes": 20}
        baseline = 0.08  # 8% baseline for low risk.
        diff = required_cagr - baseline
        if diff < 0:
            base["FDs"] += abs(diff) * 50
            base["govtSchemes"] += abs(diff) * 30
            base["stocks"] = max(base["stocks"] - abs(diff) * 20, 0)
            base["ETFs"] = max(base["ETFs"] - abs(diff) * 10, 0)
    elif risk_category == "Medium":
        base = {"stocks": 30, "mutualFunds": 30, "FDs": 10, "ETFs": 20, "govtSchemes": 10}
        baseline = 0.10  # 10% baseline for medium risk.
        diff = required_cagr - baseline
        if diff > 0:
            base["stocks"] += diff * 80
            base["ETFs"] += diff * 40
            base["FDs"] = max(base["FDs"] - diff * 40, 0)
            base["govtSchemes"] = max(base["govtSchemes"] - diff * 20, 0)
        elif diff < 0:
            base["stocks"] = max(base["stocks"] + diff * 40, 0)
            base["ETFs"] = max(base["ETFs"] + diff * 20, 0)
            base["FDs"] += abs(diff) * 30
            base["govtSchemes"] += abs(diff) * 10
    elif risk_category == "High":
        base = {"stocks": 60, "mutualFunds": 25, "FDs": 0, "ETFs": 10, "govtSchemes": 5}
        baseline = 0.15  # 15% baseline for high risk.
        diff = required_cagr - baseline
        if diff > 0:
            base["stocks"] += diff * 120
            base["ETFs"] += diff * 80
            base["mutualFunds"] = max(base["mutualFunds"] - diff * 20, 0)
            base["govtSchemes"] = max(base["govtSchemes"] - diff * 10, 0)
        elif diff < 0:
            base["stocks"] = max(base["stocks"] + diff * 60, 0)
            base["ETFs"] = max(base["ETFs"] + diff * 30, 0)
            base["mutualFunds"] += abs(diff) * 20

    # Further adjust for SIP investments.
    if investment_type == "SIP":
        if "mutualFunds" in base:
            base["mutualFunds"] += 5
        if "FDs" in base:
            base["FDs"] = max(base["FDs"] - 5, 0)
    
    return normalize_allocation(base)

def compute_dynamic_asset_return(asset):
    """
    Compute a dynamic expected return for an asset.
    Dynamic return = base return + k * abs(worst_drawdown).
    Adjust k to increase or decrease the risk premium.
    """
    k = 0.5  # Risk premium factor; increase if you need a larger spread.
    base_return = ASSET_CLASSES[asset]["avg_return"]
    drawdown = abs(ASSET_CLASSES[asset]["worst_drawdown"])
    return base_return + k * drawdown

def compute_expected_return(allocation, risk_category):
    """
    Compute the expected annual return for a basket as the weighted average of dynamic asset returns.
    Then, apply an additional risk premium adjustment:
      - Low risk: subtract ~1%
      - High risk: add ~4%
    """
    base_return = 0.0
    for asset, perc in allocation.items():
        asset_dynamic_return = compute_dynamic_asset_return(asset)
        base_return += (perc / 100) * asset_dynamic_return

    if risk_category == "Low":
        return base_return - 0.01
    elif risk_category == "High":
        return base_return + 0.04
    return base_return

def forecast_wealth_growth(initial_wealth, annual_return, time_frame):
    """Forecast yearly wealth growth based on the annual return."""
    growth = []
    for year in range(1, time_frame + 1):
        wealth = initial_wealth * ((1 + annual_return) ** year)
        growth.append({"year": year, "wealth": round(wealth, 2)})
    return growth

def feasibility_check(cagr):
    """Check if the overall required CAGR is realistic."""
    if cagr > 0.20:
        return {
            "warning": "Your target requires extremely high returns (CAGR > 20%). Consider increasing the time frame or investing more.",
            "alternativeGoal": f"Increase time frame by 2 years to require only {round(((cagr + 1) ** (1 / 1.2) - 1) * 100, 2)}% CAGR."
        }
    return {}

def ai_investment_advice(cagr):
    """Provide AI-driven advice based on overall required CAGR."""
    if cagr < 0.07:
        return "Your target return is low. Consider a very conservative portfolio emphasizing FDs and Govt Schemes."
    elif cagr < 0.15:
        return "A balanced portfolio with a mix of mutual funds, ETFs, and stocks is recommended."
    else:
        return "High returns are required. An aggressive portfolio with a significantly higher allocation to stocks and ETFs is suggested."

@app.route('/calculate-baskets', methods=['POST'])
def calculate_baskets():
    """
    API endpoint to generate diversified investment baskets dynamically (Low, Medium, High).
    For each basket, we compute:
      - Dynamic asset allocation based on required CAGR,
      - Expected annual return (using dynamic returns and risk premium),
      - Yearly wealth projection,
      - Final wealth and goal achievement (or shortfall).
    Also returns overall market scenarios, feasibility, and AI-driven advice.
    """
    try:
        data = request.get_json()
        current_wealth = float(data.get("currentWealth", 0))
        target_wealth = float(data.get("targetWealth", 0))
        time_frame = int(data.get("timeFrame", 0))
        investment_type = data.get("investmentType", "Lump-Sum")  # "Lump-Sum" or "SIP"

        if current_wealth <= 0 or target_wealth <= 0 or time_frame <= 0:
            return jsonify({"error": "Invalid input values"}), 400

        req_cagr = calculate_cagr(current_wealth, target_wealth, time_frame)
        market_scenarios = simulate_market_scenarios(req_cagr)

        baskets_result = {}
        for risk in ["Low", "Medium", "High"]:
            alloc = dynamic_allocation(risk, req_cagr, investment_type)
            exp_return = compute_expected_return(alloc, risk)
            projection = forecast_wealth_growth(current_wealth, exp_return, time_frame)
            final_wealth = projection[-1]["wealth"]
            goal_met = final_wealth >= target_wealth
            shortfall = target_wealth - final_wealth if not goal_met else 0

            baskets_result[risk] = {
                "allocation": alloc,
                "expectedReturn": round(exp_return * 100, 2),
                "finalWealth": final_wealth,
                "goalAchieved": goal_met,
                "shortfall": round(shortfall, 2),
                "wealthProjection": projection
            }
        
        feasibility = feasibility_check(req_cagr)
        advice = ai_investment_advice(req_cagr)

        result = {
            "requiredCAGR": round(req_cagr * 100, 2),
            "marketScenarios": {k: round(v * 100, 2) for k, v in market_scenarios.items()},
            "baskets": baskets_result,
            "feasibility": feasibility,
            "investmentAdvice": advice
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------
# Helper Functions Machine Learning
# --------------------------
def get_numeric_series(df, column):
    series = df[column]
    if not isinstance(series, pd.Series):
        series = series.squeeze()
    return pd.to_numeric(series, errors='coerce')

def safe_serialize(obj):
    """Ensure JSON serializability"""
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict(orient="records")
    elif isinstance(obj, pd.Series):
        return obj.to_dict()
    return obj

def fetch_stock_data(ticker, max_retries=3, delay=5):
    """Handle Yahoo Finance timeouts with retries"""
    for attempt in range(max_retries):
        try:
            df = yf.download(ticker, period="max", auto_adjust=True, timeout=20)
            if not df.empty:
                return df
        except Exception as e:
            print(f"Attempt {attempt + 1}: Failed to fetch data for {ticker}. Error: {e}")
            time.sleep(delay)
    return None  # Return None if all retries fail

# --------------------------
# Compute Technical Indicators
# --------------------------
def add_technical_indicators(df):
    df = df.sort_index().copy()
    df = df.loc[:, ~df.columns.duplicated()]
    
    close_series = get_numeric_series(df, "Close")
    high_series = get_numeric_series(df, "High")
    low_series = get_numeric_series(df, "Low")
    volume_series = get_numeric_series(df, "Volume")

    df["MA50"] = close_series.rolling(window=50, min_periods=1).mean()
    df["MA200"] = close_series.rolling(window=200, min_periods=1).mean()
    df["RSI"] = ta.momentum.RSIIndicator(close_series, window=14).rsi()
    macd = ta.trend.MACD(close_series)
    df["MACD"] = macd.macd()
    bollinger = ta.volatility.BollingerBands(close_series)
    df["BB_Upper"] = bollinger.bollinger_hband()
    df["BB_Lower"] = bollinger.bollinger_lband()
    adx_indicator = ta.trend.ADXIndicator(high=high_series, low=low_series, close=close_series, window=14)
    df["ADX"] = adx_indicator.adx()
    obv_indicator = ta.volume.OnBalanceVolumeIndicator(close=close_series, volume=volume_series)
    df["OBV"] = obv_indicator.on_balance_volume()

    for col in ["RSI", "MACD", "BB_Upper", "BB_Lower", "ADX", "OBV"]:
        df[col] = df[col].bfill()

    return df

# --------------------------
# Add Fundamental Indicators
# --------------------------
def add_fundamental_indicators(df, ticker):
    tkr = yf.Ticker(ticker)
    try:
        info = tkr.info
    except Exception as e:
        print(f"Failed to fetch fundamentals for {ticker}. Error: {e}")
        info = {}

    fundamental_features = {
        "MarketCap": info.get("marketCap", np.nan),
        "TrailingPE": info.get("trailingPE", np.nan),
        "ForwardPE": info.get("forwardPE", np.nan),
        "PriceToBook": info.get("priceToBook", np.nan),
        "DividendYield": info.get("dividendYield", np.nan),
        "Beta": info.get("beta", np.nan),
        "returnOnEquity": info.get("returnOnEquity", np.nan)
    }
    
    for key, value in fundamental_features.items():
        df[key] = 0.0 if pd.isna(value) else value
    
    return df

# --------------------------
# LSTM Model
# --------------------------
def create_lstm_model(input_shape):
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(64, return_sequences=False),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(1, activation='linear')
    ])
    model.compile(optimizer='adam', loss='mse')
    return model

# --------------------------
# Flask API Route
# --------------------------
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    stock = data.get("stock")
    prediction_period = int(data.get("prediction_period", 63))

    df = yf.download(stock, period="max", auto_adjust=True)
    if df.empty:
        return jsonify({"error": f"No data fetched for {stock}"}), 400

    df["Stock"] = stock
    df = df.sort_index()
    df_ti = add_technical_indicators(df)
    df_ti = add_fundamental_indicators(df_ti, stock)

    df_ti["Target"] = (df_ti["Close"].shift(-prediction_period) / df_ti["Close"]) - 1
    df_ti = df_ti.iloc[:-prediction_period]

    features = ["MA50", "MA200", "RSI", "MACD", "BB_Upper", "BB_Lower", "ADX", "OBV",
                "MarketCap", "TrailingPE", "ForwardPE", "PriceToBook", "DividendYield", "Beta"]
    
    X = df_ti[features].dropna()
    y = df_ti["Target"].dropna()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    base_models = [
        ('rf', RandomForestRegressor(n_estimators=100, random_state=42)),
        ('gbr', GradientBoostingRegressor(random_state=42)),
        ('svr', SVR()),
        ('ridge', Ridge())
    ]

    stacking_reg = StackingRegressor(
        estimators=base_models,
        final_estimator=LinearRegression(),
        cv=5
    )

    pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('stacking', stacking_reg)
    ])

    pipeline.fit(X_train, y_train)

    # Prepare latest data for LSTM
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X_train)
    X_lstm = np.reshape(X_scaled, (X_scaled.shape[0], 1, X_scaled.shape[1]))

    lstm_model = create_lstm_model((1, X_scaled.shape[1]))
    lstm_model.fit(X_lstm, y_train, epochs=50, batch_size=32, verbose=1)

    predicted_growth = pipeline.predict([X.iloc[-1].values])[0]
    predicted_lstm = lstm_model.predict(X_lstm[-1].reshape(1, 1, X_lstm.shape[2]))[0][0]

    final_prediction = (predicted_growth + predicted_lstm) / 2

    return jsonify({"stock": stock, "predicted_growth_percent": round(final_prediction * 100, 2)})

@app.route("/get_stock_suggestions", methods=["GET"])
def get_stock_suggestions():
    query = request.args.get("q", "").strip()
    
    if len(query) < 2:
        return jsonify({"stocks": []})

    url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        response = requests.get(url, headers=headers)
        data = response.json()

        stocks = []
        for stock in data.get("quotes", []):
            if "symbol" in stock and "shortname" in stock:
                stocks.append({"symbol": stock["symbol"], "name": stock["shortname"]})

        return jsonify({"stocks": stocks})
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)