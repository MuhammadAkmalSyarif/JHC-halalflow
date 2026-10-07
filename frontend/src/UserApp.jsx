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
  User: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  Menu: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  Send: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
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
// API BASE & AUTH HELPER
// =============================================
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getFullUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}

function getAuthHeaders() {
  const token = localStorage.getItem('jhc_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Fetch dengan auto-retry saat backend cold start (Render free tier)
// Attempt 1: timeout 38 detik. Kalau gagal, tunggu 4 detik lalu retry sekali lagi.
async function fetchWithRetry(url, options = {}, timeoutMs = 38000, maxRetries = 1) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError' && attempt < maxRetries) {
        // Timeout tapi masih ada retry — tunggu sebentar lalu coba lagi
        await new Promise(r => setTimeout(r, 4000));
        continue;
      }
      if (err.name === 'AbortError') throw new Error('TIMEOUT');
      throw err;
    }
  }
}

async function apiFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { 
    ...getAuthHeaders(),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };
  
  if (!options.method || options.method.toUpperCase() === 'GET') {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}t=${Date.now()}`;
  }
  
  const finalUrl = getFullUrl(url);
  const res = await fetch(finalUrl, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('jhc_token');
    window.location.reload();
  }
  return res;
}

export default function UserApp() {
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
  const [permohonanStatus, setPermohonanStatus] = useState('belum');
  const [permohonanCatatan, setPermohonanCatatan] = useState('');
  const [nomorSertifikat, setNomorSertifikat] = useState('');
  const [tglTerbitSertifikat, setTglTerbitSertifikat] = useState('');
  const [fileSertifikat, setFileSertifikat] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState({ text: '', type: '' });
  const [jadwalAudit, setJadwalAudit] = useState('');
  const [auditorName, setAuditorName] = useState('');

  const showToast = (text, type = 'error', duration = 5000) => {
    setGlobalToast({ text, type });
    setTimeout(() => setGlobalToast({ text: '', type: '' }), duration);
  };

  // Refresh status function
  const refreshCertStatus = async () => {
    try {
      const certRes = await apiFetch('/api/certification-status', { headers: getAuthHeaders() });
      const certVal = await certRes.json();
      setCertificationStatus(certVal.certificationStatus || 0);
      setPermohonanStatus(certVal.permohonanStatus || 'belum');
      setPermohonanCatatan(certVal.permohonanCatatan || '');
      setNomorSertifikat(certVal.nomorSertifikat || '');
      setTglTerbitSertifikat(certVal.tglTerbitSertifikat || '');
      setFileSertifikat(certVal.fileSertifikat || '');
      setJadwalAudit(certVal.jadwalAudit || '');
      setAuditorName(certVal.auditorName || '');
    } catch (err) {
      // ignore
    }
  };

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
        setPermohonanStatus(certVal.permohonanStatus || 'belum');
        setPermohonanCatatan(certVal.permohonanCatatan || '');
        setNomorSertifikat(certVal.nomorSertifikat || '');
        setTglTerbitSertifikat(certVal.tglTerbitSertifikat || '');
        setFileSertifikat(certVal.fileSertifikat || '');
        setJadwalAudit(certVal.jadwalAudit || '');
        setAuditorName(certVal.auditorName || '');
      } catch (err) {
        console.error('Error fetching data from API:', err);
      }
    }
    loadData();

    // Set up polling for real-time status updates (30 detik agar server tidak kewalahan)
    const statusInterval = setInterval(async () => {
      try {
        const certRes = await apiFetch('/api/certification-status', { headers: getAuthHeaders() });
        const certVal = await certRes.json();
        setCertificationStatus(certVal.certificationStatus || 0);
        setPermohonanStatus(certVal.permohonanStatus || 'belum');
        setPermohonanCatatan(certVal.permohonanCatatan || '');
        setNomorSertifikat(certVal.nomorSertifikat || '');
        setTglTerbitSertifikat(certVal.tglTerbitSertifikat || '');
        setFileSertifikat(certVal.fileSertifikat || '');
        setJadwalAudit(certVal.jadwalAudit || '');
        setAuditorName(certVal.auditorName || '');
      } catch (err) {
        // ignore polling errors
      }
    }, 30000); // 30 detik — jauh lebih ringan untuk server Render

    // Keep-alive ping setiap 10 menit agar Render tidak sleep
    const keepAliveInterval = setInterval(async () => {
      try {
        await fetch(getFullUrl('/api/status'), { method: 'GET', signal: AbortSignal.timeout(5000) });
      } catch (_) { /* abaikan */ }
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(keepAliveInterval);
    };
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
        showToast('Gagal mengunggah berkas: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Terjadi kesalahan saat mengunggah berkas.');
    }
  };

  const handleMultiFileUpload = async (e, fieldName, setLocalStateVal) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const token = localStorage.getItem('jhc_token');
    
    try {
      const uploadedNames = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        if (token) formData.append('_token', token);

        const res = await apiFetch('/api/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          uploadedNames.push(data.filename);
        } else {
          showToast('Gagal mengunggah berkas: ' + (data.error || 'Server error'));
        }
      }
      
      if (uploadedNames.length > 0) {
        setLocalStateVal(prev => {
          const existing = prev[fieldName] ? (prev[fieldName] + ',') : '';
          return {
            ...prev,
            [fieldName]: existing + uploadedNames.join(',')
          };
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Terjadi kesalahan saat mengunggah berkas.');
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

  const chatEndRef = React.useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Show thinking indicator
    setChatMessages(prev => [...prev, { sender: 'ai', text: '...', isThinking: true }]);

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMsg })
      });
      const data = await res.json();
      // Remove thinking indicator, append AI reply
      setChatMessages(prev => {
        const withoutThinking = prev.filter(m => !m.isThinking);
        const aiReply = data.messages?.find(m => m.sender === 'ai');
        return aiReply ? [...withoutThinking, aiReply] : withoutThinking;
      });
    } catch (err) {
      console.error('Error sending chat message:', err);
      setChatMessages(prev => [
        ...prev.filter(m => !m.isThinking),
        { sender: 'ai', text: 'Maaf, terjadi gangguan. Silakan coba lagi atau hubungi Admin JHC di 0851-1702-1977.' }
      ]);
    }
  };

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
      {/* Top Navbar — Elevated z-40 and fixed h-20 so it is never covered */}
      <header className="bg-white border-b sticky top-0 z-40 px-4 md:px-6 h-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2.5 md:gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-emerald-800 hover:bg-emerald-100/70 rounded-xl transition-colors"
            title="Menu Navigasi"
          >
            {mobileMenuOpen ? <Icons.X className="w-5 h-5" /> : <Icons.Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2.5 md:gap-3 cursor-pointer" onClick={() => { setCurrentStep(0); setMobileMenuOpen(false); }}>
            <img src="/logo.jpg" alt="JHC HalalFlow Logo" className="h-12 md:h-14 object-contain" />
            <div>
              <h1 className="font-extrabold text-base md:text-lg text-emerald-950 tracking-tight leading-tight">JHC HalalFlow</h1>
              <p className="text-[11px] md:text-xs text-emerald-700 font-semibold leading-tight">Platform Manajemen Sertifikasi Halal</p>
            </div>
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

      <div className="flex flex-1 relative">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-x-0 top-20 bottom-0 bg-black/40 z-20 lg:hidden backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed top-20 left-0 bottom-0 w-72 border-r border-emerald-200/80 z-30 flex flex-col p-4 space-y-1 overflow-y-auto shadow-lg lg:shadow-[4px_0_24px_rgba(6,78,59,0.05)] transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:shrink-0`}>
          <p className="sidebar-section-title text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider px-3 mb-2 mt-2">Alur Sertifikasi SJPH</p>
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                data-active={isActive ? "true" : undefined}
                onClick={() => {
                  setCurrentStep(step.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold border border-emerald-400/30'
                    : 'text-emerald-950/85 hover:bg-emerald-100/70 hover:text-emerald-950 hover:border-emerald-200/60 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                <span className="text-left leading-snug">{step.title}</span>
              </button>
            );
          })}



          {/* User Account & Professional Logout Button */}
          <div className="mt-auto pt-4 border-t border-emerald-200/70 flex flex-col gap-2">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-emerald-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {userProfile?.namaLengkap ? userProfile.namaLengkap.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-emerald-950 truncate leading-tight">
                  {userProfile?.namaLengkap || 'Pengguna JHC'}
                </p>
                <p className="text-[10px] text-emerald-700/80 truncate leading-tight mt-0.5">
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
                setPermohonanStatus('belum');
                setPermohonanCatatan('');
                setNomorSertifikat('');
                setTglTerbitSertifikat('');
                setFileSertifikat('');
              }}
              className="sidebar-logout-btn w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 hover:text-red-600 bg-white/80 hover:bg-red-50 border border-emerald-200/80 hover:border-red-200 transition-all shadow-2xs group"
            >
              <Icons.LogOut className="w-4 h-4 text-emerald-700 group-hover:text-red-500 transition-colors" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-6 md:p-10 pb-48 max-w-6xl mx-auto overflow-y-auto">
          {currentStep === 0 && (
            <Dashboard 
              changeStep={setCurrentStep} 
              readinessScore={readinessScore} 
              certificationStatus={certificationStatus}
              permohonanStatus={permohonanStatus}
              permohonanCatatan={permohonanCatatan}
              nomorSertifikat={nomorSertifikat}
              fileSertifikat={fileSertifikat}
              isKomitmenComplete={isKomitmenComplete} 
              isBahanComplete={isBahanComplete} 
              isPphComplete={isPphComplete} 
              isProdukComplete={isProdukComplete} 
              isEvaluasiComplete={isEvaluasiComplete} 
              jadwalAudit={jadwalAudit}
              auditorName={auditorName}
            />
          )}
          {currentStep === 1 && <StepRegistrasi />}
          {currentStep === 2 && <StepDokumen legalData={legalData} setLegalData={setLegalData} handleGenericFileUpload={handleGenericFileUpload} />}
          {currentStep === 3 && <StepMatrixBahanHalal materials={materials} setMaterials={setMaterials} matrixSubmitted={matrixSubmitted} setMatrixSubmitted={setMatrixSubmitted} showToast={showToast} />}
          {currentStep === 4 && <StepUploadProduk products={products} setProducts={setProducts} materials={materials} productsSubmitted={productsSubmitted} setProductsSubmitted={setProductsSubmitted} showToast={showToast} />}
          {currentStep === 5 && <StepProsesProduksi productionData={productionData} setProductionData={setProductionData} handleGenericFileUpload={handleGenericFileUpload} />}
          {currentStep === 6 && <StepUploadEvidence evidenceData={evidenceData} setEvidenceData={setEvidenceData} handleGenericFileUpload={handleGenericFileUpload} handleMultiFileUpload={handleMultiFileUpload} />}
          {currentStep === 7 && (
            <StepPengajuanBPJPH 
              readinessScore={readinessScore}
              certificationStatus={certificationStatus}
              permohonanStatus={permohonanStatus}
              permohonanCatatan={permohonanCatatan}
              nomorSertifikat={nomorSertifikat}
              fileSertifikat={fileSertifikat}
              jadwalAudit={jadwalAudit}
              auditorName={auditorName}
              onRefreshStatus={refreshCertStatus}
            />
          )}

        </main>
      </div>

      {/* Floating AI Chatbot Toggle & Drawer */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full shadow-lg font-bold text-sm transition-all hover:scale-105 active:scale-95">
            <Icons.Bot className="w-5 h-5" /> Tanya AI Halal Assistant
          </button>
        ) : (
          <div className="w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in" style={{height: '520px'}}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Icons.Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight">AI Halal Assistant JHC</div>
                  <div className="text-[10px] text-emerald-100">halalflow.or.id • Online</div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all">
                <Icons.X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 bg-slate-50">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Icons.Bot className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  )}
                  <div className={`max-w-[78%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                  }`}>
                    {m.isThinking ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                      </span>
                    ) : (
                      <span style={{whiteSpace: 'pre-wrap'}}>{m.text}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Tanya seputar halal, BPJPH, SJPH..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-emerald-400 outline-none transition-colors"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors active:scale-95">
                <Icons.Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Global Toast Notification */}
      {globalToast.text && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-3 max-w-sm ${globalToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span>{globalToast.text}</span>
          <button onClick={() => setGlobalToast({ text: '', type: '' })} className="opacity-70 hover:opacity-100 text-xl leading-none shrink-0">×</button>
        </div>
      )}
    </div>
  );
}

