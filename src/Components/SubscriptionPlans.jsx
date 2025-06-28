import { useState } from "react";

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState("free");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-900 to-gray-900 text-white">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Free Plan */}
        <div className={`p-6 rounded-xl shadow-lg border-2 border-gray-500 bg-gray-800 text-center w-80 ${selectedPlan === "free" ? "ring-2 ring-green-500" : ""}`}>
          <h2 className="text-2xl font-bold">Free Plan</h2>
          <p className="text-gray-300 mt-2">Basic investment tracking.</p>
          <ul className="mt-4 space-y-2">
            <li>✅ View portfolio summary</li>
            <li>❌ No AI recommendations</li>
            <li>❌ No tax-saving reports</li>
            <li>❌ No priority support</li>
          </ul>
          <p className="mt-6 text-2xl font-bold">$0/month</p>
          <button 
            className={`mt-4 px-6 py-2 rounded-lg font-semibold ${selectedPlan === "free" ? "bg-green-500" : "bg-gray-600 hover:bg-gray-500"}`} 
            onClick={() => setSelectedPlan("free")}
          >
            Selected
          </button>
        </div>

        {/* Premium Plan */}
        <div className={`p-6 rounded-xl shadow-lg border-2 border-yellow-500 bg-gray-800 text-center w-80 ${selectedPlan === "premium" ? "ring-2 ring-yellow-500" : ""}`}>
          <h2 className="text-2xl font-bold text-yellow-400">Premium Plan</h2>
          <p className="text-gray-300 mt-2">Advanced AI-powered investment tracking.</p>
          <ul className="mt-4 space-y-2">
            <li>✅ AI-driven portfolio insights</li>
            <li>✅ Automated investment strategies</li>
            <li>✅ Tax-saving & wealth growth reports</li>
            <li>✅ Priority customer support</li>
          </ul>
          <p className="mt-6 text-2xl font-bold text-yellow-400">$9.99/month</p>
          <button 
            className={`mt-4 px-6 py-2 rounded-lg font-semibold ${selectedPlan === "premium" ? "bg-yellow-500" : "bg-gray-600 hover:bg-yellow-400"}`} 
            onClick={() => setSelectedPlan("premium")}
          >
            {selectedPlan === "premium" ? "Selected" : "Upgrade"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionPlans;
