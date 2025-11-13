"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

function CitizenDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [gamificationStats, setGamificationStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchReports();
    fetchGamificationStats();
    fetchLeaderboard();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get("/citizen/reports");
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchGamificationStats = async () => {
    try {
      const res = await API.get("/citizen/gamification/stats");
      setGamificationStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch gamification stats", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("/citizen/gamification/leaderboard");
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      });
      streamRef.current = stream;
      setShowCamera(true);
      
      // Wait for video element to be mounted before setting stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video plays
          videoRef.current.play().catch(err => {
            console.error("Video play error:", err);
          });
        }
      }, 100);
    } catch (err) {
      console.error("Camera access denied:", err);
      setMessage("Camera access denied. Please use file upload instead.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCapturedPreview(null);
  };

  const capturePhoto = () => {
    console.log("Capture button clicked");
    
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available");
      setMessage("Camera not ready. Please try again.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    console.log("Video ready state:", video.readyState);
    console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
    
    // Check if video is playing
    if (video.paused || video.ended) {
      console.error("Video is not playing");
      setMessage("Camera is paused. Please try again.");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    
    // Check if video has dimensions
    if (!video.videoWidth || !video.videoHeight) {
      console.error("Video dimensions not available");
      setMessage("Camera not fully loaded. Please wait a moment...");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    
    try {
      // Set canvas size to match video
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      console.log("Setting canvas size:", width, "x", height);
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      
      // Get image as data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      console.log("Data URL length:", dataUrl.length);
      
      if (dataUrl && dataUrl.length > 100) {
        console.log("Photo captured successfully");
        setCapturedPreview(dataUrl);
      } else {
        console.error("Invalid data URL");
        setMessage("Failed to capture image. Please try again.");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      setMessage("Error capturing photo. Please try again.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const confirmCapture = () => {
    if (capturedPreview) {
      // Convert data URL to blob and create file
      fetch(capturedPreview)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFile(file);
          setPreview(capturedPreview);
          stopCamera();
        });
    }
  };

  const retakePhoto = () => {
    setCapturedPreview(null);
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setMessage("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(6));
          setLng(position.coords.longitude.toFixed(6));
          setMessage("Location captured successfully!");
          setTimeout(() => setMessage(""), 3000);
        },
        (error) => {
          setMessage("Unable to get location. Please enter manually.");
          setTimeout(() => setMessage(""), 3000);
        }
      );
    } else {
      setMessage("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select an image");
      return;
    }
    if (!lat || !lng) {
      setMessage("Please provide location");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("lat", lat);
      formData.append("lng", lng);

      const res = await API.post("/citizen/report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { report, gamification } = res.data;
      
      setMessage(
        `🎉 Report submitted! +${gamification.pointsEarned} points! Classification: ${report.classification}`
      );
      
      // Show badge animation if new badges earned
      if (gamification.newBadges && gamification.newBadges.length > 0) {
        setNewBadges(gamification.newBadges);
        setShowBadgeAnimation(true);
        setTimeout(() => setShowBadgeAnimation(false), 5000);
      }
      
      // Reset form
      setFile(null);
      setPreview(null);
      setLat("");
      setLng("");
      
      // Refresh data
      fetchReports();
      fetchGamificationStats();
      fetchLeaderboard();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* Badge Animation Overlay */}
      <AnimatePresence>
        {showBadgeAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md mx-4"
            >
              <h2 className="text-3xl font-bold text-center mb-4">🎊 New Badge Unlocked! 🎊</h2>
              {newBadges.map((badge, idx) => (
                <div key={idx} className="text-center mb-4">
                  <div className="text-6xl mb-2">{badge.icon}</div>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{badge.name}</h3>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4"
          >
            <div className="relative w-full max-w-2xl">
              {capturedPreview ? (
                // Preview Mode
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={capturedPreview}
                      alt="Captured preview"
                      className="w-full h-auto max-h-[70vh] object-contain"
                      onError={() => {
                        console.error("Failed to load preview image");
                        setMessage("Failed to load preview. Please try again.");
                        setCapturedPreview(null);
                      }}
                    />
                  </div>
                  <div className="absolute top-4 left-0 right-0 flex justify-center">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      ✓ Photo Captured Successfully
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-4">
                    <Button 
                      onClick={retakePhoto} 
                      size="lg" 
                      variant="outline" 
                      className="bg-white/95 hover:bg-white text-gray-900"
                    >
                      🔄 Retake
                    </Button>
                    <Button 
                      onClick={confirmCapture} 
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    >
                      ✓ Use This Photo
                    </Button>
                    <Button 
                      onClick={stopCamera} 
                      size="lg" 
                      variant="outline" 
                      className="bg-white/95 hover:bg-white text-gray-900"
                    >
                      ✕ Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Camera Mode
                <div className="relative">
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute top-4 left-0 right-0 flex justify-center">
                    <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full text-sm font-medium">
                      📷 Position waste in frame
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        capturePhoto();
                      }}
                      size="lg" 
                      className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-2xl shadow-lg border-4 border-gray-300"
                    >
                      📸
                    </Button>
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        stopCamera();
                      }}
                      size="lg" 
                      variant="outline" 
                      className="bg-white/90 hover:bg-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">WALL.E - Citizen Dashboard</h1>
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

      {/* Gamification Stats Bar */}
      {gamificationStats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{gamificationStats.level}</div>
                <div className="text-sm">Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{gamificationStats.points}</div>
                <div className="text-sm">Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{gamificationStats.totalReports}</div>
                <div className="text-sm">Reports</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{gamificationStats.badges.length}</div>
                <div className="text-sm">Badges</div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Level {gamificationStats.level}</span>
                <span>{gamificationStats.nextLevelPoints} pts to next level</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${gamificationStats.progressToNextLevel}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">📸</span>
                Report Waste Issue
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Upload Waste Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary transition-colors">
                    {preview ? (
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                          className="mt-4"
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <svg
                          className="mx-auto h-16 w-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div className="mt-4 flex flex-col gap-2">
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer inline-block"
                          >
                            <span className="text-primary font-semibold hover:underline">
                              Click to upload
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {" "}
                              or drag and drop
                            </span>
                            <input
                              id="file-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          <Button
                            type="button"
                            onClick={startCamera}
                            variant="outline"
                            className="mx-auto"
                          >
                            📷 Open Camera
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium">
                      Location Coordinates
                    </label>
                    <Button
                      type="button"
                      onClick={getCurrentLocation}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Use Current Location
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="Latitude"
                      required
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="Longitude"
                      required
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      message.includes("🎉")
                        ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    {message}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-lg font-semibold"
                >
                  {loading ? "Submitting Report..." : "Submit Waste Report"}
                </Button>
              </form>
            </div>

            {/* Badges Section */}
            {gamificationStats && gamificationStats.badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="text-3xl mr-3">🏆</span>
                    Your Badges
                  </h2>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {gamificationStats.badges.map((badge, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl"
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <div className="text-xs font-semibold">{badge.name}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Reports History Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="text-3xl mr-3">📋</span>
                  Your Reports
                </h2>

                {loadingReports ? (
                  <p className="text-center py-8 text-gray-500">Loading reports...</p>
                ) : reports.length === 0 ? (
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
                      No reports yet. Submit your first waste report!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {reports.slice(0, 5).map((report, idx) => (
                      <motion.div
                        key={report._id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                report.classification === "Wet"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : report.classification === "Dry"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {report.classification}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              report.status === "Collected"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                                : report.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="text-3xl mr-3">🏅</span>
                  Leaderboard
                </h2>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        idx === 0
                          ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30"
                          : "bg-gray-50 dark:bg-gray-700"
                      }`}
                    >
                      <span className="text-2xl font-bold w-8">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold">{entry.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {entry.points} pts • Level {entry.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CitizenDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Citizen"]}>
      <CitizenDashboardContent />
    </ProtectedRoute>
  );
}