const Dashboard = ({ 
  changeStep, 
  readinessScore, 
  certificationStatus, 
  permohonanStatus,
  permohonanCatatan,
  nomorSertifikat,
  fileSertifikat,
  isKomitmenComplete, 
  isBahanComplete, 
  isPphComplete, 
  isProdukComplete, 
  isEvaluasiComplete,
  jadwalAudit,
  auditorName
}) => {

  const CERT_STAGES = [
    { no: 1, label: 'Diterima oleh Admin', desc: 'Pengajuan telah diterima dan sedang dilakukan pemeriksaan awal oleh Admin JHC.', color: 'blue' },
    { no: 2, label: 'Diproses', desc: 'Data dan dokumen usaha sedang diperiksa serta dipersiapkan untuk proses sertifikasi halal.', color: 'indigo' },
    { no: 3, label: 'Disubmit di SIHALAL', desc: 'Pengajuan sertifikasi halal telah diajukan melalui sistem SIHALAL BPJPH.', color: 'violet' },
    { no: 4, label: 'Feedback BPJPH / Dikirim ke LPH', desc: 'Pengajuan sedang menunggu atau menindaklanjuti feedback BPJPH. Jika persyaratan terpenuhi, pengajuan diteruskan kepada LPH.', color: 'amber' },
    { no: 5, label: 'Penjadwalan Audit', desc: jadwalAudit ? `Audit dijadwalkan pada: ${jadwalAudit}${auditorName ? ` (Auditor: ${auditorName})` : ''}` : 'Pengajuan telah diterima LPH dan sedang dalam proses penjadwalan audit/pemeriksaan kehalalan.', color: 'orange' },
    { no: 6, label: 'Perbaikan Hasil Audit', desc: 'Hasil pemeriksaan/audit memerlukan perbaikan atau pemenuhan dokumen/data oleh pelaku usaha.', color: 'red' },
    { no: 7, label: 'Sidang Fatwa MUI', desc: 'Hasil pemeriksaan telah diproses untuk penetapan kehalalan melalui sidang fatwa sesuai ketentuan yang berlaku.', color: 'purple' },
    { no: 8, label: 'Terbit Sertifikat Halal BPJPH', desc: 'Selamat! Sertifikat Halal resmi BPJPH telah terbit dan dapat diakses melalui sistem.', color: 'emerald' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Rejection Alert Banner */}
      {permohonanStatus === 'ditolak' && (
        <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm font-black text-lg">
              !
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">Perhatian: Pengajuan Permohonan Perlu Perbaikan</h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                <strong>Catatan Admin:</strong> {permohonanCatatan || 'Harap periksa kembali kelengkapan dokumen SJPH Anda.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => changeStep(7)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all shadow-sm hover:shadow hover:scale-105"
          >
            Lihat & Ajukan Ulang →
          </button>
        </div>
      )}

      {/* Pending Banner */}
      {permohonanStatus === 'menunggu' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">Permohonan Sedang Ditinjau Admin</p>
              <p className="text-[11px] text-amber-700 mt-0.5">Dokumen Anda sedang dalam antrean verifikasi tim JHC HalalFlow.</p>
            </div>
          </div>
          <button onClick={() => changeStep(7)} className="text-xs font-bold text-amber-800 hover:underline shrink-0">
            Lihat Detail →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <p className="text-emerald-100 text-sm font-medium relative z-10">Halal Readiness Score</p>
          <p className="text-emerald-200/70 text-[10px] relative z-10 mt-0.5">Kesiapan berkas SJPH internal perusahaan</p>
          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <h3 className="text-4xl font-extrabold tracking-tight">{readinessScore}%</h3>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-semibold">{readinessScore >= 100 ? 'Siap Diajukan' : 'Persiapan Berkas'}</span>
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

        <Card className={`p-6 transition-all ${jadwalAudit ? 'border-emerald-200 bg-gradient-to-br from-white via-white to-emerald-50/50 shadow-sm ring-1 ring-emerald-100' : ''}`}>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Jadwal Audit</p>
            {jadwalAudit ? (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">Terjadwal</span>
            ) : (
              <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Menunggu</span>
            )}
          </div>
          {jadwalAudit ? (
            <>
              <h3 className="text-lg font-extrabold text-emerald-950 mt-2 flex items-center gap-1.5">
                <span>📅</span> {jadwalAudit}
              </h3>
              <p className="text-xs text-emerald-700 mt-1.5 font-semibold flex items-center gap-1">
                <span>👤</span> Oleh {auditorName || 'Pendamping LPH JHC'}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-slate-400 mt-2 italic">Belum ditentukan</h3>
              <p className="text-xs text-slate-400 mt-2">Menunggu jadwal dari admin</p>
            </>
          )}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dokumen Legal & Kontak Pendaftaran</h2>
          <p className="text-sm text-slate-500 mt-1">Unggah dokumen format Word (.doc/.docx) atau PDF (.pdf) serta lengkapi kontak resmi pendaftaran SIHALAL.</p>
        </div>
        <a
          href="https://drive.google.com/drive/folders/1HSmtyIZlv05B_GzOGKO9HB0KQ8mp8df_?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs shrink-0"
        >
          <Icons.Download className="w-4 h-4 text-emerald-600" /> Unduh Template
        </a>
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
            <p className="text-xs text-slate-400 mb-3">Format: .doc, .docx, .pdf — bisa pilih lebih dari 1 file</p>
            <input type="file" name="permohonan" accept=".pdf,.doc,.docx" multiple onChange={(e) => handleMultiFileUpload(e, 'permohonan', setLegalData)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {legalData.permohonan && legalData.permohonan.split(',').map((f, i) => (
              <a key={i} href={`/uploads/${f.trim()}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1 truncate w-full hover:underline" title={f.trim()}>
                ✓ Terunggah: {f.trim()} (Klik untuk Lihat)
              </a>
            ))}
          </div>

          <div className="p-4 border rounded-xl bg-white shadow-xs">
            <h4 className="font-semibold text-sm text-slate-800 mb-1">2. SK Penyelia Halal</h4>
            <p className="text-xs text-slate-400 mb-3">Format: .doc, .docx, .pdf — bisa pilih lebih dari 1 file</p>
            <input type="file" name="sk_penyelia" accept=".pdf,.doc,.docx" multiple onChange={(e) => handleMultiFileUpload(e, 'sk_penyelia', setLegalData)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {legalData.sk_penyelia && legalData.sk_penyelia.split(',').map((f, i) => (
              <a key={i} href={`/uploads/${f.trim()}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1 truncate w-full hover:underline" title={f.trim()}>
                ✓ Terunggah: {f.trim()} (Klik untuk Lihat)
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded-xl bg-white shadow-xs">
            <h4 className="font-semibold text-sm text-slate-800 mb-1">3. SK Manajemen Halal</h4>
            <p className="text-xs text-slate-400 mb-3">Format: .doc, .docx, .pdf — bisa pilih lebih dari 1 file</p>
            <input type="file" name="sk_manajemen" accept=".pdf,.doc,.docx" multiple onChange={(e) => handleMultiFileUpload(e, 'sk_manajemen', setLegalData)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {legalData.sk_manajemen && legalData.sk_manajemen.split(',').map((f, i) => (
              <a key={i} href={`/uploads/${f.trim()}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1 truncate w-full hover:underline" title={f.trim()}>
                ✓ Terunggah: {f.trim()} (Klik untuk Lihat)
              </a>
            ))}
          </div>

          <div className="p-4 border rounded-xl bg-white shadow-xs">
            <h4 className="font-semibold text-sm text-slate-800 mb-1">4. Kebijakan Halal</h4>
            <p className="text-xs text-slate-400 mb-3">Format: .doc, .docx, .pdf — bisa pilih lebih dari 1 file</p>
            <input type="file" name="kebijakan" accept=".pdf,.doc,.docx" multiple onChange={(e) => handleMultiFileUpload(e, 'kebijakan', setLegalData)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {legalData.kebijakan && legalData.kebijakan.split(',').map((f, i) => (
              <a key={i} href={`/uploads/${f.trim()}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1 truncate w-full hover:underline" title={f.trim()}>
                ✓ Terunggah: {f.trim()} (Klik untuk Lihat)
              </a>
            ))}
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
          <h4 className="font-semibold text-sm text-slate-800 mb-2">Upload KTP Pemilik / Penanggung Jawab</h4>
          <input type="file" name="ktpPemilik" accept="image/*,.pdf" onChange={(e) => handleGenericFileUpload(e, 'ktpPemilik', setLegalData)} className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-200 file:font-semibold" />
          {legalData.ktpPemilik && (
            <a href={`/uploads/${legalData.ktpPemilik}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 mt-2 block truncate w-full hover:underline font-medium" title={legalData.ktpPemilik}>
              ✓ KTP Pemilik Terunggah (Klik untuk Lihat)
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
        <div className="p-4 bg-slate-50 rounded-xl border">
          <h4 className="font-semibold text-sm text-slate-800 mb-2">Upload KTP Penyelia Halal</h4>
          <input type="file" name="ktpPenyelia" accept="image/*,.pdf" onChange={(e) => handleGenericFileUpload(e, 'ktpPenyelia', setLegalData)} className="w-full text-xs text-slate-500 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-200 file:font-semibold" />
          {legalData.ktpPenyelia && (
            <a href={`/uploads/${legalData.ktpPenyelia}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 mt-2 block truncate w-full hover:underline font-medium" title={legalData.ktpPenyelia}>
              ✓ KTP Penyelia Terunggah (Klik untuk Lihat)
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

const StepMatrixBahanHalal = ({ materials, setMaterials, matrixSubmitted, setMatrixSubmitted, showToast = () => {} }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newMaterial, setNewMaterial] = useState({ name: '', jenis: '', produsen: '', negara: '', supplier: '', lembaga: '', sertifikat: '', expired: '' });
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(materials.map(m => m.id));
    else setSelectedIds([]);
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} bahan baku terpilih?`)) return;
    try {
      const res = await apiFetch('/api/materials/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();
      if (res.ok) {
        setMaterials(data.materials);
        setSelectedIds([]);
        setSuccessMsg(`${selectedIds.length} bahan baku berhasil dihapus!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert('Gagal menghapus: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan atau server: ' + err.message);
    }
  };

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
        } else {
          alert('Gagal memperbarui bahan: ' + (data.error || 'Server error'));
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
        } else {
          alert('Gagal menambah bahan: ' + (data.error || 'Server error'));
        }
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan atau server: ' + err.message);
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
      {
        'nama_bahan': 'Kecap manis ABC',
        'jenis_bahan': 'Bahan',
        'produsen': 'PT. Heinz ABC Indonesia',
        'negara': 'Indonesia',
        'supplier': 'UD. Sumber Makmur',
        'lembaga_penerbit': 'BPJPH',
        'nomor_sertifikat/registr': 'ID00410000054900720',
        'masa_berlaku': '1/7/2025'
      },
      {
        'nama_bahan': 'Mayonaise maestro',
        'jenis_bahan': 'Bahan',
        'produsen': 'PT. Lasallefood Indonesia',
        'negara': 'Indonesia',
        'supplier': 'UD. Sumber Makmur',
        'lembaga_penerbit': 'BPJPH',
        'nomor_sertifikat/registr': 'ID00410000009281119',
        'masa_berlaku': '3/10/2024'
      },
      {
        'nama_bahan': 'Cheffy plastik wrap',
        'jenis_bahan': 'Kemasan',
        'produsen': 'PT. Altindo Mulia',
        'negara': 'Indonesia',
        'supplier': 'Toko Plastik Andalas',
        'lembaga_penerbit': 'BPJPH',
        'nomor_sertifikat/registr': 'ID36210018283020723',
        'masa_berlaku': '14/06/2025'
      },
      {
        'nama_bahan': 'Food tray SUS304',
        'jenis_bahan': 'Kemasan',
        'produsen': 'PT. Makmur Bersama Indonesia',
        'negara': 'Indonesia',
        'supplier': 'PT. Kinken Utomo Jaya',
        'lembaga_penerbit': 'BPJPH',
        'nomor_sertifikat/registr': 'ID32310030990121025',
        'masa_berlaku': '17/10/2025'
      },
      {
        'nama_bahan': 'SUNLIGHT Cairan Pencuci Piring, Jeruk Nipis Platinum',
        'jenis_bahan': 'Cleaning Agent',
        'produsen': 'PT. UNILEVER INDONESIA',
        'negara': 'Indonesia',
        'supplier': '',
        'lembaga_penerbit': 'BPJPH',
        'nomor_sertifikat/registr': 'ID00410000008400120',
        'masa_berlaku': '2/6/2026'
      },
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 55 }, { wch: 16 }, { wch: 28 }, { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 28 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Matrix Bahan');
    XLSX.writeFile(wb, 'template_matrix_bahan.xlsx');
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
            sertifikat: row['nomor_sertifikat/registr'] || row['nomor_sertifikat'] || row['Nomor Sertifikat'] || row['No. Sertifikat'] || row['No Sertifikat'] || row['sertifikat'] || row['ID Halal'] || row['id_halal'] || '',
            expired: row['masa_berlaku'] || row['Masa Berlaku'] || row['Expired'] || row['expired'] || row['Tanggal Terbit'] || row['tanggal_terbit'] || '',
            status: 'hijau',
            coa: 'tersedia',
            sds: 'tersedia'
          })).filter(m => m.name);

          if (parsed.length === 0) {
            showToast('Tidak ada data yang bisa dibaca. Pastikan format kolom sesuai template.');
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
          showToast('Gagal membaca file Excel. Pastikan format file sesuai template.');
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Bahan (Merk)</label>
            <input type="text" placeholder="Contoh: Tepung Terigu" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Bahan</label>
            <CustomDropdown 
              value={newMaterial.jenis}
              onChange={(val) => setNewMaterial({...newMaterial, jenis: val})}
              options={["Bahan", "Cleaning Agent", "Kemasan"]}
              placeholder="Pilih Jenis Bahan"
            />
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Terbit</label>
            <input type="date" value={newMaterial.expired} onChange={e => setNewMaterial({...newMaterial, expired: e.target.value})} className="w-full bg-white border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
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

      {selectedIds.length > 0 && (
        <div className="flex justify-start">
          <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Icons.Trash className="w-4 h-4" /> Hapus Terpilih ({selectedIds.length})
          </button>
        </div>
      )}

      <div className="border rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" checked={materials.length > 0 && selectedIds.length === materials.length} onChange={handleSelectAll} />
                </th>
                <th className="p-3.5">No</th>
                <th className="p-3.5">Nama Bahan (Merk)</th>
                <th className="p-3.5">Jenis</th>
                <th className="p-3.5">Produsen</th>
                <th className="p-3.5">Negara</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Lembaga Penerbit</th>
                <th className="p-3.5">No. Sertifikat</th>
                <th className="p-3.5">Tanggal Terbit</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-slate-400 text-sm">
                    Belum ada data bahan baku. Silakan unggah Excel atau tambah secara manual.
                  </td>
                </tr>
              ) : (
                materials.map((m, index) => (
                  <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${editingId === m.id ? 'bg-amber-50/40 font-medium' : ''}`}>
                    <td className="p-3.5 text-center">
                      <input type="checkbox" className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" checked={selectedIds.includes(m.id)} onChange={() => handleSelect(m.id)} />
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{index + 1}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{m.name}</td>
                    <td className="p-3.5 text-slate-500">{m.jenis || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.produsen || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.negara || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.supplier || '-'}</td>
                    <td className="p-3.5 text-slate-500">{m.lembaga || '-'}</td>
                    <td className="p-3.5 text-slate-500 font-mono text-xs">{m.sertifikat || m.nomor_sertifikat || '-'}</td>
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

const StepUploadProduk = ({ products, setProducts, materials, productsSubmitted, setProductsSubmitted, showToast = () => {} }) => {
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
    setPendingProducts(prev => [...prev, { id, name: newProductName.trim(), bahan: [], createdAt: id }]);
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
      showToast('Pilih minimal 1 bahan penyusun untuk produk ini.');
      return;
    }

    const newBomEntry = { ...prod, bahan: selectedIngredients, createdAt: prod.createdAt || prod.id };

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

  const handleDownloadProductTemplate = () => {
    const data = [
      { 'nama_produk': 'Nasi Gurih' },
      { 'nama_produk': 'Spaghetti Bolognese' },
      { 'nama_produk': 'Ayam Kecap' },
      { 'nama_produk': 'dan seterusnya' },
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Produk');
    XLSX.writeFile(wb, 'template_produk.xlsx');
  };

  const handleProductExcelUpload = (e) => {
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
            name: row['nama_produk'] || row['Nama Produk'] || row['name'] || '',
            bahan: []
          })).filter(p => p.name && p.name.toLowerCase() !== 'dan seterusnya');

          if (parsed.length === 0) {
            showToast('Tidak ada data yang bisa dibaca. Pastikan format kolom sesuai template.');
            return;
          }

          setPendingProducts(prev => [...prev, ...parsed]);
          setSuccessMsg(`${parsed.length} produk berhasil diimpor dari Excel!`);
          setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
          console.error(err);
          showToast('Gagal membaca file Excel. Pastikan format file sesuai template.');
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <Card className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Upload Produk & Komposisi (BOM)</h2>
          <p className="text-sm text-slate-500 mt-1">Daftarkan produk dan tentukan komposisi bahan sesuai Matrix Bahan Halal melalui 3 tahap berikut.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadProductTemplate}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Icons.Download className="w-4 h-4" /> Unduh Template Excel
          </button>
          <label className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors">
            <Icons.Upload className="w-4 h-4" /> Upload Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleProductExcelUpload} className="hidden" />
          </label>
        </div>
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
              ) : (() => {
                // Merge all products and sort by creation time to preserve insertion order
                const allProducts = [
                  ...bomProducts.map(p => ({ ...p, _status: 'bom' })),
                  ...pendingProducts.map(p => ({ ...p, _status: 'pending' }))
                ].sort((a, b) => (a.createdAt || a.id) - (b.createdAt || b.id));

                return allProducts.map((p, idx) => {
                  if (p._status === 'pending') {
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500">
                          {editingPendingId === p.id ? (
                            <span className="text-xs font-semibold text-slate-500">{idx + 1}</span>
                          ) : idx + 1}
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
                    );
                  } else {
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                        <td className="p-3"><span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ BOM Lengkap</span></td>
                        <td className="p-3 text-center"><span className="text-xs text-slate-400">-</span></td>
                      </tr>
                    );
                  }
                });
              })()}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Proses Produksi Halal</h2>
          <p className="text-sm text-slate-500 mt-1">Unggah dokumen alur proses produksi (jpeg), layout ruang produksi (jpeg), dan surat pernyataan bebas babi (pdf).</p>
        </div>
        <a
          href="https://drive.google.com/drive/folders/1en91DXyMlUgw7xRzg4Ln-qCT2FrQZgyW?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs shrink-0"
        >
          <Icons.Download className="w-4 h-4 text-emerald-600" /> Unduh Template
        </a>
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
            <h4 className="font-bold text-sm text-slate-800 mb-1">3. Surat Pernyataan Bebas Babi Bermaterai</h4>
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

const StepUploadEvidence = ({ evidenceData, setEvidenceData, handleGenericFileUpload, handleMultiFileUpload }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingFile, setDeletingFile] = useState('');

  const handleDeleteFile = async (field, filename) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus foto "${filename}"?`);
    if (!confirmDelete) return;

    setDeletingFile(filename);
    try {
      const token = localStorage.getItem('jhc_token');
      const res = await apiFetch(`/api/upload/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const currentList = (evidenceData[field] || '')
          .split(',')
          .map(f => f.trim())
          .filter(f => f && f !== filename);
        
        const updatedList = currentList.join(',');
        const updatedData = {
          ...evidenceData,
          [field]: updatedList
        };

        setEvidenceData(updatedData);

        // Sinkronisasi pembaruan ke server
        await apiFetch('/api/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });

        setSuccessMsg('Foto berhasil dihapus.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert('Gagal menghapus file: ' + (data.error || 'Terjadi kesalahan pada server'));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Terjadi kesalahan saat menghapus file.');
    } finally {
      setDeletingFile('');
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Upload Evidence (Bukti)</h2>
          <p className="text-sm text-slate-500 mt-1">Lengkapi seluruh dokumentasi bukti kegiatan perusahaan sesuai urutan standar.</p>
        </div>
        <a
          href="https://drive.google.com/drive/folders/1dBh4Okrd3D7KHKOvTKl4RjyyIh1HTzwR?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs shrink-0"
        >
          <Icons.Download className="w-4 h-4 text-emerald-600" /> Unduh Template
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">1. Bukti Foto Sosialisasi/Training Halal</h4>
          <p className="text-xs text-slate-400 mb-2">Format: Gambar (JPG, PNG) — bisa upload lebih dari 1 foto</p>
          <input type="file" multiple name="sosialisasiFoto" accept="image/*" onChange={(e) => handleMultiFileUpload(e, 'sosialisasiFoto', setEvidenceData)} className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
          {evidenceData.sosialisasiFoto && (
            <div className="mt-3 space-y-1.5">
              {evidenceData.sosialisasiFoto.split(',').map((f, i) => {
                const fname = f.trim();
                if (!fname) return null;
                return (
                  <div key={i} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
                    <a href={`/uploads/${fname}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold truncate flex-1 hover:underline" title={fname}>
                      ✓ {fname} (Klik untuk Lihat)
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile('sosialisasiFoto', fname)}
                      disabled={deletingFile === fname}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors text-xs font-bold leading-none shrink-0"
                      title="Hapus foto ini"
                    >
                      {deletingFile === fname ? '...' : '✕'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-slate-50">
          <h4 className="font-semibold text-sm text-slate-800 mb-1">2. Bukti Foto Audit Internal</h4>
          <p className="text-xs text-slate-400 mb-2">Format: Gambar (JPG, PNG) — bisa upload lebih dari 1 foto</p>
          <input type="file" multiple name="auditInternalFoto" accept="image/*" onChange={(e) => handleMultiFileUpload(e, 'auditInternalFoto', setEvidenceData)} className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
          {evidenceData.auditInternalFoto && (
            <div className="mt-3 space-y-1.5">
              {evidenceData.auditInternalFoto.split(',').map((f, i) => {
                const fname = f.trim();
                if (!fname) return null;
                return (
                  <div key={i} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
                    <a href={`/uploads/${fname}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold truncate flex-1 hover:underline" title={fname}>
                      ✓ {fname} (Klik untuk Lihat)
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile('auditInternalFoto', fname)}
                      disabled={deletingFile === fname}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors text-xs font-bold leading-none shrink-0"
                      title="Hapus foto ini"
                    >
                      {deletingFile === fname ? '...' : '✕'}
                    </button>
                  </div>
                );
              })}
            </div>
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
          <h4 className="font-semibold text-sm text-slate-800 mb-1">8. Catatan Penjualan/Distribusi Produk</h4>
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



const StepPengajuanBPJPH = ({ 
  readinessScore, 
  certificationStatus, 
  permohonanStatus, 
  permohonanCatatan, 
  nomorSertifikat, 
  fileSertifikat,
  jadwalAudit,
  auditorName,
  onRefreshStatus 
}) => {
  const [loading, setLoading] = useState(false);
  const [localSuccess, setLocalSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiFetch('/api/submit-application', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLocalSuccess('Permohonan berhasil diajukan! Tim Admin JHC akan segera meninjau berkas Anda.');
        if (onRefreshStatus) onRefreshStatus();
      } else {
        setErrorMsg(data.error || 'Gagal mengajukan permohonan.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const isPending = permohonanStatus === 'menunggu';
  const isApproved = permohonanStatus === 'disetujui';
  const isRejected = permohonanStatus === 'ditolak';
  const isCertified = (certificationStatus || 0) >= 8;

  return (
    <Card className="p-8 max-w-3xl mx-auto text-center space-y-6 animate-fade-in shadow-md">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
        isRejected ? 'bg-red-100 text-red-600' :
        isCertified ? 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50' :
        isApproved ? 'bg-emerald-100 text-emerald-600' :
        isPending ? 'bg-amber-100 text-amber-600' :
        'bg-emerald-100 text-emerald-600'
      }`}>
        {isRejected ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        ) : isCertified ? (
          <Icons.Award className="w-8 h-8" />
        ) : (
          <Icons.ShieldCheck className="w-8 h-8" />
        )}
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-800">
          {isCertified ? '🎉 Sertifikat Halal BPJPH Resmi Terbit!' :
           isRejected ? 'Pengajuan Permohonan Perlu Perbaikan' :
           isApproved ? 'Permohonan Sertifikasi Halal Disetujui' :
           isPending ? 'Permohonan Sedang Ditinjau Admin' :
           'Pengajuan Sertifikasi Halal BPJPH'}
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">
          {isCertified ? 'Selamat! Seluruh tahapan sertifikasi halal telah selesai dan sertifikat resmi telah diterbitkan.' :
           isRejected ? 'Admin telah memeriksa berkas Anda dan memberikan catatan perbaikan di bawah ini.' :
           isApproved ? 'Pengajuan Anda telah disetujui Admin JHC dan saat ini sedang berjalan pada alur sertifikasi BPJPH.' :
           isPending ? 'Seluruh tahapan SJPH dan dokumen Anda sedang diperiksa oleh Tim Admin JHC.' :
           'Seluruh tahapan SJPH dan dokumen Anda telah siap untuk diajukan ke Admin & SIHALAL BPJPH.'}
        </p>
      </div>

      <div className="p-5 bg-slate-50 rounded-2xl max-w-md mx-auto border text-left space-y-2.5 text-xs shadow-2xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <span className="text-slate-500 font-medium">Status Permohonan:</span>
          {isRejected ? (
            <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">Perlu Perbaikan / Ditolak</span>
          ) : isApproved ? (
            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">Disetujui Admin</span>
          ) : isPending ? (
            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Menunggu Review Admin</span>
          ) : (
            <span className="font-bold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full">Belum Diajukan</span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Halal Readiness Score:</span>
          <span className="font-bold text-emerald-600">{readinessScore}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Status Tahapan:</span>
          <span className="font-bold text-slate-800">
            {certificationStatus > 0 ? `Tahap ${certificationStatus} dari 8` : 'Tahap Persiapan Berkas'}
          </span>
        </div>
        {jadwalAudit && (
          <div className="flex justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-500">Jadwal Audit:</span>
            <span className="font-bold text-emerald-800">📅 {jadwalAudit}</span>
          </div>
        )}
        {jadwalAudit && auditorName && (
          <div className="flex justify-between pt-0.5">
            <span className="text-slate-500">Auditor / Pendamping:</span>
            <span className="font-medium text-slate-700">{auditorName}</span>
          </div>
        )}
        {nomorSertifikat && (
          <div className="flex justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-500">Nomor Sertifikat BPJPH:</span>
            <span className="font-bold text-emerald-700 font-mono">{nomorSertifikat}</span>
          </div>
        )}
      </div>

      {jadwalAudit && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left max-w-md mx-auto flex items-start gap-3 shadow-2xs">
          <span className="text-2xl mt-0.5">📅</span>
          <div>
            <p className="text-xs font-bold text-emerald-900">Jadwal Audit Halal Telah Ditetapkan</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{jadwalAudit}</p>
            <p className="text-xs text-emerald-700 mt-0.5 font-medium">Auditor / Pendamping LPH: {auditorName || 'Tim LPH JHC'}</p>
          </div>
        </div>
      )}

      {/* Rejection Alert Box */}
      {isRejected && permohonanCatatan && (
        <div className="p-5 bg-red-50/80 border-2 border-red-300 rounded-2xl text-left max-w-lg mx-auto shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Catatan / Alasan Penolakan dari Admin:</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-red-200 text-xs text-red-900 leading-relaxed font-medium whitespace-pre-wrap">
            {permohonanCatatan}
          </div>
          <p className="text-[11px] text-red-700">
            Silakan periksa kembali data pada tahap sebelumnya, lakukan revisi dokumen, kemudian klik tombol ajukan ulang di bawah ini.
          </p>
        </div>
      )}

      {/* Certified Download Box */}
      {isCertified && (
        <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl max-w-lg mx-auto shadow-lg space-y-3">
          <Icons.Award className="w-10 h-10 text-amber-300 mx-auto" />
          <h3 className="font-extrabold text-lg">Sertifikat Halal Resmi Anda Siap Diunduh</h3>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Sertifikat telah disahkan oleh BPJPH dan diverifikasi oleh tim JHC HalalFlow.
          </p>
          <div className="pt-2">
            <a
              href={fileSertifikat ? getFullUrl(`/uploads/${fileSertifikat}`) : getFullUrl('/api/certificate')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-black text-sm shadow-md transition-all hover:scale-105"
            >
              <Icons.Download className="w-5 h-5 text-emerald-600" /> Unduh Sertifikat Halal (PDF / Cetak)
            </a>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isCertified && (
        <div>
          {isPending ? (
            <div className="space-y-2">
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl font-bold text-sm border border-amber-200 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin text-amber-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Permohonan sedang dalam antrean verifikasi Admin JHC.
              </div>
              <p className="text-xs text-slate-400">Status akan terupdate otomatis begitu Admin menyelesaikan review.</p>
            </div>
          ) : isRejected ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? 'Mengajukan Ulang...' : 'Ajukan Ulang Permohonan'}
            </button>
          ) : isApproved ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-sm border border-emerald-200">
              ✓ Permohonan telah disetujui! Anda dapat memantau progres tahap 1 s/d 8 di Dashboard Utama.
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? 'Mengajukan...' : 'Ajukan Permohonan Sekarang'}
            </button>
          )}
        </div>
      )}

      {localSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200">
          {localSuccess}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}
    </Card>
  );
};



// Helper: wake-up ping ke Render agar server tidak cold-start saat request utama dikirim
async function wakeUpServer() {
  try {
    await fetch(getFullUrl('/api/status'), { method: 'GET', signal: AbortSignal.timeout(8000) });
  } catch (_) { /* abaikan error ping */ }
}

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', token: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Memproses...');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleResendCode = async () => {
    if (!formData.email) return;
    setLoading(true);
    setLoadingMsg('Mengirim ulang kode...');
    setMessage({ text: '', type: '' });
    try {
      // Wake-up ping dulu agar Render tidak cold start
      setLoadingMsg('Menghubungi server...');
      await wakeUpServer();
      setLoadingMsg('Mengirim kode ke email...');
      const res = await fetchWithRetry(getFullUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      }, 45000, 1);
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message || 'Kode verifikasi telah dikirim ulang ke email Anda.', type: 'success' });
        setFormData(prev => ({ ...prev, token: '' }));
      } else {
        setMessage({ text: data.error || 'Gagal mengirim ulang kode.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Gagal terhubung ke server. Periksa koneksi internet Anda.', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingMsg('Memproses...');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (isForgotPassword) {
      if (forgotPasswordStep === 1) {
        try {
          // Wake-up ping dulu agar Render tidak cold start saat kirim email
          setLoadingMsg('Menghubungi server...');
          await wakeUpServer();
          setLoadingMsg('Mengirim kode verifikasi ke email...');
          const res = await fetchWithRetry(getFullUrl('/api/auth/forgot-password'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email })
          }, 45000, 1);
          const data = await res.json();
          if (res.ok) {
            setMessage({ text: data.message, type: 'success' });
            setFormData(prev => ({ ...prev, token: '' }));
            setForgotPasswordStep(2);
          } else {
            setMessage({ text: data.error || 'Terjadi kesalahan', type: 'error' });
          }
        } catch (err) {
          if (err.message === 'TIMEOUT') {
            setMessage({ text: 'Server sedang membangun koneksi (cold start). Coba lagi dalam 10 detik.', type: 'error' });
          } else {
            setMessage({ text: 'Gagal terhubung ke server. Periksa koneksi internet Anda.', type: 'error' });
          }
        } finally {
          setLoading(false);
          setLoadingMsg('Memproses...');
        }
        return;
      } else if (forgotPasswordStep === 2) {
        // Verify Token
        try {
          const res = await fetch(getFullUrl('/api/auth/verify-reset-token'), {
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
          const res = await fetch(getFullUrl('/api/auth/reset-password'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: formData.token, newPassword: formData.password })
          });
          const data = await res.json();
          if (res.ok) {
            setMessage({ text: 'Password berhasil diubah! Silakan login.', type: 'success' });
            setIsForgotPassword(false);
            setForgotPasswordStep(1);
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
      // Wake-up ping dulu agar Render tidak cold start
      setLoadingMsg('Menghubungi server...');
      await wakeUpServer();
      setLoadingMsg(isRegister ? 'Mendaftarkan akun...' : 'Masuk ke akun...');

      const res = await fetchWithRetry(getFullUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 45000, 1);
      const data = await res.json();
      if (res.ok) {
        if (isRegister) {
          setMessage({ text: 'Registrasi berhasil. Silakan Masuk.', type: 'success' });
          setIsRegister(false);
          setFormData({ ...formData, password: '', confirmPassword: '' });
        } else {
          const userProfile = data.user || { name: formData.name, email: formData.email };
          onLogin(userProfile, data.token);
        }
      } else {
        setMessage({ text: data.error || 'Terjadi kesalahan', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      if (err.message === 'TIMEOUT') {
        setMessage({ text: 'Server sedang memuat (cold start Render). Tunggu 30 detik lalu coba lagi.', type: 'error' });
      } else {
        setMessage({ text: 'Gagal terhubung ke server. Periksa koneksi internet Anda.', type: 'error' });
      }
    } finally {
      setLoading(false);
      setLoadingMsg('Memproses...');
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
            {loading
              ? loadingMsg
              : isForgotPassword
                ? (forgotPasswordStep === 1 ? 'Kirim Kode Verifikasi' : forgotPasswordStep === 2 ? 'Verifikasi Kode' : 'Simpan Password Baru')
                : isRegister ? 'Daftar Sekarang' : 'Masuk'
            }
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
