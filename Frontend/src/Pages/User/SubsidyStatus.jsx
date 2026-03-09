import React, { useState, useEffect } from "react";
import { useI18n } from "../../Context/I18nContext";
import subsidyApplicationService from "../../services/subsidyApplicationService";

export default function SubsidyStatus() {
  const { t } = useI18n();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await subsidyApplicationService.getMySubsidyApplication();
      setApplication(data);
    } catch (err) {
      setError(err.message || "No subsidy application found. Please apply first.");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Applied: "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Under Review": "bg-blue-100 text-blue-800 border-blue-300",
    Approved: "bg-green-100 text-green-800 border-green-300",
    Rejected: "bg-red-100 text-red-800 border-red-300",
  };

  const statusIcons = {
    Applied: "📝",
    "Under Review": "👀",
    Approved: "✅",
    Rejected: "❌",
  };

  const statusBgGradient = {
    Applied: "from-yellow-50 to-yellow-100",
    "Under Review": "from-blue-50 to-blue-100",
    Approved: "from-green-50 to-green-100",
    Rejected: "from-red-50 to-red-100",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t("subsidy.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              {t("subsidy.noApplication")}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/user/apply-subsidy"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {t("subsidy.applyNow")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            📊 {t("subsidy.statusTitle")}
          </h1>
          <p className="text-gray-600">
            {t("subsidy.trackProgress")}
          </p>
        </div>

        {/* Status Card */}
        <div
          className={`bg-gradient-to-r ${
            statusBgGradient[application.status] || "from-gray-50 to-gray-100"
          } border-2 border-current rounded-lg shadow-lg p-5 sm:p-8 mb-8`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-gray-600 text-base sm:text-lg mb-2">{t("subsidy.currentStatus")}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                {statusIcons[application.status]} {application.status}
              </h2>
            </div>
            <div
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 font-bold text-base sm:text-lg ${
                statusColors[application.status]
              }`}
            >
              {application.status}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-5 sm:p-8 mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">📅 {t("subsidy.statusTimeline")}</h3>

          <div className="space-y-4">
            {/* Applied Date */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="ml-4 pt-1">
                <p className="text-gray-600 font-semibold">{t("subsidy.submitted")}</p>
                <p className="text-gray-500">
                  {new Date(application.appliedDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Under Review Date */}
            {application.reviewedDate && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="ml-4 pt-1">
                  <p className="text-gray-600 font-semibold">{t("subsidy.underReview")}</p>
                  <p className="text-gray-500">
                    {new Date(application.reviewedDate).toLocaleDateString(
                      "en-IN",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Approval Date */}
            {application.approvalDate && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="ml-4 pt-1">
                  <p className="text-gray-600 font-semibold">{t("subsidy.approved")}</p>
                  <p className="text-gray-500">
                    {new Date(application.approvalDate).toLocaleDateString(
                      "en-IN",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Application Details */}
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              📋 {t("subsidy.applicationDetails")}
            </h3>

            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-gray-500 text-sm">Applied Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{application.appliedAmount?.toLocaleString() || "0"}
                </p>
              </div>

              <div className="border-b pb-3">
                <p className="text-gray-500 text-sm">Approved Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹
                  {application.approvedAmount
                    ? application.approvedAmount.toLocaleString()
                    : "Pending"}
                </p>
              </div>

              {application.creditDate && (
                <div className="border-b pb-3">
                  <p className="text-gray-500 text-sm">Expected Credit Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(application.creditDate).toLocaleDateString(
                      "en-IN",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </p>
                </div>
              )}

              {application.remarks && (
                <div>
                  <p className="text-gray-500 text-sm">Remarks</p>
                  <p className="text-gray-800 mt-1">{application.remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              🏦 Bank Details
            </h3>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-gray-500 text-sm">Account Holder</p>
                <p className="text-lg font-semibold text-gray-800">
                  {application.bankDetails?.accountHolder}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Account Number</p>
                <p className="text-lg font-semibold text-gray-800">
                  {application.bankDetails?.accountNumber}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">IFSC Code</p>
                <p className="text-lg font-semibold text-gray-800">
                  {application.bankDetails?.ifscCode}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Bank Name</p>
                <p className="text-lg font-semibold text-gray-800">
                  {application.bankDetails?.bankName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        {application.documents && application.documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-5 sm:p-8 mt-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              📄 Uploaded Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center min-w-0">
                    <div className="text-3xl mr-3">📋</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.mimetype} •{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/uploads/${doc.path}`}
                    download
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                    title="Download document"
                  >
                    ⬇️
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-lg mt-8">
          <h4 className="font-bold text-blue-900 mb-2">ℹ️ What's Next?</h4>
          <div className="text-blue-800 space-y-2">
            {application.status === "Applied" && (
              <>
                <p>
                  ✓ Your application has been submitted successfully. The admin
                  team will review it within 5-7 business days.
                </p>
                <p>
                  ✓ You'll receive email notifications at each stage of the
                  application process.
                </p>
              </>
            )}
            {application.status === "Under Review" && (
              <>
                <p>
                  ✓ Your application is currently being reviewed by our admin
                  team.
                </p>
                <p>
                  ✓ We'll notify you as soon as the review is complete. Please
                  keep your contact information updated.
                </p>
              </>
            )}
            {application.status === "Approved" && (
              <>
                <p>🎉 Congratulations! Your subsidy application has been approved.</p>
                <p>
                  ✓ The approved amount of ₹
                  {application.approvedAmount?.toLocaleString()} will be credited
                  to your bank account by{" "}
                  {new Date(application.creditDate).toLocaleDateString("en-IN")}.
                </p>
              </>
            )}
            {application.status === "Rejected" && (
              <>
                <p>
                  ✗ Unfortunately, your subsidy application could not be approved.
                </p>
                <p>
                  {application.remarks
                    ? `Reason: ${application.remarks}`
                    : "Please contact our support team for more information."}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
