import { useState, useEffect, useRef, useCallback } from "react";

const SUPABASE_URL = "https://hawfbykssbdmlhvavbzq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhd2ZieWtzc2JkbWxodmF2YnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzIyNzQsImV4cCI6MjA4ODYwODI3NH0.XSdsYv9amoA8sZYEpKJ-TZPQxj-Bubj9D1xBLGvShlk";

const api = async (method, path, body) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (method === "DELETE" || method === "PATCH") return true;
  const text = await res.text();
  return text ? JSON.parse(text) : [];
};

const LANGS = {
  de: {
    flag: "🇩🇪", name: "Deutsch", rtl: false, currency: "€",
    appTitle: "SHISHA BAR", appSub: "SCHULDEN TRACKER",
    addBtn: "+ NEU", totalDebt: "Offene Schulden", customers: "Kunden", overdue: "Überfällig",
    searchPlaceholder: "Name oder Nummer...", noDebt: "Keine offenen Schulden", noDebtSub: "Mit + NEU beginnen",
    newDebt: "NEUE SCHULD", addCustomer: "KUNDE HINZUFÜGEN", detail: "DETAILS",
    labelName: "Name *", labelPhone: "Telefon", labelNote: "Notiz",
    placeholderName: "Name des Kunden", placeholderPhone: "+49...", placeholderNote: "Zusätzliche Info...",
    addPhoto: "📷 Foto hinzufügen", changePhoto: "📷 Foto ändern",
    saveBtn: "💾 SPEICHERN", loading: "Laden...", saving: "Speichern...",
    debtsTab: "Schulden", historyTab: "Verlauf", infoTab: "Info",
    addNewDebt: "+ NEUE SCHULD HINZUFÜGEN",
    debtLabel: "Schuld #", debtAmount: "Betrag (€) *", debtNote: "Notiz", debtDue: "Fällig am",
    addDebtBtn: "💾 Schuld Speichern",
    remaining: "OFFENER BETRAG", totalLabel: "Gesamt", callBtn: "📞 Anrufen",
    receivePayment: "💰 ZAHLUNG ERFASSEN", recordPayment: "✅ ZAHLUNG SPEICHERN",
    paymentHistory: "📋 ZAHLUNGSVERLAUF", debtDate: "Schulddatum", dueDate: "Fällig am",
    deleteBtn: "🗑️ Eintrag löschen", confirmDelete: "Wirklich löschen?",
    confirmNo: "Nein", confirmYes: "Ja, löschen",
    statusPaid: "✅ BEZAHLT", statusOverdue: "🔴 ÜBERFÄLLIG", statusPending: "⏳ OFFEN",
    toastAdded: "✅ Kunde gespeichert!", toastDebtAdded: "✅ Schuld hinzugefügt!",
    toastPayment: "💰 Zahlung erfasst!", toastDeleted: "🗑️ Gelöscht",
    toastError: "⚠️ Name erforderlich!", toastDebtError: "⚠️ Betrag eingeben!",
    toastPayError: "⚠️ Betrag eingeben!", toastUndo: "↩ Zahlung rückgängig!",
    today: "Heute", yesterday: "Gestern", daysAgo: (n) => `Vor ${n} Tagen`,
  },
  tr: {
    flag: "🇹🇷", name: "Türkçe", rtl: false, currency: "€",
    appTitle: "SHISHA BAR", appSub: "VERESİYE TAKİP",
    addBtn: "+ YENİ", totalDebt: "Toplam Borç", customers: "Müşteri", overdue: "Gecikmiş",
    searchPlaceholder: "İsim veya numara...", noDebt: "Açık borç yok", noDebtSub: "+ YENİ ile başlayın",
    newDebt: "YENİ VERESİYE", addCustomer: "MÜŞTERİ EKLE", detail: "DETAY",
    labelName: "İsim *", labelPhone: "Telefon", labelNote: "Not",
    placeholderName: "Müşteri adı", placeholderPhone: "+49...", placeholderNote: "Ek bilgi...",
    addPhoto: "📷 Fotoğraf ekle", changePhoto: "📷 Fotoğrafı değiştir",
    saveBtn: "💾 KAYDET", loading: "Yükleniyor...", saving: "Kaydediliyor...",
    debtsTab: "Borçlar", historyTab: "Geçmiş", infoTab: "Bilgi",
    addNewDebt: "+ YENİ BORÇ EKLE",
    debtLabel: "Borç #", debtAmount: "Tutar (€) *", debtNote: "Not", debtDue: "Son Ödeme",
    addDebtBtn: "💾 Borç Kaydet",
    remaining: "KALAN BORÇ", totalLabel: "Toplam", callBtn: "📞 Ara",
    receivePayment: "💰 ÖDEME AL", recordPayment: "✅ ÖDEME KAYDET",
    paymentHistory: "📋 ÖDEME GEÇMİŞİ", debtDate: "Borç Tarihi", dueDate: "Son Ödeme",
    deleteBtn: "🗑️ Kaydı Sil", confirmDelete: "Gerçekten silinsin mi?",
    confirmNo: "Hayır", confirmYes: "Evet, Sil",
    statusPaid: "✅ ÖDENDİ", statusOverdue: "🔴 GECİKMİŞ", statusPending: "⏳ BEKLEMEDE",
    toastAdded: "✅ Müşteri eklendi!", toastDebtAdded: "✅ Borç eklendi!",
    toastPayment: "💰 Ödeme kaydedildi!", toastDeleted: "🗑️ Silindi",
    toastError: "⚠️ İsim gerekli!", toastDebtError: "⚠️ Tutar girin!",
    toastPayError: "⚠️ Tutar girin!", toastUndo: "↩ Ödeme geri alındı!",
    today: "Bugün", yesterday: "Dün", daysAgo: (n) => `${n} gün önce`,
  },
  fa: {
    flag: "🇮🇷", name: "فارسی", rtl: true, currency: "€",
    appTitle: "قلیان بار", appSub: "ردیاب بدهی",
    addBtn: "+ جدید", totalDebt: "بدهی کل", customers: "مشتری", overdue: "سررسید گذشته",
    searchPlaceholder: "جستجو...", noDebt: "بدهی باز وجود ندارد", noDebtSub: "با + جدید شروع کنید",
    newDebt: "بدهی جدید", addCustomer: "افزودن مشتری", detail: "جزئیات",
    labelName: "نام *", labelPhone: "تلفن", labelNote: "یادداشت",
    placeholderName: "نام مشتری", placeholderPhone: "+49...", placeholderNote: "اطلاعات اضافی...",
    addPhoto: "📷 افزودن عکس", changePhoto: "📷 تغییر عکس",
    saveBtn: "💾 ذخیره", loading: "در حال بارگذاری...", saving: "در حال ذخیره...",
    debtsTab: "بدهی‌ها", historyTab: "تاریخچه", infoTab: "اطلاعات",
    addNewDebt: "+ افزودن بدهی جدید",
    debtLabel: "بدهی #", debtAmount: "مبلغ (€) *", debtNote: "یادداشت", debtDue: "سررسید",
    addDebtBtn: "💾 ذخیره بدهی",
    remaining: "مانده بدهی", totalLabel: "کل", callBtn: "📞 تماس",
    receivePayment: "💰 دریافت پرداخت", recordPayment: "✅ ثبت پرداخت",
    paymentHistory: "📋 تاریخچه", debtDate: "تاریخ بدهی", dueDate: "سررسید",
    deleteBtn: "🗑️ حذف", confirmDelete: "آیا مطمئن هستید؟",
    confirmNo: "خیر", confirmYes: "بله، حذف",
    statusPaid: "✅ پرداخت شد", statusOverdue: "🔴 سررسید گذشته", statusPending: "⏳ باز",
    toastAdded: "✅ مشتری اضافه شد!", toastDebtAdded: "✅ بدهی اضافه شد!",
    toastPayment: "💰 پرداخت ثبت شد!", toastDeleted: "🗑️ حذف شد",
    toastError: "⚠️ نام الزامی است!", toastDebtError: "⚠️ مبلغ وارد کنید!",
    toastPayError: "⚠️ مبلغ وارد کنید!", toastUndo: "↩ پرداخت برگشت داده شد!",
    today: "امروز", yesterday: "دیروز", daysAgo: (n) => `${n} روز پیش`,
  },
  en: {
    flag: "🇬🇧", name: "English", rtl: false, currency: "€",
    appTitle: "SHISHA BAR", appSub: "CREDIT TRACKER",
    addBtn: "+ NEW", totalDebt: "Total Debt", customers: "Customers", overdue: "Overdue",
    searchPlaceholder: "Search name or number...", noDebt: "No open debts", noDebtSub: "Start with + NEW",
    newDebt: "NEW DEBT", addCustomer: "ADD CUSTOMER", detail: "DETAIL",
    labelName: "Name *", labelPhone: "Phone", labelNote: "Note",
    placeholderName: "Customer name", placeholderPhone: "+49...", placeholderNote: "Additional info...",
    addPhoto: "📷 Add Photo", changePhoto: "📷 Change Photo",
    saveBtn: "💾 SAVE", loading: "Loading...", saving: "Saving...",
    debtsTab: "Debts", historyTab: "History", infoTab: "Info",
    addNewDebt: "+ ADD NEW DEBT",
    debtLabel: "Debt #", debtAmount: "Amount (€) *", debtNote: "Note", debtDue: "Due Date",
    addDebtBtn: "💾 Save Debt",
    remaining: "REMAINING DEBT", totalLabel: "Total", callBtn: "📞 Call",
    receivePayment: "💰 RECEIVE PAYMENT", recordPayment: "✅ RECORD PAYMENT",
    paymentHistory: "📋 PAYMENT HISTORY", debtDate: "Debt Date", dueDate: "Due Date",
    deleteBtn: "🗑️ Delete Record", confirmDelete: "Really delete?",
    confirmNo: "No", confirmYes: "Yes, Delete",
    statusPaid: "✅ PAID", statusOverdue: "🔴 OVERDUE", statusPending: "⏳ PENDING",
    toastAdded: "✅ Customer saved!", toastDebtAdded: "✅ Debt added!",
    toastPayment: "💰 Payment recorded!", toastDeleted: "🗑️ Deleted",
    toastError: "⚠️ Name required!", toastDebtError: "⚠️ Enter amount!",
    toastPayError: "⚠️ Enter amount!", toastUndo: "↩ Payment undone!",
    today: "Today", yesterday: "Yesterday", daysAgo: (n) => `${n} days ago`,
  },
};

