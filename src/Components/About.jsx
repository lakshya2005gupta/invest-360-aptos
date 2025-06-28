import { Briefcase, LineChart, Banknote, Shield } from "lucide-react";

const About = () => {
  return (
    <section className="bg-gradient-to-b from-green-700 to-gray-700 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
          Revolutionizing Investment Management 🚀
        </h2>
        <p className="text-lg text-white max-w-3xl mx-auto">
          At <span className="font-semibold text-yellow-600">INVEST360</span>, we bring stocks, banking, gold, and government schemes into a single AI-powered dashboard. Say goodbye to juggling multiple platforms—manage all your investments seamlessly in one place.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Feature Cards */}
        <FeatureCard
          icon={<Briefcase size={40} className="text-blue-600" />}
          title="Pre-IPO Investment Access"
          description="Get exclusive opportunities to invest in promising companies before they go public."
        />
        <FeatureCard
          icon={<LineChart size={40} className="text-green-600" />}
          title="AI-Driven Portfolio Insights"
          description="Stay ahead with smart alerts that help optimize your investments in stocks, mutual funds, and gold."
        />
        <FeatureCard
          icon={<Banknote size={40} className="text-yellow-600" />}
          title="Seamless Banking Investments"
          description="Invest in FDs, RDs, and government bonds with real-time tracking of your returns."
        />
        <FeatureCard
          icon={<Shield size={40} className="text-purple-600" />}
          title="Government Scheme Tracking"
          description="View all your LIC, PPF, and bond investments in one place for complete financial transparency."
        />
        <FeatureCard
        //   icon={<Gold size={40} className="text-orange-600" />}
          title="Gold Investments Simplified"
          description="Buy & sell gold ETFs and virtual gold, while tracking your SGV & physical gold holdings in real-time."
        />
      </div>

      <div className="text-center mt-12">
        <a
          href="#"
          className="bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Start Investing Smarter 🚀
        </a>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-indigo-400 shadow-lg rounded-xl p-6 flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-white mt-2">{description}</p>
    </div>
  );
};

export default About;
 