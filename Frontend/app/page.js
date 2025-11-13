"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Auto-redirect logged-in users to their dashboard only if they directly navigate to homepage
  useEffect(() => {
    if (user && window.location.pathname === '/') {
     
    }
  }, [user, router]);

  return (
    <main className="min-h-screen">
      {/* Hero Section with Background Beams */}
      <BackgroundBeamsWithCollision className="min-h-[600px] md:min-h-[700px] pt-0">
        <div className="container mx-auto px-4 pt-4 pb-8 lg:pb-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left relative z-20"
            >
              <div className="inline-block mb-4 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <span className="text-green-700 dark:text-green-400 font-semibold text-sm">
                  🤖 WALL.E - Smart Waste Management
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                Making Your City{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  Cleaner & Greener
            </span>
          </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Report waste with just a photo and location. Empower municipal teams 
                with real-time data for efficient collection. Join thousands making 
                a difference in waste management.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <a href={user.role === "Admin" ? "/admin" : user.role === "Municipal" ? "/municipal" : "/citizen"}>
                    <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                      Go to Dashboard
                    </Button>
                  </a>
                ) : (
                  <>
            <a href="/select-role">
                      <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                        Get Started Free
              </Button>
            </a>
            <a href="/login">
                      <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold">
                        Login
              </Button>
            </a>
                  </>
                )}
          </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">10K+</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Reports Filed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Active Users</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-cyan-600 dark:text-cyan-400">95%</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Success Rate</div>
                </div>
        </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center lg:justify-end z-20"
            >
              <div className="relative w-full max-w-xl">
                <img
                  src="/images/photu.png"
                  alt="Waste Management Illustration"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.target.src = "https://illustrations.popsy.co/green/environmental-study.svg";
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
      
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Advanced technology meets environmental responsibility
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "📸",
                title: "Quick Reporting",
                description: "Report waste issues in seconds with photo and location",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: "🤖",
                title: "AI Classification",
                description: "Automatic waste type detection using smart algorithms",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: "📍",
                title: "GPS Tracking",
                description: "Precise location tracking for efficient collection routes",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: "📊",
                title: "Real-time Analytics",
                description: "Comprehensive dashboards for municipal teams",
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple steps to make a big impact
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Capture & Report",
                description: "Take a photo of the waste and share your location",
                icon: "📷"
              },
              {
                step: "2",
                title: "AI Analysis",
                description: "Our system classifies the waste type automatically",
                icon: "🔍"
              },
              {
                step: "3",
                title: "Quick Action",
                description: "Municipal teams receive alerts and collect efficiently",
                icon: "🚛"
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="text-6xl mb-4 text-center">{step.icon}</div>
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    {step.description}
                  </p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waste Types Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Waste Categories We Handle
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive classification for efficient recycling
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { name: "Wet Waste", icon: "🥬", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", desc: "Organic & Food" },
              { name: "Dry Waste", icon: "📄", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", desc: "Paper & Cardboard" },
              { name: "Plastic", icon: "♻️", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", desc: "Recyclable Plastic" },
              { name: "E-Waste", icon: "💻", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", desc: "Electronics" }
            ].map((waste, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`${waste.color} rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow-md`}
              >
                <div className="text-5xl mb-3">{waste.icon}</div>
                <h3 className="text-xl font-bold mb-1">{waste.name}</h3>
                <p className="text-sm opacity-80">{waste.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our community and help create a cleaner, sustainable future for everyone
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/select-role">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl">
                  Start Reporting Now
                </Button>
              </a>
              <a href="/about">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-green-400">WALL.E</h3>
              <p className="text-gray-400 text-sm">
                Waste Allocation Load Lifter - Earth-class. Making cities cleaner, one report at a time. Join the movement for sustainable waste management.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/" className="hover:text-green-400 transition-colors">Home</a></li>
                <li><a href="/about" className="hover:text-green-400 transition-colors">About Us</a></li>
                <li><a href="/select-role" className="hover:text-green-400 transition-colors">Get Started</a></li>
                <li><a href="/login" className="hover:text-green-400 transition-colors">Login</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-green-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Waste Guidelines</a></li>
                <li><a href="/contact" className="hover:text-green-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="mailto:contact@walle.com" className="hover:text-green-400 transition-colors">
                    contact@walle.com
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210" className="hover:text-green-400 transition-colors">
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex gap-4 mt-4">
                  <a href="https://www.instagram.com/smartwaste_app/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                    Instagram
                  </a>
                  <a href="https://www.linkedin.com/company/smart-waste-solutions/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} WALL.E Waste Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
