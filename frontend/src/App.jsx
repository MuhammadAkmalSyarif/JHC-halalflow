import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// SVG Icons helper component
const Icons = {
  Home: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  Building: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  FileText: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  Table: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
  Box: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
  Cog: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  ShieldCheck: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  Upload: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>,
  Download: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  MessageSquare: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>,
  Bot: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  Bell: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  ChevronRight: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>,
  X: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
  Edit: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  Trash: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  LogOut: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  WhatsApp: (props) => <svg {...props} viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.764.814 2.796.814 3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.767-5.768-5.767zm0 10.457c-.89 0-1.745-.251-2.483-.715l-.178-.105-1.847.485.494-1.801-.116-.184a4.673 4.673 0 01-.718-2.476c0-2.581 2.1-4.682 4.682-4.682 2.581 0 4.682 2.1 4.682 4.682 0 2.581-2.1 4.682-4.682 4.682zm7.424-11.95A10.39 10.39 0 0012.031 1.5C6.236 1.5 1.517 6.22 1.517 12.015c0 1.986.55 3.864 1.516 5.51L1.5 22.5l5.123-1.488a10.468 10.468 0 005.408 1.503h.005c5.795 0 10.514-4.72 10.514-10.515 0-2.808-1.094-5.45-3.089-7.444z"/></svg>,
  Award: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
  Admin: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  List: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
  Package: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
  User: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>{children}</div>
);

