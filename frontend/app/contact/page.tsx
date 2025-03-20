"use client"
import { useState } from "react"
import type React from "react"

import { Mail, User, MessageSquare, Send, Heart } from "lucide-react"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponseMessage("")

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        setResponseMessage("Message sent successfully!")
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        setResponseMessage(data.error || "Failed to send message.")
      }
    } catch (error) {
      setResponseMessage("An error occurred. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
      <div className="w-full max-w-lg relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-red-100 rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-red-100 rounded-full opacity-70"></div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-red-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Contact Us</h2>
              <Heart className="h-8 w-8 text-white animate-pulse" />
            </div>
            <p className="mt-2 opacity-90">We're here to help with your blood donation inquiries</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1 flex items-center">
                <User className="w-4 h-4 mr-2 text-red-500" />
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none"
                required
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-red-500" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none"
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-red-500" />
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none"
                required
                placeholder="What is this regarding?"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-red-500" />
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 outline-none"
                rows={4}
                required
                placeholder="Your message here..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Message
                </>
              )}
            </button>
          </form>

          {/* Response message */}
          {responseMessage && (
            <div
              className={`p-4 text-center font-medium ${responseMessage.includes("success") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
            >
              {responseMessage}
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t border-gray-100">
            LifeFlow - Connecting donors to save lives
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage

