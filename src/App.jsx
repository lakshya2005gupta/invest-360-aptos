import { BrowserRouter,Routes,Route } from "react-router-dom";

import "./App.css";
import Chatbot from "./Components/Chatbot";
import Navbar from "./Components/Common/Navbar";
import LandingPage from "./LandingPage";
import VisualInsights  from "./VisualInsights.jsx";
import { AllFeaturesSection } from "./Components/Common/FeatureSection.jsx";
import SummarySection from "./Components/SummarySection.jsx";
import Footer from "./Components/Common/Footer.jsx";
import SubscriptionPlans from "./Components/SubscriptionPlans.jsx";
import About from './Components/About.jsx'
import PortfolioDashboard from "./Components/Dashboard.jsx";
import LoginPage from "./Authentication/Login.jsx";
import SignupPage from "./Authentication/Signup.jsx";
import Testimonial from "./Components/Testimonial.jsx";
import Cards from "./Components/Common/Card.jsx";
import InvestmentExperience from "./Components/AfterSignup/InvestmentExperience.jsx";
import InvestmentArea from "./Components/AfterSignup/InvestmentArea.jsx";

function App() {
  return (
    <div className="">
     
      <Chatbot/>
      <BrowserRouter>
      <Navbar/>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* <LandingPage/> */}
          <Route path="/visual-insights" element={<VisualInsights />} />
          <Route path='/portfolio-summary' element={<SummarySection/>}/>
           <Route path='/features' element={<AllFeaturesSection/>}/>
           <Route path="/premium" element={<SubscriptionPlans/>}/>
           <Route path="/about" element={<About/>}/>
           <Route path="/dashboard" element={<PortfolioDashboard/>}/>
           <Route path="/login" element={<LoginPage/>}/>
           <Route path="/signup" element={<SignupPage/>}/>
           <Route path="/ai" element={<PortfolioDashboard/>}/>
           <Route path="/investment-experience" element={<InvestmentExperience/>}/>
           <Route path="/investment-area" element={<InvestmentArea/>}/>
          </Routes>
          {/* <InvestmentArea/>
          <InvestmentExperience/> */}
          <Cards/>
          <Testimonial/>
        <Footer/>
     </BrowserRouter>
    </div>
    
  );
}

export default App;
