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
  // Brand & Core
  "app.title": { en: "Tureep AI+", ar: "منصة تريب للذكاء الاصطناعي", fa: "پلتفرم توریپ هوش مصنوعی", ku: "پلاتفۆرمی توریپ بۆ ژیری دەستکرد", tr: "Tureep AI+" },
  "Terminal B2B Trade Summary": { en: "Terminal B2B Trade Summary", ar: "ملخص صفقات التداول B2B", fa: "خلاصه معاملات تجاری B2B", ku: "پوختەی بازرگانی پلاتفۆرمی B2B", tr: "B2B Ticaret Terminali Özeti" },

  // Landing Page Nav
  "nav.platform": { en: "Platform", ar: "المنصة التجارية", fa: "پلتفرم تجاری", ku: "پلاتفۆرمی بازرگانی", tr: "Platform" },
  "nav.membership": { en: "Membership", ar: "نظام العضوية", fa: "عضویت و اشتراک", ku: "سیستەمی ئەندامێتی", tr: "Üyelik Sistemi" },
  "nav.corridors": { en: "Corridors", ar: "الممرات النشطة", fa: "کریدورهای فعال", ku: "ڕاڕەوە بازرگانییەکان", tr: "Ticaret Koridorları" },
  "nav.signin": { en: "Sign in", ar: "تسجيل الدخول", fa: "ورود به حساب", ku: "چوونە ژوورەوە", tr: "Giriş Yap" },
  "nav.access": { en: "Access Terminal", ar: "دخول المنصة التجارية", fa: "ورود به ترمینال", ku: "چوونە ناو پلاتفۆرم", tr: "Terminale Eriş" },

  // Landing Page Hero
  "hero.tag": { en: "Private member network", ar: "شبكة أعضاء تجارية خاصة", fa: "شبکه اعضای خصوصی تجارت", ku: "تۆڕی ئەندامانی تایبەت", tr: "Özel üye ticaret ağı" },
  "hero.title": { en: "Trade at the speed of intelligence", ar: "التداول بسرعة الذكاء الاصطناعي", fa: "تجارت با سرعت هوش مصنوعی", ku: "بازرگانی بە خێرایی ژیری دەستکرد", tr: "Zeka hızında ticaret yapın" },
  "hero.subtitle": { 
    en: "Tureep AI+ connects verified sellers and buyers across the Middle East and beyond. Our AI pre-generates institutional deals, clears compliance, and orchestrates logistics — before the first message is sent.", 
    ar: "تربط منصة تريب للذكاء الاصطناعي بين الشركات الموثوقة في العراق وإيران وتركيا والأسواق العالمية. يقوم الذكاء الاصطناعي بتوليد الصفقات المؤسسية وتخليص الامتثال وتنظيم الشحن قبل إرسال الرسالة الأولى.", 
    fa: "توریپ هوش مصنوعی فروشندگان و خریداران تاییدشده در عراق، ایران، ترکیه و بازارهای جهانی را متصل می‌کند. سیستم ما قراردادها، انطباق و لجستیک را پیش از ارسال اولین پیام آماده می‌کند.", 
    ku: "پلاتفۆرمی توریپ فرۆشیاران و کڕیارانی باوەڕپێکراو لە عێراق، ئێران، تورکیا و جیهان دەبەستێتەوە. ژیری دەستکرد ڕێککەوتنەکان و لۆجستیك و یاساکان ئامادە دەکات پێش ناردنی یەکەم پەیام.", 
    tr: "Tureep AI+, Irak, İran, Türkiye ve ötesindeki doğrulanmış alıcı ve satıcıları birbirine bağlar. Yapay zekamız ilk mesaj gönderilmeden önce kurumsal anlaşmaları oluşturur ve lojistiği düzenler." 
  },
  "hero.input": { en: "Business email address", ar: "البريد الإلكتروني المؤسسي", fa: "ایمیل سازمانی یا کاری", ku: "ئیمەیڵی بازرگانی (کار)", tr: "İş e-posta adresi" },
  "hero.req": { en: "Request access", ar: "طلب انضمام فوري", fa: "درخواست دسترسی فوری", ku: "داواکردنی دەستپێگەیشتن", tr: "Erişim talep et" },
  "hero.disclaimer": { 
    en: "Membership is reviewed. Priority given to commodity traders, manufacturers, and logistics operators.", 
    ar: "تخضع العضوية للمراجعة الدقيقة. تُعطى الأولوية لتجار السلع والمصنعين وشركات الخدمات اللوجستية.", 
    fa: "عضویت بررسی می‌شود. اولویت با معامله‌گران کالا، تولیدکنندگان و اپراتورهای لجستیک است.", 
    ku: "ئەندامێتی پێداچوونەوەی بۆ دەکرێت. لەپێشینە دەدرێت بە بازرگانانی کاڵا و کارگەکان و کۆمپانیاکانی لۆجستیك.", 
    tr: "Üyelik incelenir. Öncelik emtia tüccarlarına, üreticilere ve lojistik operatörlerine verilir." 
  },

  // Terminal Preview Mockup in Hero
  "mock.head": { en: "Tureep AI+ Terminal", ar: "منصة تريب التجارية", fa: "ترمینال تجاری توریپ", ku: "پلاتفۆرمی توریپ", tr: "Tureep AI+ Terminali" },
  "mock.dash": { en: "Dashboard", ar: "لوحة التحكم", fa: "داشبورد", ku: "پێشبین (داشبۆرد)", tr: "Gösterge Paneli" },
  "mock.role": { en: "Gold Member", ar: "عضو ذهبي معتمد", fa: "عضو طلایی تاییدشده", ku: "ئەندامی زێڕین", tr: "Altın Üye" },
  "mock.deals": { en: "Active Pre-Deals", ar: "الصفقات المبدئية النشطة", fa: "پیش‌قراردادهای فعال", ku: "پێش-ڕێککەوتنە چالاکەکان", tr: "Aktif Ön Anlaşmalar" },
  "mock.val": { en: "Trade Value", ar: "حجم التداول", fa: "ارزش کل معاملات", ku: "قەبارەی بازرگانی", tr: "Ticaret Değeri" },
  "mock.score": { en: "Match Score", ar: "درجة التوافق", fa: "امتیاز تطابق هوش مصنوعی", ku: "خاڵی گونجان", tr: "Eşleşme Puanı" },
  "mock.prod": { en: "Premium Iraqi Dates", ar: "تمور بصرة فاخرة (عراقية)", fa: "خرمای ممتاز بصره (عراق)", ku: "خورمای نایابی بەسرە (عێراق)", tr: "Premium Basra Hurması" },
  "mock.rec": { en: "Recommended", ar: "موصى به بالذكاء الاصطناعي", fa: "پیشنهاد ویژه هوش مصنوعی", ku: "پێشنیارکراو بە ژیری دەستکرد", tr: "Yapay Zeka Önerisi" },
  "mock.terms": { en: "300 ton • $2.65 / ton • Escrow", ar: "الكمية: 300 طن | السعر: 2.65 دولار/طن | الدفع: عبر حساب ضمان", fa: "مقدار: 300 تن | قیمت: 2.65 دلار/تن | پرداخت: امانی", ku: "بڕ: 300 تەن | نرخ: 2.65 دۆلار/تەن | پارەدان: ئەمانی", tr: "300 ton | $2.65 / ton | Kurumsal Escrow" },

  // Stats Section
  "Trade value screened": { en: "Trade value screened", ar: "قيمة الصفقات المعتمدة", fa: "ارزش معاملات بررسی‌شده", ku: "بڕی بازرگانی پشکنراو", tr: "Taranan ticaret değeri" },
  "Pre-deals generated": { en: "Pre-deals generated", ar: "الصفقات المبدئية المولدة", fa: "پیش‌قراردادهای ایجادشده", ku: "پێش-ڕێککەوتنە دروستکراوەکان", tr: "Oluşturulan ön anlaşmalar" },
  "Verified members": { en: "Verified members", ar: "الشركات والأعضاء الموثوقون", fa: "شرکت‌ها و اعضای تاییدشده", ku: "کۆمپانیا و ئەندامە باوەڕپێکراوەکان", tr: "Doğrulanmış şirketler" },
  "Active corridors": { en: "Active corridors", ar: "الممرات التجارية النشطة", fa: "کریدورهای تجاری فعال", ku: "ڕاڕەوە بازرگانییە چالاکەکان", tr: "Aktif ticaret koridorları" },

  // Features Section
  "The Platform": { en: "The Platform", ar: "المنصة التجارية", fa: "پلتفرم تجاری", ku: "پلاتفۆرمی بازرگانی", tr: "Platform" },
  "Built for the full deal cycle": { en: "Built for the full deal cycle", ar: "مصممة لدورة الصفقة الكاملة من البداية حتى النهاية", fa: "طراحی‌شده برای چرخه کامل معامله از ابتدا تا انتها", ku: "دروستکراو بۆ تەواوی سووڕی ڕێککەوتن لە سەرەتاوە تا کۆتایی", tr: "Tam anlaşma döngüsü için tasarlandı" },
  "From discovery to settlement, every step is engineered for institutional trust and velocity.": { 
    en: "From discovery to settlement, every step is engineered for institutional trust and velocity.", 
    ar: "من الاستكشاف حتى التسوية البنكية، تمت هندسة كل خطوة لضمان الثقة المؤسسية والسرعة الفائقة.", 
    fa: "از کشف تا تسویه بانکی، هر گام برای اعتماد نهادی و سرعت فوق‌العاده مهندسی شده است.", 
    ku: "لە دۆزینەوە تا یەکلاییکردنەوەی بانکی، هەموو هەنگاوێك بۆ متمانە و خێرایی داڕێژراوە.", 
    tr: "Keşiften banka uzlaşmasına kadar her adım, kurumsal güven ve hız için tasarlandı." 
  },
  "AI Matchmaking": { en: "AI Matchmaking", ar: "التوفيق الذكي بالذكاء الاصطناعي", fa: "تطابق هوشمند با هوش مصنوعی", ku: "گونجاندن بە ژیری دەستکرد", tr: "Yapay Zeka Eşleştirme" },
  "Proprietary scoring across price, reputation, urgency, and logistics to surface the best counterparties.": { 
    en: "Proprietary scoring across price, reputation, urgency, and logistics to surface the best counterparties.", 
    ar: "نظام تسجيل تقييمي يشمل السعر والسمعة والأهمية والخدمات اللوجستية لإظهار أفضل الشركاء التجاريين.", 
    fa: "امتیازدهی اختصاصی در قیمت، شهرت، فوریت و لجستیک برای یافتن بهترین طرف‌های معامله.", 
    ku: "شیکاری تایبەت بۆ نرخ و ناوبانگ و پەلەیی و لۆجستیك بۆ دۆزینەوەی باشترین هاوبەشەکان.", 
    tr: "En iyi karşı tarafları yüzeye çıkarmak için fiyat, itibar, aciliyet ve lojistik genelinde tescilli puanlama." 
  },
  "Institutional Trust": { en: "Institutional Trust", ar: "الثقة المؤسسية والأمان", fa: "اعتماد نهادی و امنیت", ku: "متمانەی دامەزراوەیی و ئاسایش", tr: "Kurumsal Güven ve Güvenlik" },
  "Verified companies, sanctions screening, and structured payment workflows on every deal.": { 
    en: "Verified companies, sanctions screening, and structured payment workflows on every deal.", 
    ar: "شركات معتمدة وفحص فوري للعقوبات الدولية ومسارات عمل الدفع المنظمة في كل صفقة.", 
    fa: "شرکت‌های تاییدشده، بررسی تحریم‌های بین‌المللی و جریان‌های پرداخت ساختاریافته در هر معامله.", 
    ku: "کۆمپانیا باوەڕپێکراوەکان، پشکنینی سزاکان، و شێوازی پارەدان لە هەموو ڕێککەوتنێك.", 
    tr: "Her anlaşmada doğrulanmış şirketler, yaptırım taraması ve yapılandırılmış ödeme iş akışları." 
  },
  "Logistics Clearing": { en: "Logistics Clearing", ar: "التخليص اللوجستي المدمج", fa: "ترخیص و رهگیری لجستیک", ku: "پاکسازی و بەدواداچوونی لۆجستیك", tr: "Entegre Lojistik Takas" },
  "Shipping quotes, customs-aware routing, and tracking consolidated inside the deal timeline.": { 
    en: "Shipping quotes, customs-aware routing, and tracking consolidated inside the deal timeline.", 
    ar: "عروض أسعار الشحن وتوجيه مراعٍ للجمارك وتتبع حي مدمج داخل المخطط الزمني للصفقة.", 
    fa: "نرخ حمل و نقل، مسیریابی آگاه از گمرک و رهگیری زنده ادغام‌شده در تایم‌لاین معامله.", 
    ku: "نرخەکانی شحن، ڕێڕەوی گومرکی، و بەدواداچوونی ڕاستەوخۆ لە ناو کاترمەی ڕێککەوتنەکە.", 
    tr: "Nakliye teklifleri, gümrük duyarlı rotalama ve anlaşma zaman çizelgesi içinde birleştirilmiş canlı takip." 
  },
  "Market Intelligence": { en: "Market Intelligence", ar: "استخبارات وتنبؤات السوق", fa: "هوش بازار و پیش‌بینی‌ها", ku: "زانیاری بازاڕ و پێشبینییەکان", tr: "Piyasa İstihbaratı" },
  "Price signals, demand forecasting, and corridor analytics reserved for Master Account holders.": { 
    en: "Price signals, demand forecasting, and corridor analytics reserved for Master Account holders.", 
    ar: "إشارات الأسعار الحية والتنبؤ بالطلب وتحليلات الممرات مخصصة حصرياً لأصحاب الحسابات الرئيسية.", 
    fa: "سیگنال‌های قیمت، پیش‌بینی تقاضا و تحلیل‌های کریدور مختص دارندگان حساب مستر.", 
    ku: "ئاماژەکانی نرخ، پێشبینیکردنی داواکاری، و شیکاری ڕاڕەوەکان بۆ هەژمارە سەرەکییەکان.", 
    tr: "Fiyat sinyaller, talep tahmini ve Master Hesap sahiplerine ayrılmış koridor analitiği." 
  },

  // Master Tiers Section
  "Membership": { en: "Membership", ar: "نظام العضوية", fa: "عضویت", ku: "ئەندامێتی", tr: "Üyelik" },
  "Master Accounts": { en: "Master Accounts", ar: "الحسابات الرئيسية المعتمدة", fa: "حساب‌های مستر تاییدشده", ku: "هەژمارە سەرەکییە باوەڕپێکراوەکان", tr: "Master Hesaplar" },
  "Tiered access designed for every scale of international trade.": { 
    en: "Tiered access designed for every scale of international trade.", 
    ar: "وصول متعدد المستويات مصمم خصيصاً لكل أحجام التجارة الدولية وعبر الحدود.", 
    fa: "دسترسی چندسطحی طراحی‌شده برای هر مقیاس از تجارت بین‌المللی و مرزی.", 
    ku: "دەستپێگەیشتنی چەند ئاستی بۆ هەموو قەبارەیەکی بازرگانی نێودەوڵەتی و سنووری.", 
    tr: "Uluslararası ticaretin her ölçeği için tasarlanmış katmanlı erişim." 
  },
  "per month": { en: "per month", ar: "شهرياً", fa: "در ماه", ku: "مانگانە", tr: "aylık" },
  "Most popular": { en: "Most popular", ar: "الأكثر طلباً", fa: "محبوب‌ترین", ku: "زۆرترین خواستر", tr: "En popüler" },
  "Priority deal access": { en: "Priority deal access", ar: "وصول فوري للصفقات", fa: "دسترسی فوری به معاملات", ku: "لەپێشینەی دەستپێگەیشتنی ڕێککەوتن", tr: "Öncelikli anlaşma erişimi" },
  "Reduced commission": { en: "Reduced commission", ar: "عمولة منصة مخفضة", fa: "کاهش کمیسیون پلتفرم", ku: "عمولەی کەمکراوەی پلاتفۆرم", tr: "İndirimli platform komisyonu" },
  "Dedicated support": { en: "Dedicated support", ar: "دعم مخصص وتوجيه اعتمادات بنكية", fa: "پشتیبانی ویژه و مسیریابی اعتبارات اسنادی", ku: "پشتگیری تایبەت و ڕێڕەوی بانکی", tr: "Özel destek ve L/C rotalama" },

  // Active Corridors Section
  "Active trade lanes": { en: "Active trade lanes", ar: "المسارات التجارية عبر الحدود النشطة", fa: "مسیرهای تجاری مرزی فعال", ku: "ڕێڕەوە بازرگانییە سنوورییە چالاکەکان", tr: "Aktif sınır ötesi ticaret yolları" },
  "Iraq": { en: "Iraq", ar: "العراق", fa: "عراق", ku: "عێراق", tr: "Irak" },
  "Turkey": { en: "Turkey", ar: "تركيا", fa: "ترکیه", ku: "تورکیا", tr: "Türkiye" },
  "Dates, Phosphate, Marble": { en: "Dates, Phosphate, Marble", ar: "تمور، فوسفات، رخام طبيعي", fa: "خرما، فسفات، سنگ مرمر", ku: "خورما، فۆسفات، مەڕمەڕی سروشتی", tr: "Hurma, Fosfat, Mermer" },
  "Iran": { en: "Iran", ar: "إيران", fa: "ایران", ku: "ئێران", tr: "İran" },
  "Turkey / EU": { en: "Turkey / EU", ar: "تركيا / الاتحاد الأوروبي", fa: "ترکیه / اتحادیه اروپا", ku: "تورکیا / یەکێتی ئەوروپا", tr: "Türkiye / AB" },
  "Steel Scrap, Petrochemicals": { en: "Steel Scrap, Petrochemicals", ar: "خردة الصلب، البتروكيماويات", fa: "ضایعات فولاد، محصولات پتروشیمی", ku: "پاشماوەی پۆڵا، پێترۆکیمیایی", tr: "Çelik Hurdası, Petrokimyasallar" },
  "Global Markets": { en: "Global Markets", ar: "الأسواق العالمية", fa: "بازارهای جهانی", ku: "بازاڕە جیهانییەکان", tr: "Küresel Piyasalar" },
  "Processed commodities, Textiles": { en: "Processed commodities, Textiles", ar: "السلع المصنعة، المنسوجات والملابس", fa: "کالاهای فرآوری‌شده، منسوجات و پوشاک", ku: "کاڵا پیشەسازییەکان، قوماش و جلوبەرگ", tr: "İşlenmiş emtialar, Tekstiller" },

  // CTA & Footer
  "Join the private network": { en: "Join the private B2B network", ar: "انضم إلى شبكة التجارة الخاصة B2B", fa: "به شبکه خصوصی تجارت B2B بپیوندید", ku: "پەیوەندی بکە بە تۆڕی تایبەتی بازرگانی B2B", tr: "Özel B2B ticaret ağına katılın" },
  "Priority access is limited. Apply today and our team will review your membership.": { 
    en: "Priority access is limited. Apply today and our team will review your membership.", 
    ar: "الوصول ذو الأولوية محدود. قدم اليوم وسيقوم فريقنا بمراجعة وتوثيق حساب شركتك.", 
    fa: "دسترسی اولویت‌دار محدود است. امروز اقدام کنید تا تیم ما حساب شرکتی شما را بررسی کند.", 
    ku: "دەستپێگەیشتنی لەپێشینە سنووردارە. ئەمڕۆ داواکاری بنێرە بۆ پێداچوونەوە و توثیقی کۆمپانیاکەت.", 
    tr: "Öncelikli erişim sınırlıdır. Bugün başvurun ve ekibimiz kurumsal hesabınızı incelesin." 
  },
  "Access Terminal": { en: "Access Terminal", ar: "دخول المنصة التجارية", fa: "ورود به ترمینال", ku: "چوونە ناو پلاتفۆرم", tr: "Terminale Eriş" },
  "Applying...": { en: "Applying...", ar: "جاري التقديم...", fa: "در حال ثبت...", ku: "لە ناردندایە...", tr: "Başvuruluyor..." },
  "Your application has been received. Our team will review it shortly.": { en: "Your application has been received. Our team will review it shortly.", ar: "تم استلام طلبك. سيقوم فريقنا بمراجعته قريباً.", fa: "درخواست شما دریافت شد. تیم ما به زودی آن را بررسی خواهد کرد.", ku: "داواکارییەکەت وەرگیرا. تیمەکەمان بە زووترين کات پێداچوونەوەی بۆ دەکات.", tr: "Başvurunuz alındı. Ekibimiz en kısa sürede inceleyecektir." },
  "Something went wrong. Please try again.": { en: "Something went wrong. Please try again.", ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى.", fa: "خطایی رخ داد. لطفا دوباره تلاش کنید.", ku: "هەڵەیەك ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.", tr: "Bir şeyler ters gitti. Lütfen tekrar deneyin." },
  "© 2026 Tureep Trade Systems. All rights reserved.": { en: "© 2026 Tureep Trade Systems. All rights reserved.", ar: "© 2026 أنظمة تريب التجارية. جميع الحقوق محفوظة.", fa: "© 2026 سیستم‌های تجاری توریپ. کلیه حقوق محفوظ است.", ku: "© 2026 سیستەمەکانی بازرگانی توریپ. هەموو مافەکان پارێزراوان.", tr: "© 2026 Tureep Ticaret Sistemleri. Tüm hakları saklıdır." },

  // Dashboard Nav & Buttons
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم", fa: "داشبورد", ku: "پێشبین (داشبۆرد)", tr: "Gösterge Paneli" },
  "nav.products": { en: "Products", ar: "المنتجات", fa: "محصولات", ku: "بەرهەمەکان", tr: "Ürünler" },
  "nav.workflow": { en: "Deal Workflow & Explorer", ar: "مسار عمل الصفقة والمستكشف", fa: "مسیر معامله و کاوشگر", ku: "ڕێڕەوی ڕێککەوتن و گەڕان", tr: "Anlaşma Akışı ve Kaşif" },
  "wf.title": { en: "Definitive 7-Stage Trade Workflow & System Explorer", ar: "المسار المعتمد للصفقة من 7 مراحل والمستكشف التفاعلي", fa: "مسیر 7 مرحله‌ای معامله و کاوشگر سیستم", ku: "ڕێڕەوی 7 قۆناغی ڕێککەوتن و گەڕانی سیستم", tr: "7 Aşamalı Ticaret Akışı ve Sistem Kaşif" },
  "nav.pre_deals": { en: "Pre-Deals", ar: "الصفقات المبدئية", fa: "پیش‌قراردادها", ku: "پێش-ڕێککەوتنەکان", tr: "Ön Anlaşmalar" },
  "nav.orders": { en: "Orders & Escrow", ar: "الطلبات والضمان", fa: "سفارشات و امانی", ku: "داواکارییەکان و پارەی ئەمانی", tr: "Siparişler ve Escrow" },
  "nav.finance": { en: "Trade Finance (L/C & D/P)", ar: "التمويل التجاري (L/C & D/P)", fa: "تأمین مالی تجارت (L/C & D/P)", ku: "دارایی بازرگانی (L/C & D/P)", tr: "Ticaret Finansmanı (L/C & D/P)" },
  "nav.shipments": { en: "Logistics & Tracking", ar: "اللوجستيات والتتبع", fa: "لجستیک و رهگیری", ku: "لۆجستیك و بەدواداچوون", tr: "Lojistik ve Takip" },
  "nav.billing": { en: "Master Account Billing", ar: "فواتير الحساب الرئيسي", fa: "صورتحساب حساب مستر", ku: "پارەدان و هەژماری سەرەکی", tr: "Master Hesap Faturalandırma" },
  "nav.analytics": { en: "AI / ML Analytics", ar: "تحليلات الذكاء الاصطناعي", fa: "تحلیل‌های هوش مصنوعی", ku: "شیکاری ژیری دەستکرد", tr: "Yapay Zeka / ML Analitiği" },
  "nav.kyc": { en: "KYC / AML Workflow", ar: "التحقق من الهوية (KYC/AML)", fa: "احراز هویت و ضدپولشویی", ku: "سەلماندنی ناسنامە (KYC/AML)", tr: "KYC / AML İş Akışı" },
  "nav.sanctions": { en: "Sanctions Screening", ar: "فحص العقوبات الدولية", fa: "غربالگری تحریم‌های بین‌المللی", ku: "پشکنینی سزاکان (سزای نێودەوڵەتی)", tr: "Yaptırım Taraması" },
  "nav.notifications": { en: "Notifications", ar: "الإشعارات", fa: "اعلان‌ها", ku: "ئاگادارییەکان", tr: "Bildirimler" },
  "nav.supabase": { en: "Supabase Core & RLS", ar: "قاعدة بيانات Supabase والأمان", fa: "پایگاه داده Supabase و RLS", ku: "بنکەی داتا Supabase و RLS", tr: "Supabase ve RLS" },
  "nav.microservices": { en: "Microservices Architecture", ar: "بنية الخدمات المصغرة", fa: "معماری میکروسرویس‌ها", ku: "تەلارسازی مایکرۆسێرڤیسەکان", tr: "Mikroservis Mimarisi" },
  "nav.hardening": { en: "HTTPS / Hardening Guide", ar: "دليل الأمان والتشفير", fa: "راهنمای امنیت و رمزنگاری", ku: "ڕێبەری ئاسایش و کۆدکردن", tr: "HTTPS / Güvenlik Rehberi" },

  "btn.logout": { en: "Log out", ar: "تسجيل الخروج", fa: "خروج", ku: "چوونە دەرەوە", tr: "Çıkış Yap" },
  "btn.signin": { en: "Sign in", ar: "تسجيل الدخول", fa: "ورود", ku: "چوونە ژوورەوە", tr: "Giriş Yap" },
  "btn.refresh": { en: "Refresh Pool", ar: "تحديث البيانات", fa: "بروزرسانی", ku: "نوێکردنەوەی داتا", tr: "Yenile" },
  "btn.submit": { en: "Submit", ar: "إرسال", fa: "ثبت", ku: "ناردن", tr: "Gönder" },

  "dash.welcome": { en: "B2B Trade Network Intelligence", ar: "لوحة ذكاء شبكة التجارة عبر الحدود", fa: "داشبورد هوشمند شبکه تجارت مرزی", ku: "پێشبینی ژیری تۆڕی بازرگانی سنووری", tr: "B2B Ticaret Ağı İstihbaratı" },
  "dash.showcase.title": { en: "MENA & Cross-Border Localization Gateway", ar: "بوابة التوطين ودعم اللغات في الشرق الأوسط", fa: "دروازه بومی‌سازی و پشتیبانی از زبان‌های منطقه", ku: "دەروازەی ناوچەیی و پشتگیری زمانەکانی ڕۆژهەڵاتی ناوەڕاست", tr: "Bölgesel Dil ve Yerelleştirme Vitrini" },
  "dash.showcase.desc": { en: "Tureep AI+ strictly enforces instant layout mirroring (dir='rtl') and rich native fonts for institutional trade corridors connecting Iraq, Iran, Turkey, and EU markets.", ar: "تطبق المنصة بشكل فوري دعم الاتجاه من اليمين إلى اليسار (RTL) مع خطوط أصلية فاخرة لتسهيل التجارة بين العراق وإيران وتركيا والأسواق العالمية.", fa: "این پلتفرم به صورت آنی جهت صفحه (RTL) و فونت‌های اصیل را برای تسهیل تجارت نهادی میان عراق، ایران، ترکیه و بازارهای جهانی تنظیم می‌کند.", ku: "پلاتفۆرمەکە بە شێوەیەکی خێرا ئاراستەی ڕاست بۆ چەپ (RTL) و فۆنتە ڕەسەنەکان جێبەجێ دەکات بۆ ئاسانکاری بازرگانی نێوان عێراق، ئێران، تورکیا و جیهان.", tr: "Platform, Irak, İran, Türkiye ve AB pazarlarını birbirine bağlayan kurumsal ticaret koridorları için anında RTL ayna düzenini ve yerel fontları uygular." },

  "dash.metrics.prods": { en: "Listed Products", ar: "المنتجات المعروضة", fa: "محصولات ثبت‌شده", ku: "بەرهەمە تۆمارکراوەکان", tr: "Ürünler" },
  "dash.metrics.demands": { en: "Active Demands", ar: "الطلبات النشطة", fa: "تقاضاهای فعال", ku: "داواکارییە چالاکەکان", tr: "Talepler" },
  "dash.metrics.deals": { en: "Active Pre-Deals", ar: "الصفقات المبدئية النشطة", fa: "پیش‌قراردادهای فعال", ku: "پێش-ڕێککەوتنە چالاکەکان", tr: "Aktif Ön Anlaşmalar" },
  "dash.metrics.accepted": { en: "Accepted Deals", ar: "الصفقات المعتمدة", fa: "قراردادهای تاییدشده", ku: "ڕێککەوتنە پەسەندکراوەکان", tr: "Kabul Edilen Anlaşmalar" },
  "dash.metrics.orders": { en: "Active Orders", ar: "أوامر الشراء النشطة", fa: "سفارشات فعال", ku: "کڕینە چالاکەکان", tr: "Aktif Siparişler" },

  "dash.kyc.title": { en: "KYC Identity Audit", ar: "التحقق من الهوية (KYC)", fa: "تایید احراز هویت", ku: "سەلماندنی ناسنامە", tr: "KYC Doğrulaması" },
  "dash.sanctions.title": { en: "Global Sanctions Check", ar: "فحص العقوبات الدولية", fa: "غربالگری تحریم‌ها", ku: "پشکنینی سزای نێودەوڵەتی", tr: "Yaptırım Taraması" },
  
  // Impeccable mapping for user headline
  "dash.deals.title": { en: "Active Institutional Pre-Deals", ar: "الصفقات المبدئية المؤسسية النشطة", fa: "پیش‌قراردادهای نهادی فعال", ku: "پێش-ڕێککەوتنە دامەزراوەییە چالاکەکان", tr: "Aktif Kurumsal Ön Anlaşmalar" },
  "Active Institutional Pre-Deals": { en: "Active Institutional Pre-Deals", ar: "الصفقات المبدئية المؤسسية النشطة", fa: "پیش‌قراردادهای نهادی فعال", ku: "پێش-ڕێککەوتنە دامەزراوەییە چالاکەکان", tr: "Aktif Kurumsal Ön Anlaşmalar" },

  "btn.viewall": { en: "View all", ar: "عرض الكل", fa: "مشاهده همه", ku: "بینینی هەمووی", tr: "Tümünü Gör" },
  "btn.review": { en: "Review Handshake", ar: "مراجعة الصفقة", fa: "بررسی معامله", ku: "پێداچوونەوەی ڕێککەوتن", tr: "Anlaşmayı İncele" },
  "btn.verify": { en: "Verify Proof", ar: "توثيق الهوية الآن", fa: "تایید مدارک", ku: "سەلماندنی بەڵگەنامە", tr: "Doğrula" },
  "btn.screen": { en: "Execute Sweep", ar: "إجراء فحص فوري", fa: "اجرای غربالگری", ku: "ئەنجامدانی پشکنین", tr: "Tara" },
};

