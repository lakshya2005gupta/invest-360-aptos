import json

DATABASE = {}

def save_user_portfolio(pan, portfolio):
    """Save portfolio data to the database."""
    DATABASE[pan] = portfolio

def get_cached_portfolio(pan):
    """Fetch the latest cached portfolio from the database."""
    return DATABASE.get(pan)