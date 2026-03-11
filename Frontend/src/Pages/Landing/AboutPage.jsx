import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../Context/I18nContext";

export default function AboutPage() {
  const { t } = useI18n();

  const metrics = [
    { label: "Projects Delivered", value: "500+" },
    { label: "States Served", value: "12" },
    { label: "Average Support SLA", value: "< 24 hrs" },
    { label: "Customer Satisfaction", value: "4.8/5" },
  ];

  const principles = [
    {
      title: "Engineering Precision",
      description:
        "Each system is planned using technical assessment, location context, and expected consumption patterns for long-term efficiency.",
    },
    {
      title: "Execution Transparency",
      description:
        "Customers get clear milestones from consultation to commissioning, with status visibility and accountable delivery.",
    },
    {
      title: "Lifecycle Support",
      description:
        "Beyond installation, we focus on maintenance, subsidy support, and proactive service to maximize plant output over time.",
    },
  ];

  const journey = [
    {
      step: "01",
      title: "Discover",
      description:
        "Energy needs, site conditions, and financial goals are mapped in detail before proposing a solution.",
    },
    {
      step: "02",
      title: "Design",
      description:
        "We prepare a system plan covering capacity, component quality, compliance, and expected performance.",
    },
    {
      step: "03",
      title: "Deploy",
      description:
        "Certified teams execute installation with structured quality checks and commissioning protocols.",
    },
    {
      step: "04",
      title: "Sustain",
      description:
        "Service workflows, ticket support, and performance reviews keep the system healthy and productive.",
    },
  ];

  const strengths = [
    "Subsidy guidance aligned with current policy frameworks",
    "High-quality component ecosystem and quality checkpoints",
    "Role-based digital workflow for faster and safer operations",
    "Preventive maintenance and responsive support structure",
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {t("landing.aboutUs")}
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Building a cleaner energy future with practical, high-performance solar systems.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Green Energy Solar Solution is a technology-enabled solar operations platform that combines
            engineering excellence, transparent execution, and long-term service commitment. We help
            households and businesses move to solar with confidence, clarity, and measurable value.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="rounded-lg bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
            >
              Contact Us
            </Link>
            <Link
              to="/booking"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Book Solar Consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What defines our work</h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            Our model combines technology, field execution discipline, and customer-first operations to deliver
            reliable outcomes throughout the solar lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:gap-6">
          {principles.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-2xl font-bold text-slate-900">Our delivery journey</h3>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {journey.map((item) => (
              <div key={item.step} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Step {item.step}</p>
                <h4 className="mt-1 text-lg font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="text-2xl font-bold text-slate-900">Why customers choose us</h3>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {strengths.map((point) => (
                <div
                  key={point}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Ready to switch to smart solar?</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Talk to our team for a practical roadmap covering design, installation, subsidy guidance, and
              long-term support.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Schedule a Discussion
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">From first consultation to long-term care</h3>
            <p className="mt-1 text-sm text-slate-600">
              One integrated team. One transparent process. One reliable solar partner.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/booking"
              className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start Your Booking
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Talk to Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
