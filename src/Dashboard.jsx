
import { useEffect, useState } from "react";

const PortfolioDashboard = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pan = urlParams.get("pan");
        if (pan) {
            fetchPortfolio(pan.toUpperCase());
        } else {
            setError("No PAN found. Please log in again.");
        }
    }, []);

    const fetchPortfolio = async (pan) => {
        setLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:5000/getPortfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pan })
            });
            const data = await response.json();
            if (data.error || !data.assets) {
                setError(data.error || "No portfolio data available.");
            } else {
                setPortfolio(data);
            }
        } catch (error) {
            setError("Error fetching portfolio.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('bg.jpg')" }}>
            <div className="bg-white bg-opacity-95 p-8 rounded-lg shadow-lg w-full max-w-3xl text-center">
                {loading && <div className="text-lg font-semibold text-gray-600">Loading...</div>}
                {error && <p className="text-red-600 font-semibold">{error}</p>}
                {portfolio && (
                    <>
                        <h2 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-3 px-5 rounded-md shadow-md inline-block">
                            Your Portfolio Value: <strong>₹{Number(portfolio.total_portfolio_value).toLocaleString()}</strong>
                        </h2>
                        <PortfolioDetails data={portfolio} />
                    </>
                )}
            </div>
        </div>
    );
};

const PortfolioDetails = ({ data }) => {
    const categoryOrder = ["Stocks", "Mutual Funds", "Commodities", "Government Schemes", "Fixed Deposits", "Recurring Deposits"];
    const sortedAssets = categoryOrder.map(category => data.assets[category]).filter(Boolean);

    return (
        <div className="mt-5">
            {sortedAssets.map((details, index) => {
                const category = categoryOrder[index];
                const keys = Object.keys(details.holdings[0] || {});
                
                const nameKey = keys.find(k => ["name", "type", "scheme", "bank"].includes(k));
                const valueKey = keys.find(k => ["total_value", "maturity_value"].includes(k));

                const hideTotalValue = ["Fixed Deposits", "Recurring Deposits", "Government Schemes"].includes(category);
                const filteredKeys = [nameKey, ...keys.filter(k => k !== nameKey && k !== valueKey), valueKey].filter(Boolean);

                return (
                    <div key={category} className="mb-6">
                        <h3 className="bg-blue-600 text-white py-3 px-5 rounded-md text-lg font-semibold transition duration-300 hover:bg-blue-800">
                            {category} (Total: ₹{Number(details.total_value).toLocaleString()})
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse mt-3 rounded-lg shadow-md">
                                <thead>
                                    <tr>
                                        {filteredKeys.map(key => (
                                            <th key={key} className="bg-gradient-to-r from-blue-600 to-blue-400 text-white uppercase py-3 px-4 border border-orange-500">
                                                {key.replace(/_/g, " ")}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.holdings
                                        .sort((a, b) => b.total_value - a.total_value)
                                        .map((item, idx) => (
                                            <tr key={idx} className={`transition duration-200 ${idx % 2 === 0 ? "bg-blue-50" : "bg-yellow-50"} hover:bg-blue-200`}>
                                                {filteredKeys.map(key => (
                                                    <td key={key} className={`py-3 px-4 border border-orange-500 ${parseFloat(item.allocation) > 20 ? "bg-red-100" : ""}`}>
                                                        {["total_value", "price_per_share", "nav", "price_per_gram", "maturity_value", "investment", "monthly_deposit"].includes(key)
                                                            ? `₹${Number(item[key]).toLocaleString()}`
                                                            : item[key]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PortfolioDashboard;
