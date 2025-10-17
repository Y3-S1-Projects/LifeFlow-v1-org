"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Droplet,
  Calendar,
  Clock,
  Users,
  Star,
  Gift,
  Award,
} from "lucide-react";
import Footer from "../components/Footer";
import Link from "next/link";
import GlobalHeader from "../components/GlobalHeader";
import BloodDonationChatbot from "../components/ChatBot";
import SupportChatBot from "../components/SupportChatBot";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setIsVisible] = useState(false);
  const [, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const slides = [
    {
      title: "Save Lives",
      description:
        "One donation can save up to three lives. Your contribution matters more than you know.",
      icon: <Heart className="h-16 w-16 text-red-500" />,
      color: "from-red-50 to-red-100",
      stat: "3 Lives",
      statDesc: "saved per donation",
    },
    {
      title: "Quick & Easy",
      description:
        "The donation process takes only 10-15 minutes. A small amount of your time can mean a lifetime for someone else.",
      icon: <Clock className="h-16 w-16 text-red-500" />,
      color: "from-orange-50 to-orange-100",
      stat: "15 Min",
      statDesc: "donation time",
    },
    {
      title: "Always Needed",
      description:
        "Every two seconds, someone in the US needs blood. The need is constant and your contribution is essential.",
      icon: <Droplet className="h-16 w-16 text-red-500" />,
      color: "from-blue-50 to-blue-100",
      stat: "2 Seconds",
      statDesc: "between needs",
    },
    {
      title: "Health Benefits",
      description:
        "Donating blood can reveal potential health issues, reduce harmful iron stores, and help your body produce new blood cells.",
      icon: <Gift className="h-16 w-16 text-red-500" />,
      color: "from-green-50 to-green-100",
      stat: "Health",
      statDesc: "benefits for you",
    },
    {
      title: "Join Our Community",
      description:
        "Become part of a community of heroes who regularly donate to help others in need.",
      icon: <Users className="h-16 w-16 text-red-500" />,
      color: "from-purple-50 to-purple-100",
      stat: "1M+",
      statDesc: "regular donors",
    },
  ];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const bloodTypes = [
    {
      type: "A+",
      canGiveTo: ["A+", "AB+"],
      canReceiveFrom: ["A+", "A-", "O+", "O-"],
    },
    {
      type: "A-",
      canGiveTo: ["A+", "A-", "AB+", "AB-"],
      canReceiveFrom: ["A-", "O-"],
    },
    {
      type: "B+",
      canGiveTo: ["B+", "AB+"],
      canReceiveFrom: ["B+", "B-", "O+", "O-"],
    },
    {
      type: "B-",
      canGiveTo: ["B+", "B-", "AB+", "AB-"],
      canReceiveFrom: ["B-", "O-"],
    },
    {
      type: "AB+",
      canGiveTo: ["AB+"],
      canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    {
      type: "AB-",
      canGiveTo: ["AB+", "AB-"],
      canReceiveFrom: ["A-", "B-", "AB-", "O-"],
    },
    {
      type: "O+",
      canGiveTo: ["A+", "B+", "AB+", "O+"],
      canReceiveFrom: ["O+", "O-"],
    },
    {
      type: "O-",
      canGiveTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      canReceiveFrom: ["O-"],
    },
  ];

  const donationTypes = [
    {
      name: "Whole Blood",
      description:
        "The most common type of donation where we collect about a pint of whole blood.",
      frequency: "Every 56 days",
      duration: "10-15 minutes",
      icon: <Droplet className="h-6 w-6" />,
    },
    {
      name: "Plasma",
      description:
        "The liquid portion of your blood is collected while returning red cells to you.",
      frequency: "Every 28 days",
      duration: "45 minutes",
      icon: <Droplet className="h-6 w-6" />,
    },
    {
      name: "Platelets",
      description:
        "Platelets help blood clot and are essential for cancer patients and others.",
      frequency: "Every 7 days (up to 24 times per year)",
      duration: "2-3 hours",
      icon: <Droplet className="h-6 w-6" />,
    },
    {
      name: "Double Red Cells",
      description:
        "Two units of red cells are collected while plasma and platelets are returned to you.",
      frequency: "Every 112 days",
      duration: "30 minutes",
      icon: <Droplet className="h-6 w-6" />,
    },
  ];

  const faqItems = [
    {
      question: "Who can donate blood?",
      answer:
        "Most healthy adults who are at least 17 years old (16 with parental consent in some states) and weigh at least 110 pounds can donate blood. Detailed eligibility criteria may vary by donation center.",
    },
    {
      question: "How often can I donate blood?",
      answer:
        "For whole blood donations, you can donate every 56 days (8 weeks). Plasma can be donated every 28 days, and platelets can be donated up to 24 times a year.",
    },
    {
      question: "Is donating blood safe?",
      answer:
        "Yes, donating blood is very safe. New, sterile equipment is used for each donor, and the donation process is conducted by trained professionals in clean environments.",
    },
    {
      question: "How long does a blood donation take?",
      answer:
        "The actual blood donation takes about 10-15 minutes. However, the entire process, including registration, health screening, and refreshments after donation, takes about an hour.",
    },
    {
      question: "Will donating blood hurt?",
      answer:
        "Most people feel only a slight pinch when the needle is inserted. This lasts only a couple of seconds, and most donors report very minimal discomfort during the process.",
    },
  ];

  return (
    <div className="min-h-screen w-screen bg-white">
      <GlobalHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <SupportChatBot />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white ">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24 flex flex-col md:flex-row items-center w-full md:w-3/4 lg:w-3/4">
          <div className="md:w-1/2 md:pr-4 lg:pr-8 mb-8 md:mb-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              Give Blood, Give Life
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-4 md:mb-6 text-red-100">
              Your donation can be the difference between life and death for
              someone in need.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link href="/donor/appointments">
                <Button className="w-full sm:w-auto bg-white text-red-700 hover:bg-red-100 px-4 py-2 md:px-6 md:py-3 text-base md:text-lg">
                  Donate Now
                </Button>
              </Link>
              <Link href="#learn-more">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-white text-black hover:bg-red-700 px-4 py-2 md:px-6 md:py-3 text-base md:text-lg"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 group">
            <Card className="bg-white/10 backdrop-blur border-none overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <div className="relative overflow-hidden h-48 sm:h-56 md:h-64 lg:h-96">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-gradient-to-br ${
                        slide.color
                      } p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center text-center ${
                        index === currentSlide
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-full"
                      }`}
                    >
                      <div className="text-red-600">{slide.icon}</div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2 md:mt-4 text-red-600">
                        {slide.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-700 mt-1 md:mt-2 max-w-md">
                        {slide.description}
                      </p>
                      <div className="mt-2 md:mt-4 bg-white/80 px-3 py-1 md:px-4 md:py-2 rounded-full">
                        <span className="text-lg md:text-xl text-red-600 font-bold">
                          {slide.stat}
                        </span>
                        <span className="text-sm md:text-base text-gray-700 ml-1 md:ml-2">
                          {slide.statDesc}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Background for Prev Button */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 md:w-10 bg-gradient-to-r from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  {/* Background for Next Button */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 md:w-10 bg-gradient-to-l from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  {/* Prev Button */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2  p-1 sm:p-2 text-red-600  opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={16} className="h-4 w-4 md:h-5 md:w-5" />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 sm:p-2 text-red-600  opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={16} className="h-4 w-4 md:h-5 md:w-5" />
                  </button>

                  {/* Line pagination */}
                  <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 md:space-x-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1 md:h-1.5 transition-all ${
                          currentSlide === index
                            ? "bg-red-600 w-6 md:w-8 rounded-sm"
                            : "bg-white/60 w-4 md:w-6 rounded-sm"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="learn-more" className="py-16 w-full md:w-3/4 lg:w-3/4 mx-auto">
        <div className="container mx-auto px-4 ">
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-12">
            Why Your Donation Matters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-red-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 rounded-full p-4 inline-flex mb-4">
                  <Droplet className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">38,000</h3>
                <p className="text-gray-600">
                  Blood donations needed daily in the US
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 rounded-full p-4 inline-flex mb-4">
                  <Calendar className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">1 in 7</h3>
                <p className="text-gray-600">
                  Hospital patients who need blood
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 rounded-full p-4 inline-flex mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">43,000</h3>
                <p className="text-gray-600">
                  Pints of donated blood used each day
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 rounded-full p-4 inline-flex mb-4">
                  <Star className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  4.5 million
                </h3>
                <p className="text-gray-600">
                  Americans who need blood transfusions each year
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Blood Types Section */}
      <div className="py-16 w-full md:w-3/4 lg:w-3/4 mx-auto">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
            Know Your Blood Type
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Understanding blood compatibility can help you know how your
            donation helps others.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bloodTypes.map((bloodType) => (
              <Card
                key={bloodType.type}
                className="border-red-100 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-red-600">
                      {bloodType.type}
                    </span>
                    <div className="bg-red-100 h-10 w-10 rounded-full flex items-center justify-center">
                      <Droplet className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Can give to:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bloodType.canGiveTo.map((type) => (
                          <span
                            key={type}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Can receive from:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bloodType.canReceiveFrom.map((type) => (
                          <span
                            key={type}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Types Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
            Types of Donations
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            There are several ways to donate based on community needs and your
            eligibility.
          </p>

          <Tabs
            defaultValue={donationTypes[0].name.toLowerCase().replace(" ", "-")}
            className="max-w-4xl mx-auto"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              {donationTypes.map((type) => (
                <TabsTrigger
                  key={type.name}
                  value={type.name.toLowerCase().replace(" ", "-")}
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  {type.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {donationTypes.map((type) => (
              <TabsContent
                key={type.name}
                value={type.name.toLowerCase().replace(" ", "-")}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {type.name}
                        </h3>
                        <p className="text-gray-600 mb-4">{type.description}</p>
                        <div className="flex flex-col sm:flex-row gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-red-500" />
                            <span>
                              <strong>Frequency:</strong> {type.frequency}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-red-500" />
                            <span>
                              <strong>Duration:</strong> {type.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-red-100 max-w-2xl mx-auto mb-8">
            Schedule your donation appointment today and join the community of
            lifesavers.
          </p>
          <Link href="/donor/appointments">
            <Button className="bg-white text-red-700 hover:bg-red-100 px-8 py-3 text-lg">
              Schedule Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-gray-800 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="group border border-gray-200 rounded-lg overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-4 bg-white hover:bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-800">
                    {item.question}
                  </h3>
                  <span className="text-red-600 group-open:rotate-180 transition-transform">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </summary>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <Footer isDarkMode={false} />
    </div>
  );
};

export default Home;
