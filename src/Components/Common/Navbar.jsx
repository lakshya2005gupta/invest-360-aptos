import { Link } from "react-router-dom";
import Logo from '../../Images/Logo.png'

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          <img src={Logo} className="w-32 h-16"/>
        </Link>
        {/* Menu Items */}
        <div className="space-x-6">
          <Link to="/" className="hover:text-gray-400">Home</Link>
          <Link to="/about" className="hover:text-gray-400">About</Link>
          <Link to="/features" className="hover:text-gray-400">Features</Link>
          <Link to="/dashboard" className="hover:text-gray-400">Dashboard</Link>
          <Link to="/premium" className="hover:text-gray-400">Premium</Link>
          <Link to="/login" className="hover:text-gray-400">
            <button className="rounded-md text-black text-xl p-2 bg-yellow-400 mr-2">
              LOGIN
            </button>
          </Link>
          <Link to="/signup" className="hover:text-gray-400">
            <button className="rounded-md text-black text-xl p-2 bg-green-400">
              SIGNUP
            </button>
          </Link>
          <Link to='/visual-insights' className="hover:text-gray-400"></Link>
          <Link to="/AI Assistant" className="hover:text-gray-400">Ai Assistant</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
