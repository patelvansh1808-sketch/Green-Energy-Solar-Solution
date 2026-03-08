import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../Context/I18nContext";

export default function AboutPage() {
  const { t } = useI18n();

  const highlights = [
    {
      title: "Mission",
      description:
        "Deliver reliable, affordable, and scalable solar energy solutions with transparent execution and measurable outcomes.",
    },
    {
      title: "Vision",
      description:
        "Accelerate India’s transition to clean energy by making solar adoption simple for homes, businesses, and institutions.",
    },
    {
      title: "Approach",
      description:
        "Combine engineering-first implementation, compliant processes, and long-term support to maximize system performance.",
    },
  ];

  const strengths = [
    "MNRE-aligned process and subsidy guidance",
    "Premium-grade components with quality checks",
    "Structured project planning and milestone tracking",
    "Dedicated post-installation support and monitoring",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-green-700 mb-3">
            {t("landing.aboutUs")}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            {t("landing.aboutTitle")}
          </h1>
          <p className="mt-5 text-gray-600 text-base sm:text-lg max-w-3xl leading-relaxed">
            {t("landing.aboutBody")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Contact Us
            </Link>
            <Link
              to="/booking"
              className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold px-6 py-3 rounded-lg transition"
            >
              Book Solar Consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {highlights.map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
              <p className="mt-3 text-gray-600 leading-relaxed text-sm sm:text-base">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-16">
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-900">Why Customers Choose Us</h3>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {strengths.map((point) => (
              <div key={point} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700">
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
