"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

function AdminDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    collectedReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersRes = await API.get("/admin/users");
      setUsers(usersRes.data.users || []);

      // Fetch all reports
      const reportsRes = await API.get("/admin/reports");
      const allReports = reportsRes.data.reports || [];
      setReports(allReports);

      // Calculate stats
      const pending = allReports.filter((r) => r.status === "Pending").length;
      const collected = allReports.filter((r) => r.status === "Collected").length;

      setStats({
        totalUsers: usersRes.data.users?.length || 0,
        totalReports: allReports.length,
        pendingReports: pending,
        collectedReports: collected,
      });
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/admin/users/${userId}`);
        fetchData(); // Refresh data
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">WALL.E - Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name}!
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Users",
              value: stats.totalUsers,
              icon: "👥",
              color: "from-blue-500 to-cyan-500",
            },
            {
              title: "Total Reports",
              value: stats.totalReports,
              icon: "📊",
              color: "from-green-500 to-emerald-500",
            },
            {
              title: "Pending Reports",
              value: stats.pendingReports,
              icon: "⏳",
              color: "from-yellow-500 to-orange-500",
            },
            {
              title: "Collected",
              value: stats.collectedReports,
              icon: "✅",
              color: "from-purple-500 to-pink-500",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl shadow-lg p-6 text-white`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90 mb-1">{stat.title}</p>
                  <p className="text-4xl font-bold">{stat.value}</p>
                </div>
                <span className="text-5xl opacity-80">{stat.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === "overview"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 dark:text-gray-400 hover:text-primary"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === "users"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 dark:text-gray-400 hover:text-primary"
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === "reports"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 dark:text-gray-400 hover:text-primary"
                }`}
              >
                All Reports
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">System Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">User Distribution</h3>
                    <div className="space-y-3">
                      {["Citizen", "Municipal", "Admin"].map((role) => {
                        const count = users.filter((u) => u.role === role).length;
                        const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                        return (
                          <div key={role}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{role}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Report Status</h3>
                    <div className="space-y-3">
                      {["Pending", "In Progress", "Collected"].map((status) => {
                        const count = reports.filter((r) => r.status === status).length;
                        const percentage = reports.length > 0 ? (count / reports.length) * 100 : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{status}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {u.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                u.role === "Admin"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30"
                                  : u.role === "Municipal"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={u._id === user.id}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">All Waste Reports</h2>
                <div className="grid gap-4">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                report.classification === "Wet"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30"
                                  : report.classification === "Dry"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700"
                              }`}
                            >
                              {report.classification}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                report.status === "Collected"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                                  : report.status === "InProgress"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700"
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📍 Location: {report.geoLocation?.coordinates[1]},{" "}
                            {report.geoLocation?.coordinates[0]}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            👤 Reported by: {report.createdBy?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

