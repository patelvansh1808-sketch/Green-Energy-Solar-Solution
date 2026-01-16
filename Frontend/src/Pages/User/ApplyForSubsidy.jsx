import React, { useState } from "react";
import subsidyApplicationService from "../../services/subsidyApplicationService";

export default function ApplyForSubsidy() {
  const [formData, setFormData] = useState({
    bankDetails: {
      accountHolder: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
    remarks: "",
  });

  const [documents, setDocuments] = useState({
    aadhaarCard: null,
    electricityBill: null,
    bankStatement: null,
    propertyDocument: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value,
      },
    }));
  };

  const handleRemarksChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      remarks: e.target.value,
    }));
  };

  const handleDocumentChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setDocuments((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate bank details
    if (
      !formData.bankDetails.accountHolder ||
      !formData.bankDetails.accountNumber ||
      !formData.bankDetails.ifscCode ||
      !formData.bankDetails.bankName
    ) {
      setError("Bank details are required");
      return;
    }

    // Check if all documents are uploaded
    const allDocsUploaded = Object.values(documents).every((doc) => doc !== null);
    if (!allDocsUploaded) {
      setError("Please upload all required documents");
      return;
    }

    setLoading(true);

    try {
      // Create FormData object
      const submitFormData = new FormData();
      submitFormData.append("bankDetails", JSON.stringify(formData.bankDetails));
      submitFormData.append("remarks", formData.remarks);

      // Append documents
      Object.values(documents).forEach((file) => {
        if (file) {
          submitFormData.append("documents", file);
        }
      });

      await subsidyApplicationService.createSubsidyApplication(submitFormData);

      alert("✅ Subsidy application submitted successfully!");

      // Reset form
      setFormData({
        bankDetails: {
          accountHolder: "",
          accountNumber: "",
          ifscCode: "",
          bankName: "",
        },
        remarks: "",
      });
      setDocuments({
        aadhaarCard: null,
        electricityBill: null,
        bankStatement: null,
        propertyDocument: null,
      });
    } catch (error) {
      setError(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const documentFields = [
    {
      key: "aadhaarCard",
      label: "Aadhaar Card",
      icon: "🪪",
    },
    {
      key: "electricityBill",
      label: "Electricity Bill",
      icon: "⚡",
    },
    {
      key: "bankStatement",
      label: "Bank Statement/Passbook",
      icon: "🏦",
    },
    {
      key: "propertyDocument",
      label: "Property Document/Tax Receipt",
      icon: "🏠",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Apply for Subsidy
          </h1>
          <p className="text-gray-600">
            Submit your application with required documents. The subsidy amount will be determined by the government guidelines.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <span className="text-red-500 mr-2">✕</span>
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Important Information */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-start">
            <span className="text-2xl mr-3">📋</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Important Information</h3>
              <p className="text-blue-800 text-sm">
                The subsidy amount is determined by the government based on your location, system capacity, and eligibility criteria. Our team will review your application and notify you of the eligible subsidy amount.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
          {/* Required Documents */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
              <span className="mr-2">📄</span> Required Documents <span className="text-red-500 ml-1">*</span>
            </h2>
            <p className="text-gray-600 text-sm mb-4">Please upload clear copies of the following documents:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentFields.map((field) => (
                <div
                  key={field.key}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{field.icon}</span>
                      <h3 className="font-semibold text-gray-700">{field.label}</h3>
                    </div>
                    {documents[field.key] && (
                      <span className="text-green-500 text-xl">✓</span>
                    )}
                  </div>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      name={field.key}
                      onChange={handleDocumentChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                    />
                    <div className="border border-gray-300 rounded px-4 py-2 text-sm bg-white hover:bg-gray-50 inline-block">
                      Choose File
                    </div>
                    <span className="ml-3 text-sm text-gray-600">
                      {documents[field.key]?.name || "No file chosen"}
                    </span>
                  </label>

                  {documents[field.key] && (
                    <p className="text-green-600 text-xs mt-2">
                      ✓ {documents[field.key].name}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Accepted: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
              <span className="mr-2">💳</span> Bank Account Details
            </h2>
            <p className="text-gray-600 text-sm mb-4">For transferring the approved subsidy amount</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountHolder"
                  value={formData.bankDetails.accountHolder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Remarks (Optional)
            </label>
            <textarea
              value={formData.remarks}
              onChange={handleRemarksChange}
              placeholder="Any additional information you'd like to share with us..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
