import { useState } from "react";

export default function FAQBoard({ onSelectFAQ, onSelectOther }) {
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      category: "Installation",
      question: "How long does solar panel installation take?",
      answer:
        "Typically, solar panel installation takes 1-3 days depending on your system size. A standard residential system (5-10 kW) usually takes 1-2 days of work.",
      icon: "⚙️",
    },
    {
      id: 2,
      category: "Installation",
      question: "Will installation disrupt my daily routine?",
      answer:
        "Installation involves some noise and activity on your roof. We recommend scheduling it when you'll be home, and the process usually completes within 1-2 business days.",
      icon: "🏠",
    },
    {
      id: 3,
      category: "Maintenance",
      question: "How often should I maintain my solar panels?",
      answer:
        "Solar panels require minimal maintenance - typically just cleaning 2-4 times per year. We provide free maintenance checks in the first year.",
      icon: "🧹",
    },
    {
      id: 4,
      category: "Maintenance",
      question: "What should I do if my panels get dirty?",
      answer:
        "Light rain usually cleans panels naturally. For heavy dust or debris, use a soft brush or hire a professional cleaning service. Avoid high-pressure washers that may damage the panels.",
      icon: "💧",
    },
    {
      id: 5,
      category: "Performance",
      question: "Why am I getting less power output than expected?",
      answer:
        "Several factors can affect output: shading from trees/buildings, weather conditions, panel angle, or dust accumulation. Our team can diagnose and optimize your system.",
      icon: "⚡",
    },
    {
      id: 6,
      category: "Performance",
      question: "How do weather conditions affect solar panels?",
      answer:
        "Solar panels work in all weather! Even on cloudy days, they generate 10-25% of rated capacity. Cold weather actually improves efficiency. Snow cover temporarily reduces output.",
      icon: "☁️",
    },
    {
      id: 7,
      category: "Warranty",
      question: "What warranty coverage do you provide?",
      answer:
        "We offer 25-year manufactured warranty on panels, 10-year equipment warranty on inverters, and workmanship warranty. Extended coverage options are available.",
      icon: "📋",
    },
    {
      id: 8,
      category: "Warranty",
      question: "What happens if my panel fails within warranty?",
      answer:
        "We will replace the defective panel at no cost through our warranty program. We also provide temporary solutions to minimize your downtime.",
      icon: "🔧",
    },
    {
      id: 9,
      category: "Safety",
      question: "Are solar panels safe during storms and high winds?",
      answer:
        "Yes, solar panels are built to withstand up to 140 mph winds and are designed with lightning protection. Modern panels meet rigorous safety standards.",
      icon: "🌪️",
    },
    {
      id: 10,
      category: "Safety",
      question: "Are solar panels a fire risk?",
      answer:
        "Solar panels have extremely low fire risk. All installations include proper electrical grounding, circuit protection, and meet building codes and safety standards.",
      icon: "🔥",
    },
    {
      id: 11,
      category: "Optimization",
      question: "How can I maximize my solar energy savings?",
      answer:
        "Use energy during peak solar hours (10 AM - 3 PM), consider battery storage, maintain regular panel cleaning, and monitor your energy usage through our mobile app.",
      icon: "💰",
    },
    {
      id: 12,
      category: "Technical",
      question: "Can I add more panels to my existing system?",
      answer:
        "Yes, most systems can be expanded. We assess your roof space, electrical capacity, and current inverter to determine expansion options.",
      icon: "📈",
    },
  ];

  const categories = ["Installation", "Maintenance", "Performance", "Warranty", "Safety", "Optimization", "Technical"];

  const handleSelectFAQ = (faq) => {
    onSelectFAQ(faq);
    setExpandedId(null);
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">❓ Common Questions</h1>
          <p className="text-gray-600 mt-2">
            Find answers to frequently asked questions about solar installation and maintenance
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-500 transition font-semibold"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="divide-y divide-gray-200">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="p-6 hover:bg-gray-50 transition cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === faq.id ? null : faq.id)
                }
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{faq.icon}</div>
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <p className="text-sm font-semibold text-green-600 mb-1">
                          {faq.category}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      <span className="text-2xl text-gray-400 flex-shrink-0">
                        {expandedId === faq.id ? "−" : "+"}
                      </span>
                    </div>

                    {expandedId === faq.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-700 mb-4">{faq.answer}</p>
                        <button
                          onClick={() => handleSelectFAQ(faq)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                        >
                          👍 This Helps
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Option */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Didn't find your answer?
          </h3>
          <p className="text-gray-600 mb-6">
            Chat directly with our support team about your specific issue
          </p>
          <button
            onClick={onSelectOther}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition inline-block"
          >
            💬 Start Chat Support
          </button>
        </div>
      </div>
    </div>
  );
}
