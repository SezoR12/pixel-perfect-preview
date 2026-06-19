import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar" | "fa" | "tr";

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    fa: string;
    tr: string;
  };
}

const DICTIONARY: Translations = {
  "app.title": {
    en: "Tureep AI+",
    ar: "تريب AI+",
    fa: "توریپ AI+",
    tr: "Tureep AI+",
  },
  "nav.dashboard": {
    en: "Dashboard",
    ar: "لوحة التحكم",
    fa: "داشبورد",
    tr: "Gösterge Paneli",
  },
  "nav.products": {
    en: "Products",
    ar: "المنتجات",
    fa: "محصولات",
    tr: "Ürünler",
  },
  "nav.pre_deals": {
    en: "Pre-Deals",
    ar: "الصفقات المبدئية",
    fa: "پیش‌قراردادها",
    tr: "Ön Anlaşmalar",
  },
  "nav.orders": {
    en: "Orders & Escrow",
    ar: "الطلبات والضمان",
    fa: "سفارشات و امانی",
    tr: "Siparişler ve Escrow",
  },
  "nav.finance": {
    en: "Trade Finance (L/C & D/P)",
    ar: "التمويل التجاري (L/C & D/P)",
    fa: "تأمین مالی تجارت (L/C & D/P)",
    tr: "Ticaret Finansmanı (L/C & D/P)",
  },
  "nav.shipments": {
    en: "Logistics & Tracking",
    ar: "اللوجستيات والتتبع",
    fa: "لجستیک و رهگیری",
    tr: "Lojistik ve Takip",
  },
  "nav.billing": {
    en: "Master Account Billing",
    ar: "فواتير الحساب الرئيسي",
    fa: "صورتحساب حساب مستر",
    tr: "Master Hesap Faturalandırma",
  },
  "nav.analytics": {
    en: "AI / ML Analytics",
    ar: "تحليلات الذكاء الاصطناعي",
    fa: "تحلیل‌های هوش مصنوعی",
    tr: "Yapay Zeka / ML Analitiği",
  },
  "nav.kyc": {
    en: "KYC / AML Workflow",
    ar: "التحقق من الهوية (KYC)",
    fa: "احراز هویت (KYC)",
    tr: "KYC / AML İş Akışı",
  },
  "nav.sanctions": {
    en: "Sanctions Screening",
    ar: "فحص العقوبات",
    fa: "غربالگری تحریم‌ها",
    tr: "Yaptırım Taraması",
  },
  "nav.microservices": {
    en: "Microservices Architecture",
    ar: "بنية الخدمات المصغرة",
    fa: "معماری میکروسرویس‌ها",
    tr: "Mikroservis Mimarisi",
  },
  "nav.hardening": {
    en: "HTTPS / Hardening",
    ar: "الأمان والتشفير",
    fa: "امنیت و رمزنگاری",
    tr: "HTTPS / Güvenlik",
  },
  "nav.notifications": {
    en: "Notifications",
    ar: "الإشعارات",
    fa: "اعلان‌ها",
    tr: "Bildirimler",
  },
  "nav.supabase": {
    en: "Supabase Core & RLS",
    ar: "قاعدة بيانات Supabase والأمان",
    fa: "پایگاه داده Supabase و RLS",
    tr: "Supabase ve RLS",
  },
  "btn.logout": {
    en: "Log out",
    ar: "تسجيل الخروج",
    fa: "خروج",
    tr: "Çıkış Yap",
  },
  "lang.switch": {
    en: "Select App Language & RTL",
    ar: "اختر لغة التطبيق والاتجاه",
    fa: "انتخاب زبان و جهت صفحه",
    tr: "Uygulama Dilini Seçin",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tureep_lang") as Language;
      return saved || "en";
    }
    return "en";
  });

  const dir = language === "ar" || language === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tureep_lang", language);
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, dir]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
  }

  function t(key: string, fallback?: string): string {
    const entry = DICTIONARY[key];
    if (!entry) return fallback || key;
    return entry[language] || entry.en || fallback || key;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, dir, t }}>
      <div dir={dir} className={dir === "rtl" ? "font-sans text-right" : "font-sans text-left"}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if not wrapped
    return {
      language: "en" as Language,
      setLanguage: () => {},
      dir: "ltr" as const,
      t: (key: string, fallback?: string) => fallback || key,
    };
  }
  return context;
}
