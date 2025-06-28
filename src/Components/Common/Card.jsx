import React from 'react';
import DashBoard from '../../Images/Dashboard.png'
import InvestmentRecommendation from '../../Images/InvestmentRecommendation.png'
import AssetAllocationReport from '../../Images/AssetAllocationReport.png'
import PortfolioReport from '../../Images/PortfolioReport.png'

const Cards = () => {
  return (
    <section className="w-full px-6 py-12 bg-gradient-to-b from-green-900 to-gray-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Image with Background */}
        <div className="relative w-full flex justify-center">
          <div className="relative w-[90%] md:w-[80%]">
            <img src={DashBoard} alt="Feature" className="w-full rounded-md shadow-lg" />
            <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>
          </div>
        </div>

        {/* Right Side - Description */}
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">1. Unified Dashboard for investment of user at one place</h2>
          <p className="text-lg text-gray-300">
            Displays the Data of all your investments like Stocks, Mutual Funds, Commodities, Fixed Deposits, and Government Schemes.
          </p>
        </div>
      </div>

      {/* - Image on Right, Text on Left */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-12">
        {/* Left Side - Description */}
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">2. AI-powered Investment Insights</h2>
          <p className="text-lg text-gray-300">
            Get real-time AI-driven insights and analytics to optimize your investments and maximize returns.
          </p>
        </div>

        {/* Right Side - Image with Background */}
        <div className="relative w-full flex justify-center">
          <div className="relative w-[90%] md:w-[80%]">
            <img src={InvestmentRecommendation} alt="AI Insights" className="w-full rounded-md shadow-lg" />
            <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Image with Background */}
        <div className="relative w-full flex justify-center">
          <div className="relative w-[90%] md:w-[80%]">
            <img src={AssetAllocationReport} alt="Feature" className="w-full rounded-md shadow-lg" />
            <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>
          </div>
        </div>

        {/* Right Side - Description */}
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">3. Asset Allocation Report</h2>
          <p className="text-lg text-gray-300">
          breakdown of investments across various asset classes, including Commodities, Fixed Deposits, Government Schemes, Mutual Funds, Recurring Deposits, and Stocks.Pie Chart Representation,High Exposure Warning
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-12">
        {/* Left Side - Description */}
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">4. Your personailized Portfolio report </h2>
          <p className="text-lg text-gray-300">
            Disaply Total Portfolio Value with Alert Red ,Green flags for every kind of investement like commodities, fixed deposits
          </p>
        </div>

        {/* Right Side - Image with Background */}
        <div className="relative w-full flex justify-center">
          <div className="relative w-[90%] md:w-[80%]">
            <img src={PortfolioReport} alt="AI Insights" className="w-full rounded-md shadow-lg" />
            <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Cards;