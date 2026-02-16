import { useState } from "react";

export default function CategoryFAQs({ category }) {
  const [expandedId, setExpandedId] = useState(null);

  // FAQ data mapped to categories
  const faqsByCategory = {
    installation: [
      {
        id: 1,
        question: "How long does solar panel installation take?",
        answer:
          "Typically, solar panel installation takes 1-3 days depending on your system size. A standard residential system (5-10 kW) usually takes 1-2 days of work.",
        icon: "⚙️",
      },
      {
        id: 2,
        question: "Will installation disrupt my daily routine?",
        answer:
          "Installation involves some noise and activity on your roof. We recommend scheduling it when you'll be home, and the process usually completes within 1-2 business days.",
        icon: "🏠",
      },
    ],
    maintenance: [
      {
        id: 3,
        question: "How often should I maintain my solar panels?",
        answer:
          "Solar panels require minimal maintenance - typically just cleaning 2-4 times per year. We provide free maintenance checks in the first year.",
        icon: "🧹",
      },
      {
        id: 4,
        question: "What should I do if my panels get dirty?",
        answer:
          "Light rain usually cleans panels naturally. For heavy dust or debris, use a soft brush or hire a professional cleaning service. Avoid high-pressure washers that may damage the panels.",
        icon: "💧",
      },
    ],
    technical: [
      {
        id: 5,
        question: "Why am I getting less power output than expected?",
        answer:
          "Several factors can affect output: shading from trees/buildings, weather conditions, panel angle, or dust accumulation. Our team can diagnose and optimize your system.",
        icon: "⚡",
      },
      {
        id: 6,
        question: "How do weather conditions affect solar panels?",
        answer:
          "Solar panels work in all weather! Even on cloudy days, they generate 10-25% of rated capacity. Cold weather actually improves efficiency. Snow cover temporarily reduces output.",
        icon: "☁️",
      },
      {
        id: 9,
        question: "Are solar panels safe during storms and high winds?",
        answer:
          "Yes, solar panels are built to withstand up to 140 mph winds and are designed with lightning protection. Modern panels meet rigorous safety standards.",
        icon: "🌪️",
      },
    ],
    warranty: [
      {
        id: 7,
        question: "What warranty coverage do you provide?",
        answer:
          "We offer 25-year manufactured warranty on panels, 10-year equipment warranty on inverters, and workmanship warranty. Extended coverage options are available.",
        icon: "📋",
      },
      {
        id: 8,
        question: "What happens if my panel fails within warranty?",
        answer:
          "We will replace the defective panel at no cost through our warranty program. We also provide temporary solutions to minimize your downtime.",
        icon: "🔧",
      },
    ],
  };

  const relevantFAQs = faqsByCategory[category] || [];

  if (relevantFAQs.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gradient-to-b from-green-50 to-white border-2 border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-900 mb-4">
        💡 Common Questions for {category.charAt(0).toUpperCase() + category.slice(1)}
      </h3>
      <div className="space-y-2">
        {relevantFAQs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-md border border-green-100 overflow-hidden hover:border-green-300 transition"
          >
            <button
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="w-full p-4 text-left hover:bg-green-50 transition flex justify-between items-start gap-3"
            >
              <div className="flex items-start gap-3 flex-grow min-w-0">
                <span className="text-xl mt-0.5 flex-shrink-0">{faq.icon}</span>
                <p className="font-medium text-gray-900 text-sm leading-snug">{faq.question}</p>
              </div>
              <span className="ml-2 text-lg text-gray-400 flex-shrink-0 pt-0.5">
                {expandedId === faq.id ? "−" : "+"}
              </span>
            </button>

            {expandedId === faq.id && (
              <div className="px-4 pb-4 border-t border-green-100 bg-green-50">
                <p className="text-gray-700 text-sm mt-3 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
