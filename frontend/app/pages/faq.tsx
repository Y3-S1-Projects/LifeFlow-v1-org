import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import GlobalHeader from '../components/GlobalHeader';
import Footer from '../components/Footer';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

const FAQPage: NextPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/faqs`);
        if (!response.ok) {
          throw new Error(`Failed to fetch FAQs: ${response.status}`);
        }
        const data = await response.json();
        setFaqs(data.data.faqs);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setError("Failed to load FAQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  return (
    <div className="min-h-screen w-screen bg-white">
      <GlobalHeader isMenuOpen={false} setIsMenuOpen={() => {}} />
      
      {/* FAQ Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">
              Find answers to common questions about blood donation.
            </p>
          </div>

          {loading ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 max-w-3xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq._id}
                  className="group border border-gray-200 rounded-lg overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-white hover:bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-800">
                      {faq.question}
                    </h3>
                    <span className="text-red-600 group-open:rotate-180 transition-transform">
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </summary>
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer isDarkMode={false} />
    </div>
  );
};

export default FAQPage;