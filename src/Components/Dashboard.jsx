

// import { useState } from "react"

// const Dashboard = () => {
//   const [portfolio, setPortfolio] = useState(null);
//   const [pan, setPan] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchPortfolio = async () => {
//     setError("");
//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:5000/getPortfolio", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ pan }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setPortfolio(data);
//       } else {
//         setError(data.error);
//       }
//     } catch (err) {
//       setError("Failed to fetch data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
//       <div className="max-w-4xl w-full bg-white p-6 shadow-lg rounded-lg">
//         <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">Portfolio Dashboard</h2>

//         <div className="flex space-x-4 mb-6">
//           <input
//             type="text"
//             placeholder="Enter PAN Number"
//             value={pan}
//             onChange={(e) => setPan(e.target.value)}
//             className="border p-3 w-full rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//           <button
//             onClick={fetchPortfolio}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-lg font-semibold"
//           >
//             Fetch
//           </button>
//         </div>

//         {loading && <p className="text-center text-lg text-blue-500">Fetching data...</p>}
//         {error && <p className="text-center text-red-500">{error}</p>}

//         {portfolio && (
//           <div className="mt-6">
//             <h3 className="text-xl font-semibold text-gray-800 mb-4">Total Portfolio Value: <span className="text-green-600 font-bold">₹{portfolio.total_portfolio_value}</span></h3>

//             {Object.entries(portfolio.assets).map(([category, details]) => (
//               <div key={category} className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
//                 <h4 className="text-lg font-bold text-gray-700 mb-2">{category}</h4>
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-blue-500 text-white">
//                       <th className="p-3 text-left">Name</th>
//                       <th className="p-3 text-right">Quantity</th>
//                       <th className="p-3 text-right">Total Value (₹)</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {details.holdings.map((item, index) => (
//                       <tr key={index} className="border-b">
//                         <td className="p-3">{item.name || item.type || item.bank || item.scheme}</td>
//                         <td className="p-3 text-right">{item.quantity || '-'}</td>
//                         <td className="p-3 text-right font-semibold">₹{item.total_value}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import { useState } from "react";

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [pan, setPan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newEntries, setNewEntries] = useState({});
  const [showForm, setShowForm] = useState({});

  const fetchPortfolio = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/getPortfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pan }),
      });
      const data = await response.json();
      if (response.ok) {
        setPortfolio(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = (category) => {
    if (!newEntries[category]?.name || !newEntries[category]?.quantity || !newEntries[category]?.total_value) return;
    setPortfolio((prev) => {
      const updatedPortfolio = { ...prev };
      updatedPortfolio.assets[category].holdings.push(newEntries[category]);
      return updatedPortfolio;
    });
    setNewEntries({ ...newEntries, [category]: {} });
    setShowForm({ ...showForm, [category]: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">Portfolio Dashboard</h2>
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            placeholder="Enter PAN Number"
            value={pan}
            onChange={(e) => setPan(e.target.value)}
            className="border p-3 w-full rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={fetchPortfolio}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-lg font-semibold"
          >
            Fetch
          </button>
        </div>
        {loading && <p className="text-center text-lg text-blue-500">Fetching data...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {portfolio && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Total Portfolio Value: <span className="text-green-600 font-bold">₹{portfolio.total_portfolio_value}</span>
            </h3>
            {Object.entries(portfolio.assets).map(([category, details]) => (
              <div key={category} className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
                <h4 className="text-lg font-bold text-gray-700 mb-2">{category}</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-500 text-white">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Total Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.holdings.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{item.name || item.type || item.bank || item.scheme}</td>
                        <td className="p-3 text-right">{item.quantity || '-'}</td>
                        <td className="p-3 text-right font-semibold">₹{item.total_value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={() => setShowForm({ ...showForm, [category]: !showForm[category] })}
                  className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  {showForm[category] ? "Cancel" : "Add Entry"}
                </button>
                {showForm[category] && (
                  <div className="mt-3 p-3 bg-white shadow rounded-lg">
                    <input
                      type="text"
                      placeholder="Name"
                      className="border p-2 w-full mb-2"
                      value={newEntries[category]?.name || ""}
                      onChange={(e) => setNewEntries({ ...newEntries, [category]: { ...newEntries[category], name: e.target.value } })}
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="border p-2 w-full mb-2"
                      value={newEntries[category]?.quantity || ""}
                      onChange={(e) => setNewEntries({ ...newEntries, [category]: { ...newEntries[category], quantity: e.target.value } })}
                    />
                    <input
                      type="number"
                      placeholder="Total Value (₹)"
                      className="border p-2 w-full mb-2"
                      value={newEntries[category]?.total_value || ""}
                      onChange={(e) => setNewEntries({ ...newEntries, [category]: { ...newEntries[category], total_value: e.target.value } })}
                    />
                    <button
                      onClick={() => handleAddEntry(category)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
