import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar" | "fa" | "ku" | "tr";

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    fa: string;
    ku: string;
    tr: string;
  };
}

const DICTIONARY: Translations = {
  // App Title
  "app.title": {
    en: "Tureep AI+",
    ar: "تريب AI+",
    fa: "توریپ AI+",
    ku: "توریپ AI+",
    tr: "Tureep AI+",
  },

  // Sidebar Navigation
  "nav.dashboard": {
    en: "Dashboard",
    ar: "لوحة التحكم",
    fa: "داشبورد",
    ku: "پێشبین (داشبۆرد)",
    tr: "Gösterge Paneli",
  },
  "nav.products": {
    en: "Products",
    ar: "المنتجات",
    fa: "محصولات",
    ku: "بەرهەمەکان",
    tr: "Ürünler",
  },
  "nav.pre_deals": {
    en: "Pre-Deals",
    ar: "الصفقات المبدئية",
    fa: "پیش‌قراردادها",
    ku: "پێش-ڕێککەوتنەکان",
    tr: "Ön Anlaşmalar",
  },
  "nav.orders": {
    en: "Orders & Escrow",
    ar: "الطلبات والضمان",
    fa: "سفارشات و امانی",
    ku: "داواکارییەکان و پارەی ئەمانی",
    tr: "Siparişler ve Escrow",
  },
  "nav.finance": {
    en: "Trade Finance (L/C & D/P)",
    ar: "التمويل التجاري (L/C & D/P)",
    fa: "تأمین مالی تجارت (L/C & D/P)",
    ku: "دارایی بازرگانی (L/C & D/P)",
    tr: "Ticaret Finansmanı (L/C & D/P)",
  },
  "nav.shipments": {
    en: "Logistics & Tracking",
    ar: "اللوجستيات والتتبع",
    fa: "لجستیک و رهگیری",
    ku: "لۆجستیك و بەدواداچوون",
    tr: "Lojistik ve Takip",
  },
  "nav.billing": {
    en: "Master Account Billing",
    ar: "فواتير الحساب الرئيسي",
    fa: "صورتحساب حساب مستر",
    ku: "پارەدان و هەژماری سەرەکی",
    tr: "Master Hesap Faturalandırma",
  },
  "nav.analytics": {
    en: "AI / ML Analytics",
    ar: "تحليلات الذكاء الاصطناعي",
    fa: "تحلیل‌های هوش مصنوعی",
    ku: "شیکاری ژیری دەستکرد",
    tr: "Yapay Zeka / ML Analitiği",
  },
  "nav.kyc": {
    en: "KYC / AML Workflow",
    ar: "التحقق من الهوية (KYC/AML)",
    fa: "احراز هویت و ضدپولشویی",
    ku: "سەلماندنی ناسنامە (KYC/AML)",
    tr: "KYC / AML İş Akışı",
  },
  "nav.sanctions": {
    en: "Sanctions Screening",
    ar: "فحص العقوبات الدولية",
    fa: "غربالگری تحریم‌های بین‌المللی",
    ku: "پشکنینی سزاکان (سزای نێودەوڵەتی)",
    tr: "Yaptırım Taraması",
  },
  "nav.notifications": {
    en: "Notifications",
    ar: "الإشعارات",
    fa: "اعلان‌ها",
    ku: "ئاگادارییەکان",
    tr: "Bildirimler",
  },
  "nav.supabase": {
    en: "Supabase Core & RLS",
    ar: "قاعدة بيانات Supabase والأمان",
    fa: "پایگاه داده Supabase و RLS",
    ku: "بنکەی داتا Supabase و RLS",
    tr: "Supabase ve RLS",
  },
  "nav.microservices": {
    en: "Microservices Architecture",
    ar: "بنية الخدمات المصغرة",
    fa: "معماری میکروسرویس‌ها",
    ku: "تەلارسازی مایکرۆسێرڤیسەکان",
    tr: "Mikroservis Mimarisi",
  },
  "nav.hardening": {
    en: "HTTPS / Hardening Guide",
    ar: "دليل الأمان والتشفير",
    fa: "راهنمای امنیت و رمزنگاری",
    ku: "ڕێبەری ئاسایش و کۆدکردن",
    tr: "HTTPS / Güvenlik Rehberi",
  },

  // Buttons and Common UI
  "btn.logout": {
    en: "Log out",
    ar: "تسجيل الخروج",
    fa: "خروج",
    ku: "چوونە دەرەوە",
    tr: "Çıkış Yap",
  },
  "btn.signin": {
    en: "Sign in",
    ar: "تسجيل الدخول",
    fa: "ورود",
    ku: "چوونە ژوورەوە",
    tr: "Giriş Yap",
  },
  "btn.refresh": {
    en: "Refresh Pool",
    ar: "تحديث البيانات",
    fa: "بروزرسانی",
    ku: "نوێکردنەوەی داتا",
    tr: "Yenile",
  },
  "btn.submit": {
    en: "Submit",
    ar: "إرسال",
    fa: "ثبت",
    ku: "ناردن",
    tr: "Gönder",
  },

  // Common Headers & Labels
  "lang.en": {
    en: "English (LTR)",
    ar: "الإنجليزية (LTR)",
    fa: "انگلیسی (LTR)",
    ku: "ئینگلیزی (LTR)",
    tr: "İngilizce (LTR)",
  },
  "lang.ar": {
    en: "Arabic (RTL)",
    ar: "العربية (RTL)",
    fa: "عربی (RTL)",
    ku: "عەرەبی (RTL)",
    tr: "Arapça (RTL)",
  },
  "lang.fa": {
    en: "Persian (RTL)",
    ar: "الفارسية (RTL)",
    fa: "فارسی (RTL)",
    ku: "فارسی (RTL)",
    tr: "Farsça (RTL)",
  },
  "lang.ku": {
    en: "Kurdish (RTL)",
    ar: "الكردية (RTL)",
    fa: "کردی (RTL)",
    ku: "کوردی (RTL)",
    tr: "Kürtçe (RTL)",
  },
  "lang.tr": {
    en: "Turkish (LTR)",
    ar: "التركية (LTR)",
    fa: "ترکی (LTR)",
    ku: "تورکی (LTR)",
    tr: "Türkçe (LTR)",
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

  // Exactly locks down RTL support for Arabic (ar), Persian (fa), and Kurdish (ku)
  const dir = language === "ar" || language === "fa" || language === "ku" ? "rtl" : "ltr";

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
    return (entry as any)[language] || entry.en || fallback || key;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, dir, t }}>
      <div dir={dir} className={`min-h-screen transition-all ${dir === "rtl" ? "font-sans text-right" : "font-sans text-left"}`}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      language: "en" as Language,
      setLanguage: () => {},
      dir: "ltr" as const,
      t: (key: string, fallback?: string) => fallback || key,
    };
  }
  return context;
}
