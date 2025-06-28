import React, { useEffect, useState } from 'react';

const InvestmentArea = () => {
    const [typedText, setTypedText] = useState('');
    const text = "What is Your Preferred Investment Area?";

    useEffect(() => {
        let index = 0;
        const typeEffect = () => {
            if (index < text.length) {
                setTypedText(text.substring(0, index + 1));
                index++;
                setTimeout(typeEffect, 40);
            }
        };
        typeEffect();
    }, []);

    const updateInvestmentArea = (investmentArea) => {
        localStorage.setItem('preferredInvestment', investmentArea);
        alert("You selected: " + investmentArea);
        window.location.href = '/';
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen relative bg-gradient-to-b from-green-900 to-gray-900 text-white">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-36 bg-green-400 opacity-15 blur-3xl z-0"></div>

            {/* Typing Effect Title */}
            <h1 className="text-white text-4xl md:text-5xl font-black font-merriweather text-center shadow-2xl relative z-10 mb-12">
                {typedText}<span className="animate-blink">|</span>
            </h1>

            {/* Investment Selection Buttons */}
            <div className="flex flex-wrap justify-center gap-4 relative z-10 mb-10">
                {['Stocks', 'Mutual Funds', 'Government Schemes', 'Fixed Deposit (FD)', 'Recurring Deposit (RD)'].map((item) => (
                    <button 
                        key={item} 
                        onClick={() => updateInvestmentArea(item)} 
                        className="p-6 rounded-2xl text-center text-white text-xl font-semibold transition transform scale-100 hover:scale-105 bg-gray-800 border border-green-400 min-w-[200px] max-w-[250px]">
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InvestmentArea;
