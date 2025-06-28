import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import {useState} from 'react'


const SummarySection = ({ onClose }) => {

    const [showSummary, setShowSummary] = useState(false); 

  const data = [
    { name: "Mutual Funds", value: 50000, color: "#4CAF50" },
    { name: "Stocks", value: 30000, color: "#2196F3" },
    { name: "Deposits", value: 20000, color: "#FFC107" },
    { name: "Gold", value: 15000, color: "#FF5722" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg max-w-lg w-full relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Investment Summary</h2>
        <ul className="space-y-2">
          <li><strong>Mutual Funds:</strong> $50,000 <span className="text-green-500">(Profit: $10,000)</span></li>
          <li><strong>Stocks:</strong> $30,000 <span className="text-green-500">(Profit: $12,000)</span></li>
          <li><strong>Deposits:</strong> $20,000 <span className="text-green-500">(Profit: $2,000)</span></li>
          <li><strong>Gold:</strong> $15,000 <span className="text-red-500">(Loss: $2,000)</span></li>
          <li className="font-semibold text-indigo-400">Total Investment: $115,000</li>
          <li className="font-semibold text-indigo-400">Total Profit: $22,000</li>
          <li className="font-semibold text-indigo-400">Total Loss: $2,000</li>
        </ul>

        <div className="flex justify-center my-6">
          <PieChart width={300} height={300}>
            <Pie data={data} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
        >
          ✕
        </button>
      </div>

      {/* Summary Section Modal */}
      {showSummary && <SummarySection onClose={() => setShowSummary(false)} />}
        
    </div>
  );
};

export default SummarySection;


