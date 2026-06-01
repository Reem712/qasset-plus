"use client"
import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react"

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const STORAGE_KEYS = { phones: "qasset_phones", orders: "qasset_orders", settings: "qasset_settings" }

const loadFromStorage = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
const saveToStorage = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INITIAL_PHONES = [
  { id:"1", name:"iPhone 15 Pro Max", brand:"Apple", price:55000, tagline:"تيتانيوم. قوة. دقة.", description:"أقوى آيفون على الإطلاق — شريحة A17 Pro بـ 3nm، إطار تيتانيوم درجة 5، وكاميرا رئيسية 48MP مع تصوير RAW احترافي.", image:"https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg", available:true, hot:true, color:"#4F7CFF", specs:{الشريحة:"A17 Pro",الذاكرة:"8 GB",التخزين:"256 GB",الكاميرا:"48 MP",البطارية:"4422 mAh",الشاشة:'6.7"'} },
  { id:"2", name:"Samsung Galaxy S24 Ultra", brand:"Samsung", price:48000, tagline:"ذكاء اصطناعي. قلم. سيادة.", description:"Galaxy AI على شريحة Snapdragon 8 Gen 3، قلم S Pen مدمج، وكاميرا تليفوتو 50MP بزووم 5x بصري.", image:"https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra5g.jpg", available:true, hot:true, color:"#00C2FF", specs:{الشريحة:"Snapdragon 8 Gen 3",الذاكرة:"12 GB",التخزين:"256 GB",الكاميرا:"200 MP",البطارية:"5000 mAh",الشاشة:'6.8"'} },
  { id:"3", name:"Xiaomi 14 Ultra", brand:"Xiaomi", price:32000, tagline:"Leica. ضوء. فن.", description:"أربع كاميرات Leica بفتحة عدسة f/1.63، شاشة LTPO AMOLED بـ 120Hz، وشحن سريع 90W.", image:"https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg", available:true, hot:false, color:"#FF6B35", specs:{الشريحة:"Snapdragon 8 Gen 3",الذاكرة:"16 GB",التخزين:"512 GB",الكاميرا:"50 MP Leica",البطارية:"5000 mAh",الشاشة:'6.73"'} },
  { id:"4", name:"OPPO Find X7 Pro", brand:"OPPO", price:28000, tagline:"Hasselblad. سرعة. فخامة.", description:"كاميرا Hasselblad احترافية، شحن سريع SuperVOOC 100W، وشاشة AMOLED منحنية بدقة 2K.", image:"https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x7-pro.jpg", available:true, hot:false, color:"#7C5CFC", specs:{الشريحة:"Dimensity 9300",الذاكرة:"12 GB",التخزين:"256 GB",الكاميرا:"50 MP",البطارية:"5000 mAh",الشاشة:'6.82"'} },
  { id:"5", name:"iPhone 14", brand:"Apple", price:38000, tagline:"XDR. أمان. استمرارية.", description:"شاشة Super Retina XDR، نظام كاميرا مزدوج 12MP، وخاصية الطوارئ عبر الأقمار الصناعية.", image:"https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg", available:false, hot:false, color:"#94A3B8", specs:{الشريحة:"A15 Bionic",الذاكرة:"6 GB",التخزين:"128 GB",الكاميرا:"12 MP",البطارية:"3279 mAh",الشاشة:'6.1"'} },
  { id:"6", name:"Samsung Galaxy A54", brand:"Samsung", price:14000, tagline:"قوة. بطولة. اقتصاد.", description:"Super AMOLED بـ 120Hz، كاميرا 50MP مع OIS، بطارية 5000mAh، وحماية IP67.", image:"https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg", available:true, hot:false, color:"#10D9A0", specs:{الشريحة:"Exynos 1380",الذاكرة:"8 GB",التخزين:"128 GB",الكاميرا:"50 MP",البطارية:"5000 mAh",الشاشة:'6.4"'} },
]

const INITIAL_ORDERS = [
  {id:"o1",pid:"1",pname:"iPhone 15 Pro Max",name:"أحمد محمود",phone:"0101234567",city:"القاهرة",status:"approved",notes:"12 شهر",date:"2025-05-10"},
  {id:"o2",pid:"2",pname:"Samsung S24 Ultra",name:"مريم السيد",phone:"0122345678",city:"الإسكندرية",status:"new",notes:"6 أشهر",date:"2025-05-15"},
  {id:"o3",pid:"3",pname:"Xiaomi 14 Ultra",name:"خالد عمر",phone:"0103456789",city:"الجيزة",status:"pending",notes:"18 شهر",date:"2025-05-16"},
  {id:"o4",pid:"6",pname:"Samsung Galaxy A54",name:"نورا حسن",phone:"0114567890",city:"المنصورة",status:"rejected",notes:"12 شهر",date:"2025-05-17"},
  {id:"o5",pid:"1",pname:"iPhone 15 Pro Max",name:"عمر عبدالله",phone:"0125678901",city:"طنطا",status:"new",notes:"24 شهر",date:"2025-05-18"},
  {id:"o6",pid:"4",pname:"OPPO Find X7 Pro",name:"سارة إبراهيم",phone:"0106789012",city:"أسيوط",status:"pending",notes:"6 أشهر",date:"2025-05-19"},
]

const PLANS = {
  "1":[{id:"p1",m:6,mo:9500,dp:2000},{id:"p2",m:12,mo:4800,dp:3000},{id:"p3",m:18,mo:3400,dp:4000},{id:"p4",m:24,mo:2700,dp:5000}],
  "2":[{id:"p5",m:6,mo:8200,dp:2000},{id:"p6",m:12,mo:4200,dp:3000},{id:"p7",m:18,mo:2900,dp:3500},{id:"p8",m:24,mo:2300,dp:4000}],
  "3":[{id:"p9",m:6,mo:5500,dp:1500},{id:"p10",m:12,mo:2800,dp:2000},{id:"p11",m:18,mo:1950,dp:2500},{id:"p12",m:24,mo:1550,dp:3000}],
  "4":[{id:"p13",m:6,mo:4800,dp:1000},{id:"p14",m:12,mo:2450,dp:1500},{id:"p15",m:18,mo:1700,dp:2000}],
  "6":[{id:"p16",m:6,mo:2400,dp:500},{id:"p17",m:12,mo:1250,dp:800}],
}

const USERS = [{email:"admin@qasset.com",password:"admin123",name:"المدير"}]

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  ar: {
    dir:"rtl",
    brand:"QASSET",brandSub:"PLUS",
    nav:{home:"الرئيسية",phones:"الأجهزة",order:"اطلب الآن",dashboard:"لوحة التحكم",login:"دخول"},
    hero:{
      badge:"عروض حصرية · محدودة",
      h1:"موبايلك الجديد",h2:"بأقساط مريحة",h3:"بدون مفاجآت",
      desc:"أحدث الهواتف من Apple وSamsung وXiaomi — أقساط تبدأ من 6 أشهر، موافقة خلال 24 ساعة، توصيل لكل مصر.",
      cta1:"تصفح الأجهزة",cta2:"اطلب الآن",
      stat1:"عميل راضٍ",stat2:"وقت الرد",stat3:"شهر تقسيط",
    },
    features:[["موافقة في 24 ساعة","رد سريع على طلبك"],["أقساط مرنة","من 6 لـ 24 شهر"],["ضمان أصلي 100%","جميع الأجهزة موثّقة"],["توصيل لكل مصر","جميع المحافظات"]],
    catalog:"كتالوج الأجهزة",catalogTitle:"اختار جهازك",catalogSub:"المناسب",
    viewAll:"عرض الكل",
    cta:{label:"تواصل معنا",h:"جاهز تقسّط",h2:"موبايلك؟",sub:"هنساعدك تختار المناسب وتبدأ على طول",btn:"تواصل عبر واتساب"},
    footer:{desc:"منصتك الأولى لتقسيط أحدث الهواتف الذكية في مصر — شروط ميسّرة، شفافية تامة، وخدمة احترافية.",links:"روابط",contact:"تواصل",made:"صُنع بعناية في مصر",orderLink:"طلب تقسيط",loginLink:"تسجيل الدخول"},
    phones:{title:"الأجهزة",sub:"المتاحة",available:"جهاز متاح للتقسيط الآن",all:"الكل",onlyAvail:"متاح فقط",search:"ابحث بالاسم..."},
    detail:{back:"رجوع للأجهزة",fullPrice:"السعر الكلي",availNow:"متاح الآن",notAvail:"غير متاح",calc:"حاسبة الأقساط",month:"شهر",advance:"المقدم المطلوب",duration:"مدة التقسيط",total:"إجمالي الأقساط",monthly:"القسط الشهري",waBtn:"اطلب عبر واتساب"},
    order:{label:"نموذج الطلب",title:"طلب",titleGold:"التقسيط",sub:"أملا البيانات وهنتواصل معك فوراً",name:"الاسم الكامل",phone:"رقم الهاتف",city:"المدينة",device:"الجهاز المطلوب",duration:"مدة التقسيط",notes:"ملاحظات",notesPh:"أي تفاصيل إضافية...",send:"إرسال الطلب",sending:"جاري الإرسال...",doneTitle:"تم إرسال طلبك!",doneDesc:"هيتواصل معك فريقنا خلال 24-48 ساعة",doneBtn:"العودة للرئيسية"},
    login:{welcome:"أهلاً بيك",sub:"سجّل دخولك للوصول للوحة التحكم",email:"البريد الإلكتروني",password:"كلمة المرور",btn:"دخول",loading:"جاري التحقق...",noAcc:"مش عندك حساب؟",signup:"سجّل الآن",err:"البريد الإلكتروني أو كلمة المرور غلط"},
    signup:{title:"حساب جديد",sub:"أنشئ حسابك للوصول للوحة التحكم",name:"الاسم الكامل",email:"البريد الإلكتروني",password:"كلمة المرور",confirm:"تأكيد كلمة المرور",btn:"إنشاء الحساب",loading:"جاري الإنشاء...",hasAcc:"عندك حساب؟",login:"سجّل دخولك",errMatch:"كلمتا المرور مش متطابقتين",errShort:"كلمة المرور أقل من 6 أحرف"},
    dash:{
      welcome:"مرحباً بيك",sub:"نظرة عامة على أداء المتجر",
      nav:{overview:"نظرة عامة",phones:"الأجهزة",orders:"الطلبات",plans:"الأقساط",analytics:"الإحصائيات",customers:"العملاء",settings:"الإعدادات"},
      publicSite:"الموقع العام",logout:"خروج",
      stats:["إجمالي الأجهزة","إجمالي الطلبات","طلبات مقبولة","إيرادات تقديرية"],
      statSub:["متاح","جديد","هذا الشهر","ج.م هذا الشهر"],
      lastOrders:"آخر الطلبات",brands:"البراندات",
      phonesTitle:"إدارة الأجهزة",addPhone:"إضافة جهاز",cancel:"إلغاء",
      newDevice:"جهاز جديد",save:"حفظ",editDevice:"تعديل الجهاز",
      fields:["اسم الجهاز","البراند","السعر (ج.م)","وصف قصير","Tagline"],
      tHeaders:["الجهاز","البراند","السعر","الحالة","إجراءات"],
      active:"ACTIVE",inactive:"INACTIVE",stop:"إيقاف",activate:"تفعيل",delete:"حذف",edit:"تعديل",
      ordersTitle:"إدارة الطلبات",filterAll:"الكل",
      oHeaders:["العميل","الجهاز","المدينة","الأقساط","الحالة","تغيير"],
      plansTitle:"خطط الأقساط",
      analyticsTitle:"الإحصائيات",byStatus:"حسب الحالة",byCity:"حسب المدينة",
      kpis:["معدل القبول","متوسط السعر","أجهزة متاحة"],
      customersTitle:"قاعدة العملاء",
      cHeaders:["العميل","رقم الهاتف","المدينة","الجهاز","الحالة"],
      settingsTitle:"إعدادات المتجر",storeInfo:"معلومات المتجر",
      sFields:["اسم المتجر","رقم واتساب","البريد الإلكتروني","العنوان"],
      saveSettings:"حفظ الإعدادات",saved:"تم الحفظ",
      accInfo:"معلومات الحساب",accFields:["الاسم","الإيميل","الصلاحية"],
      accVals:["المدير","admin@qasset.com","Admin"],
      searchPh:"ابحث عن جهاز...",
      imageUrl:"رابط الصورة",uploadImg:"رفع صورة",
      confirmDelete:"هل تريد حذف هذا الجهاز؟",
      hotLabel:"مميز",
    },
    outOfStock:"OUT OF STOCK",
    totalPrice:"السعر الكلي",startFrom:"يبدأ من",perMonth:" ج.م/شهر",
    st:{new:"جديد",pending:"معلق",approved:"مقبول",rejected:"مرفوض"},
  },
  en: {
    dir:"ltr",
    brand:"QASSET",brandSub:"PLUS",
    nav:{home:"Home",phones:"Devices",order:"Order Now",dashboard:"Dashboard",login:"Login"},
    hero:{
      badge:"EXCLUSIVE DEALS · LIMITED",
      h1:"Your New Phone",h2:"Easy Installments",h3:"No Surprises",
      desc:"Latest phones from Apple, Samsung & Xiaomi — installments from 6 months, approval within 24 hours, delivery across Egypt.",
      cta1:"Browse Devices",cta2:"Order Now",
      stat1:"Happy Clients",stat2:"Response Time",stat3:"Months Plan",
    },
    features:[["24h Approval","Fast response to your request"],["Flexible Plans","6 to 24 months"],["100% Genuine","All devices verified"],["Nationwide Delivery","All governorates"]],
    catalog:"DEVICE CATALOG",catalogTitle:"Find Your",catalogSub:"Perfect Phone",
    viewAll:"View All",
    cta:{label:"CONTACT US",h:"Ready to",h2:"Installment?",sub:"We'll help you choose the right one",btn:"Chat on WhatsApp"},
    footer:{desc:"Egypt's #1 platform for smartphone installments — easy terms, full transparency, professional service.",links:"Links",contact:"Contact",made:"Made with care in Egypt",orderLink:"Installment Request",loginLink:"Login"},
    phones:{title:"Devices",sub:"Available",available:"devices available for installment",all:"All",onlyAvail:"Available Only",search:"Search by name..."},
    detail:{back:"Back to Devices",fullPrice:"Full Price",availNow:"Available Now",notAvail:"Out of Stock",calc:"Installment Calculator",month:"mo",advance:"Down Payment",duration:"Duration",total:"Total Installments",monthly:"Monthly Payment",waBtn:"Order via WhatsApp"},
    order:{label:"ORDER FORM",title:"Installment",titleGold:"Request",sub:"Fill in details and we'll contact you",name:"Full Name",phone:"Phone Number",city:"City",device:"Device",duration:"Plan Duration",notes:"Notes",notesPh:"Any extra details...",send:"Submit Request",sending:"Sending...",doneTitle:"Request Sent!",doneDesc:"Our team will contact you within 24-48 hours",doneBtn:"Back to Home"},
    login:{welcome:"Welcome Back",sub:"Login to access the dashboard",email:"Email",password:"Password",btn:"Login",loading:"Verifying...",noAcc:"No account?",signup:"Sign Up",err:"Wrong email or password"},
    signup:{title:"New Account",sub:"Create your account to access the dashboard",name:"Full Name",email:"Email",password:"Password",confirm:"Confirm Password",btn:"Create Account",loading:"Creating...",hasAcc:"Have an account?",login:"Login",errMatch:"Passwords don't match",errShort:"Password must be at least 6 characters"},
    dash:{
      welcome:"Welcome Back",sub:"Store performance overview",
      nav:{overview:"Overview",phones:"Devices",orders:"Orders",plans:"Plans",analytics:"Analytics",customers:"Customers",settings:"Settings"},
      publicSite:"Public Site",logout:"Logout",
      stats:["Total Devices","Total Orders","Approved Orders","Est. Revenue"],
      statSub:["available","new","this month","EGP this month"],
      lastOrders:"Recent Orders",brands:"Brands",
      phonesTitle:"Manage Devices",addPhone:"Add Device",cancel:"Cancel",
      newDevice:"New Device",save:"Save",editDevice:"Edit Device",
      fields:["Device Name","Brand","Price (EGP)","Short Description","Tagline"],
      tHeaders:["Device","Brand","Price","Status","Actions"],
      active:"ACTIVE",inactive:"INACTIVE",stop:"Disable",activate:"Enable",delete:"Delete",edit:"Edit",
      ordersTitle:"Manage Orders",filterAll:"All",
      oHeaders:["Client","Device","City","Plan","Status","Change"],
      plansTitle:"Installment Plans",
      analyticsTitle:"Analytics",byStatus:"By Status",byCity:"By City",
      kpis:["Approval Rate","Avg Price","Available Devices"],
      customersTitle:"Customer Base",
      cHeaders:["Client","Phone","City","Device","Status"],
      settingsTitle:"Store Settings",storeInfo:"Store Information",
      sFields:["Store Name","WhatsApp Number","Email","Address"],
      saveSettings:"Save Settings",saved:"Saved",
      accInfo:"Account Info",accFields:["Name","Email","Role"],
      accVals:["Manager","admin@qasset.com","Admin"],
      searchPh:"Search devices...",
      imageUrl:"Image URL",uploadImg:"Upload Image",
      confirmDelete:"Delete this device?",
      hotLabel:"Featured",
    },
    outOfStock:"OUT OF STOCK",
    totalPrice:"Full Price",startFrom:"From",perMonth:" EGP/mo",
    st:{new:"New",pending:"Pending",approved:"Approved",rejected:"Rejected"},
  }
}

