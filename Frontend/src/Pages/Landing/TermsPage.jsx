import React from "react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-[#0b1320] text-white p-6 sm:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.16em] text-sky-300 font-semibold">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold">Terms of Service</h1>
          <p className="mt-4 text-slate-200 max-w-3xl leading-relaxed">
            These Terms set the conditions for using the Greenergy Solar Solution platform, including account
            usage, service workflows, and operational responsibilities.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-100">
            Effective date: March 2026
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.7fr_1fr] gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">1. Platform Eligibility and Use</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Users must provide accurate details while using booking, subsidy, support, and profile modules.
                Any misuse, unauthorized access attempt, or fraudulent activity is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">2. Scope of Services</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Service timelines and recommendations are subject to site readiness, regulatory approvals,
                technical feasibility, and documented project dependencies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">3. Account and Credential Responsibility</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                You are responsible for safeguarding account credentials and ensuring activities under your
                account are authorized by you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">4. Payments and Financial Terms</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Pricing, subsidy assumptions, and payment milestones are communicated as part of booking and
                quotation workflows. Final values may vary based on project scope and approvals.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">5. Limitation and Policy Updates</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                We may update these Terms to reflect legal, operational, and platform changes. Continued use
                after updates indicates acceptance of the revised terms.
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
              <h3 className="font-semibold text-sky-900">Terms Summary</h3>
              <ul className="mt-3 text-sm text-sky-900/90 space-y-2">
                <li>Use the platform with accurate and lawful information</li>
                <li>Project outcomes depend on approvals and technical conditions</li>
                <li>Policy and terms may evolve with service updates</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900">Questions on Terms?</h3>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                Reach out through our contact channel for clarification on obligations and service scope.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
