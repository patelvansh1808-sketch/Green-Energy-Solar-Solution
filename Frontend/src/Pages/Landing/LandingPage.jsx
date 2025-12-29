import React, { useState } from "react";
import { Link } from "react-router-dom";

function Feature({ title, desc, icon }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

function BenefitCard({ icon, title, desc, link }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition border-t-4 border-green-700">
      <div className="text-4xl mb-4 font-bold text-green-700">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{desc}</p>
      <Link to="/" className="text-green-700 font-semibold hover:text-green-800 text-sm">
        {link} →
      </Link>
    </div>
  );
}

function ServiceCard({ icon, title, desc, link }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{desc}</p>
      <Link to="/booking" className="text-green-700 font-semibold hover:text-green-800 text-sm">
        {link} →
      </Link>
    </div>
  );
}

function TestimonialCard({ name, feedback, rating }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex gap-1 mb-4 text-yellow-400" aria-label={`${rating} stars`}>
        {"⭐".repeat(Math.floor(rating))}
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
  return (
    <div className="bg-white min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-green-700 font-semibold uppercase tracking-wide mb-2">Welcome to Our Platform</p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Smart Solar Energy <br />
              <span className="text-green-700">Management System</span>
            </h1>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              Greenergy Solar Solution offers trusted, end-to-end solar management with premium analytics, AI power prediction, and government subsidy support. Maximize your savings and sustainability.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard" className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md">
                View Dashboard
              </Link>
              <Link to="/booking" className="border-2 border-green-700 text-green-700 hover:bg-green-50 px-8 py-3 rounded-lg font-semibold transition">
                Book Solar Panel
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600"
              alt="Solar Panels"
              className="rounded-xl shadow-2xl w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Benefits to Save Energy</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard icon="✓" title="MNRE-APPROVED & GUVNL REGISTERED" desc="All systems comply with government norms and are eligible for subsidies and net metering." link="Read More" />
            <BenefitCard icon="⭐" title="PREMIUM QUALITY COMPONENTS" desc="We use tier-1 solar panels, inverters, and mounting structures for optimal performance." link="Read More" />
            <BenefitCard icon="🤝" title="TRUST, TRANSPARENCY & COMMITMENT" desc="No hidden costs. No false promises. Just reliable, affordable solar energy solutions." link="Read More" />
            <BenefitCard icon="🛠" title="DEDICATED AFTER-SALES SUPPORT" desc="Our relationship doesn't end after installation. Reliable service and performance monitoring." link="Read More" />
          </div>
        </div>
      </section>

      {/* KEY PLATFORM FEATURES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Key Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature title="Solar Analytics" desc="Track daily, monthly, and yearly energy generation with visual charts." icon="📊" />
            <Feature title="AI Power Prediction" desc="Predict future solar output using machine learning algorithms." icon="🤖" />
            <Feature title="Weather Impact" desc="Analyze how temperature and cloud cover affect solar performance." icon="🌦" />
            <Feature title="Carbon Footprint" desc="See how much CO₂ you save and your environmental impact." icon="🌱" />
            <Feature title="Solar Booking" desc="Book solar panel installation online with cost estimation." icon="🧾" />
            <Feature title="Subsidy Eligibility" desc="Check government subsidy eligibility and final payable amount." icon="💰" />
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-green-700 font-semibold uppercase tracking-wide mb-2 text-center">OUR SOLAR SERVICES</p>
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Produce Your Own Clean, Save The Environment</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard icon="🏠" title="Residential Solutions" desc="Power your home with solar energy and reduce monthly electricity bills efficiently." link="Read More" />
            <ServiceCard icon="🏭" title="Industrial Solutions" desc="Save big with high-capacity solar systems for businesses, factories, and institutions." link="Read More" />
            <ServiceCard icon="🏫" title="Solar for Institutions" desc="Solar installations for public buildings, schools, and hospitals under government norms." link="Read More" />
            <ServiceCard icon="🔌" title="Off-Grid Systems" desc="Power remote areas with independent solar energy—no grid needed." link="Read More" />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h2 className="text-5xl font-bold mb-2">2000+</h2>
            <p className="text-lg opacity-90">Happy Customers</p>
            <p className="text-sm opacity-75">Happy customers trust us for their solar energy needs</p>
          </div>
          <div>
            <h2 className="text-5xl font-bold mb-2">1500+</h2>
            <p className="text-lg opacity-90">Solar Solutions</p>
            <p className="text-sm opacity-75">Empowered homes, businesses, and farms across India</p>
          </div>
          <div>
            <h2 className="text-5xl font-bold mb-2">4.9/5</h2>
            <p className="text-lg opacity-90">Trust Score</p>
            <p className="text-sm opacity-75">Rated by 100+ customers on Google Reviews</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-green-700 font-semibold uppercase tracking-wide mb-2 text-center">CUSTOMER FEEDBACKS</p>
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Highest Rated Company</h2>
          <div className="text-center mb-16">
            <p className="text-gray-700 text-lg mb-4">Proud to be the highest-rated solar company on Google with 5-star customer satisfaction.</p>
            <div className="text-5xl font-bold text-green-700 mb-2">4.9/5</div>
            <p className="text-gray-600">Rated by over 100+ customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard name="Customer 1" feedback="Greenergy Solar helped us cut our electricity bill by 75%. The installation was quick and professional. Highly recommended" rating={4.9} />
            <TestimonialCard name="Customer 2" feedback="Their industrial solar setup runs flawlessly. Great team, honest pricing, and excellent after-sales service." rating={4.9} />
            <TestimonialCard name="Customer 3" feedback="We installed solar panels at our school with their guidance. The children now learn under clean energy!" rating={4.9} />
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Some General Questions?</h2>
          <div className="space-y-6">
            <FAQItem question="What is a solar rooftop system?" answer="A solar rooftop system uses solar panels to convert sunlight into electricity for homes or businesses. It includes panels, inverters, mounting structures, and monitoring systems." />
            <FAQItem question="Is solar power reliable during cloudy days?" answer="Yes, solar panels generate power even on cloudy days. While output is reduced, modern systems are designed to work efficiently across various weather conditions." />
            <FAQItem question="Do I need to clean the panels regularly?" answer="Solar panels require minimal maintenance. Occasional cleaning (every 6 months) helps maintain optimal efficiency, especially in dusty areas." />
            <FAQItem question="What if there is a technical issue later?" answer="We provide dedicated after-sales support with regular performance monitoring and quick resolution of any technical issues." />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Go Solar. Save Money. Save Earth.</h2>
          <p className="text-lg mb-8 opacity-90">Start your solar journey today with smart analytics, AI prediction, and government subsidy support.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-green-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition">
              Get Started
            </Link>
            <Link to="/booking" className="border-2 border-white text-white hover:bg-green-800 px-8 py-3 rounded-lg font-semibold transition">
              Book Solar Panel
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Call Us</h3>
            <p className="text-green-700 text-lg font-semibold">+91 8511365712</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-green-700 text-lg font-semibold">info@greenergysolar.in</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Office Hours</h3>
            <p className="text-gray-700">Mon - Fri: 8:00 - 18:00</p>
            <p className="text-gray-700">Sunday: 8:00 - 14:00</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0d1b2a] text-slate-200 py-12 border-t border-[#0f2742]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="text-cyan-300">🌱</span>
                About Greenergy Solar
              </h4>
              <p className="text-sm leading-relaxed text-slate-300">Trusted solar energy solutions with premium components and expert execution.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Useful Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-cyan-300 transition">Home</Link></li>
                <li><Link to="/about" className="hover:text-cyan-300 transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-300 transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/booking" className="hover:text-cyan-300 transition">Residential Solutions</Link></li>
                <li><Link to="/booking" className="hover:text-cyan-300 transition">Commercial Solutions</Link></li>
                <li><Link to="/booking" className="hover:text-cyan-300 transition">Industrial Solutions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://facebook.com" className="hover:text-cyan-300 transition" target="_blank" rel="noreferrer">Facebook</a></li>
                <li><a href="https://youtube.com" className="hover:text-cyan-300 transition" target="_blank" rel="noreferrer">YouTube</a></li>
                <li><a href="https://linkedin.com" className="hover:text-cyan-300 transition" target="_blank" rel="noreferrer">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#0f2742] pt-8 text-center text-sm text-slate-300">
            <p>&copy; 2025 Greenergy Solar Solution. All Rights Reserved.</p>
            <p className="text-xs mt-2">Developed with <span className="text-cyan-300">❤</span> by Tech Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