// ─── CONTEXTS ─────────────────────────────────────────────────────────────────
const AuthCtx = createContext(null)
const ThemeCtx = createContext(null)
const LangCtx = createContext(null)
const DataCtx = createContext(null)

const useAuth = () => useContext(AuthCtx)
const useTheme = () => useContext(ThemeCtx)
const useLang = () => useContext(LangCtx)
const useData = () => useContext(DataCtx)

// ─── FIX: AuthProvider — read localStorage only in useEffect ──────────────────
function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // always null on first render (SSR-safe)

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("qu") || "null")) } catch {}
  }, [])

  const login = (e, p) => {
    const f = USERS.find(u => u.email === e && u.password === p)
    if (f) { setUser(f); localStorage.setItem("qu", JSON.stringify(f)); return true }
    return false
  }
  const signup = (e, p, n) => {
    const u = { email: e, password: p, name: n }
    USERS.push(u); setUser(u); localStorage.setItem("qu", JSON.stringify(u)); return true
  }
  const logout = () => { setUser(null); localStorage.removeItem("qu") }

  return <AuthCtx.Provider value={{ user, login, signup, logout }}>{children}</AuthCtx.Provider>
}

// ─── FIX: ThemeProvider — always start dark=true (SSR default), load from storage after mount ──
function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true) // consistent SSR default

  useEffect(() => {
    try {
      const s = localStorage.getItem("qdark")
      if (s !== null) setDark(s === "1")
    } catch {}
  }, [])

  const toggle = () => {
    setDark(d => { localStorage.setItem("qdark", d ? "0" : "1"); return !d })
  }

  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>
}

// ─── FIX: LangProvider — always start lang="ar" (SSR default), load from storage after mount ──
function LangProvider({ children }) {
  const [lang, setLang] = useState("ar") // consistent SSR default

  useEffect(() => {
    try {
      const s = localStorage.getItem("qlang")
      if (s) setLang(s)
    } catch {}
  }, [])

  const toggle = () => {
    setLang(l => { const n = l === "ar" ? "en" : "ar"; localStorage.setItem("qlang", n); return n })
  }

  return <LangCtx.Provider value={{ lang, toggle, t: T[lang] }}>{children}</LangCtx.Provider>
}

// ─── FIX: DataProvider — start with INITIAL data, load from storage after mount ──
function DataProvider({ children }) {
  const [phones, setPhones] = useState(INITIAL_PHONES) // consistent SSR default
  const [orders, setOrders] = useState(INITIAL_ORDERS) // consistent SSR default

  useEffect(() => {
    // Only runs on client after hydration — safe to read localStorage here
    const storedPhones = loadFromStorage(STORAGE_KEYS.phones, INITIAL_PHONES)
    const storedOrders = loadFromStorage(STORAGE_KEYS.orders, INITIAL_ORDERS)
    setPhones(storedPhones)
    setOrders(storedOrders)
  }, [])

  const updatePhones = useCallback((newPhones) => {
    setPhones(newPhones)
    saveToStorage(STORAGE_KEYS.phones, newPhones)
  }, [])

  const updateOrders = useCallback((newOrders) => {
    setOrders(newOrders)
    saveToStorage(STORAGE_KEYS.orders, newOrders)
  }, [])

  const addPhone = useCallback((phone) => {
    setPhones(prev => { const n = [phone, ...prev]; saveToStorage(STORAGE_KEYS.phones, n); return n })
  }, [])

  const editPhone = useCallback((id, updates) => {
    setPhones(prev => { const n = prev.map(p => p.id === id ? { ...p, ...updates } : p); saveToStorage(STORAGE_KEYS.phones, n); return n })
  }, [])

  const deletePhone = useCallback((id) => {
    setPhones(prev => { const n = prev.filter(p => p.id !== id); saveToStorage(STORAGE_KEYS.phones, n); return n })
  }, [])

  const togglePhone = useCallback((id) => {
    setPhones(prev => { const n = prev.map(p => p.id === id ? { ...p, available: !p.available } : p); saveToStorage(STORAGE_KEYS.phones, n); return n })
  }, [])

  const addOrder = useCallback((order) => {
    setOrders(prev => { const n = [order, ...prev]; saveToStorage(STORAGE_KEYS.orders, n); return n })
  }, [])

  const updateOrderStatus = useCallback((id, status) => {
    setOrders(prev => { const n = prev.map(o => o.id === id ? { ...o, status } : o); saveToStorage(STORAGE_KEYS.orders, n); return n })
  }, [])

  return (
    <DataCtx.Provider value={{ phones, orders, addPhone, editPhone, deletePhone, togglePhone, addOrder, updateOrderStatus }}>
      {children}
    </DataCtx.Provider>
  )
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const ST_CONFIG = {
  new:      {c:"#60A5FA",bg:"rgba(96,165,250,.1)"},
  pending:  {c:"#F59E0B",bg:"rgba(245,158,11,.1)"},
  approved: {c:"#10D9A0",bg:"rgba(16,217,160,.1)"},
  rejected: {c:"#FF6B6B",bg:"rgba(255,107,107,.1)"},
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Cairo:wght@400;500;600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
  --brand-1: #4F7CFF;
  --brand-2: #7C5CFC;
  --brand-3: #00C2FF;
  --accent:  #FF6B35;
  --green:   #10D9A0;
  --gold:    #F59E0B;
  --red:     #FF6B6B;
}

[data-theme="dark"] {
  --bg:       #070B14;
  --bg2:      #0D1220;
  --surface:  #0F1628;
  --surface2: #131A30;
  --surface3: #1A2240;
  --wire:     rgba(79,124,255,.1);
  --wire2:    rgba(79,124,255,.18);
  --wire3:    rgba(79,124,255,.3);
  --tx:       #EEF2FF;
  --tx2:      #8FA4CC;
  --tx3:      #3D5080;
  --blT:      rgba(79,124,255,.1);
  --blT2:     rgba(79,124,255,.05);
  --shadow:   rgba(0,0,0,.7);
  --navBg:    rgba(7,11,20,.92);
}

[data-theme="light"] {
  --bg:       #F4F6FF;
  --bg2:      #E8EEFF;
  --surface:  #FFFFFF;
  --surface2: #F0F3FF;
  --surface3: #E4EAFF;
  --wire:     rgba(79,124,255,.1);
  --wire2:    rgba(79,124,255,.2);
  --wire3:    rgba(79,124,255,.35);
  --tx:       #0D1530;
  --tx2:      #2A3F70;
  --tx3:      #7080A8;
  --blT:      rgba(79,124,255,.08);
  --blT2:     rgba(79,124,255,.04);
  --shadow:   rgba(79,124,255,.12);
  --navBg:    rgba(244,246,255,.95);
}

html { scroll-behavior: smooth }
body {
  background: var(--bg);
  color: var(--tx);
  font-family: 'Sora', 'Cairo', sans-serif;
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
  font-size: 15px;
  transition: background .3s, color .3s;
}
a { text-decoration: none; color: inherit }
button { font-family: inherit; cursor: pointer; border: none; outline: none; background: none }
input, select, textarea { font-family: inherit; outline: none }
img { max-width: 100%; display: block }

::-webkit-scrollbar { width: 3px }
::-webkit-scrollbar-track { background: var(--bg) }
::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 2px }
::-webkit-scrollbar-thumb:hover { background: var(--brand-1) }

@keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes float    { 0%,100%{transform:translateY(0) rotate(-.3deg)} 50%{transform:translateY(-14px) rotate(.3deg)} }
@keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.75)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes scanH    { 0%{transform:translateX(120%)} 100%{transform:translateX(-120%)} }
@keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(79,124,255,.2)} 50%{box-shadow:0 0 40px rgba(79,124,255,.5)} }
@keyframes shimmer  { 0%{background-position:-400% center} 100%{background-position:400% center} }

.fu  { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both }
.fi  { animation: fadeIn .4s ease both }
.flt { animation: float 7s ease-in-out infinite }
.d1  { animation-delay: .07s } .d2 { animation-delay: .14s }
.d3  { animation-delay: .21s } .d4 { animation-delay: .28s }
.d5  { animation-delay: .35s } .d6 { animation-delay: .42s }

.grad-text {
  background: linear-gradient(135deg, var(--brand-1), var(--brand-3), var(--brand-2));
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradMove 5s ease infinite;
}

.mono { font-family: 'IBM Plex Mono', monospace !important; }

.label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--brand-1);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--brand-2), var(--brand-1), var(--brand-3));
  background-size: 200% 200%;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  border-radius: 12px;
  transition: all .35s cubic-bezier(.22,1,.36,1);
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(79,124,255,.25);
  animation: gradMove 6s ease infinite;
}
.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(79,124,255,.45);
  filter: brightness(1.1);
}
.btn-primary:active { transform: translateY(-1px) }
.btn-primary:disabled { opacity: .5; pointer-events: none }

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: var(--tx2);
  border: 1px solid var(--wire2);
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  transition: all .25s;
  cursor: pointer;
}
.btn-outline:hover { background: var(--surface); color: var(--tx); border-color: var(--wire3) }

