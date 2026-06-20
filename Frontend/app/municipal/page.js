"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

function MunicipalDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    inProgress: 0,
    collected: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, reports]);

  const fetchReports = async () => {
    try {
      const res = await API.get("/municipal/reports");
      const allReports = res.data.reports || [];
      setReports(allReports);

      // Calculate stats
      setStats({
        total: allReports.length,
        reported: allReports.filter((r) => r.status === "Pending").length,
        inProgress: allReports.filter((r) => r.status === "In Progress").length,
        collected: allReports.filter((r) => r.status === "Collected").length,
      });
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === "all") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.status === filter));
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      await API.patch(`/municipal/reports/${reportId}`, { status: newStatus });
      fetchReports(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
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
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">WALL.E - Municipal Dashboard</h1>
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
              title: "Total Reports",
              value: stats.total,
              icon: "📊",
              color: "from-blue-500 to-cyan-500",
            },
            {
              title: "New Reports",
              value: stats.reported,
              icon: "🆕",
              color: "from-red-500 to-orange-500",
            },
            {
              title: "In Progress",
              value: stats.inProgress,
              icon: "🚧",
              color: "from-yellow-500 to-orange-500",
            },
            {
              title: "Collected",
              value: stats.collected,
              icon: "✅",
              color: "from-green-500 to-emerald-500",
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

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Reports ({stats.total})
            </Button>
            <Button
              variant={filter === "Pending" ? "default" : "outline"}
              onClick={() => setFilter("Pending")}
            >
              Pending ({stats.reported})
            </Button>
            <Button
              variant={filter === "In Progress" ? "default" : "outline"}
              onClick={() => setFilter("In Progress")}
            >
              In Progress ({stats.inProgress})
            </Button>
            <Button
              variant={filter === "Collected" ? "default" : "outline"}
              onClick={() => setFilter("Collected")}
            >
              Collected ({stats.collected})
            </Button>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  No reports found for this filter
                </p>
              </div>
            ) : (
              filteredReports.map((report, idx) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Report Info */}
                    <div className="md:col-span-2">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            report.classification === "Wet"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30"
                              : report.classification === "Dry"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700"
                          }`}
                        >
                          {report.classification} Waste
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            report.status === "Collected"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                              : report.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <span className="font-semibold">📍 Location:</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Lat: {report.geoLocation?.coordinates[1]?.toFixed(4)}, Lng:{" "}
                            {report.geoLocation?.coordinates[0]?.toFixed(4)}
                          </span>
                          <a
                            href={`https://www.google.com/maps?q=${report.geoLocation?.coordinates[1]},${report.geoLocation?.coordinates[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View on Map
                          </a>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-semibold">👤 Reported by:</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {report.createdBy?.name || "Unknown"} ({report.createdBy?.email})
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-semibold">🕐 Reported at:</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold mb-2">Update Status:</p>
                      {report.status !== "In Progress" && report.status !== "Collected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report._id, "In Progress")}
                          className="w-full"
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {report.status !== "Collected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report._id, "Collected")}
                          className="w-full"
                        >
                          Mark Collected
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MunicipalDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Municipal"]}>
      <MunicipalDashboardContent />
    </ProtectedRoute>
  );
}

