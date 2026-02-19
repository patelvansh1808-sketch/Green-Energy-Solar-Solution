import { useI18n } from "../../Context/I18nContext";

export default function SubsidyEligibility() {
  const { t } = useI18n();
  return (
    <div className="p-6 card">
      <h1 className="title">{t("subsidy.eligibilityTitle")}</h1>

      <p>{t("subsidy.status")}: {t("subsidy.eligible")}</p>
      <p>{t("subsidy.subsidyPercentage")}: <b>40%</b></p>
      <p>{t("subsidy.subsidyAmount")}: <b>₹72,000</b></p>
      <p>{t("subsidy.finalCost")}: <b>₹1,08,000</b></p>
    </div>
  );
}
