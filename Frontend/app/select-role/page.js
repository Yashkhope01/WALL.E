"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const roles = [
  {
    id: "citizen",
    title: "Citizen",
    description: "Report waste issues in your area with photos and location",
    icon: "👤",
    color: "from-blue-500 to-cyan-500",
    features: ["Upload waste photos", "Add geolocation", "Track reports", "Get AI classification"]
  },
  {
    id: "municipal",
    title: "Municipal Worker",
    description: "Manage and collect reported waste in your jurisdiction",
    icon: "🚛",
    color: "from-green-500 to-emerald-500",
    features: ["View waste reports", "Update collection status", "Route optimization", "Real-time updates"]
  },
  {
    id: "admin",
    title: "Administrator",
    description: "Oversee the entire waste management system",
    icon: "👔",
    color: "from-purple-500 to-pink-500",
    features: ["User management", "Analytics dashboard", "System monitoring", "Generate reports"]
  }
];

export default function SelectRole() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/register?role=${selectedRole}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join our smart waste management platform and contribute to a cleaner, greener future
          </p>
        </motion.div>

        {/* Role Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleRoleSelect(role.id)}
              className={`relative cursor-pointer group ${
                selectedRole === role.id ? "ring-4 ring-primary" : ""
              }`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${role.color} p-8 text-white`}>
                  <div className="text-6xl mb-4 text-center">{role.icon}</div>
                  <h2 className="text-3xl font-bold text-center">{role.title}</h2>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-6 min-h-[60px]">
                    {role.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Key Features
                    </h3>
                    {role.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Selection Indicator */}
                  {selectedRole === role.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 bg-green-500 rounded-full p-2"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="px-12 py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with Selected Role
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/login")}
            className="px-12 py-6 text-lg font-semibold"
          >
            Already have an account? Login
          </Button>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
              💡 Not sure which role to choose?
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              Most users start as Citizens to report waste issues. Municipal workers and Administrators 
              are typically assigned by your local authorities. Contact your municipal office for more information.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

