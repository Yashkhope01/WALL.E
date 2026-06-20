"use client";
import { motion } from "framer-motion";

export default function About() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-white dark:from-gray-900 dark:via-green-900/10 dark:to-gray-900 pt-32 pb-24">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/10 dark:bg-green-900/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About WALL.E
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transforming how cities manage waste through intelligent technology and community engagement
            </p>
          </motion.div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600 dark:text-gray-400">
                <p>
                  WALL.E was born from a simple observation: cities generate massive amounts of waste, but the systems managing it are outdated and disconnected from the communities they serve.
                </p>
                <p>
                  We envisioned a platform where every citizen could contribute to a cleaner city. Where technology and human action combine to create real environmental impact.
                </p>
                <p>
                  Today, WALL.E connects thousands of reporters with municipal teams, powered by artificial intelligence that classifies waste and optimizes collection routes in real-time.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-3xl p-12"
            >
              <div className="text-6xl mb-4">🌍</div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                "Our mission is to revolutionize urban waste management by empowering communities with technology that makes environmental responsibility effortless."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              What drives everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Sustainability",
                description: "We believe technology should serve the planet. Every feature is designed to reduce environmental impact.",
                icon: "🌱"
              },
              {
                title: "Community",
                description: "Environmental change happens when citizens are empowered. We put communities at the center of everything.",
                icon: "👥"
              },
              {
                title: "Innovation",
                description: "We combine cutting-edge AI with practical solutions to solve real-world waste management challenges.",
                icon: "⚡"
              },
              {
                title: "Transparency",
                description: "Data should be accessible. We provide real-time insights so communities can track their environmental impact.",
                icon: "👁️"
              },
              {
                title: "Efficiency",
                description: "Smart automation saves time, resources, and money. Better technology means better outcomes for everyone.",
                icon: "⚙️"
              },
              {
                title: "Responsibility",
                description: "We're accountable to the communities and planet we serve. Impact matters more than metrics.",
                icon: "🎯"
              }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Passionate individuals working to build a cleaner future
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                role: "Powered by AI",
                description: "Advanced machine learning algorithms that continuously improve waste classification accuracy"
              },
              {
                role: "Driven by Engineers",
                description: "Full-stack developers building scalable systems that handle real-time data from thousands of users"
              },
              {
                role: "Guided by Environmental Scientists",
                description: "Experts ensuring our solutions deliver measurable environmental impact"
              },
              {
                role: "Supported by Community",
                description: "Every citizen contributes to making our cities cleaner and smarter"
              }
            ].map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-l-4 border-green-600"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {member.role}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </main>
  );
}
