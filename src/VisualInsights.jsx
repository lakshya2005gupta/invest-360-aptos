// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Bar, Pie } from "react-chartjs-2";
// import "chart.js/auto";
// import LandingPage from "./LandingPage";

// const  VisualInsights=()=> {
//   const investmentData = {
//     labels: ["Mutual Funds", "Stocks", "Deposits", "Gold"],
//     datasets: [
//       {
//         label: "Investment Amount",
//         data: [50000, 30000, 20000, 15000],
//         backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#FFC107"],
//       },
//     ],
//   };

//   const profitLossData = {
//     labels: ["Profit", "Loss"],
//     datasets: [
//       {
//         data: [25000, 5000],
//         backgroundColor: ["#4CAF50", "#F44336"],
//       },
//     ],
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-8">
//       <h1 className="text-3xl font-bold text-center mb-8">Investment Insights</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">Investment Breakdown</h2>
//           <Bar data={investmentData} />
//         </div>
//         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">Profit vs Loss</h2>
//           <Pie data={profitLossData} />
//         </div>
//       </div>
//     </div>
//   );
// }



import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

const VisualInsights=()=> {
  const totalInvestment = 50000 + 30000 + 20000 + 15000;
  
  const investmentData = {
    labels: ["Mutual Funds", "Stocks", "Deposits", "Gold"],
    datasets: [
      {
        label: "Investment Amount",
        data: [50000, 30000, 20000, 15000],
        backgroundColor: ["#A6CEE3", "#B2DF8A", "#FB9A99", "#FDBF6F"],
      },
      {
        label: "Investment Percentage",
        data: [
          (50000 / totalInvestment) * 100,
          (30000 / totalInvestment) * 100,
          (20000 / totalInvestment) * 100,
          (15000 / totalInvestment) * 100,
        ],
        backgroundColor: ["#1F78B4", "#33A02C", "#E31A1C", "#FF7F00"],
      },
    ],
  };

  const profitLossData = {
    labels: ["Profit", "Loss"],
    datasets: [
      {
        data: [25000, 5000],
        backgroundColor: ["#A6D854", "#E31A1C"],
      },
    ],
  };

  const barChartData = {
    labels: ["Mutual Funds", "Stocks", "Deposits", "Gold"],
    datasets: [
      {
        label: "Total Investment",
        data: [50000, 30000, 20000, 15000],
        backgroundColor: "#4C9AFF",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Investment Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Investment Breakdown</h2>
          <Pie data={investmentData} />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Profit vs Loss</h2>
          <Pie data={profitLossData} />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-2">
          <h2 className="text-xl font-semibold mb-4">Total Investment Overview</h2>
          <Bar data={barChartData} />
        </div>
      </div>
    </div>
  );

}

 export default VisualInsights