.inp {
  width: 100%;
  background: var(--surface2);
  border: 1.5px solid var(--wire);
  border-radius: 10px;
  padding: 11px 16px;
  color: var(--tx);
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  transition: border-color .2s, box-shadow .2s, background .2s;
}
.inp:focus { border-color: var(--brand-1); box-shadow: 0 0 0 3px rgba(79,124,255,.1); background: var(--surface) }
.inp::placeholder { color: var(--tx3) }

.pcard {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--wire);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s, border-color .3s;
}
.pcard:hover {
  transform: translateY(-10px);
  box-shadow: 0 32px 64px var(--shadow);
  border-color: var(--wire2);
}

.trow:hover td { background: var(--surface2) !important }
.trow td { transition: background .12s }

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  color: var(--tx3);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: all .2s;
  border: none;
  background: none;
  text-align: right;
  position: relative;
}
.nav-item:hover { background: var(--surface2); color: var(--tx2) }
.nav-item.active { background: var(--blT); color: var(--brand-1) }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn .2s ease;
}
.modal-box {
  background: var(--surface);
  border-radius: 24px;
  border: 1px solid var(--wire2);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeUp .3s cubic-bezier(.22,1,.36,1);
  box-shadow: 0 40px 80px rgba(0,0,0,.5);
}
`

function InjectCSS() { return <style dangerouslySetInnerHTML={{__html:CSS}}/> }

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ic = {
  logo:    (s=22)=><svg width={s} height={s} viewBox="0 0 32 32" fill="none"><rect x="8" y="2" width="16" height="28" rx="4" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="7" width="8" height="1.5" rx=".75" fill="currentColor"/><circle cx="16" cy="25" r="1.5" fill="currentColor"/></svg>,
  arrowR:  (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowL:  (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  wa:      (s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  grid:    (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
  phone:   (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>,
  orders:  (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chart:   (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users:   (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  settings:(s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  card:    (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/><line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="1.5"/></svg>,
  logout:  (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  globe:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="1.5"/></svg>,
  bolt:    (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.99h7.41L10 22l9.91-11H12.5L13 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  shield:  (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  truck:   (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="1" y="3" width="15" height="13" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  star:    (s=11)=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  spin:    (s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{animation:"spin .8s linear infinite"}}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.2)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>,
  plus:    (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  close:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  search:  (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  sun:     (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  moon:    (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  upload:  (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:    (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  img:     (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fire:    (s=11)=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0-4 4-4 8a4 4 0 004 4 4 4 0 004-4c0-4-4-8-4-8zm0 10a2 2 0 01-2-2c0-1.5 1-3 2-4.5 1 1.5 2 3 2 4.5a2 2 0 01-2 2z" opacity=".7"/><path d="M12 22c-3.3 0-6-2.7-6-6 0-2.4 1.3-4.5 3-5.6.3 1 1 1.9 2 2.4-.6.5-1 1.3-1 2.2 0 1.7 1.3 3 3 3s3-1.3 3-3c0-.9-.4-1.7-1-2.2 1-.5 1.7-1.4 2-2.4 1.7 1.1 3 3.2 3 5.6 0 3.3-2.7 6-6 6z"/></svg>,
}

// ─── SMALL UI HELPERS ─────────────────────────────────────────────────────────
function ThemeToggle() {
  const {dark,toggle} = useTheme()
  return (
    <button onClick={toggle} style={{width:36,height:36,borderRadius:9,border:"1px solid var(--wire2)",background:"var(--surface)",color:"var(--tx2)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--brand-1)";e.currentTarget.style.color="var(--brand-1)"}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--wire2)";e.currentTarget.style.color="var(--tx2)"}}>
      {dark?Ic.sun():Ic.moon()}
    </button>
  )
}

function LangToggle() {
  const {lang,toggle} = useLang()
  return (
    <button onClick={toggle} style={{height:36,padding:"0 12px",borderRadius:9,border:"1px solid var(--wire2)",background:"var(--surface)",color:"var(--tx2)",display:"flex",alignItems:"center",gap:6,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:600,letterSpacing:"1px",transition:"all .2s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--brand-1)";e.currentTarget.style.color="var(--brand-1)"}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--wire2)";e.currentTarget.style.color="var(--tx2)"}}>
      {Ic.globe(12)} {lang==="ar"?"EN":"عر"}
    </button>
  )
}

function Badge({status, t}) {
  const s = ST_CONFIG[status]||ST_CONFIG.new
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.bg,color:s.c,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:600,border:`1px solid ${s.c}25`}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:s.c,flexShrink:0}}/>
      {t.st[status]||status}
    </span>
  )
}

// ─── FIX: PhoneImg — always start with URL src, never base64 ─────────────────
function PhoneImg({phone, h=220, cls=""}) {
  const [err, setErr] = useState(false)

  // Reset error state if phone changes
  useEffect(() => { setErr(false) }, [phone.id])

  if (err || !phone.image) return (
    <div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",color:phone.color||"var(--brand-1)",opacity:.2}}>
      {Ic.phone(h*.35)}
    </div>
  )
  return (
    <img
      src={phone.image}
      alt={phone.name}
      onError={() => setErr(true)}
      className={cls}
      style={{height:h,width:"100%",objectFit:"contain",filter:`drop-shadow(0 16px 40px ${phone.color||"#4F7CFF"}40)`}}
    />
  )
}

// ─── PHONE CARD ───────────────────────────────────────────────────────────────
function PhoneCard({phone, onClick, delay=0}) {
  const {t} = useLang()
  const plans = PLANS[phone.id]||[]
  const min = plans.length ? plans.reduce((m,p)=>p.mo<m.mo?p:m,plans[0]) : null
  const [hov,setHov] = useState(false)
  const c = phone.color||"#4F7CFF"
  return (
    <div className="pcard fu" style={{animationDelay:`${delay}s`}} onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{height:240,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:`radial-gradient(ellipse at 50% 65%, ${c}15 0%, transparent 65%)`}}>
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle, ${c}12 1px, transparent 1px)`,backgroundSize:"24px 24px",opacity:hov?.6:.25,transition:"opacity .4s"}}/>
        {hov && <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:`linear-gradient(90deg,transparent,${c},transparent)`,animation:"scanH 1.8s ease infinite"}}/>}
        <div style={{position:"relative",zIndex:2}}>
          <PhoneImg phone={phone} h={200} cls={phone.available?"flt":""}/>
        </div>
        {phone.hot && (
          <div style={{position:"absolute",top:12,right:12,zIndex:3,background:`linear-gradient(135deg,${c},${c}cc)`,color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",display:"flex",alignItems:"center",gap:4,letterSpacing:"1px"}}>
            {Ic.fire(9)} HOT
          </div>
        )}
        {!phone.available && (
          <div style={{position:"absolute",inset:0,background:"rgba(7,11,20,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3,backdropFilter:"blur(4px)"}}>
            <span style={{color:"var(--tx3)",fontWeight:600,fontSize:10,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"3px"}}>{t.outOfStock}</span>
          </div>
        )}
      </div>
      <div style={{padding:"16px 18px 20px",direction:t.dir}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:c,letterSpacing:"3px",textTransform:"uppercase"}}>{phone.brand}</span>
          {phone.available && <span style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)"}}/>}
        </div>
        <h3 style={{fontSize:16,fontWeight:700,color:"var(--tx)",marginBottom:4,lineHeight:1.3}}>{phone.name}</h3>
        <p style={{fontSize:12,color:"var(--tx3)",marginBottom:14,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{phone.tagline}</p>
        <div style={{height:"1px",background:`linear-gradient(90deg,${c}30,transparent)`,marginBottom:14}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <p style={{fontSize:9,color:"var(--tx3)",marginBottom:2,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"1px",textTransform:"uppercase"}}>{t.totalPrice}</p>
            <p style={{fontSize:13,fontWeight:600,color:"var(--tx2)"}}>{phone.price.toLocaleString("ar-EG")} ج.م</p>
          </div>
          {min && phone.available && (
            <div style={{textAlign:t.dir==="rtl"?"left":"right"}}>
              <p style={{fontSize:9,color:"var(--tx3)",marginBottom:1,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"1px",textTransform:"uppercase"}}>{t.startFrom}</p>
              <p style={{fontSize:19,fontWeight:800,color:c,lineHeight:1}}>{min.mo.toLocaleString("ar-EG")}<span style={{fontSize:9,color:"var(--tx3)",fontWeight:400}}>{t.perMonth}</span></p>
            </div>
          )}
        </div>
      </div>
      <div style={{height:"2px",background:`linear-gradient(90deg,transparent,${c},transparent)`,opacity:hov?1:0,transition:"opacity .3s"}}/>
    </div>
  )
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({pg, setPg}) {
  const {user,logout} = useAuth()
  const {t} = useLang()
  const [scrolled,setScrolled] = useState(false)
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>10); window.addEventListener("scroll",fn); return ()=>window.removeEventListener("scroll",fn) },[])
  const pages = [["home",t.nav.home],["phones",t.nav.phones],["order",t.nav.order]]
  return (
    <nav style={{position:"sticky",top:0,zIndex:300,direction:t.dir,transition:"all .4s"}}>
      <div style={{background:scrolled?"var(--navBg)":"transparent",backdropFilter:scrolled?"blur(28px)":"none",WebkitBackdropFilter:scrolled?"blur(28px)":"none",borderBottom:scrolled?"1px solid var(--wire2)":"1px solid transparent",transition:"all .4s",boxShadow:scrolled?"0 2px 32px rgba(0,0,0,.15)":"none"}}>
        {scrolled && <div style={{height:"1.5px",background:"linear-gradient(90deg,transparent,var(--brand-1) 30%,var(--brand-3) 70%,transparent)",opacity:.8}}/>}
        <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:68}}>
          <button onClick={()=>setPg("home")} style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <div style={{width:40,height:40,background:"linear-gradient(145deg,#0D1530,var(--brand-2),var(--brand-1))",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:"0 4px 20px rgba(79,124,255,.3)",position:"relative",flexShrink:0}}>
              {Ic.logo(18)}
              <div style={{position:"absolute",inset:0,borderRadius:12,background:"linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 50%)",pointerEvents:"none"}}/>
            </div>
            <div>
              <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:19,color:"var(--tx)",letterSpacing:"-1px"}}>QASSET</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--brand-3)",letterSpacing:"4px",marginLeft:4}}>PLUS</span>
            </div>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:2,background:scrolled?"var(--surface)":"rgba(255,255,255,.04)",padding:"4px",borderRadius:14,border:scrolled?"1px solid var(--wire)":"1px solid rgba(255,255,255,.06)",transition:"all .3s"}}>
            {pages.map(([p,l])=>{
              const active=pg===p
              return (
                <button key={p} onClick={()=>setPg(p)} style={{padding:"8px 20px",borderRadius:10,fontWeight:600,fontSize:13,transition:"all .2s",background:active?"var(--blT)":"transparent",color:active?"var(--brand-1)":"var(--tx3)",border:active?"1px solid var(--wire2)":"1px solid transparent"}}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(79,124,255,.05)";e.currentTarget.style.color="var(--tx2)"}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--tx3)"}}}
                >{l}</button>
              )
            })}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <LangToggle/><ThemeToggle/>
            <div style={{width:1,height:24,background:"var(--wire2)",margin:"0 2px"}}/>
            {user ? (
              <>
                <button onClick={()=>setPg("dashboard")} className="btn-primary" style={{padding:"9px 18px",fontSize:13}}>
                  {Ic.grid(13)} {t.nav.dashboard}
                </button>
                <button onClick={logout} style={{width:36,height:36,borderRadius:9,border:"1px solid var(--wire2)",background:"var(--surface)",color:"var(--tx3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,107,107,.4)";e.currentTarget.style.color="var(--red)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--wire2)";e.currentTarget.style.color="var(--tx3)"}}
                >{Ic.logout()}</button>
              </>
            ) : (
              <button onClick={()=>setPg("login")} style={{padding:"9px 22px",borderRadius:11,fontWeight:700,fontSize:13,color:"var(--brand-1)",border:"1.5px solid rgba(79,124,255,.3)",background:"var(--blT2)",cursor:"pointer",transition:"all .25s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="var(--blT)";e.currentTarget.style.borderColor="rgba(79,124,255,.5)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="var(--blT2)";e.currentTarget.style.borderColor="rgba(79,124,255,.3)"}}
              >{t.nav.login}</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({setPg}) {
  const {t} = useLang()
  return (
    <footer style={{background:"linear-gradient(180deg,#060A18 0%,#0A1225 100%)",borderTop:"1px solid rgba(79,124,255,.12)",padding:"56px 0 24px",marginTop:80,direction:t.dir}}>
      <div style={{maxWidth:1360,margin:"0 auto",padding:"0 32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:48,marginBottom:40}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:16}}>
              <div style={{width:38,height:38,background:"linear-gradient(145deg,#0D1530,var(--brand-2),var(--brand-1))",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>{Ic.logo(16)}</div>
              <p style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:"#E8EEFF"}}>{t.brand} <span style={{color:"var(--brand-3)"}}>{t.brandSub}</span></p>
            </div>
            <p style={{color:"#2A3D6A",fontSize:13,lineHeight:1.9,maxWidth:280}}>{t.footer.desc}</p>
          </div>
          <div>
            <p className="label" style={{marginBottom:18,color:"var(--brand-3)"}}>{t.footer.links}</p>
            {[["home",t.nav.home],["phones",t.nav.phones],["order",t.footer.orderLink],["login",t.footer.loginLink]].map(([p,l])=>(
              <p key={p} onClick={()=>setPg(p)} style={{color:"#2A3D6A",fontSize:13,marginBottom:11,cursor:"pointer",transition:"color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.color="var(--brand-3)"}
                onMouseLeave={e=>e.currentTarget.style.color="#2A3D6A"}
              >{l}</p>
            ))}
          </div>
          <div>
            <p className="label" style={{marginBottom:18,color:"var(--brand-3)"}}>{t.footer.contact}</p>
            {["01000000000","info@qasset.com","القاهرة، مصر"].map(x=>(
              <p key={x} style={{color:"#2A3D6A",fontSize:13,marginBottom:11}}>{x}</p>
            ))}
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(79,124,255,.08)",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{color:"#1E2E55",fontSize:11,fontFamily:"'IBM Plex Mono',monospace"}}>© 2025 QASSET+</p>
          <p style={{color:"#1E2E55",fontSize:12}}>{t.footer.made}</p>
        </div>
      </div>
    </footer>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({setPg, setPhone}) {
  const {t} = useLang()
  const {phones} = useData()
  const avail = phones.filter(p=>p.available)
  const [idx,setIdx] = useState(0)
  const hero = avail[idx]||avail[0]||phones[0]
  useEffect(()=>{ const ti=setInterval(()=>setIdx(i=>(i+1)%Math.max(1,avail.length)),5000); return ()=>clearInterval(ti) },[avail.length])
  if(!hero) return null
  const c = hero.color||"#4F7CFF"

  return (
    <div style={{direction:t.dir}}>
      <section style={{position:"relative",overflow:"hidden",minHeight:"90vh",display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",inset:0,zIndex:0}}>
          <div style={{position:"absolute",width:800,height:800,borderRadius:"50%",background:`radial-gradient(circle,${c}08 0%,transparent 65%)`,top:"50%",right:"-15%",transform:"translateY(-50%)",transition:"background 1.5s"}}/>
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(79,124,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,124,255,.03) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
        </div>
        <div style={{maxWidth:1360,margin:"0 auto",padding:"80px 32px",width:"100%",position:"relative",zIndex:2,display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:60,alignItems:"center"}}>
          <div>
            <div className="fu" style={{display:"inline-flex",alignItems:"center",gap:8,background:"var(--blT2)",border:"1px solid rgba(79,124,255,.18)",borderRadius:30,padding:"6px 16px",marginBottom:28}}>
              <span style={{width:6,height:6,background:"var(--brand-1)",borderRadius:"50%",animation:"pulse 2s infinite"}}/>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--brand-1)",fontSize:9,letterSpacing:"3px",fontWeight:600}}>{t.hero.badge}</span>
            </div>
            <h1 className="fu d1" style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(38px,4.5vw,68px)",fontWeight:800,lineHeight:1.08,marginBottom:6,color:"var(--tx)",letterSpacing:"-2px"}}>{t.hero.h1}</h1>
            <h1 className="fu d2" style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(38px,4.5vw,68px)",fontWeight:800,lineHeight:1.08,marginBottom:6,letterSpacing:"-2px"}}><span className="grad-text">{t.hero.h2}</span></h1>
            <h1 className="fu d3" style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(38px,4.5vw,68px)",fontWeight:800,lineHeight:1.08,marginBottom:24,color:"var(--tx3)",letterSpacing:"-2px"}}>{t.hero.h3}</h1>
            <p className="fu d4" style={{color:"var(--tx2)",fontSize:16,lineHeight:1.8,marginBottom:36,maxWidth:420}}>{t.hero.desc}</p>
            <div className="fu d5" style={{display:"flex",gap:12,marginBottom:48}}>
              <button onClick={()=>setPg("phones")} className="btn-primary" style={{fontSize:14,padding:"13px 28px"}}>{t.hero.cta1} {Ic.arrowR()}</button>
              <button onClick={()=>setPg("order")} className="btn-outline" style={{fontSize:13,padding:"13px 22px"}}>{t.hero.cta2}</button>
            </div>
            <div className="fu d6" style={{display:"flex",gap:0}}>
              {[["500+",t.hero.stat1],["24h",t.hero.stat2],["24",t.hero.stat3]].map(([n,l],i)=>(
                <div key={l} style={{paddingLeft:i>0?26:0,marginLeft:i>0?26:0,borderLeft:i>0?"1px solid var(--wire2)":"none"}}>
                  <p style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:"var(--brand-1)",margin:0,lineHeight:1}}>{n}</p>
                  <p style={{fontSize:12,color:"var(--tx3)",marginTop:5}}>{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="fu d2" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
            <div style={{width:340,height:400,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"absolute",width:320,height:380,borderRadius:28,border:`1px solid ${c}20`,transition:"border-color 1.5s"}}/>
              <div style={{position:"absolute",width:240,height:300,borderRadius:20,background:`radial-gradient(ellipse,${c}10 0%,transparent 65%)`,transition:"all 1.5s"}}/>
              <div style={{position:"relative",zIndex:1}}><PhoneImg phone={hero} h={320} cls="flt"/></div>
            </div>
            <div style={{background:"var(--surface)",border:"1px solid var(--wire2)",borderRadius:14,padding:"12px 24px",textAlign:"center",minWidth:250,transition:"all .7s"}}>
              <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:c,letterSpacing:"3px",textTransform:"uppercase",marginBottom:3}}>{hero.brand}</p>
              <p style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:"var(--tx)"}}>{hero.name}</p>
            </div>
            <div style={{display:"flex",gap:6}}>
              {avail.map((_,i)=>(
                <button key={i} onClick={()=>setIdx(i)} style={{height:3,borderRadius:2,padding:0,width:i===idx?24:4,background:i===idx?"var(--brand-1)":"var(--wire2)",border:"none",transition:"all .4s"}}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{background:"var(--surface)",borderTop:"1px solid var(--wire)",borderBottom:"1px solid var(--wire)"}}>
        <div style={{maxWidth:1360,margin:"0 auto",padding:"24px 32px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,direction:t.dir}}>
          {[Ic.bolt(),Ic.card(),Ic.shield(),Ic.truck()].map((icon,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"center",paddingLeft:i>0?24:0,marginLeft:i>0?24:0,borderLeft:i>0?"1px solid var(--wire)":"none",paddingRight:i<3?24:0}}>
              <div style={{width:40,height:40,background:"var(--blT)",border:"1px solid rgba(79,124,255,.12)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--brand-1)",flexShrink:0}}>{icon}</div>
              <div>
                <p style={{fontWeight:700,fontSize:13,color:"var(--tx)",marginBottom:1}}>{t.features[i][0]}</p>
                <p style={{fontSize:11,color:"var(--tx3)"}}>{t.features[i][1]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section style={{maxWidth:1360,margin:"0 auto",padding:"80px 32px",direction:t.dir}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:44}}>
          <div>
            <p className="label fu" style={{marginBottom:10}}>{t.catalog}</p>
            <h2 className="fu d1" style={{fontFamily:"'Sora',sans-serif",fontSize:40,fontWeight:800,color:"var(--tx)",lineHeight:1.1,letterSpacing:"-2px"}}>
              {t.catalogTitle}<br/><span style={{color:"var(--tx3)",fontStyle:"italic",fontWeight:400}}>{t.catalogSub}</span>
            </h2>
          </div>
          <button onClick={()=>setPg("phones")} className="btn-outline fu d2" style={{padding:"10px 20px",fontSize:12}}>{t.viewAll} {Ic.arrowR()}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:18}}>
          {avail.map((p,i)=><PhoneCard key={p.id} phone={p} delay={i*.05} onClick={()=>{setPhone(p);setPg("phone-detail")}}/>)}
        </div>
      </section>

      <section style={{padding:"0 32px 80px",direction:t.dir}}>
        <div style={{maxWidth:1360,margin:"0 auto",position:"relative",overflow:"hidden",borderRadius:24,background:"linear-gradient(135deg,#080E22 0%,#101C45 100%)",border:"1px solid rgba(79,124,255,.18)"}}>
          <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:260,height:"1px",background:"linear-gradient(90deg,transparent,var(--brand-3),transparent)"}}/>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle, rgba(79,124,255,.05) 1px, transparent 1px)",backgroundSize:"28px 28px"}}/>
          <div style={{padding:"64px 40px",textAlign:"center",position:"relative",zIndex:1}}>
            <p className="label" style={{marginBottom:14,color:"var(--brand-3)"}}>{t.cta.label}</p>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:44,fontWeight:800,color:"#E8EEFF",letterSpacing:"-2px",marginBottom:10,lineHeight:1.1}}>
              {t.cta.h}<br/><span className="grad-text" style={{fontStyle:"italic"}}>{t.cta.h2}</span>
            </h2>
            <p style={{color:"rgba(143,164,204,.6)",fontSize:15,marginBottom:32}}>{t.cta.sub}</p>
            <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:10,background:"#25D366",color:"#fff",borderRadius:14,padding:"15px 36px",fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,transition:"all .3s",boxShadow:"0 8px 32px rgba(37,211,102,.2)"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 44px rgba(37,211,102,.35)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 32px rgba(37,211,102,.2)"}}
            >{Ic.wa(17)} {t.cta.btn}</a>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── PHONES PAGE ──────────────────────────────────────────────────────────────
function PhonesPage({setPg, setPhone}) {
  const {t} = useLang()
  const {phones} = useData()
  const [brand,setBrand] = useState("all")
  const [onlyAvail,setOnlyAvail] = useState(false)
  const [search,setSearch] = useState("")
  const brands = ["all",...new Set(phones.map(p=>p.brand))]
  let list = brand==="all" ? phones : phones.filter(p=>p.brand===brand)
  if(onlyAvail) list = list.filter(p=>p.available)
  if(search) list = list.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.brand.toLowerCase().includes(search.toLowerCase()))
  return (
    <div style={{maxWidth:1360,margin:"0 auto",padding:"52px 32px",direction:t.dir}}>
      <div className="fu" style={{marginBottom:44}}>
        <p className="label" style={{marginBottom:10}}>{t.catalog}</p>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:44,fontWeight:800,color:"var(--tx)",letterSpacing:"-2.5px",marginBottom:8,lineHeight:1.08}}>
          {t.phones.title} <span style={{fontStyle:"italic",color:"var(--tx3)",fontWeight:400}}>{t.phones.sub}</span>
        </h1>
        <p style={{color:"var(--tx3)",fontSize:13}}>{list.filter(p=>p.available).length} {t.phones.available}</p>
      </div>
      <div className="fu d1" style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:40,alignItems:"center"}}>
        <div style={{display:"flex",gap:2,background:"var(--surface)",padding:4,borderRadius:12,border:"1px solid var(--wire)"}}>
          {brands.map(b=>(
            <button key={b} onClick={()=>setBrand(b)} style={{padding:"7px 16px",borderRadius:8,background:brand===b?"var(--blT)":"transparent",color:brand===b?"var(--brand-1)":"var(--tx3)",fontWeight:600,fontSize:12,transition:"all .2s",border:brand===b?"1px solid var(--wire2)":"1px solid transparent"}}>
              {b==="all"?t.phones.all:b}
            </button>
          ))}
        </div>
        <button onClick={()=>setOnlyAvail(v=>!v)} style={{padding:"7px 16px",borderRadius:10,fontWeight:600,fontSize:12,background:onlyAvail?"rgba(16,217,160,.06)":"var(--surface)",color:onlyAvail?"var(--green)":"var(--tx3)",border:`1px solid ${onlyAvail?"rgba(16,217,160,.25)":"var(--wire)"}`,transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
          {onlyAvail&&Ic.check(10)} {t.phones.onlyAvail}
        </button>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",[t.dir==="rtl"?"right":"left"]:12,top:"50%",transform:"translateY(-50%)",color:"var(--tx3)"}}>{Ic.search()}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.phones.search} className="inp" style={{width:220,[t.dir==="rtl"?"paddingRight":"paddingLeft"]:38}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:18}}>
        {list.map((p,i)=><PhoneCard key={p.id} phone={p} delay={i*.04} onClick={()=>{setPhone(p);setPg("phone-detail")}}/>)}
      </div>
    </div>
  )
}

// ─── PHONE DETAIL ─────────────────────────────────────────────────────────────
function PhoneDetailPage({phone, setPg}) {
  const {t} = useLang()
  const plans = PLANS[phone.id]||[]
  const [sel,setSel] = useState(plans[0]||null)
  if(!phone) return null
  const c = phone.color||"#4F7CFF"
  const waMsg = encodeURIComponent(`مرحباً، أريد تقسيط *${phone.name}*\nالمدة: ${sel?.m} شهر\nالقسط: ${sel?.mo?.toLocaleString("ar-EG")} ج.م`)
  return (
    <div style={{maxWidth:1360,margin:"0 auto",padding:"52px 32px",direction:t.dir}}>
      <button onClick={()=>setPg("phones")} className="btn-outline fu" style={{marginBottom:36,fontSize:12,padding:"8px 16px"}}>{Ic.arrowL()} {t.detail.back}</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48}}>
        <div className="fu">
          <div style={{borderRadius:24,padding:"44px 36px",background:`radial-gradient(ellipse at 50% 55%,${c}10 0%,transparent 60%)`,border:`1px solid ${c}18`,display:"flex",flexDirection:"column",alignItems:"center",gap:24,position:"relative",overflow:"hidden",minHeight:420}}>
            <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(circle,${c}10 1px,transparent 1px)`,backgroundSize:"26px 26px"}}/>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:`linear-gradient(90deg,transparent,${c}60,transparent)`,animation:"scanH 3s ease infinite"}}/>
            <PhoneImg phone={phone} h={300} cls="flt"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
            {Object.entries(phone.specs).map(([k,v])=>(
              <div key={k} style={{background:"var(--surface)",borderRadius:12,padding:"11px 14px",border:"1px solid var(--wire)",transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=c+"40"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--wire)"}
              >
                <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",marginBottom:5,textTransform:"uppercase",letterSpacing:"1px"}}>{k}</p>
                <p style={{fontSize:12,fontWeight:700,color:"var(--tx)"}}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="fu d1">
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:c,letterSpacing:"4px",textTransform:"uppercase",display:"inline-block",marginBottom:12}}>{phone.brand}</span>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:36,fontWeight:800,color:"var(--tx)",marginBottom:6,lineHeight:1.1,letterSpacing:"-1.5px"}}>{phone.name}</h1>
          <p style={{color:c,fontSize:13,fontWeight:600,marginBottom:14,letterSpacing:".5px"}}>{phone.tagline}</p>
          <p style={{color:"var(--tx2)",lineHeight:1.9,marginBottom:24,fontSize:13}}>{phone.description}</p>
          <div style={{background:"var(--surface)",borderRadius:14,padding:"16px 20px",marginBottom:20,border:"1px solid var(--wire)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",marginBottom:4,letterSpacing:"1.5px",textTransform:"uppercase"}}>{t.detail.fullPrice}</p>
              <p style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:"var(--tx)"}}>{phone.price.toLocaleString("ar-EG")} <span style={{fontSize:12,color:"var(--tx3)",fontWeight:400}}>ج.م</span></p>
            </div>
            {phone.available
              ? <span style={{background:"rgba(16,217,160,.07)",color:"var(--green)",border:"1px solid rgba(16,217,160,.2)",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>{Ic.check(9)} {t.detail.availNow}</span>
              : <span style={{background:"rgba(255,107,107,.07)",color:"var(--red)",border:"1px solid rgba(255,107,107,.2)",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:600}}>{t.detail.notAvail}</span>
            }
          </div>
          {plans.length>0&&sel&&(
            <div style={{background:"var(--surface)",borderRadius:20,padding:22,border:"1px solid var(--wire)"}}>
              <p style={{fontWeight:700,fontSize:14,color:"var(--tx)",marginBottom:16}}>{t.detail.calc}</p>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${plans.length},1fr)`,gap:8,marginBottom:20}}>
                {plans.map(p=>(
                  <button key={p.id} onClick={()=>setSel(p)} style={{padding:"12px 4px",borderRadius:12,border:`1.5px solid ${sel.id===p.id?c:"var(--wire)"}`,background:sel.id===p.id?`${c}0D`:"var(--surface2)",transition:"all .2s",cursor:"pointer"}}>
                    <p style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:sel.id===p.id?c:"var(--tx)",margin:"0 0 2px"}}>{p.m}</p>
                    <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",margin:0,letterSpacing:"1px"}}>{t.detail.month}</p>
                  </button>
                ))}
              </div>
              <div style={{background:"var(--surface2)",borderRadius:12,padding:"16px 18px",marginBottom:14,border:"1px solid var(--wire)"}}>
                {[[t.detail.advance,`${sel.dp.toLocaleString("ar-EG")} ج.م`],[t.detail.duration,`${sel.m} ${t.detail.month}`],[t.detail.total,`${(sel.mo*sel.m).toLocaleString("ar-EG")} ج.م`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13}}>
                    <span style={{color:"var(--tx3)"}}>{k}</span>
                    <span style={{fontWeight:700,color:"var(--tx2)"}}>{v}</span>
                  </div>
                ))}
                <div style={{borderTop:"1px solid var(--wire)",paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:700,color:"var(--tx)",fontSize:13}}>{t.detail.monthly}</span>
                  <span style={{fontFamily:"'Sora',sans-serif",fontWeight:800,color:c,fontSize:30,lineHeight:1}}>{sel.mo.toLocaleString("ar-EG")}<span style={{fontSize:11,color:"var(--tx3)",fontWeight:400}}> ج.م</span></span>
                </div>
              </div>
              <a href={`https://wa.me/201000000000?text=${waMsg}`} target="_blank" rel="noreferrer"
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:"#25D366",color:"#fff",borderRadius:12,padding:14,fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:14,transition:"all .3s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(37,211,102,.35)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}
              >{Ic.wa(16)} {t.detail.waBtn}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ORDER PAGE ───────────────────────────────────────────────────────────────
