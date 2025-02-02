import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "../components/Header";
import Footer from "../components/Footer";

type FormFields =
  | "understandsBenefits"
  | "awareOfSideEffects"
  | "understandsPostDonationCare"
  | "preparedToFollowInstructions"
  | "understandsComplications"
  | "awareOfActivityRestrictions"
  | "agreesToHonesty";

type FormData = {
  [K in FormFields]: boolean;
};

const BloodDonationForm = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    understandsBenefits: false,
    awareOfSideEffects: false,
    understandsPostDonationCare: false,
    preparedToFollowInstructions: false,
    understandsComplications: false,
    awareOfActivityRestrictions: false,
    agreesToHonesty: false,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const section1Fields: FormFields[] = [
    "understandsBenefits",
    "awareOfSideEffects",
    "understandsPostDonationCare",
  ];

  const section2Fields: FormFields[] = [
    "preparedToFollowInstructions",
    "understandsComplications",
    "awareOfActivityRestrictions",
    "agreesToHonesty",
  ];

  const handleChange = (name: FormFields, value: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setShowSuccess(false);
    setShowError(false);
  };

  const validateSection = (sectionFields: FormFields[]): boolean => {
    return sectionFields.every((field) => formData[field]);
  };

  const handleNextSection = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    if (validateSection(section1Fields)) {
      setCurrentSection(2);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handlePreviousSection = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    setCurrentSection(1);
    setShowError(false);
    setShowSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSection(section2Fields)) {
      setShowError(false);
      setShowSuccess(true);
      console.log(formData);
    } else {
      setShowError(true);
      setShowSuccess(false);
    }
  };

  const section1Questions = [
    {
      name: "understandsBenefits" as FormFields,
      label: "Do you understand the health benefits of donating blood?",
      description:
        "Blood donation can help save lives and may have health benefits for donors.",
    },
    {
      name: "awareOfSideEffects" as FormFields,
      label: "Are you aware of the potential side effects of blood donation?",
      description:
        "Common side effects may include temporary dizziness, fatigue, or discomfort at the needle site.",
    },
    {
      name: "understandsPostDonationCare" as FormFields,
      label: "Do you understand the post-donation care requirements?",
      description:
        "You'll need to rest for 15 minutes and stay hydrated after donating.",
    },
  ];

  const section2Questions = [
    {
      name: "preparedToFollowInstructions" as FormFields,
      label: "Are you prepared to follow the medical staff's instructions?",
      description:
        "Following proper procedures ensures a safe donation process.",
    },
    {
      name: "understandsComplications" as FormFields,
      label: "Do you understand when to notify the medical team?",
      description: "Report any unusual symptoms or discomfort immediately.",
    },
    {
      name: "awareOfActivityRestrictions" as FormFields,
      label: "Are you aware of post-donation activity restrictions?",
      description: "Avoid strenuous activities for 24 hours after donating.",
    },
  ];

  // Rest of the JSX remains the same until the buttons section
  return (
    <div className="min-h-screen w-screen bg-gray-50 py-6">
      <Header />
      <div className="mt-6 mb-6">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-2xl font-bold text-red-800 flex items-center gap-3">
              <span className="inline-block w-3 h-3 bg-red-600 rounded-full"></span>
              Blood Donation Questionnaire
              <span className="text-lg ml-auto">
                Section {currentSection} of 2
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {showSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800 flex items-center gap-2 text-base">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thank you for completing the questionnaire. Please proceed to
                  the next step.
                </AlertDescription>
              </Alert>
            )}

            {showError && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 flex items-center gap-2 text-base">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Please review and acknowledge all statements in this section
                  before continuing.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-gray-600 mb-6 text-lg">
              Section {currentSection}:{" "}
              {currentSection === 1
                ? "Basic Understanding"
                : "Medical Requirements"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {currentSection === 1 ? (
                  section1Questions.map(({ name, label, description }) => (
                    <div
                      key={name}
                      className="bg-white p-4 rounded-lg border border-gray-100 hover:border-red-100 hover:bg-red-50/10 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={name}
                          checked={formData[name]}
                          onCheckedChange={(checked: boolean) =>
                            handleChange(name, checked)
                          }
                          className="mt-1 h-4 w-4"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={name}
                            className="text-gray-700 text-base font-medium cursor-pointer block"
                          >
                            {label}
                          </label>
                          <p className="text-gray-500 text-sm mt-1">
                            {description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {section2Questions.map(({ name, label, description }) => (
                      <div
                        key={name}
                        className="bg-white p-4 rounded-lg border border-gray-100 hover:border-red-100 hover:bg-red-50/10 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={name}
                            checked={formData[name]}
                            onCheckedChange={(checked: boolean) =>
                              handleChange(name, checked)
                            }
                            className="mt-1 h-4 w-4"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={name}
                              className="text-gray-700 text-base font-medium cursor-pointer block"
                            >
                              {label}
                            </label>
                            <p className="text-gray-500 text-sm mt-1">
                              {description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="agreesToHonesty"
                            checked={formData.agreesToHonesty}
                            onCheckedChange={(checked: boolean) =>
                              handleChange("agreesToHonesty", checked)
                            }
                            className="mt-1 h-4 w-4"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor="agreesToHonesty"
                              className="text-gray-800 text-base font-medium cursor-pointer block"
                            >
                              Final Agreement: Honesty Declaration
                            </label>
                            <p className="text-gray-600 text-sm mt-1">
                              I hereby declare that I will provide honest and
                              accurate information about my health status during
                              the screening process. I understand that this is
                              crucial for both my safety and the safety of
                              potential blood recipients.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                {currentSection === 2 && (
                  <button
                    type="button"
                    onClick={handlePreviousSection}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-base focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Previous Section
                  </button>
                )}
                {currentSection === 1 ? (
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-base focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Next Section
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-base focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Submit and Continue
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer isDarkMode={false} />
    </div>
  );
};

export default BloodDonationForm;