// --------------------------------------------------------------------
// 🌟 CUSTOM FLOATING MULTI-LANGUAGE SWITCHER COMPONENT
// Embeds permanently at the bottom center of any screen
// --------------------------------------------------------------------
function UniversalLanguageBar() {
  const { language, setLanguage } = useI18n();

  const chips: Array<{ id: Language; label: string; flag: string }> = [
    { id: "ar", label: "العربية", flag: "🇸🇦" },
    { id: "tr", label: "Türkçe", flag: "🇹🇷" },
    { id: "ku", label: "کوردی", flag: "☀️" },
    { id: "fa", label: "فارسی", flag: "🇮🇷" },
    { id: "en", label: "English", flag: "🇬🇧" },
  ];

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9999] bg-slate-950/90 border-2 border-yellow-500/80 p-1.5 rounded-full flex items-center gap-1 shadow-2xl backdrop-blur-md select-none font-mono text-xs">
      <span className="text-yellow-400 font-extrabold px-2.5 hidden sm:inline select-none">🌐 Locale:</span>
      {chips.map((c) => {
        const isSel = language === c.id;
        return (
          <button
            key={c.id}
            onClick={() => setLanguage(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
              isSel
                ? "bg-yellow-500 text-black shadow-md scale-105"
                : "text-white hover:bg-white/10 hover:text-yellow-300"
            }`}
          >
            <span className="text-sm select-none">{c.flag}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}

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

  const dir = language === "ar" || language === "fa" || language === "ku" ? "rtl" : "ltr";

  // Dynamic explicit Web Fonts application for Arabic, Persian, Kurdish, and Turkish
  const fontFamily = language === "ar" || language === "ku" ? "'Noto Sans Arabic', sans-serif" : language === "fa" ? "'Vazirmatn', sans-serif" : "'Inter', sans-serif";

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
    if (!key) return fallback || "";
    let entry = DICTIONARY[key];
    if (!entry) {
      // Reverse lookup by exact English text or fallback match
      const foundKey = Object.keys(DICTIONARY).find(
        (k) => (DICTIONARY[k]?.en?.toLowerCase() === key.toLowerCase()) || (fallback && DICTIONARY[k]?.en?.toLowerCase() === fallback.toLowerCase())
      );
      if (foundKey) {
        entry = DICTIONARY[foundKey];
      }
    }
    if (!entry) return fallback || key;
    return (entry as any)[language] || entry.en || fallback || key;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, dir, t }}>
      <div dir={dir} style={{ fontFamily }} className={`min-h-screen transition-all ${dir === "rtl" ? "text-right" : "text-left"}`}>
        {children}
      </div>
      <UniversalLanguageBar />
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
