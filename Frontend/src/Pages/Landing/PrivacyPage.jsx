import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-[#0f172a] text-white p-6 sm:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-300 font-semibold">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-slate-200 max-w-3xl leading-relaxed">
            This policy describes how Greenergy Solar Solution handles personal information, project
            data, and communication records across booking, subsidy, maintenance, and support workflows.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-100">
            Last updated: March 2026
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.7fr_1fr] gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                We collect account and project information such as name, phone number, email, location,
                address, system preferences, subsidy details, and service requests entered through platform forms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">2. Purpose of Data Processing</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Data is used to provide quotations, schedule site visits, process installations, handle subsidy
                documentation, assign maintenance activities, and respond to support tickets.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">3. Data Sharing and Access</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Information is shared only with authorized internal teams and trusted service partners involved in
                project execution. We do not sell personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">4. Data Security and Retention</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                We apply reasonable technical and administrative safeguards to protect data from unauthorized access.
                Records are retained for operational, legal, and service continuity requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">5. Your Rights</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                You may request correction of inaccurate personal details and raise privacy-related concerns through
                our support or contact channel.
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
              <h3 className="font-semibold text-emerald-900">Privacy Highlights</h3>
              <ul className="mt-3 text-sm text-emerald-900/90 space-y-2">
                <li>Data used only for service delivery and communication</li>
                <li>Controlled access for authorized teams</li>
                <li>Secure handling for project and customer records</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900">Need Assistance?</h3>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                For any data protection concern, contact our support team via the contact section in this website.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
