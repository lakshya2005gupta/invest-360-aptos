

const Testimonial = () => {
  return (
    <div>
       <section className="text-center py-16 bg-gradient-to-b from-green-900 to-gray-700">
        <h2 className="text-3xl text-red-500 font-bold mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-10">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-yellow-400 transform hover:scale-105 transition duration-300">
            <p className="italic text-yellow-300">"Invest360 made tracking my stocks so much easier! Highly recommend."</p>
            <h4 className="mt-4 font-semibold text-yellow-500">- John Doe</h4>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-yellow-400 transform hover:scale-105 transition duration-300">
            <p className="italic text-yellow-300">"I love the AI-driven insights. It helped me make better investment decisions!"</p>
            <h4 className="mt-4 font-semibold text-yellow-500">- Sarah Lee</h4>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-yellow-400 transform hover:scale-105 transition duration-300">
            <p className="italic text-yellow-300">"A must-have for investors! The portfolio summary is detailed and useful."</p>
            <h4 className="mt-4 font-semibold text-yellow-500">- Alex Smith</h4>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-yellow-400 transform hover:scale-105 transition duration-300">
            <p className="italic text-yellow-300">"Simple and effective! I can track all my investments in one place."</p>
            <h4 className="mt-4 font-semibold text-yellow-500">- Emily Brown</h4>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Testimonial