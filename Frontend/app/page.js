"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && window.location.pathname === '/') {
     
    }
  }, [user, router]);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-white dark:from-gray-900 dark:via-green-900/10 dark:to-gray-900 pt-20 pb-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/10 dark:bg-green-900/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/10 dark:bg-blue-900/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <span className="inline-block text-green-600 dark:text-green-400 font-semibold text-sm mb-6 tracking-wider uppercase">
                  Intelligent Waste Management
                </span>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Building Cleaner, 
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600">
                    Smarter Cities
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                  Report waste issues with a single photo. Empower municipal teams with real-time intelligence. Join thousands of citizens building sustainable communities.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <a href={user.role === "Admin" ? "/admin" : user.role === "Municipal" ? "/municipal" : "/citizen"} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full px-8 py-6 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
                      Go to Dashboard
                    </Button>
                  </a>
                ) : (
                  <>
                    <a href="/select-role" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full px-8 py-6 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
                        Get Started Free
                      </Button>
                    </a>
                    <a href="/login" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full px-8 py-6 text-lg font-semibold border-2 border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10">
                        Sign In
                      </Button>
                    </a>
                  </>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Waste Reports</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">5K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">95%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 dark:from-green-600/10 dark:to-blue-600/10 rounded-3xl blur-2xl"></div>
                <Image
                  src="/images/photu.png"
                  alt="Waste Management"
                  width={800}
                  height={600}
                  className="relative w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Cutting-edge technology meets environmental responsibility
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "📱",
                title: "Easy Reporting",
                description: "Snap a photo, add location, report instantly",
              },
              {
                icon: "🧠",
                title: "AI-Powered",
                description: "Smart waste classification in seconds",
              },
              {
                icon: "🗺️",
                title: "Real-time Tracking",
                description: "See collection progress on your map",
              },
              {
                icon: "📊",
                title: "Insights & Analytics",
                description: "Track impact and community contributions",
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
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

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simple Process
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Three steps to make a difference
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Capture",
                description: "Take a photo of waste and share your location",
              },
              {
                step: "02",
                title: "Classify",
                description: "AI automatically identifies waste type",
              },
              {
                step: "03",
                title: "Collect",
                description: "Municipal teams act on real-time alerts",
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                  <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Community Impact
            </h2>
            <p className="text-xl opacity-90">
              Real results from real citizens
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: "Cities", value: "150+" },
              { label: "Reports Processed", value: "50K+" },
              { label: "Waste Collected", value: "500T+" },
              { label: "CO₂ Reduced", value: "1000T+" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of citizens building cleaner, smarter communities today.
            </p>
            {!user && (
              <a href="/select-role">
                <Button size="lg" className="px-10 py-7 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                </Button>
              </a>
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
