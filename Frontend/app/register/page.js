"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import { motion } from "framer-motion";

export default function Register() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) {
      setRole(roleParam.charAt(0).toUpperCase() + roleParam.slice(1));
    } else {
      setRole("Citizen"); // Default role
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      login(res.data.user, res.data.token);

      // Redirect based on role
      if (role === "Admin") {
        router.push("/admin");
      } else if (role === "Municipal") {
        router.push("/municipal");
      } else {
        router.push("/citizen");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = () => {
    const roles = {
      Citizen: {
        icon: "👤",
        color: "from-blue-500 to-cyan-500",
        description: "Report waste issues in your area"
      },
      Municipal: {
        icon: "🚛",
        color: "from-green-500 to-emerald-500",
        description: "Manage waste collection"
      },
      Admin: {
        icon: "👔",
        color: "from-purple-500 to-pink-500",
        description: "Oversee the system"
      }
    };
    return roles[role] || roles.Citizen;
  };

  const roleInfo = getRoleInfo();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 order-2 md:order-1"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-green-600 dark:text-green-400">WALL.E</h2>
              <h3 className="text-2xl font-bold mb-2">Create Account</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join us in making cities cleaner
              </p>
            </div>

            {/* Role Badge */}
            <div className={`bg-gradient-to-r ${roleInfo.color} text-white rounded-xl p-4 mb-6 text-center`}>
              <span className="text-3xl">{roleInfo.icon}</span>
              <p className="font-semibold mt-2">Registering as {role}</p>
              <p className="text-sm opacity-90">{roleInfo.description}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Re-enter password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-lg font-semibold"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>
              <Link
                href="/select-role"
                className="text-sm text-gray-500 hover:text-primary mt-2 inline-block"
              >
                ← Change role
              </Link>
            </div>
          </motion.div>

          {/* Right Side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2"
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Join Our Community
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Be part of the solution for a cleaner, smarter city
            </p>
            
            <div className="space-y-6">
              {[
                {
                  icon: "🌍",
                  title: "Make an Impact",
                  description: "Contribute to environmental sustainability"
                },
                {
                  icon: "⚡",
                  title: "Quick & Easy",
                  description: "Report issues in seconds with our intuitive interface"
                },
                {
                  icon: "🔒",
                  title: "Secure & Private",
                  description: "Your data is protected with enterprise-grade security"
                },
                {
                  icon: "📱",
                  title: "Stay Updated",
                  description: "Track the status of your reports in real-time"
                }
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-start space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md"
                >
                  <span className="text-4xl">{benefit.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