function OrderPage({setPg}) {
  const {t} = useLang()
  const {addOrder} = useData()
  const [form,setForm] = useState({name:"",phone:"",city:"",device:"",months:"12",notes:""})
  const [done,setDone] = useState(false)
  const [loading,setLoading] = useState(false)
  const submit = e => {
    e.preventDefault(); setLoading(true)
    setTimeout(()=>{
      addOrder({id:`o${Date.now()}`,pid:"1",pname:form.device,name:form.name,phone:form.phone,city:form.city,status:"new",notes:`${form.months} شهر — ${form.notes}`,date:new Date().toISOString().split("T")[0]})
      setLoading(false); setDone(true)
    },1500)
  }
  if(done) return (
    <div style={{minHeight:"72vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,direction:t.dir}}>
      <div className="fu" style={{textAlign:"center",maxWidth:420}}>
        <div style={{width:80,height:80,background:"rgba(16,217,160,.06)",border:"1px solid rgba(16,217,160,.15)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",color:"var(--green)"}}>{Ic.check(36)}</div>
        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:32,fontWeight:800,color:"var(--tx)",letterSpacing:"-1.5px",marginBottom:10}}>{t.order.doneTitle}</h2>
        <p style={{color:"var(--tx2)",fontSize:14,marginBottom:32,lineHeight:1.8}}>{t.order.doneDesc}</p>
        <button onClick={()=>setPg("home")} className="btn-primary" style={{fontSize:13,padding:"13px 32px"}}>{t.order.doneBtn} {Ic.arrowR()}</button>
      </div>
    </div>
  )
  return (
    <div style={{maxWidth:580,margin:"0 auto",padding:"52px 32px",direction:t.dir}}>
      <div className="fu" style={{marginBottom:36}}>
        <p className="label" style={{marginBottom:10}}>{t.order.label}</p>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:40,fontWeight:800,color:"var(--tx)",letterSpacing:"-2px",marginBottom:6,lineHeight:1.08}}>
          {t.order.title} <span style={{fontStyle:"italic",color:"var(--brand-1)"}}>{t.order.titleGold}</span>
        </h1>
        <p style={{color:"var(--tx3)",fontSize:13}}>{t.order.sub}</p>
      </div>
      <div className="fu d1" style={{background:"var(--surface)",borderRadius:20,padding:32,border:"1px solid var(--wire)"}}>
        <form onSubmit={submit}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            {[[t.order.name,"name","text","محمد أحمد"],[t.order.phone,"phone","tel","01000000000"],[t.order.city,"city","text","القاهرة"],[t.order.device,"device","text","iPhone 15 Pro"]].map(([l,k,tp,pl])=>(
              <div key={k}>
                <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:8,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{l}</label>
                <input type={tp} required value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={pl} className="inp"/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:10,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{t.order.duration}</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {["6","12","18","24"].map(m=>(
                <button type="button" key={m} onClick={()=>setForm(p=>({...p,months:m}))} style={{padding:"12px 4px",borderRadius:12,border:`1.5px solid ${form.months===m?"var(--brand-1)":"var(--wire)"}`,background:form.months===m?"var(--blT)":"var(--surface2)",color:form.months===m?"var(--brand-1)":"var(--tx3)",fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,transition:"all .2s"}}>
                  {m}<br/><span style={{fontSize:10,fontWeight:400,color:"var(--tx3)"}}>شهر</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:22}}>
            <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:8,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{t.order.notes}</label>
            <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder={t.order.notesPh} className="inp"/>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",padding:"14px",fontSize:14}}>
            {loading?<>{Ic.spin(16)} {t.order.sending}</>:<>{t.order.send} {Ic.arrowR()}</>}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({setPg}) {
  const {login} = useAuth()
  const {t} = useLang()
  const [form,setForm] = useState({email:"admin@qasset.com",password:"admin123"})
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)
  const submit = e => {
    e.preventDefault(); setLoading(true); setError("")
    setTimeout(()=>{ if(login(form.email,form.password)) setPg("dashboard"); else setError(t.login.err); setLoading(false) },900)
  }
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,direction:t.dir}}>
      <div className="fu" style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:64,height:64,background:"linear-gradient(145deg,#0D1530,var(--brand-2),var(--brand-1))",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",margin:"0 auto 18px",boxShadow:"0 10px 36px rgba(79,124,255,.3)"}}>{Ic.logo(24)}</div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:"var(--tx)",marginBottom:5,letterSpacing:"-1px"}}>{t.login.welcome}</h1>
          <p style={{color:"var(--tx3)",fontSize:13}}>{t.login.sub}</p>
        </div>
        <div style={{background:"var(--surface)",borderRadius:20,padding:32,border:"1px solid var(--wire)"}}>
          {error&&<div style={{background:"rgba(255,107,107,.06)",border:"1px solid rgba(255,107,107,.15)",borderRadius:10,padding:"11px 14px",marginBottom:18,color:"var(--red)",fontSize:13,textAlign:"center"}}>{error}</div>}
          <div style={{background:"var(--blT2)",border:"1px solid rgba(79,124,255,.12)",borderRadius:10,padding:"10px 14px",marginBottom:22,fontSize:11,color:"var(--brand-1)",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:".5px"}}>
            demo: admin@qasset.com / admin123
          </div>
          <form onSubmit={submit}>
            {[[t.login.email,"email","email"],[t.login.password,"password","password"]].map(([l,k,tp])=>(
              <div key={k} style={{marginBottom:16}}>
                <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:8,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{l}</label>
                <input type={tp} required value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="inp"/>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",fontSize:14,marginTop:4}}>
              {loading?<>{Ic.spin(15)} {t.login.loading}</>:<>{t.login.btn} {Ic.arrowR()}</>}
            </button>
          </form>
          <p style={{textAlign:"center",marginTop:18,fontSize:12,color:"var(--tx3)"}}>
            {t.login.noAcc}{" "}<button onClick={()=>setPg("signup")} style={{color:"var(--brand-1)",fontWeight:700,fontSize:12}}>{t.login.signup}</button>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
function SignupPage({setPg}) {
  const {signup} = useAuth()
  const {t} = useLang()
  const [form,setForm] = useState({name:"",email:"",password:"",confirm:""})
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)
  const submit = e => {
    e.preventDefault(); setError("")
    if(form.password!==form.confirm) return setError(t.signup.errMatch)
    if(form.password.length<6) return setError(t.signup.errShort)
    setLoading(true)
    setTimeout(()=>{signup(form.email,form.password,form.name);setPg("dashboard");setLoading(false)},900)
  }
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,direction:t.dir}}>
      <div className="fu" style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:64,height:64,background:"linear-gradient(145deg,#0D1530,var(--brand-1))",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",margin:"0 auto 18px",boxShadow:"0 10px 36px rgba(79,124,255,.3)"}}>{Ic.users(24)}</div>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,color:"var(--tx)",letterSpacing:"-1px",marginBottom:5}}>{t.signup.title}</h1>
          <p style={{color:"var(--tx3)",fontSize:13}}>{t.signup.sub}</p>
        </div>
        <div style={{background:"var(--surface)",borderRadius:20,padding:32,border:"1px solid var(--wire)"}}>
          {error&&<div style={{background:"rgba(255,107,107,.06)",border:"1px solid rgba(255,107,107,.15)",borderRadius:10,padding:"11px 14px",marginBottom:16,color:"var(--red)",fontSize:13,textAlign:"center"}}>{error}</div>}
          <form onSubmit={submit}>
            {[[t.signup.name,"name","text"],[t.signup.email,"email","email"],[t.signup.password,"password","password"],[t.signup.confirm,"confirm","password"]].map(([l,k,tp])=>(
              <div key={k} style={{marginBottom:14}}>
                <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:8,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{l}</label>
                <input type={tp} required value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="inp"/>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",fontSize:14,marginTop:4}}>
              {loading?t.signup.loading:<>{t.signup.btn} {Ic.arrowR()}</>}
            </button>
          </form>
          <p style={{textAlign:"center",marginTop:18,fontSize:12,color:"var(--tx3)"}}>
            {t.signup.hasAcc}{" "}<button onClick={()=>setPg("login")} style={{color:"var(--brand-1)",fontWeight:700,fontSize:12}}>{t.signup.login}</button>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── DEVICE FORM MODAL ────────────────────────────────────────────────────────
function DeviceFormModal({onClose, onSave, initial=null, t}) {
  const fileRef = useRef(null)
  const EMPTY = {name:"",brand:"",price:"",description:"",tagline:"",imageUrl:"",imageFile:"",color:"#4F7CFF",available:true,hot:false}
  const [form,setForm] = useState(initial ? {
    name:initial.name||"", brand:initial.brand||"", price:String(initial.price||""),
    description:initial.description||"", tagline:initial.tagline||"",
    imageUrl:initial.image||"", imageFile:"", color:initial.color||"#4F7CFF",
    available:initial.available!==false, hot:!!initial.hot
  } : EMPTY)

  const handleFile = e => {
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f=>({...f,imageFile:ev.target.result,imageUrl:""}))
    reader.readAsDataURL(file)
  }

  const submit = e => {
    e.preventDefault()
    const img = form.imageFile||form.imageUrl
    onSave({
      name:form.name, brand:form.brand, price:Number(form.price),
      description:form.description, tagline:form.tagline,
      image:img, color:form.color, available:form.available, hot:form.hot,
    })
  }

  const previewImg = form.imageFile||form.imageUrl
  const isEdit = !!initial

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{direction:"rtl"}}>
        <div style={{padding:"24px 28px 18px",borderBottom:"1px solid var(--wire)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p className="label" style={{marginBottom:4,fontSize:9}}>{isEdit?"EDIT DEVICE":"NEW DEVICE"}</p>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:"var(--tx)",margin:0}}>
              {isEdit ? t.dash.editDevice : t.dash.newDevice}
            </h2>
          </div>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:8,border:"1px solid var(--wire)",background:"var(--surface2)",color:"var(--tx2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,107,107,.06)";e.currentTarget.style.color="var(--red)"}}
            onMouseLeave={e=>{e.currentTarget.style.background="var(--surface2)";e.currentTarget.style.color="var(--tx2)"}}
          >{Ic.close()}</button>
        </div>
        <form onSubmit={submit} style={{padding:"22px 28px 26px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            {[[t.dash.fields[0],"name",true],[t.dash.fields[1],"brand",true],[t.dash.fields[2],"price",true],[t.dash.fields[4],"tagline",false]].map(([l,k,req])=>(
              <div key={k}>
                <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:7,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{l}</label>
                <input required={req} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="inp" style={{fontSize:13}}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:7,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{t.dash.fields[3]}</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="inp" rows={2} style={{resize:"vertical",fontSize:13}}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:7,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{t.dash.imageUrl}</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,marginBottom:8}}>
              <input value={form.imageUrl} onChange={e=>setForm(p=>({...p,imageUrl:e.target.value,imageFile:""}))} placeholder="https://example.com/phone.jpg" className="inp" style={{fontSize:13}}/>
              <button type="button" onClick={()=>fileRef.current?.click()} className="btn-outline" style={{padding:"0 14px",fontSize:12,whiteSpace:"nowrap",gap:6}}>
                {Ic.upload(12)} {t.dash.uploadImg}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
            {previewImg ? (
              <div style={{display:"flex",alignItems:"center",gap:12,background:"var(--surface2)",borderRadius:10,padding:10,border:"1px solid var(--wire)"}}>
                <img src={previewImg} alt="" style={{width:52,height:52,objectFit:"contain",borderRadius:7,background:"var(--bg)",border:"1px solid var(--wire)"}} onError={e=>e.target.style.display="none"}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--brand-1)",marginBottom:2,letterSpacing:"1px"}}>{form.imageFile?"FILE UPLOADED":"URL SET"}</p>
                  <p style={{fontSize:11,color:"var(--tx3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{form.imageFile?"صورة محلية":form.imageUrl}</p>
                </div>
                <button type="button" onClick={()=>setForm(p=>({...p,imageUrl:"",imageFile:""}))} style={{color:"var(--red)",fontSize:11,flexShrink:0}}>{t.dash.cancel}</button>
              </div>
            ) : (
              <div onClick={()=>fileRef.current?.click()} style={{border:"2px dashed var(--wire2)",borderRadius:10,padding:"16px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--brand-1)";e.currentTarget.style.background="var(--blT2)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--wire2)";e.currentTarget.style.background="transparent"}}
              >
                <div style={{color:"var(--tx3)",margin:"0 auto 4px",width:"fit-content"}}>{Ic.img(22)}</div>
                <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",letterSpacing:"1px"}}>DRAG & DROP OR CLICK</p>
              </div>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr",gap:14,marginBottom:22,alignItems:"center"}}>
            <div>
              <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:7,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>COLOR</label>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="color" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} style={{width:40,height:36,borderRadius:8,border:"1px solid var(--wire)",background:"none",cursor:"pointer",padding:3}}/>
                <input value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} className="inp" style={{width:90,fontSize:11,fontFamily:"'IBM Plex Mono',monospace",padding:"8px 10px"}}/>
              </div>
            </div>
            {[[t.dash.active,"available"],[t.dash.hotLabel,"hot"]].map(([l,k])=>(
              <div key={k}>
                <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:7,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{l}</label>
                <button type="button" onClick={()=>setForm(p=>({...p,[k]:!p[k]}))} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,border:`1.5px solid ${form[k]?"var(--brand-1)":"var(--wire)"}`,background:form[k]?"var(--blT)":"var(--surface2)",transition:"all .2s",cursor:"pointer"}}>
                  <div style={{width:28,height:16,borderRadius:8,background:form[k]?"var(--brand-1)":"var(--surface3)",position:"relative",transition:"background .2s",flexShrink:0}}>
                    <div style={{width:12,height:12,borderRadius:"50%",background:"#fff",position:"absolute",top:2,transition:"transform .2s",transform:form[k]?"translateX(14px)":"translateX(2px)",boxShadow:"0 1px 3px rgba(0,0,0,.3)"}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:form[k]?"var(--brand-1)":"var(--tx3)"}}>{form[k]?"ON":"OFF"}</span>
                </button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button type="submit" className="btn-primary" style={{flex:1,padding:"13px",fontSize:14}}>
              {Ic.check(13)} {t.dash.save}
            </button>
            <button type="button" onClick={onClose} className="btn-outline" style={{padding:"13px 20px",fontSize:13}}>{t.dash.cancel}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── DASH LAYOUT ─────────────────────────────────────────────────────────────
function DashLayout({children, sub, setSub, setPg}) {
  const {user,logout} = useAuth()
  const {t} = useLang()
  const W = 260
  const navItems = [
    {id:"overview",  icon:Ic.grid(),     label:t.dash.nav.overview},
    {id:"phones",    icon:Ic.phone(),    label:t.dash.nav.phones},
    {id:"orders",    icon:Ic.orders(),   label:t.dash.nav.orders},
    {id:"plans",     icon:Ic.card(),     label:t.dash.nav.plans},
    {id:"analytics", icon:Ic.chart(),    label:t.dash.nav.analytics},
    {id:"customers", icon:Ic.users(),    label:t.dash.nav.customers},
    {id:"settings",  icon:Ic.settings(), label:t.dash.nav.settings},
  ]
  return (
    <div style={{display:"flex",minHeight:"100vh",direction:t.dir,background:"var(--bg)"}}>
      <aside style={{position:"fixed",top:0,bottom:0,[t.dir==="rtl"?"right":"left"]:0,width:W,background:"var(--surface)",borderLeft:t.dir==="rtl"?"none":"1px solid var(--wire)",borderRight:t.dir==="rtl"?"1px solid var(--wire)":"none",display:"flex",flexDirection:"column",zIndex:200,overflowY:"auto",boxShadow:t.dir==="rtl"?"-4px 0 32px rgba(0,0,0,.12)":"4px 0 32px rgba(0,0,0,.12)"}}>
        <div style={{padding:"24px 20px 20px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-24,right:-24,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,rgba(79,124,255,.1) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:18,position:"relative"}}>
            <div style={{width:42,height:42,background:"linear-gradient(145deg,#0D1530,var(--brand-2),var(--brand-1))",borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:"0 5px 18px rgba(79,124,255,.3)",flexShrink:0}}>{Ic.logo(18)}</div>
            <div>
              <p style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:"var(--tx)",lineHeight:1,margin:0}}>QASSET</p>
              <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--brand-3)",letterSpacing:"3px",margin:0,marginTop:2}}>PLUS</p>
            </div>
          </div>
          <div style={{background:"var(--surface2)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--wire)",position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,var(--brand-1),var(--brand-3))",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:15,flexShrink:0}}>
                {user?.name?.[0]}
              </div>
              <div style={{minWidth:0}}>
                <p style={{color:"var(--tx)",fontWeight:700,fontSize:13,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.name}</p>
                <p style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--tx3)",fontSize:9,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.email}</p>
              </div>
            </div>
            <div style={{position:"absolute",top:13,[t.dir==="rtl"?"left":"right"]:13,width:7,height:7,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 7px var(--green)"}}/>
          </div>
        </div>
        <div style={{padding:"0 20px 8px"}}>
          <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:600,color:"var(--tx3)",letterSpacing:"3px",textTransform:"uppercase"}}>NAVIGATION</p>
        </div>
        <nav style={{flex:1,padding:"0 10px 10px"}}>
          {navItems.map(item=>{
            const on = sub===item.id
            return (
              <button key={item.id} onClick={()=>setSub(item.id)}
                style={{display:"flex",alignItems:"center",gap:11,width:"100%",padding:"10px 13px",borderRadius:10,color:on?"var(--brand-1)":"var(--tx3)",fontWeight:on?700:600,fontSize:14,cursor:"pointer",marginBottom:2,transition:"all .2s",border:"none",background:on?"var(--blT)":"transparent",textAlign:"right",boxShadow:on?"inset 0 0 0 1px rgba(79,124,255,.18)":"none",position:"relative"}}
                onMouseEnter={e=>{if(!on){e.currentTarget.style.background="var(--surface2)";e.currentTarget.style.color="var(--tx2)"}}}
                onMouseLeave={e=>{if(!on){e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--tx3)"}}}
              >
                {on && <div style={{position:"absolute",[t.dir==="rtl"?"right":"left"]:0,top:"18%",bottom:"18%",width:2.5,borderRadius:2,background:"linear-gradient(180deg,var(--brand-1),var(--brand-3))"}}/>}
                <span style={{width:32,height:32,borderRadius:9,background:on?"rgba(79,124,255,.12)":"var(--surface2)",border:`1px solid ${on?"rgba(79,124,255,.22)":"var(--wire)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:on?"var(--brand-1)":"var(--tx3)",flexShrink:0,transition:"all .2s"}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {on && <div style={{width:5,height:5,borderRadius:"50%",background:"var(--brand-1)",flexShrink:0}}/>}
              </button>
            )
          })}
        </nav>
        <div style={{padding:"12px 10px 18px",borderTop:"1px solid var(--wire)"}}>
          <div style={{display:"flex",gap:7,marginBottom:8,padding:"0 2px"}}><LangToggle/><ThemeToggle/></div>
          <button onClick={()=>setPg("home")} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 13px",borderRadius:9,color:"var(--tx2)",fontSize:13,fontWeight:600,marginBottom:5,background:"var(--surface2)",border:"1px solid var(--wire)",cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--wire2)";e.currentTarget.style.color="var(--tx)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--wire)";e.currentTarget.style.color="var(--tx2)"}}
          >{Ic.globe(13)} <span>{t.dash.publicSite}</span></button>
          <button onClick={()=>{logout();setPg("home")}} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 13px",borderRadius:9,background:"rgba(255,107,107,.05)",color:"var(--red)",fontSize:13,fontWeight:600,border:"1px solid rgba(255,107,107,.1)",cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,107,.1)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,107,107,.05)"}
          >{Ic.logout()} <span>{t.dash.logout}</span></button>
        </div>
      </aside>
      <main style={{flex:1,[t.dir==="rtl"?"marginRight":"marginLeft"]:W,minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
        <div style={{position:"sticky",top:0,zIndex:100,background:"var(--navBg)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--wire)",padding:"0 28px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",direction:t.dir}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:700,color:"var(--tx)",margin:0}}>
            {navItems.find(n=>n.id===sub)?.label||t.dash.welcome}
          </h2>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"var(--blT2)",border:"1px solid rgba(79,124,255,.12)",borderRadius:20,padding:"4px 12px",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 6px var(--green)"}}/>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--brand-1)",letterSpacing:"1px",fontWeight:600}}>LIVE</span>
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--tx3)"}}>
              {new Date().toLocaleDateString(t.dir==="rtl"?"ar-EG":"en-GB",{day:"numeric",month:"short",year:"numeric"})}
            </div>
          </div>
        </div>
        <div style={{flex:1,padding:"28px",direction:t.dir,overflowY:"auto"}}>
          {children}
        </div>
      </main>
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({icon, label, value, sub, color}) {
  return (
    <div style={{background:"var(--surface)",borderRadius:18,padding:"20px 22px",border:"1px solid var(--wire)",transition:"all .3s",position:"relative",overflow:"hidden",cursor:"default"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"50";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 16px 40px ${color}12`}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--wire)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}
    >
      <div style={{position:"absolute",top:-16,right:-16,width:80,height:80,borderRadius:"50%",background:`radial-gradient(circle,${color}15 0%,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative"}}>
        <div>
          <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",margin:"0 0 10px",textTransform:"uppercase",letterSpacing:"2px"}}>{label}</p>
          <p style={{fontFamily:"'Sora',sans-serif",fontSize:34,fontWeight:800,color:"var(--tx)",margin:"0 0 5px",lineHeight:1}}>{value}</p>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:color}}/>
            <p style={{fontSize:11,color:"var(--tx3)",margin:0}}>{sub}</p>
          </div>
        </div>
        <div style={{width:46,height:46,borderRadius:14,background:`${color}15`,border:`1px solid ${color}20`,display:"flex",alignItems:"center",justifyContent:"center",color,flexShrink:0}}>{icon}</div>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:1.5,background:`linear-gradient(90deg,transparent,${color}50,transparent)`}}/>
    </div>
  )
}

// ─── DASH OVERVIEW ────────────────────────────────────────────────────────────
function DashOverview() {
  const {t} = useLang()
  const {phones,orders} = useData()
  const rev = orders.filter(o=>o.status==="approved").length * 35000
  const approved = orders.filter(o=>o.status==="approved").length
  const approvalRate = orders.length ? Math.round((approved/orders.length)*100) : 0
  const brands = phones.reduce((a,p)=>{a[p.brand]=(a[p.brand]||0)+1;return a},{})
  return (
    <div style={{direction:t.dir}}>
      <div style={{background:"linear-gradient(135deg,#080E22 0%,#0F1C45 100%)",borderRadius:20,padding:"24px 28px",marginBottom:20,position:"relative",overflow:"hidden",border:"1px solid rgba(79,124,255,.18)"}}>
        <div style={{position:"absolute",top:-30,left:-30,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,92,252,.1) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle, rgba(79,124,255,.04) 1px, transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--brand-3)",letterSpacing:"3px",marginBottom:8,fontWeight:600}}>DASHBOARD · OVERVIEW</p>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:"#EEF2FF",margin:0,lineHeight:1.2}}>{t.dash.welcome} 👋</h1>
            <p style={{color:"rgba(143,164,204,.7)",fontSize:13,marginTop:6}}>{t.dash.sub}</p>
          </div>
          <div style={{textAlign:"center",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:16,padding:"16px 26px"}}>
            <p style={{fontFamily:"'Sora',sans-serif",fontSize:38,fontWeight:800,color:"#EEF2FF",margin:0,lineHeight:1}}>{approvalRate}%</p>
            <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--brand-3)",letterSpacing:"2px",marginTop:5,fontWeight:600}}>{t.dash.kpis[0]}</p>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <StatCard icon={Ic.phone(18)} label={t.dash.stats[0]} value={phones.length} sub={`${phones.filter(p=>p.available).length} ${t.dash.statSub[0]}`} color="#60A5FA"/>
        <StatCard icon={Ic.orders(18)} label={t.dash.stats[1]} value={orders.length} sub={`${orders.filter(o=>o.status==="new").length} ${t.dash.statSub[1]}`} color="var(--gold)"/>
        <StatCard icon={Ic.check(18)} label={t.dash.stats[2]} value={approved} sub={t.dash.statSub[2]} color="var(--green)"/>
        <StatCard icon={Ic.card(18)} label={t.dash.stats[3]} value={`${(rev/1000).toFixed(0)}K`} sub={t.dash.statSub[3]} color="var(--brand-1)"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16}}>
        <div style={{background:"var(--surface)",borderRadius:18,padding:22,border:"1px solid var(--wire)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:"var(--tx)",margin:0}}>{t.dash.lastOrders}</h2>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",background:"var(--surface2)",padding:"3px 10px",borderRadius:20,border:"1px solid var(--wire)",letterSpacing:"1px"}}>{orders.length} TOTAL</span>
          </div>
          {orders.slice(0,5).map(o=>(
            <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 11px",borderRadius:12,marginBottom:4,cursor:"default",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--surface2)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:38,height:38,background:"linear-gradient(135deg,rgba(79,124,255,.18),rgba(0,194,255,.12))",border:"1px solid rgba(79,124,255,.18)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--brand-1)",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,flexShrink:0}}>{o.name[0]}</div>
                <div>
                  <p style={{fontWeight:700,fontSize:13,color:"var(--tx)",margin:"0 0 1px"}}>{o.name}</p>
                  <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",margin:0}}>{o.pname} · {o.city}</p>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                <Badge status={o.status} t={t}/>
                <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",margin:0}}>{o.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"var(--surface)",borderRadius:18,padding:20,border:"1px solid var(--wire)",flex:1}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,marginBottom:16,color:"var(--tx)"}}>{t.dash.brands}</h2>
            {Object.entries(brands).map(([b,c])=>(
              <div key={b} style={{marginBottom:13}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{b}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--brand-1)",fontWeight:700}}>{c}</span>
                </div>
                <div style={{height:3,background:"var(--surface2)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",background:"linear-gradient(90deg,var(--brand-2),var(--brand-1),var(--brand-3))",width:`${(c/phones.length)*100}%`,borderRadius:2,backgroundSize:"200% 100%",animation:"gradMove 4s ease infinite"}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"var(--surface)",borderRadius:18,padding:20,border:"1px solid var(--wire)"}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,marginBottom:12,color:"var(--tx)"}}>حالة الطلبات</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {["new","pending","approved","rejected"].map(s=>{
                const cfg=ST_CONFIG[s]
                return (
                  <div key={s} style={{background:cfg.bg,border:`1px solid ${cfg.c}20`,borderRadius:11,padding:"11px",textAlign:"center"}}>
                    <p style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,color:cfg.c,margin:0,lineHeight:1}}>{orders.filter(o=>o.status===s).length}</p>
                    <p style={{fontSize:10,color:"var(--tx3)",margin:"4px 0 0",fontWeight:600}}>{t.st[s]}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DASH PHONES ──────────────────────────────────────────────────────────────
function DashPhones() {
  const {t} = useLang()
  const {phones, addPhone, editPhone, deletePhone, togglePhone} = useData()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [search, setSearch] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = phones.filter(p=>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = (data) => {
    addPhone({id:`${Date.now()}`,hot:false,specs:{الشريحة:"—",الذاكرة:"8 GB",التخزين:"128 GB",الكاميرا:"50 MP",البطارية:"5000 mAh",الشاشة:'6.5"'},...data})
    setShowForm(false)
  }

  const handleEdit = (data) => {
    editPhone(editTarget.id, data)
    setEditTarget(null)
  }

  const handleDelete = (id) => {
    deletePhone(id)
    setConfirmDelete(null)
  }

  return (
    <div style={{direction:t.dir}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"var(--tx)",margin:0}}>{t.dash.phonesTitle}</h1>
        <button onClick={()=>setShowForm(true)} className="btn-primary" style={{padding:"10px 20px",fontSize:13}}>
          {Ic.plus(13)} {t.dash.addPhone}
        </button>
      </div>

      {showForm && <DeviceFormModal onClose={()=>setShowForm(false)} onSave={handleAdd} t={t}/>}
      {editTarget && <DeviceFormModal onClose={()=>setEditTarget(null)} onSave={handleEdit} initial={editTarget} t={t}/>}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setConfirmDelete(null)}>
          <div style={{background:"var(--surface)",borderRadius:20,border:"1px solid var(--wire)",padding:32,maxWidth:360,width:"100%",animation:"fadeUp .3s cubic-bezier(.22,1,.36,1)",textAlign:"center",boxShadow:"0 40px 80px rgba(0,0,0,.5)"}}>
            <div style={{width:56,height:56,background:"rgba(255,107,107,.06)",border:"1px solid rgba(255,107,107,.15)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",color:"var(--red)"}}>{Ic.trash(24)}</div>
            <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:"var(--tx)",marginBottom:8}}>{t.dash.confirmDelete}</h3>
            <p style={{color:"var(--tx3)",fontSize:13,marginBottom:24}}>{confirmDelete.name}</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>handleDelete(confirmDelete.id)} style={{padding:"10px 24px",borderRadius:10,background:"rgba(255,107,107,.1)",color:"var(--red)",border:"1px solid rgba(255,107,107,.25)",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,107,.2)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,107,107,.1)"}
              >{t.dash.delete}</button>
              <button onClick={()=>setConfirmDelete(null)} className="btn-outline" style={{padding:"10px 24px",fontSize:13}}>{t.dash.cancel}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:"var(--surface)",borderRadius:16,overflow:"hidden",border:"1px solid var(--wire)"}}>
        <div style={{padding:"13px 18px",borderBottom:"1px solid var(--wire)",display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"var(--tx3)"}}>{Ic.search()}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.dash.searchPh} style={{background:"none",border:"none",color:"var(--tx)",fontSize:13,width:240,outline:"none"}}/>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",marginRight:"auto",letterSpacing:"1px"}}>{filtered.length} DEVICES</span>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"var(--surface2)"}}>
              {t.dash.tHeaders.map(h=>(
                <th key={h} style={{padding:"11px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",borderBottom:"1px solid var(--wire)",textTransform:"uppercase",letterSpacing:"2px"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id} className="trow" style={{borderBottom:"1px solid var(--wire)"}}>
                <td style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:11}}>
                    <div style={{width:48,height:48,background:p.image?`${p.color||"#4F7CFF"}10`:"var(--surface2)",border:`1px solid ${p.color||"#4F7CFF"}20`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                      {p.image ? <img src={p.image} alt={p.name} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>e.target.style.display="none"}/> : <span style={{color:p.color||"#4F7CFF",opacity:.4}}>{Ic.phone(20)}</span>}
                    </div>
                    <div>
                      <p style={{fontWeight:700,fontSize:13,color:"var(--tx)",margin:"0 0 2px"}}>{p.name}</p>
                      {p.hot && <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--accent)",background:"rgba(255,107,53,.08)",border:"1px solid rgba(255,107,53,.15)",borderRadius:4,padding:"1px 6px",letterSpacing:"1px"}}>HOT</span>}
                    </div>
                  </div>
                </td>
                <td style={{padding:"12px 16px",fontSize:12,color:"var(--tx2)"}}>{p.brand}</td>
                <td style={{padding:"12px 16px",fontWeight:700,fontSize:13,color:"var(--tx)"}}>{p.price.toLocaleString("ar-EG")} ج.م</td>
                <td style={{padding:"12px 16px"}}>
                  <span style={{background:p.available?"rgba(16,217,160,.07)":"rgba(255,107,107,.07)",color:p.available?"var(--green)":"var(--red)",borderRadius:20,padding:"3px 11px",fontSize:10,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>
                    {p.available?t.dash.active:t.dash.inactive}
                  </span>
                </td>
                <td style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setEditTarget(p)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:8,border:"1px solid var(--wire2)",background:"var(--surface2)",color:"var(--brand-1)",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="var(--blT)";e.currentTarget.style.borderColor="var(--brand-1)"}}
                      onMouseLeave={e=>{e.currentTarget.style.background="var(--surface2)";e.currentTarget.style.borderColor="var(--wire2)"}}
                    >{Ic.edit(11)} {t.dash.edit}</button>
                    <button onClick={()=>togglePhone(p.id)} className="btn-outline" style={{padding:"5px 11px",fontSize:11}}>{p.available?t.dash.stop:t.dash.activate}</button>
                    <button onClick={()=>setConfirmDelete(p)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 11px",borderRadius:8,background:"rgba(255,107,107,.05)",color:"var(--red)",border:"1px solid rgba(255,107,107,.12)",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .2s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,107,.12)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,107,107,.05)"}
                    >{Ic.trash(11)} {t.dash.delete}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{padding:"40px 20px",textAlign:"center"}}>
            <p style={{color:"var(--tx3)",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,letterSpacing:"2px"}}>NO DEVICES FOUND</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DASH ORDERS ──────────────────────────────────────────────────────────────
function DashOrders() {
  const {t} = useLang()
  const {orders, updateOrderStatus} = useData()
  const [filter,setFilter] = useState("all")
  const filtered = filter==="all" ? orders : orders.filter(o=>o.status===filter)
  return (
    <div style={{direction:t.dir}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"var(--tx)",marginBottom:20}}>{t.dash.ordersTitle}</h1>
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
        {[["all",t.dash.filterAll],["new",t.st.new],["pending",t.st.pending],["approved",t.st.approved],["rejected",t.st.rejected]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:"5px 14px",borderRadius:20,fontWeight:600,fontSize:12,transition:"all .2s",border:`1px solid ${filter===v?"var(--brand-1)":"var(--wire)"}`,background:filter===v?"var(--blT)":"transparent",color:filter===v?"var(--brand-1)":"var(--tx3)"}}>
            {l} ({v==="all"?orders.length:orders.filter(o=>o.status===v).length})
          </button>
        ))}
      </div>
      <div style={{background:"var(--surface)",borderRadius:16,overflow:"hidden",border:"1px solid var(--wire)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"var(--surface2)"}}>
              {t.dash.oHeaders.map(h=>(
                <th key={h} style={{padding:"11px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",borderBottom:"1px solid var(--wire)",textTransform:"uppercase",letterSpacing:"2px"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o=>(
              <tr key={o.id} className="trow" style={{borderBottom:"1px solid var(--wire)"}}>
                <td style={{padding:"12px 16px"}}>
                  <p style={{fontWeight:700,fontSize:13,color:"var(--tx)",margin:"0 0 2px"}}>{o.name}</p>
                  <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",margin:0,direction:"ltr",textAlign:t.dir==="rtl"?"right":"left"}}>{o.phone}</p>
                </td>
                <td style={{padding:"12px 16px",fontSize:12,color:"var(--tx2)",fontWeight:600}}>{o.pname}</td>
                <td style={{padding:"12px 16px",fontSize:12,color:"var(--tx3)"}}>{o.city}</td>
                <td style={{padding:"12px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--tx3)"}}>{o.notes}</td>
                <td style={{padding:"12px 16px"}}><Badge status={o.status} t={t}/></td>
                <td style={{padding:"12px 16px"}}>
                  <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)} className="inp" style={{width:"auto",padding:"5px 10px",fontSize:11}}>
                    {["new","pending","approved","rejected"].map(s=><option key={s} value={s}>{t.st[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── DASH PLANS ───────────────────────────────────────────────────────────────
function DashPlans() {
  const {t} = useLang()
  const {phones} = useData()
  const all = Object.entries(PLANS).flatMap(([pid,plans])=>{
    const ph=phones.find(p=>p.id===pid)
    return ph ? plans.map(pl=>({...pl,pname:ph.name,color:ph.color||"#4F7CFF",img:ph.image||""})) : []
  })
  return (
    <div style={{direction:t.dir}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"var(--tx)",marginBottom:20}}>{t.dash.plansTitle}</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:13}}>
        {all.map(p=>(
          <div key={p.id} style={{background:"var(--surface)",borderRadius:16,padding:18,border:"1px solid var(--wire)",borderTop:`2px solid ${p.color}40`,transition:"transform .3s,border-top-color .3s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.borderTopColor=p.color}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderTopColor=p.color+"40"}}
          >
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:13}}>
              {p.img && <img src={p.img} alt={p.pname} style={{width:32,height:32,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>}
              <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"1px",flex:1}}>{p.pname}</p>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <p style={{fontFamily:"'Sora',sans-serif",fontSize:34,fontWeight:800,color:"var(--tx)",margin:0,lineHeight:1}}>{p.m}</p>
                <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",marginTop:3,letterSpacing:"1px"}}>شهر</p>
              </div>
              <div style={{textAlign:"left"}}>
                <p style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:p.color,margin:"0 0 2px",lineHeight:1}}>{p.mo.toLocaleString("ar-EG")}</p>
                <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--tx3)",letterSpacing:"1px"}}>ج.م / شهر</p>
              </div>
            </div>
            <div style={{background:"var(--surface2)",borderRadius:8,padding:"9px 12px",fontSize:12,border:"1px solid var(--wire)"}}>
              <span style={{color:"var(--tx3)"}}>المقدم: </span>
              <span style={{fontWeight:700,color:"var(--tx)",fontSize:13}}>{p.dp.toLocaleString("ar-EG")} ج.م</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DASH ANALYTICS ───────────────────────────────────────────────────────────
function DashAnalytics() {
  const {t} = useLang()
  const {phones,orders} = useData()
  const bySt = Object.fromEntries(["new","pending","approved","rejected"].map(s=>[s,orders.filter(o=>o.status===s).length]))
  const byCity = orders.reduce((a,o)=>{a[o.city]=(a[o.city]||0)+1;return a},{})
  const maxC = Math.max(1,...Object.values(byCity))
  return (
    <div style={{direction:t.dir}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"var(--tx)",marginBottom:20}}>{t.dash.analyticsTitle}</h1>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={{background:"var(--surface)",borderRadius:16,padding:22,border:"1px solid var(--wire)"}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,marginBottom:18,color:"var(--tx)"}}>{t.dash.byStatus}</h2>
          {Object.entries(bySt).map(([s,c])=>(
            <div key={s} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,alignItems:"center"}}>
                <Badge status={s} t={t}/>
                <span style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:"var(--tx)"}}>{c}</span>
              </div>
              <div style={{height:4,background:"var(--surface2)",borderRadius:2}}><div style={{height:"100%",background:ST_CONFIG[s].c,borderRadius:2,width:`${orders.length?(c/orders.length)*100:0}%`,transition:"width .8s"}}/></div>
            </div>
          ))}
        </div>
        <div style={{background:"var(--surface)",borderRadius:16,padding:22,border:"1px solid var(--wire)"}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,marginBottom:18,color:"var(--tx)"}}>{t.dash.byCity}</h2>
          {Object.entries(byCity).sort((a,b)=>b[1]-a[1]).map(([city,count])=>(
            <div key={city} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{city}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--tx3)"}}>{count}</span>
              </div>
              <div style={{height:4,background:"var(--surface2)",borderRadius:2}}><div style={{height:"100%",background:"linear-gradient(90deg,var(--brand-2),var(--brand-1))",borderRadius:2,width:`${(count/maxC)*100}%`,transition:"width .8s"}}/></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13}}>
        {[
          {label:t.dash.kpis[0],value:`${orders.length?Math.round((bySt.approved/orders.length)*100):0}%`,color:"var(--green)"},
          {label:t.dash.kpis[1],value:phones.length?`${Math.round(phones.reduce((a,p)=>a+p.price,0)/phones.length/1000)}K`:"—",color:"var(--brand-1)"},
          {label:t.dash.kpis[2],value:`${phones.filter(p=>p.available).length}/${phones.length}`,color:"#60A5FA"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--surface)",borderRadius:16,padding:22,textAlign:"center",border:"1px solid var(--wire)"}}>
            <p style={{fontFamily:"'Sora',sans-serif",fontSize:38,fontWeight:800,color:s.color,margin:"0 0 6px"}}>{s.value}</p>
            <p style={{fontSize:12,color:"var(--tx3)"}}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DASH CUSTOMERS ───────────────────────────────────────────────────────────
function DashCustomers() {
  const {t} = useLang()
  const {orders} = useData()
  const customers = [...new Map(orders.map(o=>[o.phone,o])).values()]
  const colors = ["#4F7CFF","#00C2FF","#7C5CFC","#10D9A0","#F59E0B","#FF6B35"]
  return (
    <div style={{direction:t.dir}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"var(--tx)",marginBottom:20}}>{t.dash.customersTitle}</h1>
      <div style={{background:"var(--surface)",borderRadius:16,overflow:"hidden",border:"1px solid var(--wire)"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid var(--wire)"}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--tx3)",fontSize:9,letterSpacing:"2px"}}>{customers.length} CLIENTS</span>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"var(--surface2)"}}>
              {t.dash.cHeaders.map(h=>(
                <th key={h} style={{padding:"11px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",borderBottom:"1px solid var(--wire)",textTransform:"uppercase",letterSpacing:"2px"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c,i)=>(
              <tr key={c.id} className="trow" style={{borderBottom:"1px solid var(--wire)"}}>
                <td style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,background:colors[i%colors.length],borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:14,flexShrink:0}}>{c.name[0]}</div>
                    <span style={{fontWeight:700,fontSize:13,color:"var(--tx)"}}>{c.name}</span>
                  </div>
                </td>
                <td style={{padding:"12px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--tx3)",direction:"ltr",textAlign:t.dir==="rtl"?"right":"left"}}>{c.phone}</td>
                <td style={{padding:"12px 16px",fontSize:12,color:"var(--tx3)"}}>{c.city}</td>
                <td style={{padding:"12px 16px",fontSize:12,color:"var(--tx2)",fontWeight:600}}>{c.pname}</td>
                <td style={{padding:"12px 16px"}}><Badge status={c.status} t={t}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── DASH SETTINGS ────────────────────────────────────────────────────────────
function DashSettings() {
  const {t} = useLang()
  const [s,setS] = useState({storeName:"QASSET+",whatsapp:"201000000000",email:"info@qasset.com",address:"القاهرة، مصر"})
  const [saved,setSaved] = useState(false)

  // FIX: load settings from localStorage only after mount
  useEffect(() => {
    const stored = loadFromStorage(STORAGE_KEYS.settings, null)
    if (stored) setS(stored)
  }, [])

  const save = () => { saveToStorage(STORAGE_KEYS.settings,s); setSaved(true); setTimeout(()=>setSaved(false),2200) }
  return (
    <div style={{direction:t.dir}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"var(--tx)",marginBottom:20}}>{t.dash.settingsTitle}</h1>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:"var(--surface)",borderRadius:16,padding:26,border:"1px solid var(--wire)"}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,marginBottom:20,color:"var(--tx)"}}>{t.dash.storeInfo}</h2>
          {t.dash.sFields.map((l,i)=>{
            const keys=["storeName","whatsapp","email","address"]
            return (
              <div key={l} style={{marginBottom:16}}>
                <label style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"var(--tx3)",marginBottom:8,display:"block",textTransform:"uppercase",letterSpacing:"2px"}}>{l}</label>
                <input value={s[keys[i]]||""} onChange={e=>setS(p=>({...p,[keys[i]]:e.target.value}))} className="inp" style={{fontSize:13}}/>
              </div>
            )
          })}
          <button onClick={save} className="btn-primary" style={{padding:"11px 28px",fontSize:13}}>
            {saved?<>{Ic.check(13)} {t.dash.saved}</>:t.dash.saveSettings}
          </button>
        </div>
        <div style={{background:"var(--surface)",borderRadius:16,padding:26,border:"1px solid var(--wire)"}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,marginBottom:20,color:"var(--tx)"}}>{t.dash.accInfo}</h2>
          <div style={{background:"var(--surface2)",borderRadius:14,padding:18,marginBottom:14,border:"1px solid var(--wire)"}}>
            <div style={{width:52,height:52,background:"linear-gradient(135deg,var(--brand-2),var(--brand-1))",borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",marginBottom:16}}>{Ic.users(20)}</div>
            {t.dash.accFields.map((k,i)=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:11,fontSize:13}}>
                <span style={{color:"var(--tx3)"}}>{k}</span>
                <span style={{fontWeight:700,color:"var(--tx)",fontSize:13}}>{t.dash.accVals[i]}</span>
              </div>
            ))}
          </div>
          <div style={{background:"var(--blT2)",border:"1px solid rgba(79,124,255,.12)",borderRadius:12,padding:14}}>
            <p style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--brand-1)",margin:0,lineHeight:1.8,letterSpacing:".3px"}}>البيانات محفوظة محلياً · localStorage</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({setPg}) {
  const [sub,setSub] = useState("overview")
  const pages = {overview:<DashOverview/>,phones:<DashPhones/>,orders:<DashOrders/>,plans:<DashPlans/>,analytics:<DashAnalytics/>,customers:<DashCustomers/>,settings:<DashSettings/>}
  return <DashLayout sub={sub} setSub={setSub} setPg={setPg}>{pages[sub]||<DashOverview/>}</DashLayout>
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <DataProvider>
            <InjectCSS/>
            <Main/>
          </DataProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  )
}

function Main() {
  const {user} = useAuth()
  const {dark} = useTheme()
  const {t} = useLang()
  const [pg,setPg] = useState("home")
  const [phone,setPhone] = useState(null)
  const chrome = pg !== "dashboard"

  const render = () => {
    switch(pg) {
      case "home":         return <HomePage setPg={setPg} setPhone={setPhone}/>
      case "phones":       return <PhonesPage setPg={setPg} setPhone={setPhone}/>
      case "phone-detail": return phone ? <PhoneDetailPage phone={phone} setPg={setPg}/> : <HomePage setPg={setPg} setPhone={setPhone}/>
      case "order":        return <OrderPage setPg={setPg}/>
      case "login":        return <LoginPage setPg={setPg}/>
      case "signup":       return <SignupPage setPg={setPg}/>
      case "dashboard":    return user ? <DashboardPage setPg={setPg}/> : <LoginPage setPg={setPg}/>
      default:             return <HomePage setPg={setPg} setPhone={setPhone}/>
    }
  }

  return (
    <div data-theme={dark?"dark":"light"} style={{minHeight:"100vh",background:"var(--bg)",fontFamily:"'Sora','Cairo',sans-serif",direction:t.dir,transition:"background .3s,color .3s"}}>
      {chrome && <Navbar pg={pg} setPg={setPg}/>}
      <div key={pg} style={{animation:"fadeIn .3s ease"}}>{render()}</div>
      {chrome && <Footer setPg={setPg}/>}
      {chrome && (
        <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer"
          style={{position:"fixed",bottom:26,left:26,zIndex:500,width:54,height:54,background:"#25D366",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:"0 8px 28px rgba(37,211,102,.35)",transition:"all .3s"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 12px 36px rgba(37,211,102,.5)"}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 8px 28px rgba(37,211,102,.35)"}}
        >{Ic.wa(21)}</a>
      )}
    </div>
  )
}