import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Translations = {
  // Navigation
  'nav.vendors': { en: 'Vendors', ar: 'البائعون' },
  'nav.ai-readiness': { en: 'AI Readiness', ar: 'جاهزية الذكاء الاصطناعي' },
  'nav.community': { en: 'Community', ar: 'المجتمع' },
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.login': { en: 'Login', ar: 'تسجيل الدخول' },
  'nav.logout': { en: 'Logout', ar: 'تسجيل الخروج' },
  'nav.admin': { en: 'Admin Panel', ar: 'لوحة الإدارة' },
  
  // Home
  'home.title': { en: 'Meyden AI Marketplace', ar: 'سوق ميادة للذكاء الاصطناعي' },
  'home.subtitle': { en: 'Discover AI vendors, assess readiness, and connect with the region\'s leading AI ecosystem', ar: 'اكتشف بائعي الذكاء الاصطناعي، وقيّم الجاهزية، وتواصل مع رائدة نظام الذكاء الاصطناعي الإقليمي' },
  'home.cta.explore': { en: 'Explore Vendors', ar: 'استكشف البائعين' },
  'home.cta.readiness': { en: 'Check AI Readiness', ar: 'افحص جاهزية الذكاء الاصطناعي' },
  'home.cta.community': { en: 'Join Community', ar: 'انضم للمجتمع' },
  
  // Authentication
  'auth.title': { en: 'Welcome to Meyden', ar: 'مرحباً بكم في ميادة' },
  'auth.subtitle': { en: 'Sign in to access your AI ecosystem', ar: 'سجل الدخول للوصول إلى نظامك البيئي للذكاء الاصطناعي' },
  'auth.demo.accounts': { en: 'Demo Accounts', ar: 'الحسابات التجريبية' },
  'auth.demo.vendor': { en: 'Demo Vendor Account', ar: 'حساب بائع تجريبي' },
  'auth.demo.admin': { en: 'Demo Admin Account', ar: 'حساب إداري تجريبي' },
  'auth.demo.learner': { en: 'Demo Learner Account', ar: 'حساب متعلم تجريبي' },
  'auth.demo.login': { en: 'Login as {role}', ar: 'تسجيل الدخول ك{role}' },
  
  // Vendors
  'vendors.title': { en: 'AI Vendor Directory', ar: 'دليل بائعي الذكاء الاصطناعي' },
  'vendors.search': { en: 'Search vendors, services, or industries...', ar: 'ابحث عن البائعين أو الخدمات أو الصناعات...' },
  'vendors.filter.all': { en: 'All Tiers', ar: 'جميع المستويات' },
  'vendors.filter.premium': { en: 'Premium', ar: 'مميز' },
  'vendors.filter.standard': { en: 'Standard', ar: 'قياسي' },
  'vendors.filter.basic': { en: 'Basic', ar: 'أساسي' },
  'vendors.rating': { en: 'Rating', ar: 'التقييم' },
  'vendors.reviews': { en: 'reviews', ar: 'مراجعات' },
  'vendors.years': { en: 'years in business', ar: 'سنوات في العمل' },
  'vendors.employees': { en: 'employees', ar: 'موظف' },
  'vendors.contact': { en: 'Contact Vendor', ar: 'تواصل مع البائع' },
  'vendors.website': { en: 'Visit Website', ar: 'زيارة الموقع' },
  
  // AI Readiness
  'readiness.title': { en: 'AI Readiness Assessment', ar: 'تقييم جاهزية الذكاء الاصطناعي' },
  'readiness.subtitle': { en: 'Evaluate your organization\'s AI readiness across three key dimensions', ar: 'قيم جاهزية مؤسستك للذكاء الاصطناعي عبر ثلاثة أبعاد رئيسية' },
  'readiness.dimensions': { en: 'Dimensions', ar: 'الأبعاد' },
  'readiness.data': { en: 'Data Foundation', ar: 'أساسيات البيانات' },
  'readiness.governance': { en: 'AI Governance', ar: 'حوكمة الذكاء الاصطناعي' },
  'readiness.adoption': { en: 'Organizational Adoption', ar: 'تبني المؤسسة' },
  'readiness.start': { en: 'Start Assessment', ar: 'ابدأ التقييم' },
  'readiness.progress': { en: 'Question {current} of {total}', ar: 'السؤال {current} من {total}' },
  'readiness.next': { en: 'Next Question', ar: 'السؤال التالي' },
  'readiness.previous': { en: 'Previous', ar: 'السابق' },
  'readiness.complete': { en: 'Complete Assessment', ar: 'إكمال التقييم' },
  'readiness.results': { en: 'Assessment Results', ar: 'نتائج التقييم' },
  'readiness.download': { en: 'Download Report', ar: 'تحميل التقرير' },
  'readiness.retake': { en: 'Retake Assessment', ar: 'إعادة التقييم' },
  
  // Community
  'community.title': { en: 'AI Community Hub', ar: 'مركز مجتمع الذكاء الاصطناعي' },
  'community.subtitle': { en: 'Connect, share, and learn with AI professionals across MENA', ar: 'تصل وتشارك وتتعلم مع محترفي الذكاء الاصطناعي في منطقة الشرق الأوسط وشمال أفريقيا' },
  'community.new.post': { en: 'Create New Post', ar: 'إنشاء منشور جديد' },
  'community.post.title': { en: 'Post title...', ar: 'عنوان المنشور...' },
  'community.post.content': { en: 'Share your thoughts, questions, or insights...', ar: 'شارك أفكارك أو أسئلتك أو رؤيتك...' },
  'community.post.category': { en: 'Select category', ar: 'اختر الفئة' },
  'community.post.submit': { en: 'Publish Post', ar: 'نشر المنشور' },
  'community.likes': { en: 'likes', ar: 'إعجاب' },
  'community.replies': { en: 'replies', ar: 'رد' },
  'community.following': { en: 'Following', ar: 'متابعة' },
  'community.follow': { en: 'Follow', ar: 'متابعة' },
  
  // Admin
  'admin.title': { en: 'Platform Administration', ar: 'إدارة المنصة' },
  'admin.users': { en: 'Total Users', ar: 'إجمالي المستخدمين' },
  'admin.vendors': { en: 'Total Vendors', ar: 'إجمالي البائعين' },
  'admin.surveys': { en: 'Surveys Completed', ar: 'استطلاعات مكتملة' },
  'admin.engagement': { en: 'Community Engagement', ar: 'تفاعل المجتمع' },
  'admin.analytics': { en: 'Analytics Overview', ar: 'نظرة عامة على التحليلات' },
  
  // Common
  'common.loading': { en: 'Loading...', ar: 'جاري التحميل...' },
  'common.error': { en: 'Something went wrong', ar: 'حدث خطأ ما' },
  'common.success': { en: 'Success!', ar: 'نجح!' },
  'common.save': { en: 'Save', ar: 'حفظ' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.submit': { en: 'Submit', ar: 'إرسال' },
  'common.close': { en: 'Close', ar: 'إغلاق' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  const value = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};