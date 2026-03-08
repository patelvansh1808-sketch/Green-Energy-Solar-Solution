import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../Context/I18nContext";
import {
  FiCalendar,
  FiClock,
  FiTool,
  FiFileText,
  FiBarChart2,
  FiHeadphones,
  FiHome,
  FiBriefcase,
  FiUsers,
  FiSettings,
} from "react-icons/fi";

function Feature({ title, desc, icon, to, ctaLabel }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition flex flex-col gap-3">
      <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center text-2xl mb-2">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
      {to && (
        <Link
          to={to}
          className="mt-1 inline-flex items-center gap-2 text-green-700 font-semibold text-sm hover:text-green-800"
        >
          {ctaLabel} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

function BenefitCard({ icon, title, desc, details, link, collapseLabel, isExpanded, onToggle }) {
  return (
    <div className="h-full bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition border-t-4 border-green-700 flex flex-col">
      <div className="text-4xl mb-4 font-bold text-green-700">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{desc}</p>
      {isExpanded && (
        <p className="text-gray-700 text-sm mb-4 leading-relaxed bg-green-50 border border-green-100 rounded-md p-3">
          {details}
        </p>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="mt-auto self-start text-left text-green-700 font-semibold hover:text-green-800 text-sm"
      >
        {isExpanded ? collapseLabel : `${link} →`}
      </button>
    </div>
  );
}

function ServiceCard({ icon, title, desc, link, to = "/booking" }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{desc}</p>
      <Link to={to} className="text-green-700 font-semibold hover:text-green-800 text-sm">
        {link} →
      </Link>
    </div>
  );
}

function TestimonialCard({ name, feedback, rating }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
      <div className="mb-4 text-green-700 font-semibold" aria-label={`${rating} rating`}>
        Rating: {rating}/5
      </div>
      <p className="text-gray-700 text-sm mb-4 leading-relaxed italic">"{feedback}"</p>
      <p className="font-semibold text-gray-900">{name}</p>
      <p className="text-gray-600 text-xs">{rating} Out of 5 Star</p>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-gray-900 hover:text-green-700"
      >
        {question}
        <span className="text-xl">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <p className="text-gray-600 text-sm mt-4 leading-relaxed">{answer}</p>}
    </div>
  );
}

export default function LandingPage() {
  const { t } = useI18n();
  const [expandedBenefit, setExpandedBenefit] = useState("");

  const handleToggleBenefit = (benefitId) => {
    setExpandedBenefit((prev) => (prev === benefitId ? "" : benefitId));
  };

  return (
    <div className="bg-white min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-slate-50 py-14 sm:py-16 lg:py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-green-700 font-semibold uppercase tracking-[0.16em] text-xs sm:text-sm mb-3">
              {t("landing.welcome")}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.05] mb-5">
              {t("landing.heroTitle")} <br />
              <span className="text-green-700">{t("landing.heroHighlight")}</span>
            </h1>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
              {t("landing.heroBody")}
            </p>

            <div className="mb-8 flex justify-center sm:justify-start">
              <Link
                to="/booking"
                className="inline-flex bg-green-700 hover:bg-green-800 text-white px-7 py-3 rounded-lg font-semibold transition shadow-sm"
              >
                {t("landing.bookSolar")}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium">MNRE Approved</div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium">Premium Components</div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium">After-Sales Support</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-green-200/50 to-blue-200/40 rounded-2xl blur-2xl" aria-hidden="true"></div>
            <img
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=80"
              alt="Modern rooftop solar installation"
              className="relative rounded-2xl shadow-xl w-full h-[300px] sm:h-[360px] lg:h-[420px] object-cover border border-white"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{t("landing.benefitsTitle")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              icon="01"
              title="Lower Monthly Electricity Bills"
              desc="Generate your own clean power and reduce dependence on expensive grid electricity from day one."
              details="Solar converts sunlight into usable power at your site, so your monthly bill burden drops and your long-term energy budget becomes more predictable."
              link={t("landing.readMore")}
              collapseLabel={t("landing.showLess")}
              isExpanded={expandedBenefit === "benefit-1"}
              onToggle={() => handleToggleBenefit("benefit-1")}
            />
            <BenefitCard
              icon="02"
              title="Government Subsidy Support"
              desc="Eligible systems can receive subsidy benefits, reducing upfront cost and improving your overall return on investment."
              details="Our workflow helps you submit subsidy details correctly and track approval stages, making the financial advantage easier to realize."
              link={t("landing.readMore")}
              collapseLabel={t("landing.showLess")}
              isExpanded={expandedBenefit === "benefit-2"}
              onToggle={() => handleToggleBenefit("benefit-2")}
            />
            <BenefitCard
              icon="03"
              title="Reliable Long-Term Savings"
              desc="Solar assets are built for years of output, helping you control operating costs with predictable energy generation."
              details="With proper sizing, quality components, and maintenance planning, your system continues generating value for years after payback."
              link={t("landing.readMore")}
              collapseLabel={t("landing.showLess")}
              isExpanded={expandedBenefit === "benefit-3"}
              onToggle={() => handleToggleBenefit("benefit-3")}
            />
            <BenefitCard
              icon="04"
              title="Cleaner and Greener Future"
              desc="Reduce carbon emissions and contribute to a more sustainable environment while powering your daily needs."
              details="Every unit of solar energy used reduces fossil-fuel dependence and supports a healthier, more sustainable future for communities."
              link={t("landing.readMore")}
              collapseLabel={t("landing.showLess")}
              isExpanded={expandedBenefit === "benefit-4"}
              onToggle={() => handleToggleBenefit("benefit-4")}
            />
          </div>
        </div>
      </section>

      {/* KEY PLATFORM FEATURES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{t("landing.keyFeatures")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature
              title={t("landing.featureBookingTitle")}
              desc={t("landing.featureBookingDesc")}
              icon={<FiCalendar />}
              to="/booking"
              ctaLabel={t("landing.viewDetails")}
            />
            <Feature
              title={t("landing.featureTrackingTitle")}
              desc={t("landing.featureTrackingDesc")}
              icon={<FiClock />}
              to="/booking-status"
              ctaLabel={t("landing.viewDetails")}
            />
            <Feature
              title={t("landing.featureMaintenanceTitle")}
              desc={t("landing.featureMaintenanceDesc")}
              icon={<FiTool />}
              to="/maintenance"
              ctaLabel={t("landing.viewDetails")}
            />
            <Feature
              title={t("landing.featureSubsidyTitle")}
              desc={t("landing.featureSubsidyDesc")}
              icon={<FiFileText />}
              to="/apply-subsidy"
              ctaLabel={t("landing.viewDetails")}
            />
            <Feature
              title={t("landing.featureDashboardTitle")}
              desc={t("landing.featureDashboardDesc")}
              icon={<FiBarChart2 />}
              to="/dashboard"
              ctaLabel={t("landing.viewDetails")}
            />
            <Feature
              title={t("landing.featureSupportTitle")}
              desc={t("landing.featureSupportDesc")}
              icon={<FiHeadphones />}
              to="/support"
              ctaLabel={t("landing.viewDetails")}
            />
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-green-700 font-semibold uppercase tracking-wide mb-2 text-center">{t("landing.servicesLabel")}</p>
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{t("landing.servicesTitle")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              icon={<FiHome className="mx-auto text-green-700" />}
              title="Customer Self-Service Portal"
              desc="Customers can raise bookings, check status, view recommendations, and manage their profile from one place."
              link={t("landing.readMore")}
              to="/dashboard"
            />
            <ServiceCard
              icon={<FiBriefcase className="mx-auto text-green-700" />}
              title="Admin Operations Console"
              desc="Manage bookings, users, subsidy applications, inventory, tickets, and finance from a unified admin panel."
              link={t("landing.readMore")}
              to="/admin"
            />
            <ServiceCard
              icon={<FiUsers className="mx-auto text-green-700" />}
              title="Team & Field Workflow"
              desc="Enable engineer and team member coordination for assignments, execution tracking, and operational follow-up."
              link={t("landing.readMore")}
              to="/engineer/dashboard"
            />
            <ServiceCard
              icon={<FiSettings className="mx-auto text-green-700" />}
              title="Maintenance Lifecycle Control"
              desc="Plan services, assign technicians, capture reports, and maintain long-term solar performance continuity."
              link={t("landing.readMore")}
              to="/maintenance"
            />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h2 className="text-5xl font-bold mb-2">2000+</h2>
            <p className="text-lg opacity-90">{t("landing.statsHappyCustomers")}</p>
            <p className="text-sm opacity-75">{t("landing.statsHappyCustomersDesc")}</p>
          </div>
          <div>
            <h2 className="text-5xl font-bold mb-2">1500+</h2>
            <p className="text-lg opacity-90">{t("landing.statsSolarSolutions")}</p>
            <p className="text-sm opacity-75">{t("landing.statsSolarSolutionsDesc")}</p>
          </div>
          <div>
            <h2 className="text-5xl font-bold mb-2">4.9/5</h2>
            <p className="text-lg opacity-90">{t("landing.statsTrust")}</p>
            <p className="text-sm opacity-75">{t("landing.statsTrustDesc")}</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-green-700 font-semibold uppercase tracking-wide mb-2 text-center">{t("landing.feedbackLabel")}</p>
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{t("landing.feedbackTitle")}</h2>
          <div className="text-center mb-16">
            <p className="text-gray-700 text-lg mb-4">{t("landing.feedbackSubtitle")}</p>
            <div className="text-5xl font-bold text-green-700 mb-2">4.9/5</div>
            <p className="text-gray-600">Rated highly for implementation quality and support response</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Residential Customer"
              feedback="The booking and status tracking flow kept us informed at every step. Installation and documentation were handled professionally."
              rating={4.9}
            />
            <TestimonialCard
              name="Commercial Client"
              feedback="The dashboard visibility and maintenance coordination helped our team manage operations with confidence and fewer delays."
              rating={4.9}
            />
            <TestimonialCard
              name="Institution Project"
              feedback="Subsidy workflow and support ticket handling were smooth. The platform made project communication very clear for our stakeholders."
              rating={4.9}
            />
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">{t("landing.faqTitle")}</h2>
          <div className="space-y-6">
            <FAQItem question={t("landing.faq1Q")} answer={t("landing.faq1A")} />
            <FAQItem question={t("landing.faq2Q")} answer={t("landing.faq2A")} />
            <FAQItem question={t("landing.faq3Q")} answer={t("landing.faq3A")} />
            <FAQItem question={t("landing.faq4Q")} answer={t("landing.faq4A")} />
            <FAQItem question={t("landing.faq5Q")} answer={t("landing.faq5A")} />
            <FAQItem question={t("landing.faq6Q")} answer={t("landing.faq6A")} />
            <FAQItem question={t("landing.faq7Q")} answer={t("landing.faq7A")} />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">{t("landing.ctaTitle")}</h2>
          <p className="text-lg mb-8 opacity-90">{t("landing.ctaSubtitle")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition">
              {t("landing.getStarted")}
            </Link>
            <Link to="/booking" className="border-2 border-white text-white hover:bg-green-800 px-8 py-3 rounded-lg font-semibold transition">
              {t("landing.bookSolar")}
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("landing.callUs")}</h3>
            <p className="text-green-700 text-lg font-semibold">+91 8511365712</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("landing.emailUs")}</h3>
            <p className="text-green-700 text-lg font-semibold">teamsuryaurjaa@gmail.com</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("landing.officeHours")}</h3>
            <p className="text-gray-700">{t("landing.officeWeek")}</p>
            <p className="text-gray-700">{t("landing.officeSunday")}</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0d1b2a] text-slate-200 py-12 border-t border-[#0f2742]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                About Greenergy Solar
              </h4>
              <p className="text-sm leading-relaxed text-slate-300">Trusted solar energy solutions with premium components and expert execution.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("landing.usefulLinks")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-cyan-300 transition">{t("nav.home")}</Link></li>
                <li><Link to="/about" className="hover:text-cyan-300 transition">{t("landing.aboutUs")}</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-300 transition">{t("landing.contactUs")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("landing.services")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/booking" className="hover:text-cyan-300 transition">Online Solar Booking</Link></li>
                <li><Link to="/booking-status" className="hover:text-cyan-300 transition">Project Tracking</Link></li>
                <li><Link to="/support" className="hover:text-cyan-300 transition">Support & Maintenance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("landing.followUs")}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://facebook.com" className="hover:text-cyan-300 transition" target="_blank" rel="noreferrer">Facebook</a></li>
                <li><a href="https://youtube.com" className="hover:text-cyan-300 transition" target="_blank" rel="noreferrer">YouTube</a></li>
                <li><a href="https://linkedin.com" className="hover:text-cyan-300 transition" target="_blank" rel="noreferrer">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#0f2742] pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-slate-300">
            <div>
              <p>{t("landing.rights")}</p>
              <p className="text-xs mt-2">{t("landing.developedBy")}</p>
            </div>
            <div className="flex items-center gap-6 text-slate-300">
              <Link to="/privacy" className="hover:text-cyan-300 transition">{t("landing.privacy")}</Link>
              <Link to="/terms" className="hover:text-cyan-300 transition">{t("landing.terms")}</Link>
              <Link to="/cookies" className="hover:text-cyan-300 transition">{t("landing.cookies")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
