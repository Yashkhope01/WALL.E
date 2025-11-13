export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">WALL.E</h1>
            <p className="text-2xl md:text-3xl font-light mb-4">Waste Allocation Load Lifter - Earth</p>
            <p className="text-xl md:text-2xl opacity-90">AI-Powered Waste Management System</p>
          </div>
        </div>
      </div>

      {/* Motto Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Motto</h2>
            <p className="text-2xl text-gray-700 dark:text-gray-300 font-medium italic max-w-4xl mx-auto">
              "Transforming waste management through intelligent automation, one classification at a time"
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6 bg-green-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">AI-Powered</h3>
              <p className="text-gray-600 dark:text-gray-300">Intelligent waste classification using advanced machine learning</p>
            </div>
            <div className="text-center p-6 bg-blue-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Eco-Friendly</h3>
              <p className="text-gray-600 dark:text-gray-300">Promoting sustainable practices for a cleaner planet</p>
            </div>
            <div className="text-center p-6 bg-purple-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Efficient</h3>
              <p className="text-gray-600 dark:text-gray-300">Real-time reporting and streamlined waste collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🎯 Our Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                To revolutionize urban waste management by leveraging artificial intelligence and community participation, 
                making cities cleaner, smarter, and more sustainable for future generations.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We empower citizens, municipal workers, and administrators with cutting-edge technology to create a 
                collaborative ecosystem for efficient waste handling and environmental conservation.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🔭 Our Vision</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A world where every piece of waste is properly classified, collected, and processed, contributing to 
                a circular economy and a healthier planet.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We envision cities where waste management is seamless, transparent, and data-driven, enabling 
                communities to make informed decisions about their environmental impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">Our Goals</h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Accurate Waste Classification</h3>
                <p className="text-gray-700 dark:text-gray-300">Achieve 95%+ accuracy in AI-powered waste type identification to optimize recycling and disposal processes.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Community Engagement</h3>
                <p className="text-gray-700 dark:text-gray-300">Empower 100,000+ citizens to actively participate in keeping their cities clean through easy reporting.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Efficient Resource Allocation</h3>
                <p className="text-gray-700 dark:text-gray-300">Reduce waste collection time by 40% through optimized routing and real-time status tracking.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data-Driven Insights</h3>
                <p className="text-gray-700 dark:text-gray-300">Provide comprehensive analytics to help cities make informed decisions about waste management policies.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-teal-50 to-green-50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xl">5</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Environmental Impact</h3>
                <p className="text-gray-700 dark:text-gray-300">Contribute to reducing landfill waste by 30% through improved sorting and recycling initiatives.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">95%</div>
              <p className="text-xl opacity-90">Classification Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">50K+</div>
              <p className="text-xl opacity-90">Reports Processed</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">40%</div>
              <p className="text-xl opacity-90">Time Reduction</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">30%</div>
              <p className="text-xl opacity-90">Waste Reduction</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">How WALL.E Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📸</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">1. Capture</h3>
              <p className="text-gray-600 dark:text-gray-300">Citizens upload photos of waste with geolocation data through our easy-to-use interface</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">2. Classify</h3>
              <p className="text-gray-600 dark:text-gray-300">AI algorithms analyze the image and automatically classify waste as wet, dry, or other categories</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🚛</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">3. Collect</h3>
              <p className="text-gray-600 dark:text-gray-300">Municipal workers receive optimized routes and collect waste efficiently based on priority</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Join the Revolution</h2>
          <p className="text-xl mb-8">Be part of the solution. Help us create cleaner, smarter cities for everyone.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/select-role" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              Get Started
            </a>
            <a href="/contact" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
