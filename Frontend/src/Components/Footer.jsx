import { useI18n } from "../Context/I18nContext";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-100 text-center p-4 text-sm">
      {t("footer.copyright")}
    </footer>
  );
}
