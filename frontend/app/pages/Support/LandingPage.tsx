import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Header from "@/app/components/Header";
import GlobalHeader from "@/app/components/GlobalHeader";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "How do I find a blood donation camp near me?",
    answer:
      "Enter your location in the search bar on our homepage. You can filter results by date, distance, and blood type needed. The map view will show all camps in your area.",
  },
  {
    question: "Can I schedule a donation appointment through the website?",
    answer:
      "Yes! Once you find a suitable camp, click on 'Schedule Appointment' and select your preferred time slot. You'll receive a confirmation email with all details.",
  },
  {
    question: "What should I do before donating blood?",
    answer:
      "Get a good night's sleep, eat a healthy meal, drink plenty of fluids, and bring a valid ID. Avoid fatty foods, alcohol, and smoking before donation.",
  },
  {
    question: "How often can I donate blood?",
    answer:
      "Most healthy adults can donate whole blood every 56 days (8 weeks). For platelets, you can donate every 7 days up to 24 times a year.",
  },
  {
    question: "How do I organize a blood donation camp?",
    answer:
      "Contact us through the 'Organize a Camp' form on our website. Our team will guide you through the process, including requirements, logistics, and necessary documentation.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "Yes, our mobile app is available for both iOS and Android devices. Search for 'Blood Donation Finder' in your app store to download.",
  },
];

const SupportPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setContactFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to a server
    alert("Your message has been sent. We will respond shortly!");
    setContactFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <>
      <GlobalHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div className="min-h-screen mt-10  bg-gray-50">
        {/* Hero Section */}
        <motion.div
          className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 w-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.h1
              className="text-3xl md:text-4xl font-bold mb-4 text-center"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              How Can We Help You?
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto text-center text-red-100"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Find answers, resources, and assistance for all your blood
              donation questions
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="mt-8 max-w-2xl mx-auto relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  className="w-full py-3 px-4 pr-12 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="absolute right-4 top-3 text-gray-500"
                  size={20}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Support Options */}
        <div className="container mx-auto px-4 md:px-6 py-12">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Contact Support */}
            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <MessageCircle className="text-red-600" size={24} />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">
                Contact Support
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Reach out to our dedicated support team for personalized
                assistance
              </p>
              <div className="flex justify-center">
                <a
                  href="#contact-form"
                  className="text-red-600 font-medium hover:text-red-700 flex items-center"
                >
                  Get in touch <ChevronDown size={16} className="ml-1" />
                </a>
              </div>
            </motion.div>

            {/* Resources */}
            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <FileText className="text-red-600" size={24} />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">
                Resources
              </h2>
              <p className="text-gray-600 text-center mb-4">
                Access guides, articles, and documents about blood donation
              </p>
              <div className="flex justify-center">
                <a
                  href="#"
                  className="text-red-600 font-medium hover:text-red-700 flex items-center"
                >
                  Browse resources <ChevronDown size={16} className="ml-1" />
                </a>
              </div>
            </motion.div>

            {/* FAQs */}
            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <HelpCircle className="text-red-600" size={24} />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2">FAQs</h2>
              <p className="text-gray-600 text-center mb-4">
                Find answers to frequently asked questions about donation
              </p>
              <div className="flex justify-center">
                <a
                  href="#faqs"
                  className="text-red-600 font-medium hover:text-red-700 flex items-center"
                >
                  View FAQs <ChevronDown size={16} className="ml-1" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div id="faqs" className="bg-gray-100 py-12">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Frequently Asked Questions
              </h2>

              <div className="max-w-3xl mx-auto">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <motion.div
                      key={index}
                      className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <button
                        className="w-full text-left p-4 flex justify-between items-center focus:outline-none"
                        onClick={() => toggleFAQ(index)}
                      >
                        <span className="font-medium text-lg">
                          {faq.question}
                        </span>
                        {expandedFAQ === index ? (
                          <ChevronUp className="text-red-600" size={20} />
                        ) : (
                          <ChevronDown className="text-red-600" size={20} />
                        )}
                      </button>
                      {expandedFAQ === index && (
                        <motion.div
                          className="p-4 pt-0 text-gray-600 border-t border-gray-100"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No FAQs match your search. Try different keywords or browse
                    all questions.
                  </p>
                )}

                {searchTerm && filteredFAQs.length === 0 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setSearchTerm("")}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contact Form */}
        <div id="contact-form" className="py-12">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Get in Touch
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Contact Methods */}
                <div className="md:col-span-1 h-full">
                  <div className="bg-white rounded-lg shadow-md p-6 h-full">
                    <h3 className="text-xl font-semibold mb-4">
                      Contact Methods
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="p-2 bg-red-100 rounded-full mr-3 flex-shrink-0">
                          <Mail className="text-red-600" size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">Email</p>
                          <p className="text-gray-600 break-words">
                            support@blooddonationfinder.org
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="p-2 bg-red-100 rounded-full mr-3 flex-shrink-0">
                          <Phone className="text-red-600" size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">Phone</p>
                          <p className="text-gray-600">
                            1-800-DONATE (366-283)
                          </p>
                          <p className="text-sm text-gray-500">
                            Mon-Fri: 8am-8pm
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="p-2 bg-red-100 rounded-full mr-3 flex-shrink-0">
                          <MessageCircle className="text-red-600" size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">Live Chat</p>
                          <p className="text-gray-600">Available on website</p>
                          <p className="text-sm text-gray-500">
                            24/7 for urgent matters
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="md:col-span-2 h-full">
                  <motion.div
                    className="bg-white rounded-lg shadow-md p-6 h-full"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                            value={contactFormData.name}
                            onChange={handleContactFormChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                            value={contactFormData.email}
                            onChange={handleContactFormChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                          value={contactFormData.subject}
                          onChange={handleContactFormChange}
                        >
                          <option value="">Select a subject</option>
                          <option value="General Inquiry">
                            General Inquiry
                          </option>
                          <option value="Technical Support">
                            Technical Support
                          </option>
                          <option value="Donation Process">
                            Donation Process
                          </option>
                          <option value="Organize a Camp">
                            Organize a Camp
                          </option>
                          <option value="Report an Issue">
                            Report an Issue
                          </option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                          value={contactFormData.message}
                          onChange={handleContactFormChange}
                        />
                      </div>

                      <div className="flex justify-end">
                        <motion.button
                          onClick={handleContactSubmit}
                          className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Send Message
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Emergency Section */}
        <motion.div
          className="bg-red-50 py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-red-600 mb-2">
                Emergency Blood Need?
              </h3>
              <p className="text-gray-700 mb-4">
                For urgent blood needs, please call our emergency hotline
                immediately. Our team is available 24/7 to coordinate emergency
                donations and connect you with nearby donors.
              </p>
              <div className="flex items-center justify-center sm:justify-start">
                <Phone className="text-red-600 mr-2" size={20} />
                <span className="text-lg font-bold text-red-600">
                  1-800-BLOOD-NOW (256-6366)
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SupportPage;
