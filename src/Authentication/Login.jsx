// import { useEffect, useState } from "react";
// import GoogleImage from '../Images/Google.png'

// const LoginPage = () => {
//   const [typingText, setTypingText] = useState("");
//   const fullText = "Welcome Back";

//   useEffect(() => {
//     let index = 0;
//     const type = () => {
//       if (index < fullText.length) {
//         setTypingText(fullText.substring(0, index + 1));
//         index++;
//         setTimeout(type, 60);
//       }
//     };
//     type();
//   }, []);

//   const redirectToExperience = (event) => {
//     event.preventDefault();
//     window.location.href = "experience.html";
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-green-900 to-gray-900 text-white relative overflow-hidden">
//       {/* Background Glow */}
//       <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3/4 h-44 bg-green-500 opacity-30 blur-3xl z-0"></div>

//       {/* Typing Effect Heading */}
//       <h1 className="text-white text-4xl md:text-5xl font-black text-center shadow-2xl relative z-10">
//         <span>{typingText}</span>
//         <span className="animate-blink">|</span>
//       </h1>

//       {/* Login Box */}
//       <div className="login-box bg-gray-900 p-8 rounded-2xl shadow-2xl w-96 relative transition mt-12 transform hover:scale-105">
//         <form onSubmit={redirectToExperience}>
//           <label className="block text-gray-400 text-sm mb-1">Email</label>
//           <input
//             type="email"
//             placeholder="Enter your email"
//             required
//             className="w-full p-3 mb-3 bg-gray-700 text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//           />

//           <label className="block text-gray-400 text-sm mb-1">Password</label>
//           <input
//             type="password"
//             placeholder="Enter your password"
//             required
//             className="w-full p-3 mb-3 bg-gray-700 text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
//           />

//           <button
//             type="submit"
//             className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full transition font-semibold mb-2"
//           >
//             Log In
//           </button>
//         </form>

//         {/* Login with Google */}
//         <button
//           onClick={redirectToExperience}
//           className="w-full bg-white text-black flex items-center justify-center py-3 rounded-full hover:bg-gray-200 transition shadow-md"
//         >
//           <img src={GoogleImage}className="w-6 h-6 mr-2" alt="Google Logo" />
//           Log In with Google
//         </button>

//         <div className="text-center text-gray-400 mt-4 text-sm">
//           Don't have an account? <a href="/signup" className="text-white hover:underline">Sign Up</a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;



import { useEffect, useState } from "react";
import GoogleImage from '../Images/Google.png'
const LoginPage = () => {
  const [typingText, setTypingText] = useState("");
  const fullText = "Welcome Back";
  useEffect(() => {
    let index = 0;
    const type = () => {
      if (index < fullText.length) {
        setTypingText(fullText.substring(0, index + 1));
        index++;
        setTimeout(type, 60);
      }
    };
    type();
  }, []);
  const redirectToExperience = (event) => {
    event.preventDefault();
    window.location.href = "experience.html";
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-green-900 to-gray-900 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3/4 h-44 bg-green-500 opacity-30 blur-3xl z-0"></div>
      {/* Typing Effect Heading */}
      <h1 className="text-white text-4xl md:text-5xl font-black text-center shadow-2xl relative z-10">
        <span>{typingText}</span>
        <span className="animate-blink">|</span>
      </h1>
      {/* Login Box */}
      <div className="login-box bg-gray-900 p-8 rounded-2xl shadow-2xl w-96 relative transition mt-12 transform hover:scale-105">
        <form onSubmit={redirectToExperience}>
          <label className="block text-gray-400 text-sm mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="w-full p-3 mb-3 bg-gray-700 text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <label className="block text-gray-400 text-sm mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
            className="w-full p-3 mb-3 bg-gray-700 text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full transition font-semibold mb-2"
          >
            Log In
          </button>
        </form>
        {/* Login with Google */}
        <button
          onClick={redirectToExperience}
          className="w-full bg-white text-black flex items-center justify-center py-3 rounded-full hover:bg-gray-200 transition shadow-md"
        >
          <img src={GoogleImage}className="w-6 h-6 mr-2" alt="Google Logo" />
          Log In with Google
        </button>
        <div className="text-center text-gray-400 mt-4 text-sm">
          Don't have an account? <a href="/signup" className="text-white hover:underline">Sign Up</a>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
