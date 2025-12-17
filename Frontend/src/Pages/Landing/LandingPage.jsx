import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 leading-tight">
            Smart Solar Energy <br /> Management System
          </h1>

          <p className="mt-5 text-gray-600 text-lg">
            Monitor solar energy, predict power using AI, check government
            subsidies, and book solar panels — all in one smart platform.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              View Dashboard
            </Link>

            <Link
              to="/subsidy"
              className="border border-green-700 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              Check Subsidy
            </Link>
          </div>
        </div>

        {/* HERO IMAGE / ILLUSTRATION */}
        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1509391366360-2e959784a276"
            alt="Solar Panels"
            className="rounded-xl shadow-lg w-full max-w-md"
          />
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-green-700 text-white py-14">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h2 className="text-3xl font-bold">40%</h2>
            <p className="text-sm opacity-90">Max Govt Subsidy</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">AI</h2>
            <p className="text-sm opacity-90">Power Prediction</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">100%</h2>
            <p className="text-sm opacity-90">Software Based</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">CO₂</h2>
            <p className="text-sm opacity-90">Carbon Reduction</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Key Platform Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <Feature
            title="Solar Analytics"
            desc="Track daily, monthly, and yearly energy generation with visual charts."
            icon="📊"
          />
          <Feature
            title="AI Power Prediction"
            desc="Predict future solar output using machine learning algorithms."
            icon="🤖"
          />
          <Feature
            title="Weather Impact"
            desc="Analyze how temperature and cloud cover affect solar performance."
            icon="🌦"
          />
          <Feature
            title="Carbon Footprint"
            desc="See how much CO₂ you save and your environmental impact."
            icon="🌱"
          />
          <Feature
            title="Solar Booking"
            desc="Book solar panel installation online with cost estimation."
            icon="🧾"
          />
          <Feature
            title="Subsidy Eligibility"
            desc="Check government subsidy eligibility and final payable amount."
            icon="💰"
          />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-green-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-green-800">
            Go Solar. Save Money. Save Earth.
          </h2>

          <p className="mt-4 text-gray-600">
            Start your solar journey today with smart analytics, AI prediction,
            and government subsidy support.
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>

            <Link
              to="/booking"
              className="border border-green-700 text-green-700 hover:bg-green-100 px-6 py-3 rounded-lg font-semibold transition"
            >
              Book Solar Panel
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-500">
        © 2025 Smart Solar Energy Management System  
        <br />
        Final Year MERN Stack Project
      </footer>
    </div>
  );
}

/* 🔹 Feature Card Component */
function Feature({ title, desc, icon }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
