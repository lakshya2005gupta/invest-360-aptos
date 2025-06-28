# data.py

# Sample Portfolio Data (Mock Database)
user_portfolios = {
    "ABCDE1234F": {
        "assets": {
            "Stocks": {
                "holdings": [
                    {"name": "ICICI Bank", "quantity": 10},
                    {"name": "TCS", "quantity": 5},
                    {"name": "ITI", "quantity": 8},
                    {"name": "HDFC Bank", "quantity": 15},
                    {"name": "ITC", "quantity": 20}
                ]
            },
            "Mutual Funds": {
                "holdings": [
                    {"name": "Parag Parikh Flexi Cap", "units": 80},
                    {"name": "HDFC Large Cap", "units": 10}
                ]
            },
            "ETF": {
                "holdings": [
                    {"type": "Gold", "quantity": 300},
                    {"type": "Silver", "quantity": 20}
                ]
            },
            "Fixed Deposits": {
                "holdings": [
                    {"bank": "SBI", "investment": 100000, "duration": 12, "interest_rate": 7.5},
                    {"bank": "Kotak Mahindra", "investment": 50000, "duration": 4, "interest_rate": 2.8}
                ]
            },
            "Recurring Deposits": {
                "holdings": [
                    {"bank": "ICICI", "monthly_deposit": 5000, "duration": 12, "interest_rate": 6.5}
                ]
            },
            "Government Schemes": {
                "holdings": [
                    {"scheme": "PPF", "investment": 80000, "duration": 15, "interest_rate": 7.1},
                    {"scheme": "NPS", "investment": 100000, "duration": 10, "interest_rate": 7.3}
                ]
            }
        }
    }
}

def get_user_portfolio(pan):
    return user_portfolios.get(pan)