// Custom Dropdown Component to force downwards opening
const CustomDropdown = ({ options, value, onChange, placeholder = "Pilih opsi..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: isOpen ? '#10b981' : '#e2e8f0', boxShadow: isOpen ? '0 0 0 3px rgba(16,185,129,0.1)' : 'none' }}
      >
        <span className="text-slate-800">{value || placeholder}</span>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-[100] top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in" style={{ transformOrigin: 'top' }}>
          {options.map((option, idx) => (
            <div 
              key={idx}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${value === option ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const STEPS = [
  { id: 0, title: 'Dashboard Utama', icon: Icons.Home },
  { id: 1, title: 'Tahap 1: Registrasi Perusahaan', icon: Icons.Building },
  { id: 2, title: 'Tahap 2: Dokumen Legal', icon: Icons.FileText },
  { id: 3, title: 'Tahap 3: Matrix Bahan Halal', icon: Icons.Table },
  { id: 4, title: 'Tahap 4: Upload Produk', icon: Icons.Box },
  { id: 5, title: 'Tahap 5: Proses Produksi Halal', icon: Icons.Cog },
  { id: 6, title: 'Tahap 6: Upload Evidence (Bukti)', icon: Icons.Upload },
  { id: 7, title: 'Tahap 7: Pengajuan BPJPH', icon: Icons.ShieldCheck }
];

// =============================================
// AUTH HELPER
// =============================================
function getAuthHeaders() {
  const token = localStorage.getItem('jhc_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { 
    ...getAuthHeaders(),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };
  
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('jhc_token');
    window.location.reload();
  }
  return res;
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('jhc_token'));
  const [userProfile, setUserProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jhc_user') || 'null'); } catch { return null; }
  });

  const [materials, setMaterials] = useState([]);
  const [matrixSubmitted, setMatrixSubmitted] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsSubmitted, setProductsSubmitted] = useState(false);
  const [legalData, setLegalData] = useState({});
  const [productionData, setProductionData] = useState({});
  const [evidenceData, setEvidenceData] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [certificationStatus, setCertificationStatus] = useState(0);

  // Fetch initial data from backend APIs with JWT
  useEffect(() => {
    if (!isLoggedIn) return;
    async function loadData() {
      try {
        const headers = getAuthHeaders();
        const [matRes, prodRes, legalRes, productionRes, evidenceRes, chatRes, certRes] = await Promise.all([
          apiFetch('/api/materials', { headers }),
          apiFetch('/api/products', { headers }),
          apiFetch('/api/legal', { headers }),
          apiFetch('/api/production', { headers }),
          apiFetch('/api/evidence', { headers }),
          apiFetch('/api/chat', { headers }),
          apiFetch('/api/certification-status', { headers }),
        ]);

        const matData = await matRes.json();
        setMaterials(matData.materials || []);
        setMatrixSubmitted(matData.matrixSubmitted || false);

        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
        setProductsSubmitted(prodData.productsSubmitted || false);

        setLegalData(await legalRes.json() || {});
        setProductionData(await productionRes.json() || {});
        setEvidenceData(await evidenceRes.json() || {});
        setChatMessages(await chatRes.json() || []);

        const certVal = await certRes.json();
        setCertificationStatus(certVal.certificationStatus || 0);
      } catch (err) {
        console.error('Error fetching data from API:', err);
      }
    }
    loadData();

    // Set up polling for real-time status updates
    const statusInterval = setInterval(async () => {
      try {
        const certRes = await apiFetch('/api/certification-status', { headers: getAuthHeaders() });
        const certVal = await certRes.json();
        setCertificationStatus(certVal.certificationStatus || 0);
      } catch (err) {
        // ignore polling errors
      }
    }, 5000);

    return () => clearInterval(statusInterval);
  }, [isLoggedIn]);

  // Shared file upload function (with JWT)
  const handleGenericFileUpload = async (e, fieldName, setLocalStateVal) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('jhc_token');
    if (token) formData.append('_token', token);

    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setLocalStateVal(prev => ({
          ...prev,
          [fieldName]: data.filename
        }));
        return data.filename;
      } else {
        alert('Gagal mengunggah berkas: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Terjadi kesalahan saat mengunggah berkas.');
    }
  };

  // Criteria calculations
  const isKomitmenComplete = Boolean(
    (legalData?.permohonan || legalData?.sk_penyelia || legalData?.sk_manajemen || legalData?.kebijakan) &&
    evidenceData?.sosialisasiFoto &&
    evidenceData?.sosialisasiAbsen
  );

  const isBahanComplete = Boolean(matrixSubmitted);

  const isPphComplete = Boolean(
    productionData?.alurProses && productionData?.layoutRuang && productionData?.bebasBabi
  );

  const isProdukComplete = Boolean(
    productsSubmitted && products && products.length > 0
  );

  const isEvaluasiComplete = Boolean(
    evidenceData?.auditInternalFoto && evidenceData?.auditInternalAbsen
  );

  let completedCriteriaCount = 0;
  if (isKomitmenComplete) completedCriteriaCount++;
  if (isBahanComplete) completedCriteriaCount++;
  if (isPphComplete) completedCriteriaCount++;
  if (isProdukComplete) completedCriteriaCount++;
  if (isEvaluasiComplete) completedCriteriaCount++;

  const readinessScore = Math.round((completedCriteriaCount / 5) * 100);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMsg })
      });
      const data = await res.json();
      setChatMessages(data.messages);
    } catch (err) {
      console.error('Error sending chat message:', err);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'ai', text: 'Maaf, terjadi gangguan saat menghubungi asisten AI.' }]);
      }, 1000);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={(profile, token) => {
      localStorage.setItem('jhc_token', token);
      localStorage.setItem('jhc_user', JSON.stringify(profile));
      setUserProfile(profile);
      setIsLoggedIn(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentStep(0)}>
          <img src="/logo.jpg" alt="JHC HalalFlow Logo" className="h-16 md:h-20 object-contain" />
          <div>
            <h1 className="font-extrabold text-lg text-emerald-900 tracking-tight">JHC HalalFlow</h1>
            <p className="text-xs text-emerald-600 font-semibold">Platform Manajemen Sertifikasi Halal</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <a
            href="https://wa.me/6285117021977?text=Assalamu%27alaikum%20Admin%20JHC%20HalalFlow,%20saya%20butuh%20bantuan"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs hover:shadow-xs group"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Icons.WhatsApp className="w-3 h-3 fill-current" />
            </span>
            <div className="text-left leading-tight">
              <span className="block text-[10px] text-emerald-600 font-medium">Bantuan Admin WA</span>
              <span className="font-bold tracking-tight">0851-1702-1977</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700 tracking-wide">Readiness: {readinessScore}%</span>
          </div>
          <button onClick={() => setChatOpen(!chatOpen)} className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors" title="Notifikasi">
            <Icons.Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-[#063b27] border-r border-emerald-900 hidden lg:flex flex-col p-4 space-y-1 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20">
          <p className="text-[11px] font-extrabold text-emerald-300/70 uppercase tracking-wider px-3 mb-2 mt-2">Alur Sertifikasi SJPH</p>
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/20'
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-300/70'}`} />
                <span className="text-left leading-snug">{step.title}</span>
              </button>
            );
          })}

          <div className="mt-6">
            <p className="text-[11px] font-extrabold text-emerald-300/70 uppercase tracking-wider px-3 mb-2">Menu Komplementer</p>
            <a
              href="https://drive.google.com/drive/folders/1R6UuM_uvXeuzu4bLLK4HhiJesAnexTBQ?hl=ID"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all text-emerald-100 hover:bg-emerald-800 hover:text-white"
            >
              <Icons.Download className="w-5 h-5 text-emerald-300/70" />
              <div className="text-left leading-snug">
                <span>Download Template</span>
                <p className="text-[10px] text-emerald-400 font-normal mt-0.5 leading-tight">File pendukung untuk diunduh</p>
              </div>
            </a>
          </div>

          {/* User Account & Professional Logout Button */}
          <div className="mt-auto pt-4 border-t border-emerald-800 flex flex-col gap-2">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-900/50 border border-emerald-800/50">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {userProfile?.namaLengkap ? userProfile.namaLengkap.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {userProfile?.namaLengkap || 'Pengguna JHC'}
                </p>
                <p className="text-[10px] text-emerald-300 truncate leading-tight mt-0.5">
                  {userProfile?.email || 'Akun Aktif'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('jhc_token');
                localStorage.removeItem('jhc_user');
                setIsLoggedIn(false);
                setUserProfile(null);
                setCurrentStep(0);
                setMaterials([]);
                setMatrixSubmitted(false);
                setProducts([]);
                setProductsSubmitted(false);
                setLegalData({});
                setProductionData({});
                setEvidenceData({});
                setChatMessages([]);
                setCertificationStatus(0);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100 hover:text-white bg-emerald-800/40 hover:bg-red-500/90 border border-emerald-700/50 hover:border-red-500 transition-all shadow-sm group"
            >
              <Icons.LogOut className="w-4 h-4 text-emerald-300 group-hover:text-white transition-colors" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 pb-48 max-w-6xl mx-auto overflow-y-auto">
          {currentStep === 0 && <Dashboard changeStep={setCurrentStep} readinessScore={readinessScore} certificationStatus={certificationStatus} isKomitmenComplete={isKomitmenComplete} isBahanComplete={isBahanComplete} isPphComplete={isPphComplete} isProdukComplete={isProdukComplete} isEvaluasiComplete={isEvaluasiComplete} />}
          {currentStep === 1 && <StepRegistrasi />}
          {currentStep === 2 && <StepDokumen legalData={legalData} setLegalData={setLegalData} handleGenericFileUpload={handleGenericFileUpload} />}
          {currentStep === 3 && <StepMatrixBahanHalal materials={materials} setMaterials={setMaterials} matrixSubmitted={matrixSubmitted} setMatrixSubmitted={setMatrixSubmitted} />}
          {currentStep === 4 && <StepUploadProduk products={products} setProducts={setProducts} materials={materials} productsSubmitted={productsSubmitted} setProductsSubmitted={setProductsSubmitted} />}
          {currentStep === 5 && <StepProsesProduksi productionData={productionData} setProductionData={setProductionData} handleGenericFileUpload={handleGenericFileUpload} />}
          {currentStep === 6 && <StepUploadEvidence evidenceData={evidenceData} setEvidenceData={setEvidenceData} handleGenericFileUpload={handleGenericFileUpload} />}
          {currentStep === 7 && <StepPengajuanBPJPH readinessScore={readinessScore} />}
          {currentStep === 99 && <AdminPanel certificationStatus={certificationStatus} setCertificationStatus={setCertificationStatus} />}
        </main>
      </div>

      {/* Floating AI Chatbot Toggle & Drawer */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full shadow-lg font-bold text-sm transition-all hover:scale-105">
            <Icons.Bot className="w-5 h-5" /> Tanya AI Halal Assistant
          </button>
        ) : (
          <div className="w-96 bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-fade-in h-[500px]">
            <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icons.Bot className="w-5 h-5" />
                <span className="font-bold text-sm">AI Halal Assistant JHC</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white hover:opacity-80">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${m.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-xs' : 'bg-white border text-slate-700 rounded-bl-xs shadow-xs'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
              <input type="text" placeholder="Tanyakan seputar regulasi halal..." value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:bg-white outline-none" />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold">Kirim</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const Dashboard = ({ changeStep, readinessScore, certificationStatus, isKomitmenComplete, isBahanComplete, isPphComplete, isProdukComplete, isEvaluasiComplete }) => {

  const CERT_STAGES = [
    { no: 1, label: 'Diterima oleh Admin', desc: 'Pengajuan telah diterima dan sedang dilakukan pemeriksaan awal oleh Admin JHC.', color: 'blue' },
    { no: 2, label: 'Diproses', desc: 'Data dan dokumen usaha sedang diperiksa serta dipersiapkan untuk proses sertifikasi halal.', color: 'indigo' },
    { no: 3, label: 'Disubmit di SIHALAL', desc: 'Pengajuan sertifikasi halal telah diajukan melalui sistem SIHALAL BPJPH.', color: 'violet' },
    { no: 4, label: 'Feedback BPJPH / Dikirim ke LPH', desc: 'Pengajuan sedang menunggu atau menindaklanjuti feedback BPJPH. Jika persyaratan terpenuhi, pengajuan diteruskan kepada LPH.', color: 'amber' },
    { no: 5, label: 'Penjadwalan Audit', desc: 'Pengajuan telah diterima LPH dan sedang dalam proses penjadwalan audit/pemeriksaan kehalalan.', color: 'orange' },
    { no: 6, label: 'Perbaikan Hasil Audit', desc: 'Hasil pemeriksaan/audit memerlukan perbaikan atau pemenuhan dokumen/data oleh pelaku usaha.', color: 'red' },
    { no: 7, label: 'Sidang Fatwa MUI', desc: 'Hasil pemeriksaan telah diproses untuk penetapan kehalalan melalui sidang fatwa sesuai ketentuan yang berlaku.', color: 'purple' },
    { no: 8, label: 'Terbit Sertifikat Halal BPJPH', desc: 'Selamat! Sertifikat Halal resmi BPJPH telah terbit dan dapat diakses melalui sistem.', color: 'emerald' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <p className="text-emerald-100 text-sm font-medium relative z-10">Halal Readiness Score</p>
          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <h3 className="text-4xl font-extrabold tracking-tight">{readinessScore}%</h3>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-semibold">Siap Sertifikasi</span>
          </div>
          <div className="w-full bg-white/15 h-2.5 rounded-full mt-4 overflow-hidden relative z-10">
            <div className="bg-white h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${readinessScore}%` }}></div>
          </div>

        </Card>

        <Card className="p-6">
          <p className="text-slate-500 text-sm font-medium">Tahap Saat Ini</p>
          <h3 className="text-xl font-bold text-slate-800 mt-2">Matrix Bahan Halal</h3>
          <button onClick={() => changeStep(3)} className="mt-4 text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:underline">
            Lanjut Proses <Icons.ChevronRight className="w-4 h-4" />
          </button>
        </Card>

        <Card className="p-6">
          <p className="text-slate-500 text-sm font-medium">Status Dokumen</p>
          <h3 className="text-3xl font-bold text-emerald-600 mt-2">Terverifikasi</h3>
          <p className="text-xs text-slate-400 mt-2">Vault cloud aktif</p>
        </Card>

        <Card className="p-6">
          <p className="text-slate-500 text-sm font-medium">Jadwal Audit</p>
          <h3 className="text-lg font-bold text-slate-800 mt-2">15 November 2026</h3>
          <p className="text-xs text-emerald-600 mt-2 font-medium">Oleh Pendamping JHC</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Alur JHC HalalFlow</h3>
          <span className="text-xs text-slate-500 font-medium">Ikuti langkah secara berurutan</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.slice(1).map((s) => (
            <button
              key={s.id}
              onClick={() => changeStep(s.id)}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left flex flex-col justify-between group"
            >
              <s.icon className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Tahap {s.id}</span>
                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 leading-snug block mt-1">{s.title.split(': ')[1]}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
      
      <StepImplementasiSJPH 
        isKomitmenComplete={isKomitmenComplete} 
        isBahanComplete={isBahanComplete} 
        isPphComplete={isPphComplete} 
        isProdukComplete={isProdukComplete} 
        isEvaluasiComplete={isEvaluasiComplete} 
      />

      {/* Status Progress Sertifikasi Halal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <Icons.Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Status Progress Sertifikasi Halal</h3>
              <p className="text-xs text-slate-400 mt-0.5">Diperbarui oleh Admin JHC • Real-time</p>
            </div>
          </div>
          {certificationStatus === 0 ? (
            <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-3 py-1 rounded-full border">Menunggu Pengajuan</span>
          ) : certificationStatus === 8 ? (
            <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">🎉 Sertifikat Terbit!</span>
          ) : (
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-200">Tahap {certificationStatus} dari 8</span>
          )}
        </div>

        {certificationStatus === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Icons.ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="text-sm font-semibold">Proses sertifikasi belum dimulai.</p>
            <p className="text-xs mt-1">Admin JHC akan memperbarui status setelah pengajuan diterima.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {CERT_STAGES.map((stage) => {
              const isDone = stage.no < certificationStatus;
              const isCurrent = stage.no === certificationStatus;
              const isPending = stage.no > certificationStatus;
              return (
                <div
                  key={stage.no}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    isCurrent ? 'bg-emerald-50 border-emerald-300 shadow-sm' :
                    isDone ? 'bg-slate-50 border-slate-100' :
                    'border-slate-100 opacity-40'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                    isDone ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-emerald-600 text-white ring-4 ring-emerald-200' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {isDone ? '✓' : stage.no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight ${
                      isCurrent ? 'text-emerald-800' : isDone ? 'text-slate-600' : 'text-slate-400'
                    }`}>{stage.label}</p>
                    {(isCurrent || isDone) && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{stage.desc}</p>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shrink-0 animate-pulse">SAAT INI</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

const StepRegistrasi = () => {
  const [formData, setFormData] = useState({
    nama: '',
    nib: '',
    npwp: '',
    alamat: '',
    penanggungJawab: '',
    jenisUsaha: 'Makanan & Minuman',
    skalaUsaha: 'Menengah',
    jumlahOutlet: '1',
    cabang: ''
  });

  const [savedMsg, setSavedMsg] = useState('');

  // Fetch initial profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem('jhc_token');
        const res = await apiFetch('/api/company-profile', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
        const data = await res.json();
        if (data && data.nama) {
          setFormData(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('jhc_token');
      const res = await apiFetch('/api/company-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSavedMsg('Data perusahaan berhasil disimpan!');
        setTimeout(() => setSavedMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Registrasi Perusahaan</h2>
        <p className="text-sm text-slate-500 mt-1">Masukkan data profil badan usaha Anda untuk sinkronisasi BPJPH.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Nama Perusahaan</label>
            <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Nomor Induk Berusaha (NIB)</label>
            <input type="text" name="nib" value={formData.nib} onChange={handleChange} className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">NPWP Perusahaan</label>
            <input type="text" name="npwp" value={formData.npwp} onChange={handleChange} className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Penanggung Jawab / Pimpinan</label>
            <input type="text" name="penanggungJawab" value={formData.penanggungJawab} onChange={handleChange} className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Jenis Usaha</label>
            <CustomDropdown 
              value={formData.jenisUsaha}
              onChange={(val) => setFormData({ ...formData, jenisUsaha: val })}
              options={[
                "Makanan & Minuman",
                "Restoran/Rumah Makan/Kafe",
                "Catering/Jasa Boga/Dapur MBG",
                "Industri Pengolahan Pangan",
                "Industri Obat/Farmasi/Suplemen",
                "RPH (Rumah Potong Hewan) & RPU",
                "Kosmetik & Produk Perawatan Tubuh",
                "Barang Gunaan (Fashion & Kain)",
                "Barang Kemasan",
                "Jasa Logistik",
                "Jasa Penyimpanan",
                "Jasa Distribusi",
                "Jasa Pengemasan"
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Skala Usaha</label>
            <select name="skalaUsaha" value={formData.skalaUsaha} onChange={handleChange} className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none">
              <option value="Mikro">Mikro</option>
              <option value="Kecil">Kecil</option>
              <option value="Menengah">Menengah</option>
              <option value="Besar">Besar</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Jumlah Outlet</label>
            <input type="number" name="jumlahOutlet" value={formData.jumlahOutlet} onChange={handleChange} className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Cabang / Wilayah</label>
            <input type="text" name="cabang" value={formData.cabang} onChange={handleChange} placeholder="Contoh: Jakarta, Bogor" className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Alamat Kantor / Pabrik</label>
          <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="2" className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm focus:bg-white outline-none" required></textarea>
        </div>

        <div className="flex justify-between items-center pt-4">
          {savedMsg ? <span className="text-emerald-600 text-sm font-semibold">{savedMsg}</span> : <span></span>}
          <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors">
            Simpan & Lanjutkan
          </button>
        </div>
      </form>
    </Card>
  );
};

const StepDokumen = ({ legalData, setLegalData, handleGenericFileUpload }) => {
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLegalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await apiFetch('/api/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legalData)
      });
      if (res.ok) {
        setSuccessMsg('Dokumen legal & kontak berhasil disimpan!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dokumen Legal & Kontak Pendaftaran</h2>
        <p className="text-sm text-slate-500 mt-1">Unggah dokumen format Word (.doc/.docx) atau PDF (.pdf) serta lengkapi kontak resmi pendaftaran SIHALAL.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">No. Telp Pemilik Usaha</label>
          <input type="text" name="telpPemilik" value={legalData.telpPemilik || ''} onChange={handleChange} placeholder="0812xxxxxxxx" className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">No. Telp Penyelia Halal</label>
          <input type="text" name="telpPenyelia" value={legalData.telpPenyelia || ''} onChange={handleChange} placeholder="0813xxxxxxxx" className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email untuk SIHALAL</label>
          <input type="email" name="emailSihalal" value={legalData.emailSihalal || ''} onChange={handleChange} placeholder="admin@perusahaan.com" className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 border rounded-xl bg-white shadow-xs">
            <h4 className="font-semibold text-sm text-slate-800 mb-1">1. Permohonan Pendaftaran Sertifikasi Halal</h4>
            <p className="text-xs text-slate-400 mb-3">Format: .doc, .docx, .pdf</p>
            <input type="file" name="permohonan" accept=".pdf,.doc,.docx" onChange={(e) => handleGenericFileUpload(e, 'permohonan', setLegalData)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {legalData.permohonan && (
              <a href={`/uploads/${legalData.permohonan}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-medium mt-2 block truncate w-full hover:underline" title={legalData.permohonan}>
                ✓ Terunggah: {legalData.permohonan} (Klik untuk Lihat)
              </a>
            )}
          </div>

          <div className="p-4 border rounded-xl bg-white shadow-xs">
            <h4 className="font-semibold text-sm text-slate-800 mb-1">2. SK Penyelia Halal</h4>
            <p className="text-xs text-slate-400 mb-3">Format: .doc, .docx, .pdf</p>
            <input type="file" name="sk_penyelia" accept=".pdf,.doc,.docx" onChange={(e) => handleGenericFileUpload(e, 'sk_penyelia', setLegalData)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {legalData.sk_penyelia && (
              <a href={`/uploads/${legalData.sk_penyelia}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-medium mt-2 block truncate w-full hover:underline" title={legalData.sk_penyelia}>
                ✓ Terunggah: {legalData.sk_penyelia} (Klik untuk Lihat)
              </a>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded-xl bg-white shadow-xs">
            <h4 className="font-semibold text-sm text-slate-800 mb-1">3. SK Manajemen Halal</h4>
            <p className="text-xs text-slate-400 mb-3">Format: .doc, .docx, .pdf</p>
            <input type="file" name="sk_manajemen" accept=".pdf,.doc,.docx" onChange={(e) => handleGenericFileUpload(e, 'sk_manajemen', setLegalData)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {legalData.sk_manajemen && (
              <a href={`/uploads/${legalData.sk_manajemen}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-medium mt-2 block truncate w-full hover:underline" title={legalData.sk_manajemen}>
                ✓ Terunggah: {legalData.sk_manajemen} (Klik untuk Lihat)
              </a>
            )}
          </div>

          <div className="p-4 border rounded-xl bg-white shadow-xs">
            <h4 className="font-semibold text-sm text-slate-800 mb-1">4. Kebijakan Halal Bermaterai</h4>
            <p className="text-xs text-slate-400 mb-3">Format: .doc, .docx, .pdf</p>
            <input type="file" name="kebijakan" accept=".pdf,.doc,.docx" onChange={(e) => handleGenericFileUpload(e, 'kebijakan', setLegalData)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {legalData.kebijakan && (
              <a href={`/uploads/${legalData.kebijakan}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-medium mt-2 block truncate w-full hover:underline" title={legalData.kebijakan}>
                ✓ Terunggah: {legalData.kebijakan} (Klik untuk Lihat)
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        <div className="p-4 bg-slate-50 rounded-xl border">
          <h4 className="font-semibold text-sm text-slate-800 mb-2">Upload Tanda Tangan Pemilik Usaha</h4>
          <input type="file" name="ttdPemilik" accept="image/*" onChange={(e) => handleGenericFileUpload(e, 'ttdPemilik', setLegalData)} className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-200 file:font-semibold" />
          {legalData.ttdPemilik && (
            <a href={`/uploads/${legalData.ttdPemilik}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 mt-2 block truncate w-full hover:underline font-medium" title={legalData.ttdPemilik}>
              ✓ TTD Pemilik Terunggah (Klik untuk Lihat)
            </a>
          )}
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border">
          <h4 className="font-semibold text-sm text-slate-800 mb-2">Upload Tanda Tangan Penyelia Halal</h4>
          <input type="file" name="ttdPenyelia" accept="image/*" onChange={(e) => handleGenericFileUpload(e, 'ttdPenyelia', setLegalData)} className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-200 file:font-semibold" />
          {legalData.ttdPenyelia && (
            <a href={`/uploads/${legalData.ttdPenyelia}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 mt-2 block truncate w-full hover:underline font-medium" title={legalData.ttdPenyelia}>
              ✓ TTD Penyelia Terunggah (Klik untuk Lihat)
            </a>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-4 pt-4">
        {successMsg && <span className="text-emerald-600 font-semibold text-sm">{successMsg}</span>}
        <button onClick={handleSave} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors">
          Simpan Dokumen Legal
        </button>
      </div>
    </Card>
  );
};

const StepMatrixBahanHalal = ({ materials, setMaterials, matrixSubmitted, setMatrixSubmitted }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newMaterial, setNewMaterial] = useState({ name: '', jenis: '', produsen: '', negara: '', supplier: '', lembaga: '', sertifikat: '', expired: '' });

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!newMaterial.name) return;

    try {
      if (editingId) {
        // Update existing material
        const res = await apiFetch(`/api/materials/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMaterial)
        });
        const data = await res.json();
        if (res.ok) {
          setMaterials(data.materials);
          setEditingId(null);
          setNewMaterial({ name: '', jenis: '', produsen: '', negara: '', supplier: '', lembaga: '', sertifikat: '', expired: '' });
          setSuccessMsg('Bahan baku berhasil diperbarui!');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } else {
        // Add new material
        const res = await apiFetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMaterial)
        });
        const data = await res.json();
        if (res.ok) {
          setMaterials(data.materials);
          setNewMaterial({ name: '', jenis: '', produsen: '', negara: '', supplier: '', lembaga: '', sertifikat: '', expired: '' });
          setSuccessMsg('Bahan baku berhasil ditambahkan!');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (mat) => {
    setEditingId(mat.id);
    setNewMaterial({
      name: mat.name || '',
      jenis: mat.jenis || '',
      produsen: mat.produsen || '',
      negara: mat.negara || '',
      supplier: mat.supplier || '',
      lembaga: mat.lembaga || '',
      sertifikat: mat.sertifikat || '',
      expired: mat.expired || ''
    });
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewMaterial({ name: '', jenis: '', produsen: '', negara: '', supplier: '', lembaga: '', sertifikat: '', expired: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus bahan baku ini?')) return;
    try {
      const res = await apiFetch(`/api/materials/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setMaterials(data.materials);
        if (editingId === id) {
          handleCancelEdit();
        }
        setSuccessMsg('Bahan baku berhasil dihapus!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadTemplate = () => {
    const data = [
      { 'nama_bahan': 'Tepung Terigu', 'jenis_bahan': 'Bahan Baku', 'produsen': 'PT Bogasari', 'negara': 'Indonesia', 'supplier': 'PT Distribusi', 'lembaga_penerbit': 'BPJPH', 'nomor_sertifikat/registr': 'ID12345678', 'masa_berlaku': '31/12/2026' },
      { 'nama_bahan': '', 'jenis_bahan': '', 'produsen': '', 'negara': '', 'supplier': '', 'lembaga_penerbit': '', 'nomor_sertifikat/registr': '', 'masa_berlaku': '' },
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Matrix Bahan');
    XLSX.writeFile(wb, 'nama-bahan.xlsx');
  };

  const handleExcelUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          const sheetName = wb.SheetNames[0];
          const sheet = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });

          const parsed = rows.map((row, i) => ({
            id: Date.now() + i,
            name: row['nama_bahan'] || row['Nama Bahan'] || row['name'] || '',
            jenis: row['jenis_bahan'] || row['Jenis Bahan'] || '',
            produsen: row['produsen'] || row['Produsen'] || '',
            negara: row['negara'] || row['Negara'] || '',
            supplier: row['supplier'] || row['Supplier'] || '',
            lembaga: row['lembaga_penerbit'] || row['Lembaga Penerbit'] || '',
            sertifikat: row['nomor_sertifikat/registr'] || row['nomor_sertifikat'] || '',
            expired: row['masa_berlaku'] || row['Masa Berlaku'] || row['Expired'] || '',
            status: 'hijau',
            coa: 'tersedia',
            sds: 'tersedia'
          })).filter(m => m.name);

          if (parsed.length === 0) {
            alert('Tidak ada data yang bisa dibaca. Pastikan format kolom sesuai template.');
            return;
          }

          // Update local state instantly
          setMaterials(prev => {
            const newList = [...prev, ...parsed];
            return newList;
          });
          setSuccessMsg(`${parsed.length} bahan baku berhasil diimpor dari Excel!`);
          setTimeout(() => setSuccessMsg(''), 4000);

          // Also persist to backend
          const formData = new FormData();
          formData.append('file', file);
          apiFetch('/api/materials/import', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
              if (data.materials) setMaterials(data.materials);
            })
            .catch(err => console.error('Backend sync error:', err));

        } catch (err) {
          console.error(err);
          alert('Gagal membaca file Excel. Pastikan format file sesuai template.');
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleSubmitMatrix = async () => {
    try {
      const res = await apiFetch('/api/materials/submit', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMatrixSubmitted(data.matrixSubmitted);
        setSuccessMsg('Matrix Bahan Halal berhasil disubmit untuk diverifikasi admin!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Matrix Bahan Halal</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola dan pantau seluruh bahan baku produksi untuk sertifikasi halal.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Icons.Download className="w-4 h-4" /> Unduh Template Excel
          </button>
          <label className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors">
            <Icons.Upload className="w-4 h-4" /> Upload Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
          </label>
          <a
            href="https://bpjph.halal.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Cari di bpjph.halal.go.id
          </a>
        </div>
      </div>

      <form onSubmit={handleAddOrUpdate} className={`p-5 rounded-2xl border transition-all ${editingId ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            {editingId ? (
              <>
                <Icons.Edit className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800">Edit Data Bahan Baku</span>
              </>
            ) : (
              <span>+ Input Bahan Baku Manual</span>
            )}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
            >
              Batal Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Bahan</label>
            <input type="text" placeholder="Contoh: Tepung Terigu" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Bahan</label>
            <input type="text" placeholder="Contoh: Bahan Baku" value={newMaterial.jenis} onChange={e => setNewMaterial({...newMaterial, jenis: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Produsen</label>
            <input type="text" placeholder="Contoh: PT Bogasari" value={newMaterial.produsen} onChange={e => setNewMaterial({...newMaterial, produsen: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Negara</label>
            <input type="text" placeholder="Contoh: Indonesia" value={newMaterial.negara} onChange={e => setNewMaterial({...newMaterial, negara: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier</label>
            <input type="text" placeholder="Contoh: PT Distribusi" value={newMaterial.supplier} onChange={e => setNewMaterial({...newMaterial, supplier: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lembaga Penerbit</label>
            <input type="text" placeholder="Contoh: BPJPH" value={newMaterial.lembaga} onChange={e => setNewMaterial({...newMaterial, lembaga: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Sertifikat/Registrasi</label>
            <input type="text" placeholder="Contoh: ID12345678" value={newMaterial.sertifikat} onChange={e => setNewMaterial({...newMaterial, sertifikat: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Masa Berlaku (Expired)</label>
            <input type="text" placeholder="dd/mm/yyyy" value={newMaterial.expired} onChange={e => setNewMaterial({...newMaterial, expired: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-slate-200">
          {editingId && (
            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
              Batal
            </button>
          )}
          <button type="submit" className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors text-white ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {editingId ? '✓ Simpan Perubahan' : '+ Tambah Bahan'}
          </button>
        </div>
      </form>

      <div className="border rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <th className="p-3.5">Nama Bahan</th>
                <th className="p-3.5">Jenis</th>
                <th className="p-3.5">Produsen</th>
                <th className="p-3.5">Negara</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Lembaga Penerbit</th>
                <th className="p-3.5">No. Sertifikat</th>
                <th className="p-3.5">Expired</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-slate-400 text-sm">
                    Belum ada data bahan baku. Silakan unggah Excel atau tambah secara manual.
                  </td>
                </tr>
              ) : (
                materials.map((m) => (
                  <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${editingId === m.id ? 'bg-amber-50/40 font-medium' : ''}`}>
                    <td className="p-3.5 font-semibold text-slate-800">{m.name}</td>
                    <td className="p-3.5 text-slate-500">{m.jenis || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.produsen || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.negara || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.supplier || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.lembaga || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.sertifikat || '-'}</td>
                    <td className="p-3.5 text-xs text-slate-500">{m.expired || '-'}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(m)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Edit bahan baku"
                        >
                          <Icons.Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Hapus bahan baku"
                        >
                          <Icons.Trash className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        {successMsg && <span className="text-emerald-600 font-semibold text-sm">{successMsg}</span>}
        <button onClick={handleSubmitMatrix} className="ml-auto px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all text-white bg-slate-900 hover:bg-slate-800">
          Simpan &amp; Submit Matrix Bahan
        </button>
      </div>
    </Card>
  );
};

const StepUploadProduk = ({ products, setProducts, materials, productsSubmitted, setProductsSubmitted }) => {
  const [successMsg, setSuccessMsg] = useState('');

  // --- TABEL 1: Daftar Nama Produk ---
  const [newProductName, setNewProductName] = useState('');
  // pendingProducts = produk yg sudah diregistrasi tapi belum punya BOM
  const [pendingProducts, setPendingProducts] = useState([]);

  // --- TABEL 2: Input Bahan Penyusun per Produk ---
  const [selectedPendingId, setSelectedPendingId] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  // bomProducts = produk yang sudah dikasih BOM
  const [bomProducts, setBomProducts] = useState([]);

  // Load existing products into bomProducts on mount
  React.useEffect(() => {
    if (products && products.length > 0) {
      setBomProducts(products.map((p, i) => ({
        id: p.id,
        no: i + 1,
        name: p.name,
        bahan: p.bahan || []
      })));
    }
  }, []);

  const [editingPendingId, setEditingPendingId] = useState(null);
  const [editingProductName, setEditingProductName] = useState('');

  const handleRegisterProduct = (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    const id = Date.now();
    setPendingProducts(prev => [...prev, { id, name: newProductName.trim(), bahan: [] }]);
    setNewProductName('');
    setSuccessMsg(`Produk "${newProductName.trim()}" berhasil didaftarkan!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditPending = (p) => {
    setEditingPendingId(p.id);
    setEditingProductName(p.name);
  };

  const handleSaveEditPending = (id) => {
    if (!editingProductName.trim()) return;
    setPendingProducts(prev => prev.map(p =>
      p.id === id ? { ...p, name: editingProductName.trim() } : p
    ));
    setEditingPendingId(null);
    setEditingProductName('');
    setSuccessMsg('Data produk berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeletePending = (id) => {
    if (!window.confirm('Hapus produk ini dari daftar?')) return;
    setPendingProducts(prev => prev.filter(p => p.id !== id));
    if (selectedPendingId === id) {
      setSelectedPendingId(null);
      setSelectedIngredients([]);
    }
    if (editingPendingId === id) setEditingPendingId(null);
  };

  const handleDeleteBOM = async (bomProduct) => {
    if (!window.confirm(`Hapus produk "${bomProduct.name}" dari BOM Final?`)) return;
    try {
      await apiFetch(`/api/products/${bomProduct.id}`, { method: 'DELETE' });
    } catch (e) { /* ignore if no backend endpoint */ }
    setBomProducts(prev => prev.filter(p => p.id !== bomProduct.id));
    setSuccessMsg(`Produk "${bomProduct.name}" berhasil dihapus dari BOM!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditBOM = (bomProduct) => {
    // Move from BOM back to pending so it re-enters Table 2
    setBomProducts(prev => prev.filter(p => p.id !== bomProduct.id));
    const restoredProduct = { ...bomProduct, bahan: [] };
    setPendingProducts(prev => [...prev, restoredProduct]);
    // Auto-select it in Table 2 with its old ingredients pre-filled
    setSelectedPendingId(bomProduct.id);
    setSelectedIngredients(bomProduct.bahan || []);
    setSuccessMsg(`Produk "${bomProduct.name}" siap diedit di Tabel 2.`);
    setTimeout(() => setSuccessMsg(''), 4000);
    // Scroll toward table 2
    setTimeout(() => {
      const el = document.getElementById('tabel2-upload-produk');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleIngredient = (matName) => {
    setSelectedIngredients(prev =>
      prev.includes(matName) ? prev.filter(x => x !== matName) : [...prev, matName]
    );
  };

  const handleSelectPending = (id) => {
    setSelectedPendingId(id);
    // pre-fill from existing selections if any
    const found = pendingProducts.find(p => p.id === id);
    setSelectedIngredients(found?.bahan || []);
  };

  const handleSubmitBOM = async () => {
    if (!selectedPendingId) return;
    const prod = pendingProducts.find(p => p.id === selectedPendingId);
    if (!prod) return;
    if (selectedIngredients.length === 0) {
      alert('Pilih minimal 1 bahan penyusun untuk produk ini.');
      return;
    }

    const newBomEntry = { ...prod, bahan: selectedIngredients };

    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: prod.name, bahan: selectedIngredients })
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
        setBomProducts(prev => [...prev, { ...newBomEntry, id: data.products[data.products.length - 1]?.id || newBomEntry.id }]);
        setPendingProducts(prev => prev.filter(p => p.id !== selectedPendingId));
        setSelectedPendingId(null);
        setSelectedIngredients([]);
        setSuccessMsg(`Bahan penyusun "${prod.name}" berhasil disimpan ke BOM!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProducts = async () => {
    try {
      const res = await apiFetch('/api/products/submit', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setProductsSubmitted(data.productsSubmitted);
        setSuccessMsg('Seluruh data produk & komposisi berhasil disubmit!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedPendingProduct = pendingProducts.find(p => p.id === selectedPendingId);

  return (
    <Card className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Upload Produk & Komposisi (BOM)</h2>
        <p className="text-sm text-slate-500 mt-1">Daftarkan produk dan tentukan komposisi bahan sesuai Matrix Bahan Halal melalui 3 tahap berikut.</p>
      </div>

      {/* ========= TABEL 1: Input Produk ========= */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
          <div>
            <h3 className="font-bold text-slate-800">Daftar Nama Produk</h3>
            <p className="text-xs text-slate-500">Input nama produk, lalu klik Submit agar produk masuk ke Tahap 2.</p>
          </div>
        </div>

        <form onSubmit={handleRegisterProduct} className="p-4 bg-slate-50 rounded-xl border flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Produk</label>
            <input
              type="text"
              placeholder="Contoh: Roti Manis Cokelat"
              value={newProductName}
              onChange={e => setNewProductName(e.target.value)}
              className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
            Submit Produk →
          </button>
        </form>

        <div className="border rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <th className="p-3">No.</th>
                <th className="p-3">Nama Produk</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {pendingProducts.length === 0 && bomProducts.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-slate-400 text-xs">Belum ada produk. Input produk di atas.</td></tr>
              ) : (
                <>
                  {pendingProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">
                        {editingPendingId === p.id ? (
                          <span className="text-xs font-semibold text-slate-500">{bomProducts.length + idx + 1}</span>
                        ) : bomProducts.length + idx + 1}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {editingPendingId === p.id ? (
                          <input
                            type="text"
                            value={editingProductName}
                            onChange={e => setEditingProductName(e.target.value)}
                            className="w-full border rounded-lg px-2 py-1 text-sm outline-none focus:border-emerald-500"
                            autoFocus
                          />
                        ) : p.name}
                      </td>
                      <td className="p-3"><span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Menunggu BOM</span></td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {editingPendingId === p.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEditPending(p.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingPendingId(null)}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                Batal
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditPending(p)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Icons.Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeletePending(p.id)}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Icons.Trash className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bomProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="p-3"><span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ BOM Lengkap</span></td>
                      <td className="p-3 text-center"><span className="text-xs text-slate-400">-</span></td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========= TABEL 2: Input Bahan Penyusun ========= */}
      <div className="space-y-4" id="tabel2-upload-produk">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${pendingProducts.length > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
          <div>
            <h3 className={`font-bold ${pendingProducts.length > 0 ? 'text-slate-800' : 'text-slate-400'}`}>Input Bahan Penyusun Produk</h3>
            <p className="text-xs text-slate-500">Klik nama produk dari Tahap 1, centang bahan dari Matrix Bahan Halal, lalu Submit BOM.</p>
          </div>
        </div>

        {pendingProducts.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl border text-center text-slate-400 text-sm">
            Belum ada produk yang menunggu BOM. Submit produk dari Tahap 1 terlebih dahulu.
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <th className="p-3">No.</th>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3">Pilih Bahan Penyusun</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-slate-700">
                {pendingProducts.map((p, idx) => (
                  <tr key={p.id} className={`transition-colors ${selectedPendingId === p.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <td className="p-3 text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      <button
                        onClick={() => handleSelectPending(p.id)}
                        className={`text-left hover:text-blue-700 transition-colors ${selectedPendingId === p.id ? 'text-blue-700 font-bold' : ''}`}
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="p-3">
                      {selectedPendingId === p.id ? (
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                          {materials.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">Belum ada bahan dari Matrix Bahan Halal.</span>
                          ) : (
                            materials.map(m => (
                              <label key={m.id} className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg border text-xs transition-all ${
                                selectedIngredients.includes(m.name)
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={selectedIngredients.includes(m.name)}
                                  onChange={() => toggleIngredient(m.name)}
                                  className="hidden"
                                />
                                {m.name}
                              </label>
                            ))
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Klik nama produk untuk pilih bahan.</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {selectedPendingId === p.id && (
                        <button
                          onClick={handleSubmitBOM}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                        >
                          Submit BOM →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========= TABEL 3: Rekap BOM Produk ========= */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${bomProducts.length > 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>3</div>
          <div>
            <h3 className={`font-bold ${bomProducts.length > 0 ? 'text-slate-800' : 'text-slate-400'}`}>Rekap Komposisi Bahan (BOM Final)</h3>
            <p className="text-xs text-slate-500">Daftar produk yang telah lengkap dengan komposisi bahan halal.</p>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-100 text-xs font-bold uppercase tracking-wider">
                <th className="p-3.5">No.</th>
                <th className="p-3.5">Nama Produk</th>
                <th className="p-3.5">Komposisi Bahan (BOM)</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {bomProducts.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center text-slate-400 text-sm">Belum ada produk yang selesai di-BOM. Selesaikan Tahap 1 dan 2 terlebih dahulu.</td></tr>
              ) : (
                bomProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 text-slate-500 font-medium">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p.name}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(p.bahan || []).map((b, i) => (
                          <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditBOM(p)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Edit bahan penyusun di Tabel 2"
                        >
                          <Icons.Edit className="w-3.5 h-3.5" /> Edit BOM
                        </button>
                        <button
                          onClick={() => handleDeleteBOM(p)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Hapus produk dari BOM"
                        >
                          <Icons.Trash className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {successMsg && (
        <div className="pt-4 border-t flex justify-start">
          <span className="text-emerald-600 font-semibold text-sm">{successMsg}</span>
        </div>
      )}
    </Card>
  );
};

const StepProsesProduksi = ({ productionData, setProductionData, handleGenericFileUpload }) => {
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async () => {
    try {
      const res = await apiFetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productionData)
      });
      if (res.ok) {
        setSuccessMsg('Dokumen proses produksi halal berhasil disimpan!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Proses Produksi Halal</h2>
        <p className="text-sm text-slate-500 mt-1">Unggah dokumen alur proses produksi (jpeg), layout ruang produksi (jpeg), dan surat pernyataan bebas babi (pdf).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 border rounded-2xl bg-slate-50 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-1">1. Alur Proses Produksi</h4>
            <p className="text-xs text-slate-500 mb-4">Format: .jpeg / Gambar</p>
            <input type="file" name="alurProses" accept="image/jpeg" onChange={(e) => handleGenericFileUpload(e, 'alurProses', setProductionData)} className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700" />
          </div>
          {productionData.alurProses && (
            <a href={`/uploads/${productionData.alurProses}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-3 block truncate w-full hover:underline" title={productionData.alurProses}>
              ✓ {productionData.alurProses} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-5 border rounded-2xl bg-slate-50 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-1">2. Layout Ruang Produksi</h4>
            <p className="text-xs text-slate-500 mb-4">Format: .jpeg / Denah Ruang</p>
            <input type="file" name="layoutRuang" accept="image/jpeg" onChange={(e) => handleGenericFileUpload(e, 'layoutRuang', setProductionData)} className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700" />
          </div>
          {productionData.layoutRuang && (
            <a href={`/uploads/${productionData.layoutRuang}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-3 block truncate w-full hover:underline" title={productionData.layoutRuang}>
              ✓ {productionData.layoutRuang} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-5 border rounded-2xl bg-slate-50 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-1">3. Surat Pernyataan Bebas Babi</h4>
            <p className="text-xs text-slate-500 mb-4">Format: .pdf</p>
            <input type="file" name="bebasBabi" accept=".pdf" onChange={(e) => handleGenericFileUpload(e, 'bebasBabi', setProductionData)} className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700" />
          </div>
          {productionData.bebasBabi && (
            <a href={`/uploads/${productionData.bebasBabi}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-3 block truncate w-full hover:underline" title={productionData.bebasBabi}>
              ✓ {productionData.bebasBabi} (Klik untuk Lihat)
            </a>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-4 pt-4 border-t">
        {successMsg && <span className="text-emerald-600 font-semibold text-sm">{successMsg}</span>}
        <button onClick={handleSave} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors">
          Simpan Proses Produksi Halal
        </button>
      </div>
    </Card>
  );
};

const StepImplementasiSJPH = ({ isKomitmenComplete, isBahanComplete, isPphComplete, isProdukComplete, isEvaluasiComplete }) => {
  const criteria = [
    { 
      title: '1. Komitmen & Tanggung Jawab', 
      status: isKomitmenComplete ? '✓ Selesai' : 'Belum Lengkap', 
      desc: 'Dipenuhi dari pengisian Dokumen Legal & Evidence (Foto Sosialisasi & Absen Sosialisasi).' 
    },
    { 
      title: '2. Bahan', 
      status: isBahanComplete ? '✓ Selesai' : 'Belum Submit', 
      desc: 'Dipenuhi jika sudah mensubmit/mengirim dan sesuai kriteria bahan halal.' 
    },
    { 
      title: '3. Proses Produk Halal (PPH)', 
      status: isPphComplete ? '✓ Selesai' : 'Belum Lengkap', 
      desc: 'Dipenuhi jika sudah mengupload dokumen/gambar sesuai pada fitur Proses Produksi Halal.' 
    },
    { 
      title: '4. Produk', 
      status: isProdukComplete ? '✓ Selesai' : 'Belum Lengkap', 
      desc: 'Dipenuhi jika sudah mengupload dokumen/data sesuai pada fitur Upload Produk.' 
    },
    { 
      title: '5. Pemantauan & Evaluasi', 
      status: isEvaluasiComplete ? '✓ Selesai' : 'Belum Lengkap', 
      desc: 'Dipenuhi jika sudah mengupload Bukti Foto Audit Internal & Daftar Hadir Audit Internal.' 
    }
  ];

  return (
    <Card className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Implementasi SJPH (5 Kriteria)</h2>
        <p className="text-sm text-slate-500 mt-1">Status pemenuhan kriteria Sistem Jaminan Produk Halal secara real-time berdasarkan input Anda.</p>
      </div>

      <div className="space-y-3">
        {criteria.map((c, idx) => {
          const isDone = c.status.includes('Selesai');
          return (
            <div key={idx} className="p-4 rounded-xl border flex justify-between items-center bg-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-800">{c.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {c.status}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const StepUploadEvidence = ({ evidenceData, setEvidenceData, handleGenericFileUpload }) => {
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async () => {
    try {
      const res = await apiFetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidenceData)
      });
      if (res.ok) {
        setSuccessMsg('Seluruh evidence (bukti) berhasil disimpan!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Upload Evidence (Bukti)</h2>
        <p className="text-sm text-slate-500 mt-1">Lengkapi seluruh dokumentasi bukti kegiatan perusahaan sesuai urutan standar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">1. Bukti Foto Sosialisasi/Training Halal</h4>
          <input type="file" name="sosialisasiFoto" accept="image/*" onChange={(e) => handleGenericFileUpload(e, 'sosialisasiFoto', setEvidenceData)} className="w-full text-xs text-slate-500 mt-2" />
          {evidenceData.sosialisasiFoto && (
            <a href={`/uploads/${evidenceData.sosialisasiFoto}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-1 block truncate w-full hover:underline" title={evidenceData.sosialisasiFoto}>
              ✓ {evidenceData.sosialisasiFoto} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">2. Bukti Foto Audit Internal</h4>
          <input type="file" name="auditInternalFoto" accept="image/*" onChange={(e) => handleGenericFileUpload(e, 'auditInternalFoto', setEvidenceData)} className="w-full text-xs text-slate-500 mt-2" />
          {evidenceData.auditInternalFoto && (
            <a href={`/uploads/${evidenceData.auditInternalFoto}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-1 block truncate w-full hover:underline" title={evidenceData.auditInternalFoto}>
              ✓ {evidenceData.auditInternalFoto} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">3. Upload Daftar Hadir Sosialisasi Halal</h4>
          <input type="file" name="sosialisasiAbsen" accept=".pdf,.doc,.docx" onChange={(e) => handleGenericFileUpload(e, 'sosialisasiAbsen', setEvidenceData)} className="w-full text-xs text-slate-500 mt-2" />
          {evidenceData.sosialisasiAbsen && (
            <a href={`/uploads/${evidenceData.sosialisasiAbsen}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-1 block truncate w-full hover:underline" title={evidenceData.sosialisasiAbsen}>
              ✓ {evidenceData.sosialisasiAbsen} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">4. Upload Daftar Hadir Audit Internal</h4>
          <input type="file" name="auditInternalAbsen" accept=".pdf,.doc,.docx" onChange={(e) => handleGenericFileUpload(e, 'auditInternalAbsen', setEvidenceData)} className="w-full text-xs text-slate-500 mt-2" />
          {evidenceData.auditInternalAbsen && (
            <a href={`/uploads/${evidenceData.auditInternalAbsen}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-1 block truncate w-full hover:underline" title={evidenceData.auditInternalAbsen}>
              ✓ {evidenceData.auditInternalAbsen} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">5. Sampel Catatan Pembelian Bahan</h4>
          <input type="file" name="pembelianBahan" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleGenericFileUpload(e, 'pembelianBahan', setEvidenceData)} className="w-full text-xs text-slate-500 mt-2" />
          {evidenceData.pembelianBahan && (
            <a href={`/uploads/${evidenceData.pembelianBahan}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-1 block truncate w-full hover:underline" title={evidenceData.pembelianBahan}>
              ✓ {evidenceData.pembelianBahan} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">6. Catatan Penyimpanan Bahan</h4>
          <input type="file" name="penyimpananBahan" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleGenericFileUpload(e, 'penyimpananBahan', setEvidenceData)} className="w-full text-xs text-slate-500 mt-2" />
          {evidenceData.penyimpananBahan && (
            <a href={`/uploads/${evidenceData.penyimpananBahan}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-1 block truncate w-full hover:underline" title={evidenceData.penyimpananBahan}>
              ✓ {evidenceData.penyimpananBahan} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">7. Catatan Hasil Produksi</h4>
          <input type="file" name="hasilProduksi" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleGenericFileUpload(e, 'hasilProduksi', setEvidenceData)} className="w-full text-xs text-slate-500 mt-2" />
          {evidenceData.hasilProduksi && (
            <a href={`/uploads/${evidenceData.hasilProduksi}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-1 block truncate w-full hover:underline" title={evidenceData.hasilProduksi}>
              ✓ {evidenceData.hasilProduksi} (Klik untuk Lihat)
            </a>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">8. Bukti Distribusi/Penjualan Produk</h4>
          <input type="file" name="distribusiProduk" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleGenericFileUpload(e, 'distribusiProduk', setEvidenceData)} className="w-full text-xs text-slate-500 mt-2" />
          {evidenceData.distribusiProduk && (
            <a href={`/uploads/${evidenceData.distribusiProduk}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold mt-1 block truncate w-full hover:underline" title={evidenceData.distribusiProduk}>
              ✓ {evidenceData.distribusiProduk} (Klik untuk Lihat)
            </a>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-4 pt-4 border-t">
        {successMsg && <span className="text-emerald-600 font-semibold text-sm">{successMsg}</span>}
        <button onClick={handleSave} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors">
          Simpan Semua Evidence
        </button>
      </div>
    </Card>
  );
};



const StepPengajuanBPJPH = ({ readinessScore }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/submit-application', { method: 'POST' });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <Icons.ShieldCheck className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Pengajuan Sertifikasi Halal BPJPH</h2>
        <p className="text-sm text-slate-500 mt-1">Seluruh tahapan SJPH dan dokumen Anda telah diverifikasi. Siap dikirim ke sistem SIHALAL.</p>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl max-w-md mx-auto border text-left space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Readiness Score:</span>
          <span className="font-bold text-emerald-600">{readinessScore}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Status Berkas:</span>
          <span className="font-bold text-slate-800">Lengkap & Valid</span>
        </div>
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} disabled={loading} className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50">
          {loading ? 'Mengajukan...' : 'Ajukan Permohonan Sekarang'}
        </button>
      ) : (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-sm border border-emerald-200">
          ✓ Permohonan berhasil diajukan ke BPJPH! Nomor Registrasi: JHC-2026-89410.
        </div>
      )}
    </Card>
  );
};

const AdminPanel = ({ certificationStatus, setCertificationStatus }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await apiFetch('/api/certification-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setCertificationStatus(data.certificationStatus);
        setMessage('Status berhasil diperbarui!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Gagal memperbarui status.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const STAGES = [
    { no: 1, label: 'Diterima oleh Admin' },
    { no: 2, label: 'Diproses' },
    { no: 3, label: 'Disubmit di SIHALAL' },
    { no: 4, label: 'Feedback BPJPH / Dikirim ke LPH' },
    { no: 5, label: 'Penjadwalan Audit' },
    { no: 6, label: 'Perbaikan Hasil Audit' },
    { no: 7, label: 'Sidang Fatwa MUI' },
    { no: 8, label: 'Terbit Sertifikat Halal BPJPH' }
  ];

  return (
    <Card className="p-8 max-w-3xl mx-auto space-y-6 animate-fade-in border-violet-200 shadow-xl bg-violet-50/30">
      <div className="flex items-center gap-3 border-b pb-4 border-violet-100">
        <div className="w-12 h-12 bg-violet-600 text-white rounded-xl flex items-center justify-center shadow-md">
          <Icons.Admin className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-violet-900 tracking-tight">Admin Panel</h2>
          <p className="text-sm text-violet-600 mt-1">Kelola progres pengajuan sertifikasi halal</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <h3 className="font-bold text-slate-800">Status Progress Sertifikasi Halal</h3>
          <p className="text-xs text-slate-500 mt-1">Pilih tahapan saat ini untuk diperbarui di Dashboard pengguna.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => handleStatusChange(0)}
            disabled={loading}
            className={`p-4 rounded-xl border text-left transition-all ${certificationStatus === 0 ? 'bg-slate-800 text-white border-slate-800 ring-2 ring-slate-400 ring-offset-1' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="font-bold text-sm">0. Menunggu Pengajuan</div>
            <div className={`text-xs mt-1 ${certificationStatus === 0 ? 'text-slate-300' : 'text-slate-400'}`}>Reset ke awal</div>
          </button>
          
          {STAGES.map((s) => {
            const isCurrent = certificationStatus === s.no;
            return (
              <button
                key={s.no}
                onClick={() => handleStatusChange(s.no)}
                disabled={loading}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${isCurrent ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 ring-offset-1 scale-[1.02]' : 'bg-white hover:bg-emerald-50 hover:border-emerald-200'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrent ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                  {s.no}
                </div>
                <div>
                  <div className={`font-bold text-sm leading-tight ${isCurrent ? 'text-white' : 'text-slate-700'}`}>{s.label}</div>
                  {isCurrent && <div className="text-[10px] bg-white/20 inline-block px-2 py-0.5 rounded-full mt-1.5 font-semibold tracking-wide">STATUS AKTIF</div>}
                </div>
              </button>
            )
          })}
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-semibold text-center border ${message.includes('Gagal') || message.includes('Terjadi') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {message}
          </div>
        )}
      </div>
    </Card>
  );
};

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', token: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [devToken, setDevToken] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleResendCode = async () => {
    if (!formData.email) return;
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message || 'Kode verifikasi telah dikirim ulang ke email Anda.', type: 'success' });
        if (data.dev_token) {
          setDevToken(data.dev_token);
          setFormData(prev => ({ ...prev, token: data.dev_token }));
        } else {
          setDevToken('');
          setFormData(prev => ({ ...prev, token: '' }));
        }
      } else {
        setMessage({ text: data.error || 'Gagal mengirim ulang kode.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (isForgotPassword) {
      if (forgotPasswordStep === 1) {
        // Handle Forgot Password (request token)
        try {
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email })
          });
          const data = await res.json();
          if (res.ok) {
            setMessage({ text: data.message, type: 'success' });
            if (data.dev_token) {
              setDevToken(data.dev_token); // For dev purposes only
              setFormData({ ...formData, token: data.dev_token });
            } else {
              setDevToken('');
              setFormData(prev => ({ ...prev, token: '' }));
            }
            setForgotPasswordStep(2);
          } else {
            setMessage({ text: data.error || 'Terjadi kesalahan', type: 'error' });
          }
        } catch (err) {
          setMessage({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
        } finally {
          setLoading(false);
        }
        return;
      } else if (forgotPasswordStep === 2) {
        // Verify Token
        try {
          const res = await fetch('/api/auth/verify-reset-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: formData.token })
          });
          const data = await res.json();
          if (res.ok) {
            setMessage({ text: 'Kode verifikasi valid. Silakan masukkan password baru.', type: 'success' });
            setForgotPasswordStep(3);
          } else {
            setMessage({ text: data.error || 'Terjadi kesalahan', type: 'error' });
          }
        } catch (err) {
          setMessage({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
        } finally {
          setLoading(false);
        }
        return;
      } else if (forgotPasswordStep === 3) {
        // Handle Reset Password (submit token and new password)
        if (formData.password !== formData.confirmPassword) {
          setMessage({ text: 'Konfirmasi password tidak cocok', type: 'error' });
          setLoading(false);
          return;
        }
        try {
          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: formData.token, newPassword: formData.password })
          });
          const data = await res.json();
          if (res.ok) {
            setMessage({ text: 'Password berhasil diubah! Silakan login.', type: 'success' });
            setIsForgotPassword(false);
            setForgotPasswordStep(1);
            setDevToken('');
            setFormData({ ...formData, password: '', confirmPassword: '', token: '' });
          } else {
            setMessage({ text: data.error || 'Terjadi kesalahan', type: 'error' });
          }
        } catch (err) {
          setMessage({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
        } finally {
          setLoading(false);
        }
        return;
      }
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Konfirmasi password tidak cocok', type: 'error' });
      setLoading(false);
      return;
    }

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        const userProfile = data.user || { name: formData.name, email: formData.email };
        onLogin(userProfile, data.token);
      } else {
        setMessage({ text: data.error || 'Terjadi kesalahan', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Terjadi kesalahan koneksi. Pastikan server berjalan.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 animate-pulse"></div>

      <Card className="max-w-md w-full p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] bg-white/95 backdrop-blur-md relative z-10 border border-slate-100 rounded-3xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center mb-4 p-2">
            <img src="/logo.jpg" alt="JHC HalalFlow Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-emerald-950 tracking-tight text-center">JHC HalalFlow</h2>
          <p className="text-sm text-emerald-700/80 mt-1 text-center font-medium">Sistem Manajemen Sertifikasi Halal</p>
        </div>

        {/* Toggle Register/Login/Forgot Password */}
        {!isForgotPassword && (
          <div className="flex bg-emerald-50 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setMessage({ text: '', type: '' }); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isRegister ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-600/70 hover:text-emerald-800'}`}
            >Masuk</button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setMessage({ text: '', type: '' }); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isRegister ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-600/70 hover:text-emerald-800'}`}
            >Daftar Baru</button>
          </div>
        )}
        
        {isForgotPassword && (
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold text-emerald-900 mb-1">Reset Password</h3>
            <p className="text-sm text-emerald-700/80">
              {forgotPasswordStep === 1 && 'Masukkan email Anda untuk menerima kode verifikasi.'}
              {forgotPasswordStep === 2 && (
                <span>Kode 6 digit telah dikirim ke <strong>{formData.email}</strong>. Periksa inbox/spam.</span>
              )}
              {forgotPasswordStep === 3 && 'Masukkan password baru Anda.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isForgotPassword && isRegister && (
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-emerald-950" placeholder="Masukkan nama lengkap" required={isRegister} />
            </div>
          )}
          
          {(!isForgotPassword || (isForgotPassword && forgotPasswordStep === 1)) && (
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wide">Alamat Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-emerald-950" placeholder="Masukkan email aktif" required disabled={isForgotPassword && forgotPasswordStep > 1} />
            </div>
          )}
          
          {!isForgotPassword && isRegister && (
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wide">Nomor Telepon (WhatsApp)</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-emerald-950" placeholder="Contoh: 08123456789" />
            </div>
          )}
          
          {isForgotPassword && forgotPasswordStep === 2 && (
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wide">Kode Verifikasi</label>
              <input 
                type="text" 
                name="token" 
                value={formData.token} 
                onChange={handleChange} 
                maxLength={6}
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono font-bold focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-emerald-950" 
                placeholder="000000" 
                required 
              />
              <div className="flex justify-between items-center mt-2 px-1">
                <button 
                  type="button" 
                  onClick={() => { setForgotPasswordStep(1); setMessage({ text: '', type: '' }); }} 
                  className="text-xs text-slate-500 hover:text-emerald-700 transition-colors">
                  Ganti email
                </button>
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={handleResendCode} 
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800 disabled:opacity-50 transition-colors">
                  Kirim ulang kode
                </button>
              </div>
            </div>
          )}
          
          {(!isForgotPassword || (isForgotPassword && forgotPasswordStep === 3)) && (
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wide">Password {isForgotPassword && forgotPasswordStep === 3 ? 'Baru' : ''}</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 pr-12 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-emerald-950" placeholder="Minimal 6 karakter" required minLength={6} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPwd ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'} /></svg>
                </button>
              </div>
              {!isRegister && !isForgotPassword && (
                <div className="mt-2 text-right">
                  <button type="button" onClick={() => { setIsForgotPassword(true); setForgotPasswordStep(1); setMessage({text: '', type: ''}); }} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                    Lupa Password?
                  </button>
                </div>
              )}
            </div>
          )}
          
          {(isRegister || (isForgotPassword && forgotPasswordStep === 3)) && (
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wide">Konfirmasi Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-emerald-950" placeholder="Ulangi password" required />
            </div>
          )}

          {message.text && (
            <p className={`text-xs font-bold text-center p-2 rounded-lg ${message.type === 'error' ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50'}`}>{message.text}</p>
          )}

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-400 text-white rounded-xl font-bold text-sm shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5 transition-all mt-2">
            {loading ? 'Memproses...' : isForgotPassword ? (forgotPasswordStep === 1 ? 'Kirim Kode Verifikasi' : forgotPasswordStep === 2 ? 'Verifikasi Kode' : 'Simpan Password Baru') : isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
          
          {isForgotPassword && (
            <div className="text-center mt-3">
              <button type="button" onClick={() => { setIsForgotPassword(false); setForgotPasswordStep(1); setMessage({text: '', type: ''}); }} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                ← Kembali ke Login
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-emerald-100 flex items-start gap-3">
            <Icons.ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-700/80 leading-relaxed font-medium">
              <strong className="text-emerald-900">Keamanan Data Terjamin.</strong> Data dilindungi dengan enkripsi JWT dan password hashing bcrypt.
            </p>
          </div>

          <div className="text-center">
            <a href="https://wa.me/6285117021977" target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-emerald-700 font-bold hover:text-emerald-900 transition-colors inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100">
              <Icons.WhatsApp className="w-3.5 h-3.5 fill-current" />
              Bantuan Admin: 0851-1702-1977
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
};

const AdminLogin = ({ onLogin, onBack }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password === 'ASA_JHC' && formData.username.trim() !== '') {
      onLogin();
    } else {
      setErrorMsg('Username atau password salah. Silakan periksa kembali.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4"></div>

      <div className="max-w-sm w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-900/50 flex items-center justify-center mx-auto mb-5">
            <Icons.Admin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">JHC HalalFlow — Akses Manajemen Internal</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Username Admin</label>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/15 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-slate-500 font-medium"
                placeholder="Nama Anda"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/15 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-slate-500 font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            {errorMsg && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold text-center p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 transition-all mt-2"
            >
              Masuk ke Portal Admin
            </button>
          </form>

          <div className="mt-6 text-center pt-5 border-t border-white/10">
            <button
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold inline-flex items-center gap-1.5"
            >
              ← Kembali ke Login Pengguna
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout, certificationStatus, setCertificationStatus, readinessScore }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('status');
  const [companyData, setCompanyData] = useState({});
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiFetch('/api/company-profile').then(r => r.json()).then(d => setCompanyData(d || {})).catch(() => {});
    apiFetch('/api/materials').then(r => r.json()).then(d => setMaterials(d.materials || [])).catch(() => {});
    apiFetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
    apiFetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
  }, []);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await apiFetch('/api/certification-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setCertificationStatus(data.certificationStatus);
        setMessage('Status sertifikasi berhasil diperbarui!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Gagal memperbarui status.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const STAGES = [
    { no: 1, label: 'Diterima oleh Admin', desc: 'Pengajuan diterima & pemeriksaan awal dimulai.' },
    { no: 2, label: 'Diproses', desc: 'Data & dokumen sedang diverifikasi.' },
    { no: 3, label: 'Disubmit di SIHALAL', desc: 'Pengajuan dikirim ke sistem SIHALAL BPJPH.' },
    { no: 4, label: 'Feedback BPJPH / Dikirim ke LPH', desc: 'Menunggu/menindaklanjuti feedback dari BPJPH.' },
    { no: 5, label: 'Penjadwalan Audit', desc: 'LPH menjadwalkan audit pemeriksaan kehalalan.' },
    { no: 6, label: 'Perbaikan Hasil Audit', desc: 'Perbaikan dokumen/data berdasarkan hasil audit.' },
    { no: 7, label: 'Sidang Fatwa MUI', desc: 'Penetapan kehalalan melalui sidang fatwa MUI.' },
    { no: 8, label: 'Terbit Sertifikat Halal BPJPH', desc: 'Sertifikat Halal resmi BPJPH telah terbit!' }
  ];

  const TABS = [
    { id: 'status', label: 'Kelola Status', icon: Icons.ShieldCheck },
    { id: 'perusahaan', label: 'Data Perusahaan', icon: Icons.Building },
    { id: 'bahan', label: 'Bahan Baku', icon: Icons.List },
    { id: 'produk', label: 'Produk', icon: Icons.Package },
    { id: 'pengguna', label: 'Pengguna', icon: Icons.User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-[#063b27] text-white px-8 py-4 flex justify-between items-center shadow-xl sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
            <Icons.Admin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-tight">JHC HalalFlow</h1>
            <p className="text-[10px] text-emerald-300 font-semibold uppercase tracking-widest">Portal Admin Internal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-800/50 px-3 py-1.5 rounded-full border border-emerald-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-200">Admin Aktif</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-red-500"
          >
            <Icons.LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-700">{users.length || 1}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Pengguna Terdaftar</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">{readinessScore}%</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Kesiapan Berkas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-amber-600">{materials.length}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Data Bahan Baku</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-700">Tahap {certificationStatus}/8</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Status Sertifikasi</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-8 space-y-6">

        {/* Tab: Status Sertifikasi */}
        {activeTab === 'status' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Kelola Status Sertifikasi</h2>
                <p className="text-sm text-slate-500 mt-1">Klik salah satu tahap di bawah untuk memperbarui status di Dashboard Pengguna secara real-time.</p>
              </div>
              {certificationStatus > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Aktif: </span>
                  <span className="text-sm font-bold text-emerald-900">{STAGES[certificationStatus - 1]?.label || 'Tidak Diketahui'}</span>
                </div>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${
                message.includes('Gagal') || message.includes('Terjadi')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current flex-shrink-0"></span>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleStatusChange(0)}
                disabled={loading}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  certificationStatus === 0
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="font-black text-base">Reset</div>
                <div className="text-xs mt-1 opacity-70">Menunggu Pengajuan</div>
              </button>

              {STAGES.map((s) => {
                const isCurrent = certificationStatus === s.no;
                const isDone = certificationStatus > s.no;
                return (
                  <button
                    key={s.no}
                    onClick={() => handleStatusChange(s.no)}
                    disabled={loading}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/30 scale-[1.02] ring-4 ring-emerald-600/20'
                        : isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-400'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        isCurrent ? 'bg-white text-emerald-700' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isDone ? '✓' : s.no}
                      </div>
                      {isCurrent && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Aktif</span>}
                    </div>
                    <div className={`font-bold text-sm leading-tight ${isCurrent ? 'text-white' : ''}`}>{s.label}</div>
                    <div className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Data Perusahaan */}
        {activeTab === 'perusahaan' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800">Data Perusahaan Terdaftar</h2>
            <Card className="p-6">
              {companyData.nama ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Nama Perusahaan', value: companyData.nama },
                    { label: 'NIB', value: companyData.nib },
                    { label: 'NPWP', value: companyData.npwp },
                    { label: 'Penanggung Jawab', value: companyData.penanggungJawab },
                    { label: 'Jenis Usaha', value: companyData.jenisUsaha },
                    { label: 'Skala Usaha', value: companyData.skalaUsaha },
                    { label: 'Jumlah Outlet', value: companyData.jumlahOutlet },
                    { label: 'Cabang', value: companyData.cabang },
                    { label: 'Alamat', value: companyData.alamat },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{item.value || '-'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">Data perusahaan belum diisi oleh pengguna.</p>
              )}
            </Card>
          </div>
        )}

        {/* Tab: Bahan Baku */}
        {activeTab === 'bahan' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800">Daftar Bahan Baku ({materials.length} item)</h2>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-max">
                  <thead className="bg-emerald-900 text-white text-xs font-bold uppercase tracking-wide">
                    <tr>
                      <th className="p-4">No</th>
                      <th className="p-4">Nama Bahan</th>
                      <th className="p-4">Jenis</th>
                      <th className="p-4">Produsen</th>
                      <th className="p-4">Negara</th>
                      <th className="p-4">No. Sertifikat</th>
                      <th className="p-4">Expired</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm text-slate-700">
                    {materials.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-400">Belum ada data bahan baku.</td></tr>
                    ) : materials.map((m, i) => (
                      <tr key={m.id || i} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-400">{i + 1}</td>
                        <td className="p-4 font-semibold text-slate-800">{m.name}</td>
                        <td className="p-4 text-slate-500">{m.jenis || '-'}</td>
                        <td className="p-4 text-slate-500">{m.produsen || '-'}</td>
                        <td className="p-4 text-slate-500">{m.negara || '-'}</td>
                        <td className="p-4 text-slate-500">{m.sertifikat || '-'}</td>
                        <td className="p-4 text-slate-500">{m.expired || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Produk */}
        {activeTab === 'produk' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800">Daftar Produk ({products.length} item)</h2>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-max">
                  <thead className="bg-emerald-900 text-white text-xs font-bold uppercase tracking-wide">
                    <tr>
                      <th className="p-4">No</th>
                      <th className="p-4">Nama Produk</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {products.length === 0 ? (
                      <tr><td colSpan="3" className="p-8 text-center text-slate-400">Belum ada produk yang didaftarkan.</td></tr>
                    ) : products.map((p, i) => (
                      <tr key={p.id || i} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-400">{i + 1}</td>
                        <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                        <td className="p-4">
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            Terdaftar
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Pengguna */}
        {activeTab === 'pengguna' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800">Daftar Pengguna Terdaftar</h2>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-max">
                  <thead className="bg-emerald-900 text-white text-xs font-bold uppercase tracking-wide">
                    <tr>
                      <th className="p-4">No</th>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Nomor Telepon</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {users.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-400">Belum ada pengguna yang terdaftar.</td></tr>
                    ) : users.map((u, i) => (
                      <tr key={i} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-400">{i + 1}</td>
                        <td className="p-4 font-semibold text-slate-800">{u.namaLengkap || '-'}</td>
                        <td className="p-4 text-slate-500">{u.email || '-'}</td>
                        <td className="p-4 text-slate-500">{u.nomorTelepon || '-'}</td>
                        <td className="p-4">
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">Aktif</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
};