const fmtDate = (d) => new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
const daysDiff = (d, t) => {
  const n = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (n === 0) return t.today;
  if (n === 1) return t.yesterday;
  return t.daysAgo(n);
};

export default function ShishaBar() {
  const [lang, setLang] = useState("de");
  const t = LANGS[lang];
  const [isOwner, setIsOwner] = useState(() => {
    try { return localStorage.getItem("shisha_owner_mode") === "true"; }
    catch { return false; }
  });
  const toggleOwner = () => {
    setIsOwner(p => {
      const next = !p;
      try { localStorage.setItem("shisha_owner_mode", String(next)); } catch {}
      return next;
    });
  };

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab] = useState("debts");
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [activeDebtId, setActiveDebtId] = useState(null);

  const [custForm, setCustForm] = useState({ name: "", phone: "", note: "", photo: null });
  const [debtForm, setDebtForm] = useState({ amount: "", note: "", dueDate: "", photo: null });
  const [payForm, setPayForm] = useState({ amount: "", note: "", photo: null });

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const photoRef = useRef(null);
  const payPhotoRef = useRef(null);
  const debtPhotoRef = useRef(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2800); };

  // Load from Supabase
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("GET", "customers?select=*&order=created_at.desc");
      setCustomers(Array.isArray(data) ? data.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone || "",
        note: r.note || "",
        photo: r.photo || null,
        createdAt: r.created_at,
        debts: r.debts || [],
      })) : []);
    } catch (e) {
      showToast("⚠️ Verbindungsfehler!");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // Save customer to Supabase
  const saveCustomer = async (customer) => {
    await api("PATCH", `customers?id=eq.${customer.id}`, {
      name: customer.name,
      phone: customer.phone,
      note: customer.note,
      photo: customer.photo,
      debts: customer.debts,
    });
  };

  const selected = customers.find(c => c.id === selectedId);
  const selectedTotal = selected ? selected.debts.filter(d => !d.paid).reduce((a, d) => a + d.remaining, 0) : 0;
  const totalDebt = customers.reduce((s, c) => s + c.debts.filter(d => !d.paid).reduce((a, d) => a + d.remaining, 0), 0);
  const activeCustomers = customers.filter(c => c.debts.some(d => !d.paid)).length;
  const overdueCount = customers.filter(c => c.debts.some(d => !d.paid && d.dueDate && new Date(d.dueDate) < new Date())).length;

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustForm(p => ({ ...p, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const handlePhotoForExisting = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const updated = customers.map(c => c.id === selectedId ? { ...c, photo: ev.target.result } : c);
      setCustomers(updated);
      const cust = updated.find(c => c.id === selectedId);
      if (cust) await saveCustomer(cust);
    };
    reader.readAsDataURL(file);
  };
  const handleDebtPhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDebtForm(p => ({ ...p, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };
  const handlePayPhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPayForm(p => ({ ...p, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const addCustomer = async () => {
    if (!custForm.name.trim()) { showToast(t.toastError); return; }
    setSaving(true);
    try {
      const result = await api("POST", "customers", {
        name: custForm.name.trim(),
        phone: custForm.phone.trim(),
        note: custForm.note.trim(),
        photo: custForm.photo,
        debts: [],
      });
      const r = Array.isArray(result) ? result[0] : result;
      const nc = { id: r.id, name: r.name, phone: r.phone || "", note: r.note || "", photo: r.photo || null, createdAt: r.created_at, debts: [] };
      setCustomers(p => [nc, ...p]);
      setCustForm({ name: "", phone: "", note: "", photo: null });
      setView("list");
      showToast(t.toastAdded);
    } catch { showToast("⚠️ Fehler!"); }
    setSaving(false);
  };

  const addDebt = async (customerId) => {
    if (!debtForm.amount || isNaN(debtForm.amount) || +debtForm.amount <= 0) { showToast(t.toastDebtError); return; }
    setSaving(true);
    const nd = {
      id: Date.now(),
      amount: +debtForm.amount,
      remaining: +debtForm.amount,
      note: debtForm.note.trim(),
      dueDate: debtForm.dueDate || "",
      photo: debtForm.photo || null,
      createdAt: new Date().toISOString(),
      paid: false,
      payments: [],
    };
    const updated = customers.map(c => c.id === customerId ? { ...c, debts: [...c.debts, nd] } : c);
    setCustomers(updated);
    const cust = updated.find(c => c.id === customerId);
    await saveCustomer(cust);
    setDebtForm({ amount: "", note: "", dueDate: "", photo: null });
    setShowAddDebt(false);
    showToast(t.toastDebtAdded);
    setSaving(false);
  };

  const payDebt = async (customerId, debtId) => {
    if (!payForm.amount || isNaN(payForm.amount) || +payForm.amount <= 0) { showToast(t.toastPayError); return; }
    setSaving(true);
    const updated = customers.map(c => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        debts: c.debts.map(d => {
          if (d.id !== debtId) return d;
          const paid = Math.min(+payForm.amount, d.remaining);
          const newRemaining = Math.max(0, d.remaining - paid);
          return {
            ...d,
            remaining: newRemaining,
            paid: newRemaining === 0,
            payments: [...d.payments, { id: Date.now(), amount: paid, note: payForm.note, photo: payForm.photo || null, prevRemaining: d.remaining, date: new Date().toISOString() }],
          };
        }),
      };
    });
    setCustomers(updated);
    const cust = updated.find(c => c.id === customerId);
    await saveCustomer(cust);
    setPayForm({ amount: "", note: "", photo: null });
    setActiveDebtId(null);
    showToast(t.toastPayment);
    setSaving(false);
  };

  const markDebtPaid = async (customerId, debtId) => {
    setSaving(true);
    const updated = customers.map(c => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        debts: c.debts.map(d => {
          if (d.id !== debtId) return d;
          return { ...d, remaining: 0, paid: true, payments: [...d.payments, { id: Date.now(), amount: d.remaining, note: "Vollständig bezahlt", photo: null, prevRemaining: d.remaining, date: new Date().toISOString() }] };
        }),
      };
    });
    setCustomers(updated);
    const cust = updated.find(c => c.id === customerId);
    await saveCustomer(cust);
    showToast(t.toastPayment);
    setSaving(false);
  };

  const undoPayment = async (customerId, debtId, paymentId) => {
    setSaving(true);
    const updated = customers.map(c => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        debts: c.debts.map(d => {
          if (d.id !== debtId) return d;
          const payment = d.payments.find(p => p.id === paymentId);
          if (!payment) return d;
          return { ...d, remaining: payment.prevRemaining !== undefined ? payment.prevRemaining : d.remaining + payment.amount, paid: false, payments: d.payments.filter(p => p.id !== paymentId) };
        }),
      };
    });
    setCustomers(updated);
    const cust = updated.find(c => c.id === customerId);
    await saveCustomer(cust);
    showToast(t.toastUndo);
    setSaving(false);
  };

  const deleteCustomer = async (id) => {
    setSaving(true);
    await api("DELETE", `customers?id=eq.${id}`);
    setCustomers(p => p.filter(c => c.id !== id));
    setView("list"); setSelectedId(null); setConfirmDel(null);
    showToast(t.toastDeleted);
    setSaving(false);
  };

  const sendWhatsApp = () => {
    const open = customers.filter(c => c.debts.some(d => !d.paid));
    if (!open.length) { showToast("Keine offenen Zahlungen!"); return; }
    const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
    let msg = "🪔 *SHISHA BAR - OFFENE ZAHLUNGEN*\nDatum: " + date + "\n\n";
    open.forEach((c, i) => {
      const total = c.debts.filter(d => !d.paid).reduce((a, d) => a + d.remaining, 0);
      const debts = c.debts.filter(d => !d.paid);
      msg += (i + 1) + ". *" + c.name + "* - Gesamt: €" + total.toLocaleString("de-DE") + "\n";
      debts.forEach((d, di) => {
        const overdue = d.dueDate && new Date(d.dueDate) < new Date();
        msg += "   " + (di + 1) + ". €" + d.remaining.toLocaleString("de-DE");
        if (d.note) msg += " (" + d.note + ")";
        if (overdue) msg += " ⚠️";
        msg += "\n";
      });
      msg += "\n";
    });
    msg += "*Gesamt: €" + totalDebt.toLocaleString("de-DE") + "* (" + open.length + " Personen)\nBitte bald bezahlen! 🙏";
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  };

  const copyWhatsApp = () => {
    const open = customers.filter(c => c.debts.some(d => !d.paid));
    if (!open.length) { showToast("Keine offenen Zahlungen!"); return; }
    const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
    let msg = "🪔 *SHISHA BAR - OFFENE ZAHLUNGEN*\nDatum: " + date + "\n\n";
    open.forEach((c, i) => {
      const total = c.debts.filter(d => !d.paid).reduce((a, d) => a + d.remaining, 0);
      msg += (i + 1) + ". *" + c.name + "* - €" + total.toLocaleString("de-DE") + "\n";
    });
    msg += "\n*Gesamt: €" + totalDebt.toLocaleString("de-DE") + "*";
    navigator.clipboard.writeText(msg);
    showToast("📋 Kopiert!");
  };

  const filtered = customers
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || "").includes(search))
    .sort((a, b) => {
      const aT = a.debts.filter(d => !d.paid).reduce((s, d) => s + d.remaining, 0);
      const bT = b.debts.filter(d => !d.paid).reduce((s, d) => s + d.remaining, 0);
      return bT - aT;
    });

  const inputSt = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid #2a1f12", borderRadius: "10px",
    color: "#e8d5b7", padding: "12px 14px", fontSize: "14px",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    direction: t.rtl ? "rtl" : "ltr", colorScheme: "dark",
  };

  const tabBtn = (label, tab) => (
    <button onClick={() => setDetailTab(tab)} style={{
      flex: 1, padding: "10px 6px", border: "none",
      background: detailTab === tab ? "rgba(139,90,43,0.4)" : "transparent",
      borderBottom: detailTab === tab ? "2px solid #c4935a" : "2px solid transparent",
      color: detailTab === tab ? "#f5d8a0" : "#6b4f2a",
      fontSize: "12px", fontWeight: "bold", cursor: "pointer",
      fontFamily: "inherit", letterSpacing: "0.5px",
    }}>{label}</button>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d0d",
      fontFamily: t.rtl ? "'Tahoma', sans-serif" : "'Georgia', serif",
      color: "#e8d5b7", maxWidth: "480px", margin: "0 auto",
      direction: t.rtl ? "rtl" : "ltr",
    }}>
      {toast && (
        <div style={{
          position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(20,14,8,0.97)", border: "1px solid #8b5a2b",
          borderRadius: "30px", padding: "10px 22px", fontSize: "13px",
          color: "#f5d8a0", zIndex: 1000, whiteSpace: "nowrap",
          boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
        }}>{toast}</div>
      )}

      {saving && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: "3px",
          background: "linear-gradient(90deg, #8b5a2b, #c4935a, #22c55e)",
          zIndex: 999, animation: "none",
        }} />
      )}

      {/* HEADER */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(13,10,6,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2a1f12", padding: "12px 16px",
      }}>
        <div style={{ display: "flex", gap: "5px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {Object.entries(LANGS).map(([code, l]) => (
            <button key={code} onClick={() => setLang(code)} style={{
              background: lang === code ? "rgba(139,90,43,0.4)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${lang === code ? "#c4935a" : "#2a1f12"}`,
              borderRadius: "20px", padding: "3px 10px",
              color: lang === code ? "#f5d8a0" : "#6b4f2a",
              fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
            }}>{l.flag} {l.name}</button>
          ))}
          <button onClick={toggleOwner} style={{
            marginLeft: "auto",
            background: isOwner ? "rgba(139,90,43,0.35)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isOwner ? "#c4935a" : "#2a1f12"}`,
            borderRadius: "20px", padding: "3px 12px",
            color: isOwner ? "#f5d8a0" : "#4a3520",
            fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
          }}>{isOwner ? "🔓 Owner" : "👁 Guest"}</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {view !== "list" && (
            <button onClick={() => { setView("list"); setSelectedId(null); setShowAddDebt(false); setActiveDebtId(null); }} style={{
              background: "none", border: "none", color: "#c4935a", fontSize: "20px", cursor: "pointer",
            }}>{t.rtl ? "→" : "←"}</button>
          )}
          <div style={{ fontSize: "20px" }}>🪔</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "bold", color: "#f5d8a0", letterSpacing: "1px" }}>
              {view === "list" ? t.appTitle : view === "addCustomer" ? t.newDebt : selected?.name}
            </div>
            <div style={{ fontSize: "10px", color: "#8b6a3e", letterSpacing: "1px" }}>
              {view === "list" ? t.appSub : view === "addCustomer" ? t.addCustomer : t.detail}
            </div>
          </div>
          {view === "list" && isOwner && (
            <button onClick={() => setView("addCustomer")} style={{
              marginLeft: "auto", background: "linear-gradient(135deg, #8b5a2b, #c4935a)",
              border: "none", borderRadius: "10px", color: "#fff",
              padding: "7px 14px", fontSize: "12px", fontWeight: "bold",
              cursor: "pointer", fontFamily: "inherit",
            }}>{t.addBtn}</button>
          )}
          {view === "list" && !isOwner && (
            <div style={{ marginLeft: "auto", fontSize: "11px", color: "#3a2510", padding: "4px 10px", border: "1px solid #1a1008", borderRadius: "20px" }}>
              👁 Read Only
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "14px 16px", position: "relative", zIndex: 1 }}>

        {/* LIST */}
        {view === "list" && (<>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
            {[
              { label: t.totalDebt, value: `€${totalDebt.toLocaleString("de-DE")}`, color: "#ef4444", icon: "💸" },
              { label: t.customers, value: activeCustomers, color: "#f59e0b", icon: "👥" },
              { label: t.overdue, value: overdueCount, color: "#c084fc", icon: "🔴" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2a1f12", borderRadius: "12px", padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: "16px", marginBottom: "3px" }}>{s.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "9px", color: "#6b4f2a", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Today payments */}
          {(() => {
            const todayStr = new Date().toDateString();
            const todayPays = [];
            customers.forEach(c => {
              c.debts.forEach(d => {
                d.payments.forEach(p => {
                  if (new Date(p.date).toDateString() === todayStr) todayPays.push({ customerName: c.name, ...p });
                });
              });
            });
            if (!todayPays.length) return null;
            const todayTotal = todayPays.reduce((s, p) => s + p.amount, 0);
            return (
              <div style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.08),rgba(22,163,74,0.04))", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "12px", padding: "12px 14px", marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "bold", letterSpacing: "1px" }}>HEUTE ERHALTEN</span>
                  <span style={{ fontSize: "15px", fontWeight: "bold", color: "#22c55e" }}>+€{todayTotal.toLocaleString("de-DE")}</span>
                </div>
                {todayPays.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderTop: i > 0 ? "1px solid rgba(34,197,94,0.1)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      {p.photo && <img src={p.photo} alt="" style={{ width: "26px", height: "26px", borderRadius: "4px", objectFit: "cover" }} />}
                      <span style={{ fontSize: "12px", color: "#a0d4a0" }}>{p.customerName}</span>
                      {p.note && <span style={{ fontSize: "10px", color: "#6b4f2a" }}>({p.note})</span>}
                    </div>
                    <span style={{ fontSize: "12px", color: "#22c55e" }}>+€{p.amount.toLocaleString("de-DE")}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {isOwner && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button onClick={sendWhatsApp} style={{ flex: 1, background: "linear-gradient(135deg, #128c7e, #25d366)", border: "none", borderRadius: "10px", color: "#fff", padding: "11px 8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>📤 WhatsApp Send</button>
              <button onClick={copyWhatsApp} style={{ flex: 1, background: "rgba(37,211,102,0.08)", border: "1px solid #25d366", borderRadius: "10px", color: "#25d366", padding: "11px 8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>📋 Copy Message</button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid #2a1f12", borderRadius: "10px", padding: "9px 12px", marginBottom: "12px" }}>
            <span style={{ color: "#6b4f2a" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{ flex: 1, background: "none", border: "none", color: "#e8d5b7", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#8b6a3e", cursor: "pointer" }}>✕</button>}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px", color: "#6b4f2a" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>🪔</div>
              <div>{t.loading}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "#4a3520" }}>
              <div style={{ fontSize: "44px", marginBottom: "10px" }}>🪔</div>
              <div>{t.noDebt}</div>
              <div style={{ fontSize: "12px", marginTop: "5px" }}>{t.noDebtSub}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filtered.map(c => {
                const openDebts = c.debts.filter(d => !d.paid);
                const cTotal = openDebts.reduce((a, d) => a + d.remaining, 0);
                const isOverdue = openDebts.some(d => d.dueDate && new Date(d.dueDate) < new Date());
                const borderColor = cTotal === 0 ? "#22c55e" : isOverdue ? "#ef4444" : "#f59e0b";
                return (
                  <div key={c.id} onClick={() => { setSelectedId(c.id); setView("detail"); setDetailTab("debts"); }}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2a1f12", borderLeft: t.rtl ? "none" : `3px solid ${borderColor}`, borderRight: t.rtl ? `3px solid ${borderColor}` : "none", borderRadius: "12px", padding: "12px 14px", cursor: "pointer", opacity: cTotal === 0 ? 0.45 : 1, display: "flex", gap: "12px", alignItems: "center" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  >
                    <div style={{ width: "46px", height: "46px", borderRadius: "50%", flexShrink: 0, border: `2px solid ${borderColor}`, background: c.photo ? "none" : "rgba(139,90,43,0.2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                      {c.photo ? <img src={c.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "bold", fontSize: "15px", color: "#f5d8a0" }}>{c.name}</div>
                      {c.phone && <div style={{ fontSize: "11px", color: "#8b6a3e" }}>📞 {c.phone}</div>}
                      <div style={{ fontSize: "11px", color: "#6b4f2a", marginTop: "2px" }}>{openDebts.length} offene Schuld{openDebts.length !== 1 ? "en" : ""}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "17px", fontWeight: "bold", color: borderColor }}>€{cTotal.toLocaleString("de-DE")}</div>
                      {isOverdue && <div style={{ fontSize: "10px", color: "#ef4444" }}>⚠️ ÜBERFÄLLIG</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>)}

        {/* ADD CUSTOMER */}
        {view === "addCustomer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center" }}>
              <div onClick={() => photoRef.current?.click()} style={{ width: "90px", height: "90px", borderRadius: "50%", border: "2px dashed #8b5a2b", margin: "0 auto 10px", background: custForm.photo ? "none" : "rgba(139,90,43,0.1)", overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>
                {custForm.photo ? <img src={custForm.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
              </div>
              <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
              <button onClick={() => photoRef.current?.click()} style={{ background: "rgba(139,90,43,0.15)", border: "1px solid #8b5a2b", borderRadius: "20px", color: "#c4935a", padding: "6px 16px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                {custForm.photo ? t.changePhoto : t.addPhoto}
              </button>
            </div>
            {[
              { label: t.labelName, key: "name", placeholder: t.placeholderName, type: "text", icon: "👤" },
              { label: t.labelPhone, key: "phone", placeholder: t.placeholderPhone, type: "tel", icon: "📞" },
              { label: t.labelNote, key: "note", placeholder: t.placeholderNote, type: "text", icon: "📝" },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize: "12px", color: "#8b6a3e", marginBottom: "5px" }}>{f.icon} {f.label}</div>
                <input type={f.type} value={custForm[f.key]} onChange={e => setCustForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputSt} />
              </div>
            ))}
            <button onClick={addCustomer} disabled={saving} style={{ background: saving ? "#3a2510" : "linear-gradient(135deg, #8b5a2b, #c4935a)", border: "none", borderRadius: "12px", color: "#fff", padding: "14px", fontSize: "14px", fontWeight: "bold", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving ? t.saving : t.saveBtn}
            </button>
          </div>
        )}

        {/* DETAIL */}
        {view === "detail" && selected && (() => {
          const openDebts = selected.debts.filter(d => !d.paid);
          const paidDebts = selected.debts.filter(d => d.paid);
          return (
            <div>
              <div style={{ background: selectedTotal === 0 ? "linear-gradient(135deg,#0a2010,#0f3018)" : "linear-gradient(135deg,#1a0a04,#2a1206)", border: `1px solid ${selectedTotal === 0 ? "#22c55e" : "#8b5a2b"}40`, borderRadius: "16px", padding: "18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: `2px solid ${selectedTotal === 0 ? "#22c55e" : "#c4935a"}`, overflow: "hidden", background: "rgba(139,90,43,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                    {selected.photo ? <img src={selected.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                  </div>
                  {isOwner && (
                    <label style={{ position: "absolute", bottom: -2, right: -2, background: "#8b5a2b", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", cursor: "pointer" }}>
                      📷<input type="file" accept="image/*" onChange={handlePhotoForExisting} style={{ display: "none" }} />
                    </label>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f5d8a0" }}>{selected.name}</div>
                  {selected.phone && <a href={`tel:${selected.phone}`} style={{ fontSize: "12px", color: "#c4935a", textDecoration: "none" }}>📞 {selected.phone}</a>}
                  <div style={{ fontSize: "12px", color: "#6b4f2a", marginTop: "3px" }}>{openDebts.length} offen • {paidDebts.length} bezahlt</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: selectedTotal === 0 ? "#22c55e" : "#ef4444" }}>€{selectedTotal.toLocaleString("de-DE")}</div>
                  <div style={{ fontSize: "10px", color: "#6b4f2a" }}>{t.remaining}</div>
                </div>
              </div>

              {!isOwner && (
                <div style={{ background: "rgba(139,90,43,0.08)", border: "1px solid #2a1f12", borderRadius: "10px", padding: "9px 14px", marginBottom: "10px", fontSize: "12px", color: "#6b4f2a", textAlign: "center" }}>
                  👁 Guest Mode — Sirf dekhne ke liye
                </div>
              )}

              <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid #2a1f12", borderRadius: "10px", overflow: "hidden", marginBottom: "14px" }}>
                {tabBtn(t.debtsTab + ` (${openDebts.length})`, "debts")}
                {tabBtn(t.historyTab, "history")}
                {tabBtn(t.infoTab, "info")}
              </div>

              {/* DEBTS TAB */}
              {detailTab === "debts" && (
                <div>
                  {openDebts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "30px", color: "#4a3520" }}>
                      <div style={{ fontSize: "32px" }}>✅</div>
                      <div style={{ marginTop: "8px" }}>Keine offenen Schulden!</div>
                    </div>
                  )}
                  {openDebts.map((d, i) => {
                    const isOverdue = d.dueDate && new Date(d.dueDate) < new Date();
                    const isPaying = activeDebtId === d.id;
                    return (
                      <div key={d.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${isOverdue ? "#ef444440" : "#2a1f12"}`, borderLeft: `3px solid ${isOverdue ? "#ef4444" : "#f59e0b"}`, borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <div style={{ fontSize: "12px", color: "#8b6a3e", marginBottom: "3px" }}>{t.debtLabel}{i + 1} • {daysDiff(d.createdAt, t)}</div>
                            {d.note && <div style={{ fontSize: "13px", color: "#c4935a", fontStyle: "italic" }}>"{d.note}"</div>}
                            {d.dueDate && <div style={{ fontSize: "11px", color: isOverdue ? "#ef4444" : "#6b4f2a", marginTop: "3px" }}>📅 {fmtDate(d.dueDate)} {isOverdue ? "⚠️" : ""}</div>}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "20px", fontWeight: "bold", color: isOverdue ? "#ef4444" : "#f59e0b" }}>€{d.remaining.toLocaleString("de-DE")}</div>
                            <div style={{ fontSize: "10px", color: "#6b4f2a" }}>von €{d.amount.toLocaleString("de-DE")}</div>
                          </div>
                        </div>
                        {d.photo && <img src={d.photo} alt="proof" style={{ width: "100%", maxHeight: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(196,147,90,0.3)", marginBottom: "8px" }} />}
                        <div style={{ background: "#1a1208", borderRadius: "4px", height: "4px", marginBottom: "10px" }}>
                          <div style={{ height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, #22c55e, #16a34a)", width: `${((d.amount - d.remaining) / d.amount * 100)}%` }} />
                        </div>
                        {!isPaying ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {isOwner && (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => { setActiveDebtId(d.id); setPayForm({ amount: "", note: "", photo: null }); }} style={{ flex: 2, background: "linear-gradient(135deg,#1a5c2a,#22c55e)", border: "none", borderRadius: "8px", color: "#fff", padding: "9px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>💰 Zahlung</button>
                                <button onClick={() => markDebtPaid(selected.id, d.id)} style={{ flex: 1, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e", borderRadius: "8px", color: "#22c55e", padding: "9px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>✅ Voll</button>
                              </div>
                            )}
                            {d.payments.length > 0 && (() => {
                              const lastPay = d.payments[d.payments.length - 1];
                              return (
                                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "7px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div style={{ fontSize: "11px", color: "#6b4f2a" }}>
                                    Letzte: <span style={{ color: "#22c55e" }}>+€{lastPay.amount.toLocaleString("de-DE")}</span>
                                    {lastPay.note ? <span> ({lastPay.note})</span> : null}
                                    {lastPay.photo && <img src={lastPay.photo} alt="" style={{ width: "18px", height: "18px", borderRadius: "3px", objectFit: "cover", marginLeft: "5px", verticalAlign: "middle" }} />}
                                  </div>
                                  {lastPay.id && isOwner && (
                                    <button onClick={() => undoPayment(selected.id, d.id, lastPay.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "5px", color: "#ef4444", padding: "3px 9px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", fontWeight: "bold" }}>↩ Undo</button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "12px" }}>
                            <input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} placeholder={`Max: €${d.remaining}`} style={{ ...inputSt, marginBottom: "8px" }} />
                            <input type="text" value={payForm.note} onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))} placeholder="Note / Bemerkung" style={{ ...inputSt, fontSize: "13px", marginBottom: "8px" }} />
                            <div style={{ marginBottom: "8px" }}>
                              <input ref={payPhotoRef} type="file" accept="image/*" onChange={handlePayPhoto} style={{ display: "none" }} />
                              {payForm.photo ? (
                                <div style={{ position: "relative" }}>
                                  <img src={payForm.photo} alt="" style={{ width: "100%", maxHeight: "110px", objectFit: "cover", borderRadius: "8px", border: "1px solid #22c55e" }} />
                                  <button onClick={() => setPayForm(p => ({ ...p, photo: null }))} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.75)", border: "none", borderRadius: "50%", color: "#fff", width: "22px", height: "22px", cursor: "pointer", fontSize: "12px" }}>x</button>
                                </div>
                              ) : (
                                <button onClick={() => payPhotoRef.current && payPhotoRef.current.click()} style={{ width: "100%", background: "rgba(34,197,94,0.05)", border: "1px dashed rgba(34,197,94,0.3)", borderRadius: "8px", color: "rgba(34,197,94,0.6)", padding: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>📷 Foto hinzufügen (optional)</button>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                              {[10, 20, 50].map(a => (
                                <button key={a} onClick={() => setPayForm(p => ({ ...p, amount: String(Math.min(a, d.remaining)) }))} style={{ flex: 1, background: "rgba(139,90,43,0.15)", border: "1px solid #3a2510", borderRadius: "6px", color: "#c4935a", padding: "6px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>€{a}</button>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => payDebt(selected.id, d.id)} disabled={saving} style={{ flex: 2, background: saving ? "#1a3a1a" : "linear-gradient(135deg,#1a5c2a,#22c55e)", border: "none", borderRadius: "8px", color: "#fff", padding: "10px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>{saving ? t.saving : t.recordPayment}</button>
                              <button onClick={() => setActiveDebtId(null)} style={{ flex: 1, background: "transparent", border: "1px solid #2a1f12", borderRadius: "8px", color: "#6b4f2a", padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {!showAddDebt && isOwner ? (
                    <button onClick={() => setShowAddDebt(true)} style={{ width: "100%", marginTop: "6px", background: "rgba(139,90,43,0.1)", border: "1px dashed #8b5a2b", borderRadius: "12px", color: "#c4935a", padding: "13px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>{t.addNewDebt}</button>
                  ) : showAddDebt ? (
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #8b5a2b", borderRadius: "14px", padding: "16px", marginTop: "6px" }}>
                      <div style={{ fontSize: "12px", color: "#c4935a", marginBottom: "12px", fontWeight: "bold" }}>➕ {t.addNewDebt}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <input type="number" value={debtForm.amount} onChange={e => setDebtForm(p => ({ ...p, amount: e.target.value }))} placeholder={t.debtAmount} style={inputSt} />
                        <input type="text" value={debtForm.note} onChange={e => setDebtForm(p => ({ ...p, note: e.target.value }))} placeholder={t.debtNote} style={{ ...inputSt, fontSize: "13px" }} />
                        <input type="date" value={debtForm.dueDate} onChange={e => setDebtForm(p => ({ ...p, dueDate: e.target.value }))} style={{ ...inputSt, fontSize: "13px" }} />
                        <div>
                          <input ref={debtPhotoRef} type="file" accept="image/*" onChange={handleDebtPhoto} style={{ display: "none" }} />
                          {debtForm.photo ? (
                            <div style={{ position: "relative", marginBottom: "8px" }}>
                              <img src={debtForm.photo} alt="" style={{ width: "100%", maxHeight: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #c4935a" }} />
                              <button onClick={() => setDebtForm(p => ({ ...p, photo: null }))} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.75)", border: "none", borderRadius: "50%", color: "#fff", width: "22px", height: "22px", cursor: "pointer", fontSize: "11px" }}>x</button>
                            </div>
                          ) : (
                            <button onClick={() => debtPhotoRef.current && debtPhotoRef.current.click()} style={{ width: "100%", marginBottom: "8px", background: "rgba(139,90,43,0.08)", border: "1px dashed rgba(196,147,90,0.4)", borderRadius: "8px", color: "rgba(196,147,90,0.7)", padding: "9px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>📷 Foto / Beweis hinzufügen (optional)</button>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => addDebt(selected.id)} disabled={saving} style={{ flex: 2, background: saving ? "#3a2510" : "linear-gradient(135deg,#8b5a2b,#c4935a)", border: "none", borderRadius: "10px", color: "#fff", padding: "12px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>{saving ? t.saving : t.addDebtBtn}</button>
                          <button onClick={() => { setShowAddDebt(false); setDebtForm({ amount: "", note: "", dueDate: "", photo: null }); }} style={{ flex: 1, background: "transparent", border: "1px solid #2a1f12", borderRadius: "10px", color: "#6b4f2a", padding: "12px", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* HISTORY TAB */}
              {detailTab === "history" && (
                <div>
                  {selected.debts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px", color: "#4a3520" }}>Keine Einträge</div>
                  ) : (
                    selected.debts.slice().reverse().map((d, i) => (
                      <div key={d.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${d.paid ? "#22c55e30" : "#2a1f12"}`, borderRadius: "12px", padding: "12px 14px", marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <div>
                            <span style={{ fontSize: "13px", color: d.paid ? "#22c55e" : "#f59e0b", fontWeight: "bold" }}>{d.paid ? "✅" : "⏳"} €{d.amount.toLocaleString("de-DE")}</span>
                            {d.note && <span style={{ fontSize: "11px", color: "#8b6a3e", marginLeft: "8px" }}>"{d.note}"</span>}
                          </div>
                          <span style={{ fontSize: "11px", color: "#6b4f2a" }}>{fmtDate(d.createdAt)}</span>
                        </div>
                        {d.payments.map((p, pi) => (
                          <div key={pi} style={{ padding: "8px 0 8px 12px", borderLeft: "2px solid rgba(34,197,94,0.4)", marginTop: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "bold" }}>+ €{p.amount.toLocaleString("de-DE")}</span>
                                {p.note && <span style={{ fontSize: "11px", color: "#8b6a3e", marginLeft: "6px" }}>({p.note})</span>}
                                <div style={{ fontSize: "10px", color: "#6b4f2a", marginTop: "1px" }}>{fmtDate(p.date)}</div>
                              </div>
                              {p.id && isOwner && (
                                <button onClick={() => undoPayment(selected.id, d.id, p.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#ef4444", padding: "3px 8px", fontSize: "10px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, marginLeft: "8px" }}>Undo</button>
                              )}
                            </div>
                            {p.photo && <img src={p.photo} alt="proof" style={{ marginTop: "6px", width: "100%", maxHeight: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(34,197,94,0.2)" }} />}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* INFO TAB */}
              {detailTab === "info" && (
                <div>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #2a1f12", borderRadius: "14px", padding: "14px", marginBottom: "14px", fontSize: "13px" }}>
                    {[
                      { label: t.debtDate, val: fmtDate(selected.createdAt), color: "#c4935a" },
                      { label: t.customers, val: selected.debts.length + " Schulden gesamt", color: "#f5d8a0" },
                      { label: t.totalDebt, val: "€" + selectedTotal.toLocaleString("de-DE"), color: "#ef4444" },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid #1a1208" : "none" }}>
                        <span style={{ color: "#6b4f2a" }}>{row.label}</span>
                        <span style={{ color: row.color }}>{row.val}</span>
                      </div>
                    ))}
                    {selected.note && <div style={{ padding: "8px 0", color: "#a0784a", fontStyle: "italic", borderTop: "1px solid #1a1208" }}>"{selected.note}"</div>}
                  </div>
                  {isOwner && (confirmDel === selected.id ? (
                    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef444440", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                      <div style={{ fontSize: "13px", color: "#fca5a5", marginBottom: "12px" }}>{t.confirmDelete}</div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => setConfirmDel(null)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid #2a1f12", borderRadius: "10px", color: "#e8d5b7", padding: "10px", cursor: "pointer", fontFamily: "inherit" }}>{t.confirmNo}</button>
                        <button onClick={() => deleteCustomer(selected.id)} style={{ flex: 1, background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", borderRadius: "10px", color: "#ef4444", padding: "10px", cursor: "pointer", fontFamily: "inherit", fontWeight: "bold" }}>{t.confirmYes}</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDel(selected.id)} style={{ width: "100%", background: "transparent", border: "1px solid #2a1208", borderRadius: "10px", color: "#6b3a2a", padding: "11px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>{t.deleteBtn}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0d0d0d; } ::-webkit-scrollbar-thumb { background: #2a1f12; border-radius: 3px; } input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }`}</style>
    </div>
  );
}
