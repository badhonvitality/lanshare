import { create } from 'zustand';

type Language = 'en' | 'bn';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
}));

export const translations = {
  en: {
    hostDashboard: "Host Dashboard",
    live: "LIVE",
    readyToShare: "Ready to share screen",
    startSharing: "Start Sharing",
    stopSharing: "Stop Sharing",
    viewers: "Viewers",
    connected: "connected",
    share: "Share",
    copied: "Copied",
    controls: "Controls",
    streamMode: "Stream Mode",
    source: "Source",
    smooth: "Smooth",
    sourceDesc: "Crisp text, code",
    smoothDesc: "Video, motion",
    resolution: "Resolution",
    framerate: "Framerate",
    roomPin: "Room PIN",
    sharePlaceholder: "Share link and QR code will appear here",
    connectionFailed: "Connection Failed",
    tryReconnecting: "Try Reconnecting",
    tryAgain: "Try Again",
    enterPin: "Enter PIN",
    enterPinDesc: "Please enter the 4-digit PIN to view this screen",
    joinRoom: "Join Room",
    connecting: "Connecting",
    fit: "FIT",
    fill: "FILL",
    connectingToHost: "Connecting to host...",
    language: "Language",
  },
  bn: {
    hostDashboard: "হোস্ট ড্যাশবোর্ড",
    live: "লাইভ",
    readyToShare: "স্ক্রিন শেয়ারের জন্য প্রস্তুত",
    startSharing: "শেয়ার শুরু করুন",
    stopSharing: "শেয়ার বন্ধ করুন",
    viewers: "ভিউয়ার",
    connected: "যুক্ত আছেন",
    share: "শেয়ার",
    copied: "কপি করা হয়েছে",
    controls: "নিয়ন্ত্রণ",
    streamMode: "স্ট্রিম মোড",
    source: "সোর্স",
    smooth: "স্মুথ",
    sourceDesc: "ক্লিয়ার টেক্সট, কোড",
    smoothDesc: "ভিডিও, মোশন",
    resolution: "রেজোলিউশন",
    framerate: "ফ্রেমরেট",
    roomPin: "রুম পিন",
    sharePlaceholder: "শেয়ার লিংক এবং কিউআর কোড এখানে দেখা যাবে",
    connectionFailed: "সংযোগ বিচ্ছিন্ন হয়েছে",
    tryReconnecting: "আবার চেষ্টা করুন",
    tryAgain: "আবার চেষ্টা করুন",
    enterPin: "পিন প্রবেশ করুন",
    enterPinDesc: "স্ক্রিন দেখতে দয়া করে ৪-ডিজিটের পিন দিন",
    joinRoom: "রুমে জয়েন করুন",
    connecting: "সংযুক্ত হচ্ছে",
    fit: "ফিট",
    fill: "ভরাট",
    connectingToHost: "হোস্টের সাথে সংযুক্ত হচ্ছে...",
    language: "ভাষা",
  }
};

export const useTranslation = () => {
  const { language } = useI18nStore();
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key];
  };
  return { t, language };
};
