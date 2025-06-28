import { useState, useEffect } from "react";

export default function LandingPage() {
  const [panid, setPanId] = useState("");

  useEffect(() => {
    const storedPanId = localStorage.getItem('userPan');
    if (storedPanId) {
      setPanId(storedPanId);
    }
  }, []);

  const handleRedirect = (url) => {
    console.log("Redirecting to", url);
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-gray-700 text-white">
      <section className="text-center py-20 px-6">
        <h1 className="text-5xl font-bold">Track Your Investments in One Place</h1>
        <p className="mt-4 text-lg">Manage mutual funds, stocks, deposits, and gold seamlessly.</p>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-16">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center cursor-pointer" onClick={() => handleRedirect('/portf/portfolio.html?pan=ABCDE1234F')}>
          <h2 className="text-xl font-bold">Portfolio Summary</h2>
          <p className="mt-2">View your total investments and track profit/loss in real-time.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center cursor-pointer" onClick={() => handleRedirect('/portf/recom.html')}>
          <h2 className="text-xl font-bold">Risk Analysis and Report</h2>
          <p className="mt-2">AI-driven portfolio insights and report generation.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center cursor-pointer" onClick={() => handleRedirect('/portf/allocation.html')}>
          <h2 className="text-xl font-bold">Asset Allocation</h2>
          <p className="mt-2">Shows the diversification of the portfolio.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center cursor-pointer" onClick={() => handleRedirect('/prediction/mainpg.html')}>
          <h2 className="text-xl font-bold">Future Predictions</h2>
          <p className="mt-2">Coming soon: AI-driven future investment predictions.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center cursor-pointer" onClick={() => handleRedirect('/target/index.html')}>
          <h2 className="text-xl font-bold">Wealth Targeting</h2>
          <p className="mt-2">Set and achieve your financial goals efficiently.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center cursor-pointer" onClick={() => handleRedirect('/preipo/web.html')}>
          <h2 className="text-xl font-bold">Pre IPOs</h2>
          <p className="mt-2">Join the tokenization of pre-IPO companies, turning ownership into tradable digital tokens.</p>
        </div>
      </section>
    </div>
  );
}
