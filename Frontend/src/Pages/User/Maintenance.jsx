import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "../../Context/I18nContext";
import { useAuth } from "../../Context/AuthContext";
import maintenanceService from "../../services/maintenanceService";

export default function Maintenance() {
  const { t } = useI18n();
  const { user } = useAuth();

  const defaultPricing = useMemo(
    () => ({
      oneMonth: { price: 999, taxPercent: 18, discountPercent: 0, isActive: true },
      sixMonths: { price: 4999, taxPercent: 18, discountPercent: 0, isActive: true },
      oneYear: { price: 8999, taxPercent: 18, discountPercent: 0, isActive: true },
      lifetime: { price: 24999, taxPercent: 18, discountPercent: 0, isActive: true },
    }),
    []
  );

  const planKeyByType = useMemo(
    () => ({
      "1 Month": "oneMonth",
      "6 Months": "sixMonths",
      "1 Year": "oneYear",
      Lifetime: "lifetime",
    }),
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribeError, setSubscribeError] = useState("");
  const [subscribingPlan, setSubscribingPlan] = useState("");
  const [summary, setSummary] = useState({
    activePlan: null,
    upcoming: [],
    history: [],
  });
  const [reports, setReports] = useState([]);
  const [reportError, setReportError] = useState("");
  const [reportUploadError, setReportUploadError] = useState("");
  const [reportUploadSuccess, setReportUploadSuccess] = useState("");
  const [reportUploading, setReportUploading] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [pricingSettings, setPricingSettings] = useState(defaultPricing);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  const plans = [
    {
      key: "maintenance.plan1Month",
      planType: "1 Month",
      price: 599,
      detailKeys: [
        "maintenance.planDetailVisits1",
        "maintenance.planDetailCleaningTesting",
        "maintenance.planDetailReport",
      ],
    },
    {
      key: "maintenance.plan6Months",
      planType: "6 Months",
      price: 1499,
      detailKeys: [
        "maintenance.planDetailVisits6",
        "maintenance.planDetailCleaningTesting",
        "maintenance.planDetailPrioritySupport",
        "maintenance.planDetailReport",
      ],
    },
    {
      key: "maintenance.plan1Year",
      planType: "1 Year",
      price: 3499,
      detailKeys: [
        "maintenance.planDetailVisits12",
        "maintenance.planDetailCleaningTesting",
        "maintenance.planDetailPrioritySupport",
        "maintenance.planDetailResponseTime",
        "maintenance.planDetailReport",
      ],
    },
    {
      key: "maintenance.planLifetime",
      planType: "Lifetime",
      price: 10000,
      detailKeys: [
        "maintenance.planDetailVisitsUnlimited",
        "maintenance.planDetailCleaningTesting",
        "maintenance.planDetailPrioritySupport",
        "maintenance.planDetailResponseTime",
        "maintenance.planDetailReport",
      ],
    },
  ];

  const planTypeMap = useMemo(
    () => ({
      "1 Month": "maintenance.plan1Month",
      "6 Months": "maintenance.plan6Months",
      "1 Year": "maintenance.plan1Year",
      Lifetime: "maintenance.planLifetime",
    }),
    []
  );

  const statusKeyMap = useMemo(
    () => ({
      Active: "maintenance.statusActive",
      Inactive: "maintenance.statusInactive",
      Expired: "maintenance.statusExpired",
      Cancelled: "maintenance.statusCancelled",
    }),
    []
  );

  const serviceTypeMap = useMemo(
    () => ({
      Cleaning: "maintenance.cleaning",
      Testing: "maintenance.testing",
    }),
    []
  );

  const serviceStatusMap = useMemo(
    () => ({
      Scheduled: "maintenance.scheduled",
      "Due Soon": "maintenance.dueSoon",
      Completed: "maintenance.completed",
      Cancelled: "maintenance.cancelled",
    }),
    []
  );

  const formatDate = (value) => {
    if (!value) return t("maintenance.notAvailable");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("maintenance.notAvailable");
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const [data, reportData] = await Promise.all([
        maintenanceService.getSummary(),
        maintenanceService.getReports(),
      ]);
      try {
        const pricingData = await maintenanceService.getPricingSettings();
        setPricingSettings(pricingData?.planPricing || defaultPricing);
      } catch {
        setPricingSettings(defaultPricing);
      }
      setSummary({
        activePlan: data.activePlan || null,
        upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
        history: Array.isArray(data.history) ? data.history : [],
      });
      setReports(Array.isArray(reportData) ? reportData : []);
      setError("");
      setReportError("");
    } catch (err) {
      setError(err.response?.data?.message || t("maintenance.error"));
    } finally {
      setLoading(false);
    }
  }, [defaultPricing, t]);

  const getReportUrl = (fileUrl) => {
    if (!fileUrl) return "";
    if (fileUrl.startsWith("http")) return fileUrl;
    if (fileUrl.startsWith("/")) return `http://localhost:5000${fileUrl}`;
    return fileUrl;
  };

  const latestUploadedReport = Array.isArray(reports) && reports.length ? reports[0] : null;
  const latestHistoryWithReport = Array.isArray(summary?.history)
    ? summary.history.find((entry) => entry?.reportUrl)
    : null;
  const reportDownloadUrl = getReportUrl(
    latestUploadedReport?.fileUrl || latestHistoryWithReport?.reportUrl || ""
  );
  const hasDownloadableReport = Boolean(reportDownloadUrl);

  const handleDownloadReport = () => {
    if (!hasDownloadableReport) {
      setReportError(t("maintenance.reportUnavailable"));
      return;
    }

    setReportError("");
    window.open(reportDownloadUrl, "_blank", "noopener,noreferrer");
  };

  const canUploadReport = Boolean(
    user && ["admin", "engineer", "support"].includes(user.role)
  );

  const handleReportUpload = async (event) => {
    event.preventDefault();
    if (!reportFile || !reportTitle.trim()) {
      setReportUploadError(t("maintenance.reportUploadMissing"));
      setReportUploadSuccess("");
      return;
    }

    try {
      setReportUploading(true);
      setReportUploadError("");
      setReportUploadSuccess("");

      const formData = new FormData();
      formData.append("report", reportFile);
      formData.append("title", reportTitle.trim());

      await maintenanceService.uploadReport(formData);
      setReportTitle("");
      setReportFile(null);
      await loadSummary();
      setReportUploadSuccess(t("maintenance.reportUploadSuccess"));
    } catch (err) {
      setReportUploadError(
        err.response?.data?.message || t("maintenance.reportUploadFailed")
      );
    } finally {
      setReportUploading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const getPlanPricingBreakdown = useCallback(
    (planType) => {
      const pricingKey = planKeyByType[planType];
      const configuredPricing = pricingSettings?.[pricingKey] || {};
      const basePrice = Number(configuredPricing.price || 0);
      const taxPercent = Number(configuredPricing.taxPercent || 0);
      const discountPercent = Number(configuredPricing.discountPercent || 0);
      const taxAmount = (basePrice * taxPercent) / 100;
      const discountAmount = (basePrice * discountPercent) / 100;
      const totalAmount = Math.max(0, basePrice + taxAmount - discountAmount);

      return {
        basePrice,
        taxPercent,
        discountPercent,
        taxAmount,
        discountAmount,
        totalAmount,
        isActive: configuredPricing.isActive !== false,
      };
    },
    [planKeyByType, pricingSettings]
  );

  const openSubscribeCheckout = useCallback(
    (plan) => {
      const breakdown = getPlanPricingBreakdown(plan.planType);
      setSubscribeError("");
      setSelectedPlanForCheckout({
        ...plan,
        pricing: breakdown,
      });
    },
    [getPlanPricingBreakdown]
  );

  const handleSubscribe = async () => {
    if (!selectedPlanForCheckout) {
      return;
    }

    const { planType } = selectedPlanForCheckout;

    try {
      setSubscribeError("");
      setSubscribingPlan(planType);
      await maintenanceService.createPlan({ planType });
      setSelectedPlanForCheckout(null);
      await loadSummary();
    } catch (err) {
      setSubscribeError(err.response?.data?.message || t("maintenance.subscribeFailed"));
    } finally {
      setSubscribingPlan("");
    }
  };

  const activePlan = summary.activePlan;
  const hasActivePlan = Boolean(activePlan && activePlan.status === "Active");
  const activePlanLabel = activePlan
    ? t(planTypeMap[activePlan.planType] || "maintenance.plan6Months")
    : t("maintenance.noActivePlan");
  const activePlanStatusKey = activePlan
    ? statusKeyMap[activePlan.status] || "maintenance.statusInactive"
    : "maintenance.statusInactive";
  const activePlanNextService = activePlan?.nextServiceDate
    ? formatDate(activePlan.nextServiceDate)
    : t("maintenance.noNextService");
  const activePlanServicesUsed = activePlan
    ? `${activePlan.servicesUsed ?? 0} / ${activePlan.servicesTotal ?? 0}`
    : t("maintenance.notAvailable");

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t("maintenance.title")}</h1>
              <p className="text-slate-600 mt-1">{t("maintenance.subtitle")}</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
              {t("maintenance.status")}: {t(activePlanStatusKey)}
            </div>
          </div>
        </header>

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-600">{t("maintenance.loading")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
            <p className="font-semibold">{t("maintenance.error")}</p>
            <p className="mt-2">{error}</p>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">{t("maintenance.overviewTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-500">{t("maintenance.activePlan")}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{activePlanLabel}</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-500">{t("maintenance.nextServiceDate")}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{activePlanNextService}</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-500">{t("maintenance.servicesUsed")}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{activePlanServicesUsed}</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-500">{t("maintenance.status")}</p>
              <p className="text-lg font-semibold text-emerald-700 mt-1">{t(activePlanStatusKey)}</p>
            </div>
          </div>
        </section>

        {!hasActivePlan && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">{t("maintenance.plansTitle")}</h2>
              <span className="text-sm text-slate-500">{t("maintenance.selectPlan")}</span>
            </div>
            {subscribeError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {subscribeError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div key={plan.key} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{t(plan.key)}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {t("maintenance.priceLabel")}: ₹
                      {getPlanPricingBreakdown(plan.planType).basePrice.toLocaleString("en-IN")} + tax
                    </p>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {plan.detailKeys.map((detailKey) => (
                      <li key={detailKey} className="flex items-start gap-2">
                        <span className="text-emerald-600">•</span>
                        <span>{t(detailKey)}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openSubscribeCheckout(plan)}
                    disabled={
                      subscribingPlan === plan.planType ||
                      !getPlanPricingBreakdown(plan.planType).isActive
                    }
                    className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60 mt-auto"
                  >
                    {!getPlanPricingBreakdown(plan.planType).isActive
                      ? "Currently Unavailable"
                      : subscribingPlan === plan.planType
                      ? t("maintenance.subscribing")
                      : t("maintenance.subscribeNow")}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedPlanForCheckout && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Confirm Subscription
              </h3>
              <p className="text-slate-600 mt-1">
                {t(selectedPlanForCheckout.key)}
              </p>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Base Price</span>
                  <span>₹{selectedPlanForCheckout.pricing.basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Tax ({selectedPlanForCheckout.pricing.taxPercent}%)</span>
                  <span>₹{selectedPlanForCheckout.pricing.taxAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Discount ({selectedPlanForCheckout.pricing.discountPercent}%)</span>
                  <span>- ₹{selectedPlanForCheckout.pricing.discountAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2 flex items-center justify-between text-base font-semibold text-slate-900">
                  <span>Total Amount</span>
                  <span>₹{selectedPlanForCheckout.pricing.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForCheckout(null)}
                  disabled={Boolean(subscribingPlan)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={Boolean(subscribingPlan)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                >
                  {Boolean(subscribingPlan) ? t("maintenance.subscribing") : "Confirm & Subscribe"}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">{t("maintenance.upcomingTitle")}</h2>
          {summary.upcoming.length === 0 ? (
            <p className="text-slate-600">{t("maintenance.noUpcoming")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-4">{t("maintenance.date")}</th>
                    <th className="py-2 pr-4">{t("maintenance.type")}</th>
                    <th className="py-2">{t("maintenance.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.upcoming.map((service) => (
                    <tr key={service._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-slate-900 font-medium">
                        {formatDate(service.date)}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {t(serviceTypeMap[service.type] || "maintenance.testing")}
                      </td>
                      <td className="py-3 text-slate-700">
                        {t(serviceStatusMap[service.status] || "maintenance.scheduled")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">{t("maintenance.serviceHistoryTitle")}</h2>
          {summary.history.length === 0 ? (
            <p className="text-slate-600">{t("maintenance.noHistory")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-4">{t("maintenance.date")}</th>
                    <th className="py-2 pr-4">{t("maintenance.workDone")}</th>
                    <th className="py-2 pr-4">{t("maintenance.technician")}</th>
                    <th className="py-2">{t("maintenance.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.history.map((entry) => (
                    <tr key={entry._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-slate-900 font-medium">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {entry.workDone || t("maintenance.notAvailable")}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {entry.technician || t("maintenance.notAvailable")}
                      </td>
                      <td className="py-3 text-slate-700">
                        {t(serviceStatusMap[entry.status] || "maintenance.completed")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t("maintenance.reportsTitle")}</h2>
            <p className={`mt-1 ${hasDownloadableReport ? "text-slate-600" : "text-amber-700"}`}>
              {hasDownloadableReport
                ? t("maintenance.downloadReport")
                : t("maintenance.reportAvailableAfterFirstService")}
            </p>
            {reportError && (
              <p className="mt-2 text-sm text-red-600">{reportError}</p>
            )}
            {reportUploadSuccess && (
              <p className="mt-2 text-sm text-emerald-600">{reportUploadSuccess}</p>
            )}
            {reportUploadError && (
              <p className="mt-2 text-sm text-red-600">{reportUploadError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={!hasDownloadableReport}
            className={`px-5 py-2.5 rounded-lg font-semibold transition ${
              hasDownloadableReport
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {t("maintenance.downloadReport")}
          </button>
        </section>

        {canUploadReport && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {t("maintenance.uploadReportTitle")}
            </h3>
            <form onSubmit={handleReportUpload} className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">
                  {t("maintenance.reportTitleLabel")}
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(event) => setReportTitle(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t("maintenance.reportTitlePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  {t("maintenance.reportFileLabel")}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setReportFile(event.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={reportUploading}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {reportUploading
                    ? t("maintenance.reportUploading")
                    : t("maintenance.uploadReport")}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
