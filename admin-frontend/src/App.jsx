import React, { useState, useEffect, useCallback } from 'react';

// =============================================
// ADMIN AUTH HELPER
// =============================================
function getAdminHeaders() {
  const token = localStorage.getItem('jhc_admin_token');
  return token
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function adminFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...getAdminHeaders(), ...(options.headers || {}) } });
  if (res.status === 401) {
    localStorage.removeItem('jhc_admin_token');
    window.location.reload();
  }
  return res;
}

// =============================================
// SVG ICONS
// =============================================
const Icons = {
  Shield: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  LogOut: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  Building: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  Users: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  List: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
  Award: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
  Lock: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
  Eye: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  EyeOff: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>,
  Check: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>,
  Activity: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  Search: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  ChevronRight: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>,
  ChevronLeft: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>,
  FileText: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  Refresh: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  Menu: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>,
  X: (p) => <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
};

// =============================================
// STATUS BADGE
// =============================================
const statusConfig = {
  'Belum Dimulai':     { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' },
  'Dalam Proses':      { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Menunggu Verifikasi':{ bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Terverifikasi':     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Perlu Perbaikan':   { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
  'Selesai':           { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig['Belum Dimulai'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {status}
    </span>
  );
}

// =============================================
// FORMAT DATE
// =============================================
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

// =============================================
// ADMIN LOGIN PAGE
// =============================================
const AdminLogin = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('jhc_admin_token', data.token);
        localStorage.setItem('jhc_admin_user', JSON.stringify(data.admin));
        onLogin(data.admin);
      } else {
        setError(data.error || 'Login gagal. Periksa email dan password.');
      }
    } catch (err) {
      setError('Koneksi ke server gagal. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-900/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-teal-900/30 rounded-full blur-3xl"></div>
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at center,rgba(16,185,129,0.03) 1px,transparent 1px)',backgroundSize:'24px 24px'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] shadow-2xl shadow-emerald-900/50 mb-6 relative border border-emerald-400/30">
            <Icons.Shield className="w-10 h-10 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#070b14] animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">JHC HalalFlow</h1>
          <p className="text-emerald-400 text-sm font-bold mt-2 uppercase tracking-[0.2em]">Enterprise Admin Portal</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">
          <form onSubmit={handleSubmit} className="px-10 py-10 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Email Administrator</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-black/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                placeholder="admin@jhc.or.id"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Secure Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 pr-12 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-black/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors p-1">
                  {showPwd ? <Icons.EyeOff className="w-5 h-5"/> : <Icons.Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center p-4 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-70 text-white rounded-2xl font-bold text-sm shadow-[0_8px_32px_rgba(16,185,129,0.3)] hover:shadow-[0_16px_48px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Mengautentikasi...</>
              ) : (
                <><Icons.Lock className="w-5 h-5"/> Akses Secure System</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// =============================================
// SIDEBAR
// =============================================
const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Activity, section: 'UTAMA' },
  { id: 'companies', label: 'Data Perusahaan', icon: Icons.Building, section: 'DATA SERTIFIKASI' },
];

function Sidebar({ activePage, onNavigate, adminName, onLogout, isMobileOpen, onCloseMobile }) {
  let currentSection = '';
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onCloseMobile}></div>}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen shadow-sm`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
              <Icons.Shield className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm tracking-tight">JHC HalalFlow</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const showSection = item.section !== currentSection;
            currentSection = item.section;
            const isActive = activePage === item.id || (activePage?.startsWith('company-') && item.id === 'companies');
            return (
              <React.Fragment key={item.id}>
                {showSection && (
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pt-4 pb-1">{item.section}</p>
                )}
                <button
                  onClick={() => { onNavigate(item.id); onCloseMobile(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}/>
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Admin Info + Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black shrink-0">
              {adminName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{adminName}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Administrator</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all">
            <Icons.LogOut className="w-4 h-4"/> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

// =============================================
// DASHBOARD PAGE
// =============================================
function DashboardPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/dashboard');
      const d = await res.json();
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); const i = setInterval(fetchDashboard, 15000); return () => clearInterval(i); }, [fetchDashboard]);

  if (loading) return <LoadingState text="Memuat dashboard..."/>;

  const stats = data?.stats || {};
  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview sistem sertifikasi halal JHC HalalFlow</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Perusahaan', value: stats.totalCompanies || 0, icon: Icons.Building, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Perusahaan Baru (7 hari)', value: stats.newThisWeek || 0, icon: Icons.Users, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Total Pengguna', value: stats.totalUsers || 0, icon: Icons.Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Legal Menunggu', value: stats.legalPending || 0, icon: Icons.FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Legal Terverifikasi', value: stats.legalVerified || 0, icon: Icons.Check, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Matrix Menunggu', value: stats.matrixPending || 0, icon: Icons.List, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`}/>
            </div>
            <p className="text-2xl font-black text-slate-800">{s.value}</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-5">Navigasi Cepat</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Data Perusahaan', desc: 'Lihat & kelola perusahaan', icon: Icons.Building, page: 'companies' },
            { label: 'Dokumen Legal', desc: 'Verifikasi dokumen', icon: Icons.FileText, page: 'legal' },
            { label: 'Matrix Bahan', desc: 'Status bahan halal', icon: Icons.List, page: 'materials' },
            { label: 'Status Sertifikasi', desc: 'Progress per perusahaan', icon: Icons.Award, page: 'progress' },
          ].map((item, i) => (
            <button key={i} onClick={() => onNavigate(item.page)} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all group">
              <item.icon className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform"/>
              <p className="text-sm font-bold text-slate-800">{item.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================
// COMPANIES LIST PAGE
// =============================================
function CompaniesPage({ onSelectCompany }) {
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, ...(q ? { search: q } : {}) });
      const res = await adminFetch(`/api/admin/companies?${params}`);
      const d = await res.json();
      setCompanies(d.companies || []);
      setPagination(d.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchCompanies(1, search); }, [fetchCompanies]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(1, search);
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data perusahaan ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await adminFetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCompanies(pagination.page, search);
      } else {
        alert('Gagal menghapus data perusahaan.');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Data Perusahaan</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total} perusahaan terdaftar</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari perusahaan, NIB, email..."
              className="w-64 bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">Cari</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <LoadingState text="Memuat data perusahaan..."/>
        ) : companies.length === 0 ? (
          <EmptyState text="Belum ada perusahaan terdaftar" sub={search ? 'Coba ubah kata kunci pencarian' : 'Pengguna belum melakukan registrasi perusahaan'}/>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">No</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Perusahaan</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">NIB</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Penanggung Jawab</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Jenis Usaha</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Update</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c, i) => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 text-slate-400 text-xs">{(pagination.page - 1) * 15 + i + 1}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{c.nama || <span className="text-slate-400 italic">Belum diisi</span>}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{c.user_email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs font-mono">{c.nib || '—'}</td>
                      <td className="px-5 py-4 text-slate-600 text-xs">{c.penanggung_jawab || '—'}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{c.jenis_usaha || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 min-w-[60px]">
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all" style={{width:`${c.progress_percent || 0}%`}}></div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 shrink-0">{c.progress_percent || 0}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-[11px]">{formatDate(c.updated_at).split(',')[0]}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectCompany(c.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                          >
                            <Icons.Eye className="w-3.5 h-3.5"/> Detail
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(c.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                          >
                            <Icons.X className="w-3.5 h-3.5"/> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">Menampilkan {companies.length} dari {pagination.total} perusahaan</p>
                <div className="flex gap-2">
                  <button onClick={() => fetchCompanies(pagination.page - 1)} disabled={pagination.page <= 1} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold disabled:opacity-30 hover:bg-slate-200 transition-colors">← Sebelum</button>
                  <span className="px-3 py-1.5 text-xs text-slate-800 font-bold">{pagination.page} / {pagination.totalPages}</span>
                  <button onClick={() => fetchCompanies(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold disabled:opacity-30 hover:bg-slate-200 transition-colors">Berikut →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// =============================================
// COMPANY DETAIL PAGE
// =============================================
const STAGE_STATUSES = ['Belum Dimulai', 'Dalam Proses', 'Menunggu Verifikasi', 'Terverifikasi', 'Perlu Perbaikan', 'Selesai'];

function CompanyDetailPage({ companyId, onBack }) {
  const [company, setCompany] = useState(null);
  const [progress, setProgress] = useState([]);
  const [legal, setLegal] = useState({});
  const [materials, setMaterials] = useState([]);
  const [activities, setActivities] = useState([]);
  const [products, setProducts] = useState([]);
  const [productStageStatus, setProductStageStatus] = useState('Belum Dimulai');
  const [production, setProduction] = useState(null);
  const [productionStageStatus, setProductionStageStatus] = useState('Belum Dimulai');
  const [evidence, setEvidence] = useState(null);
  const [evidenceStageStatus, setEvidenceStageStatus] = useState('Belum Dimulai');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [compRes, legalRes, matRes, actRes, prodRes, productionRes, evidenceRes] = await Promise.all([
        adminFetch(`/api/admin/companies/${companyId}`),
        adminFetch(`/api/admin/companies/${companyId}/legal-documents`),
        adminFetch(`/api/admin/companies/${companyId}/materials`),
        adminFetch(`/api/admin/companies/${companyId}/activities`),
        adminFetch(`/api/admin/companies/${companyId}/products`),
        adminFetch(`/api/admin/companies/${companyId}/production`),
        adminFetch(`/api/admin/companies/${companyId}/evidence`),
      ]);
      const compData = await compRes.json();
      setCompany(compData.company);
      setProgress(compData.progress || []);
      const legalData = await legalRes.json();
      setLegal(legalData.legal || {});
      const matData = await matRes.json();
      setMaterials(matData.materials || []);
      const actData = await actRes.json();
      setActivities(actData.activities || []);
      const prodData = await prodRes.json();
      setProducts(prodData.products || []);
      setProductStageStatus(prodData.stageStatus || 'Belum Dimulai');
      const productionData = await productionRes.json();
      setProduction(productionData.production || null);
      setProductionStageStatus(productionData.stageStatus || 'Belum Dimulai');
      const evidenceData = await evidenceRes.json();
      setEvidence(evidenceData.evidence || null);
      setEvidenceStageStatus(evidenceData.stageStatus || 'Belum Dimulai');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusUpdate = async (stage, newStatus) => {
    setStatusLoading(true);
    try {
      const res = await adminFetch(`/api/admin/companies/${companyId}/stage-status`, {
        method: 'PATCH',
        body: JSON.stringify({ stage, status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(data.progress || []);
        setStatusMsg('Status berhasil diperbarui!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (e) { console.error(e); }
    finally { setStatusLoading(false); }
  };

  if (loading) return <LoadingState text="Memuat detail perusahaan..."/>;
  if (!company) return <EmptyState text="Perusahaan tidak ditemukan"/>;

  const tabs = ['overview', 'registrasi', 'dokumen-legal', 'matrix-bahan', 'bom-produk', 'proses-produksi', 'evidence', 'sertifikasi-bpjph'];
  const tabLabels = { 'overview': 'Overview', 'registrasi': 'Registrasi', 'dokumen-legal': 'Dokumen Legal', 'matrix-bahan': 'Matrix Bahan', 'bom-produk': 'BOM Produk', 'proses-produksi': 'Proses Produksi', 'evidence': 'Evidence (Bukti)', 'sertifikasi-bpjph': 'Sertifikasi BPJPH' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 text-sm font-semibold mb-4 transition-colors group">
          <Icons.ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Kembali ke Data Perusahaan
        </button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">{company.nama || 'Perusahaan Belum Diisi'}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {company.nib && <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">NIB: {company.nib}</span>}
              <span className="text-xs text-slate-500">{company.user_email}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-black text-emerald-600">{company.progress_percent || 0}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'}`}>
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold p-3 rounded-xl">{statusMsg}</div>
      )}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.Building className="w-4 h-4 text-emerald-600"/> Informasi Perusahaan</h3>
            <dl className="space-y-3">
              {[
                ['Nama Perusahaan', company.nama],
                ['NIB', company.nib],
                ['NPWP', company.npwp],
                ['Penanggung Jawab', company.penanggung_jawab],
                ['Jenis Usaha', company.jenis_usaha],
                ['Skala Usaha', company.skala_usaha],
                ['Jumlah Outlet', company.jumlah_outlet],
                ['Cabang / Wilayah', company.cabang],
                ['Alamat', company.alamat],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="text-[11px] font-bold text-slate-500 w-36 shrink-0 pt-0.5">{label}</dt>
                  <dd className="text-sm text-slate-800 flex-1">{value || <span className="text-slate-400 italic text-xs">Belum diisi</span>}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.Users className="w-4 h-4 text-emerald-600"/> Informasi Pengguna</h3>
            <dl className="space-y-3">
              {[
                ['Nama', company.user_name],
                ['Email', company.user_email],
                ['Telepon', company.user_phone],
                ['Terdaftar', formatDate(company.user_registered_at)],
                ['Update Terakhir', formatDate(company.updated_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="text-[11px] font-bold text-slate-500 w-28 shrink-0 pt-0.5">{label}</dt>
                  <dd className="text-sm text-slate-800 flex-1">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* TAB: REGISTRASI */}
      {activeTab === 'registrasi' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-5">Data Registrasi Perusahaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ['Nama Perusahaan', company.nama],
              ['NIB', company.nib],
              ['NPWP', company.npwp],
              ['Penanggung Jawab', company.penanggung_jawab],
              ['Jenis Usaha', company.jenis_usaha],
              ['Skala Usaha', company.skala_usaha],
              ['Jumlah Outlet', company.jumlah_outlet],
              ['Cabang / Wilayah', company.cabang],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value || <span className="text-slate-400 italic">Belum diisi</span>}</p>
              </div>
            ))}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Alamat Lengkap</p>
              <p className="text-sm font-semibold text-slate-800">{company.alamat || <span className="text-slate-400 italic">Belum diisi</span>}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DOKUMEN LEGAL */}
      {activeTab === 'dokumen-legal' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800">Informasi Kontak & Legal</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={legal.status || 'Belum Dimulai'}/>
                <button onClick={() => setActiveTab('progress')} className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1 bg-emerald-50 rounded-lg transition-colors border border-emerald-200">Verifikasi</button>
              </div>
            </div>
            {!legal.telp_pemilik && !legal.email_sihalal ? (
              <EmptyState text="Dokumen legal belum diisi" sub="Pengguna belum mengisi data dokumen legal"/>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Nomor Telepon Pemilik', legal.telp_pemilik],
                  ['Nomor Telepon Penyelia', legal.telp_penyelia],
                  ['Email SIHALAL', legal.email_sihalal],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Dokumen yang Diupload</h3>
            <div className="space-y-3">
              {[
                ['Permohonan Pendaftaran', legal.permohonan],
                ['SK Penyelia Halal', legal.sk_penyelia],
                ['SK Manajemen Halal', legal.sk_manajemen],
                ['Kebijakan Halal Bermaterai', legal.kebijakan],
                ['Tanda Tangan Pemilik', legal.ttd_pemilik],
                ['Tanda Tangan Penyelia', legal.ttd_penyelia],
              ].map(([label, filename]) => (
                <div key={label} className={`flex items-center justify-between p-3 rounded-xl border ${filename ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <Icons.FileText className={`w-4 h-4 ${filename ? 'text-emerald-600' : 'text-slate-400'}`}/>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{label}</p>
                      {filename && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{filename}</p>}
                    </div>
                  </div>
                  {filename ? (
                    <a href={`/uploads/${filename}`} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">
                      Lihat
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">Belum upload</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MATRIX BAHAN */}
      {activeTab === 'matrix-bahan' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-800">Matrix Bahan Halal <span className="text-slate-400 text-sm font-normal">({materials.length} bahan)</span></h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={progress.find(s => s.stage === 3)?.status || 'Belum Dimulai'}/>
              <button onClick={() => setActiveTab('progress')} className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1 bg-emerald-50 rounded-lg transition-colors border border-emerald-200">Verifikasi</button>
            </div>
          </div>
          {materials.length === 0 ? (
            <EmptyState text="Belum ada bahan halal" sub="Pengguna belum menambahkan bahan halal"/>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['No', 'Nama Bahan', 'Jenis', 'Produsen', 'Negara', 'Supplier', 'Lembaga', 'No. Sertifikat', 'Expired', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, i) => (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{m.nama_bahan}</td>
                      <td className="px-4 py-3 text-slate-500">{m.jenis || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{m.produsen || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{m.negara || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{m.supplier || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{m.lembaga || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{m.nomor_sertifikat || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{m.expired || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.halal_status === 'hijau' ? 'bg-emerald-100 text-emerald-700' : m.halal_status === 'kuning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {m.halal_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: BOM PRODUK */}
      {activeTab === 'bom-produk' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-800">Upload Produk & Komposisi (BOM) <span className="text-slate-400 text-sm font-normal">({products.length} produk)</span></h3>
            <StatusBadge status={productStageStatus}/>
          </div>
          {products.length === 0 ? (
            <EmptyState text="Belum ada data produk" sub="Pengguna belum menambahkan produk dan BOM"/>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">No</th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Nama Produk</th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Komposisi Bahan (BOM)</th>
                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status BOM</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{p.name}</td>
                      <td className="px-5 py-4">
                        {p.bahan && p.bahan.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.bahan.map((b, bi) => (
                              <span key={bi} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">{b}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Belum ada bahan</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {p.bahan && p.bahan.length > 0 ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200">✓ BOM Lengkap</span>
                        ) : (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full border border-amber-200">Menunggu BOM</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: PROSES PRODUKSI HALAL */}
      {activeTab === 'proses-produksi' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Proses Produksi Halal</h3>
            <StatusBadge status={productionStageStatus}/>
          </div>
          {!production ? (
            <EmptyState text="Belum ada dokumen proses produksi" sub="Pengguna belum mengupload dokumen proses produksi halal"/>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: '1. Alur Proses Produksi', key: 'alurProses', desc: 'Format: .jpeg / Gambar' },
                { label: '2. Layout Ruang Produksi', key: 'layoutRuang', desc: 'Format: .jpeg / Denah Ruang' },
                { label: '3. Surat Pernyataan Bebas Babi', key: 'bebasBabi', desc: 'Format: .pdf' },
              ].map(({ label, key, desc }) => {
                const filename = production[key];
                return (
                  <div key={key} className={`p-5 rounded-2xl border ${filename ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="font-bold text-sm text-slate-800 mb-1">{label}</h4>
                    <p className="text-xs text-slate-500 mb-4">{desc}</p>
                    {filename ? (
                      <div>
                        <p className="text-xs text-slate-500 font-mono mb-2 truncate" title={filename}>{filename}</p>
                        <a
                          href={`/uploads/${filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          <Icons.Eye className="w-3.5 h-3.5"/> Lihat File
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">Belum diupload</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: EVIDENCE (BUKTI) */}
      {activeTab === 'evidence' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Bukti Kegiatan (Evidence)</h3>
            <StatusBadge status={evidenceStageStatus}/>
          </div>
          {!evidence ? (
            <EmptyState text="Belum ada dokumen evidence" sub="Pengguna belum mengupload dokumen evidence (bukti)"/>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: '1. Bukti Foto Sosialisasi/Training', key: 'sosialisasiFoto' },
                { label: '2. Bukti Foto Audit Internal', key: 'auditInternalFoto' },
                { label: '3. Daftar Hadir Sosialisasi Halal', key: 'sosialisasiAbsen' },
                { label: '4. Daftar Hadir Audit Internal', key: 'auditInternalAbsen' },
                { label: '5. Sampel Catatan Pembelian Bahan', key: 'pembelianBahan' },
                { label: '6. Catatan Penyimpanan Bahan', key: 'penyimpananBahan' },
                { label: '7. Catatan Hasil Produksi', key: 'hasilProduksi' },
                { label: '8. Bukti Distribusi/Penjualan', key: 'distribusiProduk' },
              ].map(({ label, key }) => {
                const filename = evidence[key];
                return (
                  <div key={key} className={`p-4 rounded-xl border flex items-center justify-between ${filename ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{label}</h4>
                      {filename && <p className="text-[10px] text-slate-500 font-mono mt-1 truncate max-w-[200px]" title={filename}>{filename}</p>}
                    </div>
                    {filename ? (
                      <a
                        href={`/uploads/${filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap"
                      >
                        <Icons.Eye className="w-3 h-3"/> Lihat File
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">Belum upload</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: SERTIFIKASI BPJPH */}
      {activeTab === 'sertifikasi-bpjph' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-5">Pengajuan Sertifikasi Halal BPJPH</h3>

          {/* Current Status Badge */}
          <div className="flex items-center justify-between mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                {company.certification_status || 0}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status Saat Ini</p>
                <p className="font-bold text-slate-800 text-sm">
                  {(() => {
                    const st = company.certification_status || 0;
                    const labels = ['Menunggu Pengajuan','Diterima oleh Admin','Diproses','Disubmit di SIHALAL','Feedback BPJPH / Dikirim ke LPH','Penjadwalan Audit','Perbaikan Hasil Audit','Sidang Fatwa MUI','Terbit Sertifikat Halal BPJPH'];
                    return labels[st] || `Tahap ${st}`;
                  })()}
                </p>
              </div>
            </div>
            {statusMsg && <span className="text-emerald-700 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-full">{statusMsg}</span>}
          </div>

          {/* Stage Cards */}
          <p className="text-xs text-slate-500 mb-3 font-semibold">Klik tahapan untuk memperbarui status pengguna:</p>
          <div className="space-y-2">
            {[
              { no: 0, label: 'Menunggu Pengajuan', desc: 'Pengguna belum atau sedang mempersiapkan pengajuan sertifikasi halal. Reset ke tahap awal.' },
              { no: 1, label: 'Diterima oleh Admin', desc: 'Pengajuan telah diterima dan sedang dilakukan pemeriksaan awal oleh Admin JHC.' },
              { no: 2, label: 'Diproses', desc: 'Data dan dokumen usaha sedang diperiksa serta dipersiapkan untuk proses sertifikasi halal.' },
              { no: 3, label: 'Disubmit di SIHALAL', desc: 'Pengajuan sertifikasi halal telah diajukan melalui sistem SIHALAL BPJPH.' },
              { no: 4, label: 'Feedback BPJPH / Dikirim ke LPH', desc: 'Pengajuan sedang menunggu atau menindaklanjuti feedback BPJPH. Jika persyaratan terpenuhi, pengajuan diteruskan ke LPH.' },
              { no: 5, label: 'Penjadwalan Audit', desc: 'Pengajuan telah diterima LPH dan sedang dalam proses penjadwalan audit/pemeriksaan kehalalan.' },
              { no: 6, label: 'Perbaikan Hasil Audit', desc: 'Hasil pemeriksaan/audit memerlukan perbaikan atau pemenuhan dokumen/data oleh pelaku usaha.' },
              { no: 7, label: 'Sidang Fatwa MUI', desc: 'Hasil pemeriksaan telah diproses untuk penetapan kehalalan melalui sidang fatwa sesuai ketentuan yang berlaku.' },
              { no: 8, label: 'Terbit Sertifikat Halal BPJPH', desc: 'Selamat! Sertifikat Halal resmi BPJPH telah terbit dan dapat diakses melalui sistem.' },
            ].map(stage => {
              const isCurrent = (company.certification_status || 0) === stage.no;
              return (
                <button
                  key={stage.no}
                  onClick={async () => {
                    setStatusLoading(true);
                    try {
                      const res = await adminFetch(`/api/admin/companies/${companyId}/certification-status`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status: stage.no })
                      });
                      if (res.ok) {
                        setCompany({...company, certification_status: stage.no});
                        setStatusMsg('Status BPJPH berhasil diperbarui!');
                        setTimeout(() => setStatusMsg(''), 3000);
                      }
                    } catch (e) {} finally { setStatusLoading(false); }
                  }}
                  disabled={statusLoading || isCurrent}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 border-emerald-600 shadow-md ring-2 ring-emerald-300 ring-offset-1 cursor-default'
                      : 'bg-white border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                  } disabled:opacity-80`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {stage.no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm ${isCurrent ? 'text-white' : 'text-slate-800'}`}>{stage.label}</div>
                    <div className={`text-xs mt-0.5 leading-snug ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>{stage.desc}</div>
                    {isCurrent && (
                      <span className="inline-block mt-1.5 text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full tracking-wide">STATUS AKTIF</span>
                    )}
                  </div>
                  {!isCurrent && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 self-center bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 transition-colors`}>
                      Set Aktif
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}



// =============================================
// LOADING + EMPTY STATES
// =============================================
function LoadingState({ text = 'Memuat...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <svg className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <p className="text-slate-500 text-sm">{text}</p>
      </div>
    </div>
  );
}

function EmptyState({ text, sub }) {
  return (
    <div className="flex items-center justify-center py-16 text-center">
      <div>
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <Icons.List className="w-7 h-7 text-slate-400"/>
        </div>
        <p className="text-slate-600 font-semibold text-sm">{text}</p>
        {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// =============================================
// SIMPLE PLACEHOLDER PAGES
// =============================================
function SimplePage({ title, onSelectCompany }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/companies?limit=100')
      .then(r => r.json())
      .then(d => { setCompanies(d.companies || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isLegal = title.includes('Legal');
  const isMaterials = title.includes('Bahan');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-800">{title}</h1>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {loading ? <LoadingState/> : companies.length === 0 ? (
          <EmptyState text="Belum ada perusahaan terdaftar"/>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-4">Pilih perusahaan untuk melihat {isLegal ? 'dokumen legal' : isMaterials ? 'matrix bahan' : 'data'}:</p>
            {companies.map(c => (
              <button key={c.id} onClick={() => onSelectCompany(c.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl border border-slate-200 transition-all group text-left">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{c.nama || 'Belum diisi'}</p>
                  <p className="text-[11px] text-slate-500">{c.user_email} • NIB: {c.nib || '—'}</p>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"/>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
// MAIN ADMIN APP
// =============================================
function AdminApp({ admin, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelectCompany = (id) => {
    setSelectedCompanyId(id);
    setPage('company-detail');
  };

  const handleNavigate = (p) => {
    setPage(p);
    if (p !== 'company-detail') setSelectedCompanyId(null);
  };

  const renderPage = () => {
    if (page === 'company-detail' && selectedCompanyId) {
      return <CompanyDetailPage companyId={selectedCompanyId} onBack={() => handleNavigate('companies')}/>;
    }
    switch (page) {
      case 'dashboard': return <DashboardPage onNavigate={handleNavigate}/>;
      case 'companies': return <CompaniesPage onSelectCompany={handleSelectCompany}/>;
      default: return <DashboardPage onNavigate={handleNavigate}/>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 flex">
      <Sidebar
        activePage={page}
        onNavigate={handleNavigate}
        adminName={admin?.name}
        onLogout={onLogout}
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 flex items-center justify-between px-6 shadow-sm">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-slate-500 hover:text-slate-800 p-1">
            <Icons.Menu className="w-5 h-5"/>
          </button>
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            <span>JHC HalalFlow</span>
            <Icons.ChevronRight className="w-3 h-3"/>
            <span className="text-slate-800 font-semibold capitalize">{page.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              Live
            </div>
            <div className="text-xs text-slate-800 font-semibold">{admin?.name}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// =============================================
// ROOT APP
// =============================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('jhc_admin_token'));
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jhc_admin_user') || 'null'); } catch { return null; }
  });

  const handleLogout = () => {
    localStorage.removeItem('jhc_admin_token');
    localStorage.removeItem('jhc_admin_user');
    setIsLoggedIn(false);
    setAdmin(null);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={(adminData) => { setAdmin(adminData); setIsLoggedIn(true); }}/>;
  }

  return <AdminApp admin={admin} onLogout={handleLogout}/>;
}
