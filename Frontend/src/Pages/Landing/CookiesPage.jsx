import React from "react";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-[#111827] text-white p-6 sm:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.16em] text-amber-300 font-semibold">Legal</p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold">Cookie Policy</h1>
          <p className="mt-4 text-slate-200 max-w-3xl leading-relaxed">
            This policy outlines how Greenergy Solar Solution uses cookies and similar technologies to improve
            reliability, personalize experience, and support secure platform operation.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-100">
            Last reviewed: March 2026
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.7fr_1fr] gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">1. What Cookies Are</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Cookies are small browser files that help websites remember preferences, maintain session state,
                and improve overall user interaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">2. Types of Cookies We Use</h2>
              <div className="mt-3 space-y-3 text-gray-700">
                <p><span className="font-semibold text-gray-900">Essential:</span> Required for login/session handling and core navigation.</p>
                <p><span className="font-semibold text-gray-900">Preference:</span> Stores settings such as language and basic interface choices.</p>
                <p><span className="font-semibold text-gray-900">Analytics:</span> Helps us understand feature usage patterns to improve performance.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">3. Cookie Retention</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Some cookies are session-based and expire when the browser closes, while others may persist for
                a limited duration to retain preference or security context.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">4. Managing Your Choices</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                You may control or clear cookies through browser settings. Disabling essential cookies can impact
                authentication and parts of platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">5. Updates to this Policy</h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                We may revise this Cookie Policy based on legal, security, or operational changes. Updated
                versions will be published on this page.
              </p>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-900">Cookie Snapshot</h3>
              <ul className="mt-3 text-sm text-amber-900/90 space-y-2">
                <li>Essential cookies enable secure access</li>
                <li>Preference cookies improve user experience</li>
                <li>Analytics cookies support service optimization</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900">Need Clarification?</h3>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                For cookie-related questions, use our contact channel and reference this policy.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
