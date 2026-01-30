import React, { useState, useEffect } from "react";
import bookingService from "../../services/bookingService";
import { LocationService } from "../../services/locationService";
import { useAuth } from "../../Context/AuthContext";

export default function Booking() {
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    systemType: "Residential",
    capacity: "",
    roofArea: "",
    roofType: "Concrete",
    state: "",
    district: "",
    address: "",
    pincode: "",
    contactPerson: user?.email?.split("@")[0] || "",
    contactPhone: "",
    remarks: "",
    financingOption: "Full Payment",
  });

  // UI State
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    const allStates = LocationService.getStates();
    setStates(allStates);
  }, []);

  const handleStateChange = (state) => {
    setFormData((prev) => ({
      ...prev,
      state,
      district: "",
    }));
    const districtList = LocationService.getDistricts(state);
    setDistricts(districtList || []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const required = ["systemType", "capacity", "address", "pincode", "contactPhone"];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      setError(`Missing required fields: ${missing.join(", ")}`);
      return false;
    }

    if (formData.pincode.length !== 6) {
      setError("Pincode must be 6 digits");
      return false;
    }

    if (formData.contactPhone.length !== 10) {
      setError("Phone number must be 10 digits");
      return false;
    }

    return true;
  };

  const generateQuotation = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setActiveStep(2);
    setLoading(true);

    try {
      const response = await bookingService.generateQuotation({
        systemType: formData.systemType,
        capacity: parseFloat(formData.capacity),
        state: formData.state,
        district: formData.district,
        roofArea: formData.roofArea ? parseFloat(formData.roofArea) : null,
      });

      // Backend returns { quotation: {...}, systemType, capacity }
      // Extract the quotation object from the response
      setQuotation(response.quotation || response);
    } catch (err) {
      setError(err.message || "Failed to generate quotation");
      setActiveStep(1);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (!quotation) return;

    setLoading(true);
    setError("");

    try {
      const bookingPayload = {
        systemType: formData.systemType,
        capacity: parseFloat(formData.capacity),
        roofArea: formData.roofArea ? parseFloat(formData.roofArea) : null,
        roofType: formData.roofType,
        installationAddress: {
          address: formData.address,
          state: formData.state,
          district: formData.district,
          pincode: formData.pincode,
        },
        customerRemarks: formData.remarks,
        quotation: {
          equipmentCost: quotation.equipmentCost || 0,
          installationCost: quotation.installationCost || 0,
          totalCost: quotation.totalCost || 0,
          subsidyAmount: quotation.subsidyAmount || 0,
          netCost: quotation.netCost || (quotation.totalCost - quotation.subsidyAmount) || 0,
          roiYears: quotation.roiYears || 0,
        },
        // Legacy fields for backward compatibility
        baseCost: quotation.equipmentCost || 0,
        finalCost: quotation.netCost || (quotation.totalCost - quotation.subsidyAmount) || 0,
        subsidyAmount: quotation.subsidyAmount || 0,
        subsidyApplied: quotation.subsidyAmount > 0,
      };

      const response = await bookingService.createBooking(bookingPayload);

      setSuccess(`✅ Booking ${response.booking?.bookingId || '#' + response.booking?._id?.slice(-8)} submitted successfully! We will contact you within 24 hours.`);
      setActiveStep(3);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setQuotation(null);
        setActiveStep(1);
        setFormData({
          systemType: "Residential",
          capacity: "",
          roofArea: "",
          roofType: "Concrete",
          state: "",
          district: "",
          address: "",
          pincode: "",
          contactPerson: user?.email?.split("@")[0] || "",
          contactPhone: "",
          remarks: "",
          financingOption: "Full Payment",
        });
      }, 3000);
    } catch (err) {
      console.error("Booking Error:", err);
      console.error("Error Response:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Failed to create booking");
      setActiveStep(2);
    } finally {
      setLoading(false);
    }
  };

  const getROI = (finalCost) => {
    const annualSavings = (formData.capacity || 0) * 80000;
    if (annualSavings === 0 || finalCost === 0) return 'N/A';
    return Math.round((finalCost / annualSavings) * 10) / 10;
  };

  const systemInfo = {
    Residential: {
      desc: "For homes and apartments (1-10 kW)",
      pricePerKW: 50000,
      icon: "🏠",
    },
    Commercial: {
      desc: "For small businesses and offices (10-50 kW)",
      pricePerKW: 40000,
      icon: "🏢",
    },
    Industrial: {
      desc: "For factories and large facilities (50+ kW)",
      pricePerKW: 35000,
      icon: "🏭",
    },
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            ☀️ Solar Installation Booking System
          </h1>
          <p className="text-gray-600">Professional CRM + Operations Management</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border-l-4 border-red-500 text-red-100 rounded-lg shadow-lg">
            <p className="font-semibold">⚠️ Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gray-800 border-l-4 border-blue-500 text-gray-100 rounded-lg shadow-lg">
            <p className="font-semibold">✅ Success</p>
            <p>{success}</p>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8 flex justify-between items-center max-w-3xl mx-auto">
          {[
            { step: 1, label: "Project Details", icon: "📋" },
            { step: 2, label: "Quotation Review", icon: "📊" },
            { step: 3, label: "Confirmation", icon: "✅" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
                  activeStep >= item.step
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {item.icon}
              </div>
              <p className={`text-xs mt-2 text-center ${activeStep >= item.step ? "text-gray-800" : "text-gray-500"}`}>
                {item.label}
              </p>
              {item.step < 3 && (
                <div className={`flex-1 h-1 mx-2 mt-6 ${activeStep > item.step ? "bg-blue-500" : "bg-gray-300"}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* STEP 1: Project Details */}
        {activeStep === 1 && (
          <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 1: Project Details</h2>

            <form onSubmit={generateQuotation} className="space-y-6">
              {/* Row 1: System Type & Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    System Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="systemType"
                    value={formData.systemType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  >
                    <option value="Residential">🏠 Residential</option>
                    <option value="Commercial">🏢 Commercial</option>
                    <option value="Industrial">🏭 Industrial</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">{systemInfo[formData.systemType].desc}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    System Capacity (kW) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    step="0.1"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-2">Base price: ₹{systemInfo[formData.systemType].pricePerKW}/kW</p>
                </div>
              </div>

              {/* Row 2: Roof Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Roof Type
                  </label>
                  <select
                    name="roofType"
                    value={formData.roofType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  >
                    <option value="Concrete">Concrete</option>
                    <option value="Metal">Metal</option>
                    <option value="Tile">Tile</option>
                    <option value="RCC">RCC</option>
                    <option value="Asbestos">Asbestos</option>
                    <option value="Ground Mount">Ground Mount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Roof Area (sq.m) - Optional
                  </label>
                  <input
                    type="number"
                    name="roofArea"
                    value={formData.roofArea}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    step="1"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  />
                </div>
              </div>

              {/* Row 3: Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        district: e.target.value,
                      }))
                    }
                    disabled={!formData.state}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition disabled:bg-gray-100"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="10 digit mobile"
                    maxLength="10"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  />
                </div>
              </div>

              {/* Row 5: Installation Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Installation Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Complete address with house no., street, area"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                ></textarea>
              </div>

              {/* Row 6: Pincode & Financing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6 digit pincode"
                    maxLength="6"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Financing Option
                  </label>
                  <select
                    name="financingOption"
                    value={formData.financingOption}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                  >
                    <option value="Full Payment">Full Payment</option>
                    <option value="3-Year EMI">3-Year EMI</option>
                    <option value="5-Year EMI">5-Year EMI</option>
                    <option value="7-Year EMI">7-Year EMI</option>
                    <option value="MNRE Subsidy">MNRE Subsidy</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requirements / Remarks (Optional)
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Shading issues, maintenance preferences, budget constraints, etc."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "⏳ Generating Quotation..." : "📋 Generate Quotation"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Quotation Review */}
        {activeStep === 2 && quotation && (
          <div className="space-y-6">
            {/* Quotation Card */}
            <div className="bg-white rounded-lg shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Step 2: Review Quotation</h2>

              {/* System Summary */}
              <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">System Type</p>
                    <p className="text-xl font-bold text-gray-100">{systemInfo[formData.systemType].icon} {formData.systemType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">Capacity</p>
                    <p className="text-xl font-bold text-gray-100">{formData.capacity} kW</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">Location</p>
                    <p className="text-xl font-bold text-gray-100">{formData.state || "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">Roof Type</p>
                    <p className="text-xl font-bold text-gray-100">{formData.roofType}</p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💰 Cost Breakdown</h3>

                <div className="space-y-3 bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <p className="text-gray-700 font-semibold">Equipment Cost</p>
                    <p className="text-lg font-bold">₹{(quotation?.equipmentCost || 0).toLocaleString()}</p>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b">
                    <p className="text-gray-700 font-semibold">Installation & Labor</p>
                    <p className="text-lg font-bold">₹{(quotation?.installationCost || 0).toLocaleString()}</p>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300 py-2">
                    <p className="text-gray-800 font-bold">Subtotal</p>
                    <p className="text-xl font-bold text-gray-800">₹{(quotation?.totalCost || 0).toLocaleString()}</p>
                  </div>

                  {(quotation?.subsidyAmount || 0) > 0 && (
                    <div className="flex justify-between items-center bg-gray-700 p-3 rounded border border-gray-600 my-3">
                      <p className="text-gray-100 font-bold">Government Subsidy (MNRE)</p>
                      <p className="text-lg font-bold text-blue-400">-₹{(quotation?.subsidyAmount || 0).toLocaleString()}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-blue-600 p-4 rounded-lg my-4">
                    <p className="text-white font-bold text-lg">Final Cost to Pay</p>
                    <p className="text-3xl font-bold text-white">₹{((quotation?.totalCost || 0) - (quotation?.subsidyAmount || 0)).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-gray-600 text-sm font-semibold">Payback Period</p>
                  <p className="text-2xl font-bold text-yellow-700">{quotation?.roiYears || getROI((quotation?.totalCost || 0) - (quotation?.subsidyAmount || 0))} years</p>
                  <p className="text-xs text-gray-500 mt-1">Time to recover investment</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-400 text-sm font-semibold">Annual Savings</p>
                  <p className="text-2xl font-bold text-blue-300">₹{((formData.capacity || 0) * 80000).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Approximate yearly benefit</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-600 text-sm font-semibold">25-Year Benefit</p>
                  <p className="text-2xl font-bold text-blue-700">₹{((formData.capacity || 0) * 80000 * 25).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Lifetime value generation</p>
                </div>
              </div>

              {/* Installation Timeline */}
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400 mb-8">
                <h4 className="font-bold text-gray-800 mb-3">📅 Installation Timeline</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Application</p>
                    <p className="font-bold text-gray-800">0 days</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Site Survey</p>
                    <p className="font-bold text-gray-800">3-5 days</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Procurement</p>
                    <p className="font-bold text-gray-800">5-10 days</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Installation</p>
                    <p className="font-bold text-gray-800">3-5 days</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">📌 Total: 15-25 days from booking confirmation</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setQuotation(null);
                    setActiveStep(1);
                  }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition"
                >
                  ← Back to Details
                </button>

                <button
                  onClick={confirmBooking}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? "⏳ Processing..." : "✅ Confirm & Book Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {activeStep === 3 && success && (
          <div className="bg-white rounded-lg shadow-2xl p-12 text-center">
            <div className="mb-6">
              <div className="inline-block bg-green-100 p-4 rounded-full mb-6">
                <span className="text-6xl">✅</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-4">Your solar installation booking has been successfully submitted.</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-8 border-2 border-blue-200">
              <p className="text-gray-600 text-sm mb-2">Next Steps:</p>
              <ol className="text-left space-y-2 text-gray-700">
                <li>✓ We will contact you within 24 hours to confirm details</li>
                <li>✓ Site survey will be scheduled at your convenience</li>
                <li>✓ Final quotation and installation timeline will be provided</li>
                <li>✓ Installation will commence upon your approval</li>
              </ol>
            </div>

            <a
              href="/booking-status"
              className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition hover:bg-blue-700"
            >
              📊 Track Your Booking
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
