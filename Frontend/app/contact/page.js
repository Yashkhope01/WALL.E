"use client";
import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert("Thank you for contacting WALL.E! We will get back to you within 24 hours.");
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      inquiryType: 'general'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl md:text-2xl opacity-90">We're here to help make waste management smarter and cleaner</p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📧</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Email Us</h3>
              <a href="mailto:contact@walle-ai.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                contact@walle-ai.com
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Response within 24 hours</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Call Us</h3>
              <a href="tel:+919876543210" className="text-green-600 dark:text-green-400 hover:underline">
                +91 98765 43210
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Mon-Fri, 9AM-6PM IST</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Visit Us</h3>
              <p className="text-gray-700 dark:text-gray-300">
                WALL.E Headquarters<br />
                Mumbai, Maharashtra<br />
                India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Send Us a Message</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Have questions about WALL.E? Fill out the form below and our team will respond promptly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inquiry Type */}
              <div>
                <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type of Inquiry
                </label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="municipal">Municipal Registration</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What is this regarding?"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">How does WALL.E classify waste?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                WALL.E uses advanced AI and machine learning algorithms to analyze uploaded images and automatically classify waste into categories like wet, dry, recyclable, or hazardous waste.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Is WALL.E free for citizens?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Yes! Citizens can register and report waste completely free of charge. Our mission is to make waste management accessible to everyone.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">How can municipalities integrate WALL.E?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Municipal bodies can contact us through this form or call our dedicated municipal support line. We provide full implementation support and training.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What kind of support do you provide?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We offer 24/7 technical support, regular system updates, training sessions, and dedicated account managers for municipal and enterprise clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media & Newsletter */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Connected</h2>
          <p className="text-xl mb-8">Follow us on social media for updates and waste management tips</p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="https://www.instagram.com/walle_ai/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform">
              📷
            </a>
            <a href="https://www.linkedin.com/company/walle-ai/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform">
              💼
            </a>
            <a href="https://twitter.com/walle_ai" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform">
              🐦
            </a>
            <a href="https://facebook.com/walle.ai" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform">
              📘
            </a>
          </div>
          <p className="text-lg">Or email us at: <a href="mailto:contact@walle-ai.com" className="underline font-bold">contact@walle-ai.com</a></p>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;