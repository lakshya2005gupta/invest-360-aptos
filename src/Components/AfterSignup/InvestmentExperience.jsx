import { useState, useEffect } from "react";

const InvestmentExperience = () => {
  const text = "What is Your Investing Experience?";
  const [typedText, setTypedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setTypedText(text.substring(0, index + 1));
        setIndex(index + 1);
      }, 40);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  const storeExperience = (experience) => {
    localStorage.setItem("investmentExperience", experience);
    alert("Your experience level: " + experience);
    window.location.href = "/investment-area";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen relative bg-gradient-to-b from-green-900 to-gray-800 text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-40 bg-green-400 bg-opacity-15 filter blur-3xl"></div>
      
      {/* Typing Effect Title */}
      <h1 className="text-4xl md:text-5xl font-black font-[Merriweather] text-center shadow-2xl relative z-10 mb-12">
        {typedText}<span className="animate-blink">|</span>
      </h1>
      
      {/* Experience Selection Buttons */}
      <div className="flex space-x-6 relative z-10 mb-10">
        {["Beginner", "Intermediate", "Advanced"].map((level) => (
          <button
            key={level}
            onClick={() => storeExperience(level)}
            className="p-6 rounded-2xl w-64 text-center text-white text-xl font-semibold transition transform scale-100 hover:scale-105 bg-gray-800 border border-green-400"
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InvestmentExperience;