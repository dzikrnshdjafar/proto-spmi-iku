import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Layers,
  FileText,
  Activity,
  CheckSquare,
  AlertTriangle,
  Ticket,
  TrendingUp,
  History,
  Plus,
  CloudSync,
  Upload,
  Search,
  ArrowRight,
  Clock,
  User,
  Bookmark,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
  Database,
  Building,
  Scale,
  DollarSign,
  X,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Menu
} from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://spmi-iku-backend.vercel.app/api';
// const API_BASE = 'http://localhost:5000/api';

const IKU_FORMULA_CONFIG = {
  "IKU-001": {
    inputs: [
      { name: "AEE Realisasi (Rata-rata lama studi mahasiswa)", key: "realisasi", defaultValue: 3.5, unit: "Tahun" },
      { name: "AEE Ideal (Target masa studi)", key: "ideal", defaultValue: 4.0, unit: "Tahun" }
    ],
    formula: "(AEE Realisasi / AEE Ideal) * 100",
    calc: (vars) => Math.round((Number(vars.realisasi) / Number(vars.ideal)) * 100)
  },
  "IKU-002": {
    inputs: [
      { name: "Jumlah Lulusan Terserap (Kerja/Wirausaha/Studi)", key: "terserap", defaultValue: 164 },
      { name: "Total Lulusan Tahun Lalu", key: "total", defaultValue: 200 }
    ],
    formula: "(Jumlah Lulusan Terserap / Total Lulusan) * 100",
    calc: (vars) => Math.round((Number(vars.terserap) / Number(vars.total)) * 100)
  },
  "IKU-003": {
    inputs: [
      { name: "Jumlah Mahasiswa Aktif Berprestasi Nasional/Int", key: "prestasi", defaultValue: 700 },
      { name: "Total Mahasiswa Aktif PT", key: "total", defaultValue: 2500 }
    ],
    formula: "(Jumlah Mahasiswa Berprestasi / Total Mahasiswa Aktif) * 100",
    calc: (vars) => Math.round((Number(vars.prestasi) / Number(vars.total)) * 100)
  },
  "IKU-004": {
    inputs: [
      { name: "Jumlah Dosen dengan Rekognisi Nasional/Int", key: "rekognisi", defaultValue: 38 },
      { name: "Total Dosen Perguruan Tinggi", key: "total", defaultValue: 100 }
    ],
    formula: "(Jumlah Dosen Rekognisi / Total Dosen PT) * 100",
    calc: (vars) => Math.round((Number(vars.rekognisi) / Number(vars.total)) * 100)
  },
  "IKU-005": {
    inputs: [
      { name: "Jumlah Kerja Sama & Hilirisasi Aktif", key: "kerjasama", defaultValue: 9 },
      { name: "Total Usulan Kerja Sama PT", key: "total", defaultValue: 20 }
    ],
    formula: "(Jumlah Kerja Sama / Total Usulan Kerja Sama) * 100",
    calc: (vars) => Math.round((Number(vars.kerjasama) / Number(vars.total)) * 100)
  },
  "IKU-006": {
    inputs: [
      { name: "Jumlah Publikasi Scopus/WoS Terbit", key: "publikasi", defaultValue: 78 },
      { name: "Total Dosen Aktif Peneliti", key: "total", defaultValue: 100 }
    ],
    formula: "(Jumlah Publikasi / Total Dosen) * 100",
    calc: (vars) => Math.round((Number(vars.publikasi) / Number(vars.total)) * 100)
  },
  "IKU-007": {
    inputs: [
      { name: "Jumlah Program Berkontribusi pada SDGs", key: "sdgs", defaultValue: 13 },
      { name: "Total Program Kerja Tridharma PT", key: "total", defaultValue: 20 }
    ],
    formula: "(Jumlah Program SDGs / Total Program Kerja) * 100",
    calc: (vars) => Math.round((Number(vars.sdgs) / Number(vars.total)) * 100)
  },
  "IKU-008": {
    inputs: [
      { name: "Jumlah Dosen/SDM Jadi Ahli Kebijakan Publik", key: "sdm", defaultValue: 12 },
      { name: "Total Dosen Aktif PT", key: "total", defaultValue: 100 }
    ],
    formula: "(Jumlah SDM Terlibat Kebijakan / Total Dosen) * 100",
    calc: (vars) => Math.round((Number(vars.sdm) / Number(vars.total)) * 100)
  },
  "IKU-009": {
    inputs: [
      { name: "Pendapatan Non-UKT (Rupiah)", key: "nonUkt", defaultValue: 3000000000 },
      { name: "Total Pendapatan Perguruan Tinggi", key: "total", defaultValue: 10000000000 }
    ],
    formula: "(Pendapatan Non-UKT / Total Pendapatan) * 100",
    calc: (vars) => Math.round((Number(vars.nonUkt) / Number(vars.total)) * 100)
  },
  "IKU-010": {
    inputs: [
      { name: "Jumlah Unit Kerja Zona Integritas (WBK/WBBM)", key: "zi", defaultValue: 2 },
      { name: "Total Unit Kerja Terdaftar", key: "total", defaultValue: 5 }
    ],
    formula: "(Jumlah Unit Diusulkan / Total Unit Kerja) * 100",
    calc: (vars) => Math.round((Number(vars.zi) / Number(vars.total)) * 100)
  },
  "IKU-011": {
    inputs: [
      { name: "Nilai Kepatuhan Keuangan (0-100)", key: "keuangan", defaultValue: 95 },
      { name: "Nilai Kepatuhan PPKS/Anti Kekerasan (0-100)", key: "ppks", defaultValue: 95 },
      { name: "Nilai Kepatuhan Anti Narkoba (0-100)", key: "narkoba", defaultValue: 95 }
    ],
    formula: "(Nilai Keuangan + Nilai PPKS + Nilai Narkoba) / 3",
    calc: (vars) => Math.round((Number(vars.keuangan) + Number(vars.ppks) + Number(vars.narkoba)) / 3)
  },
  "IKU-012": {
    inputs: [
      { name: "Jumlah Dosen Gaji >= UMP + Tunjangan", key: "sejahtera", defaultValue: 90 },
      { name: "Total Dosen Aktif PT", key: "total", defaultValue: 100 }
    ],
    formula: "(Jumlah Dosen Sejahtera / Total Dosen) * 100",
    calc: (vars) => Math.round((Number(vars.sejahtera) / Number(vars.total)) * 100)
  }
};

function App() {
  // Navigation & Filtering
  const [activeStep, setActiveStep] = useState(0); // 0: Penetapan, 1: Pelaksanaan, 2: Evaluasi, 3: Pengendalian, 4: Peningkatan
  const [selectedRumpun, setSelectedRumpun] = useState('All');
  const [selectedTicketFilter, setSelectedTicketFilter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar Dropdown Open/Closed States
  const [openAkademik, setOpenAkademik] = useState(true);
  const [openNonAkademik, setOpenNonAkademik] = useState(true);

  // Core Data States
  const [standards, setStandards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [auditForms, setAuditForms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [versions, setVersions] = useState([]);
  const [predictiveRecs, setPredictiveRecs] = useState([]);

  // Modal Control States
  const [showAddStdModal, setShowAddStdModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStdForUpload, setSelectedStdForUpload] = useState(null);
  const [calcInputs, setCalcInputs] = useState({});
  const [showResolveTicketModal, setShowResolveTicketModal] = useState(null);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [rawJsonData, setRawJsonData] = useState(null);
  const [showRawDataModal, setShowRawDataModal] = useState(false);
  const [rawDataSource, setRawDataSource] = useState('');
  const [syncResult, setSyncResult] = useState(null);
  const [showSyncResultModal, setShowSyncResultModal] = useState(false);

  // Form Field States
  const [newStd, setNewStd] = useState({
    nama: '',
    rumpun: 'Pendidikan',
    formula: '',
    targetType: 'percentage',
    targetValue: '',
    operator: '>=',
    snDikti: 'STANDAR PROSES PEMBELAJARAN',
    unitPenanggungJawab: ''
  });
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [complianceEvidence, setComplianceEvidence] = useState('');
  const [newVersionName, setNewVersionName] = useState('');

  // UI Interactive States
  const [toast, setToast] = useState(null);
  const [syncingSource, setSyncingSource] = useState(null);
  const [scanningDiscrepancy, setScanningDiscrepancy] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load Initial Data
  useEffect(() => {
    fetchStandards();
    fetchAchievements();
    fetchAuditForms();
    fetchTickets();
    fetchVersions();
    fetchPredictiveRecs();
  }, []);

  // Show dynamic toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch Calls
  const fetchStandards = async () => {
    try {
      const res = await fetch(`${API_BASE}/standards`);
      const data = await res.json();
      setStandards(data);
    } catch (err) {
      console.error('Error fetching standards:', err);
    }
  };

  const fetchAchievements = async () => {
    try {
      const res = await fetch(`${API_BASE}/achievements`);
      const data = await res.json();
      setAchievements(data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  const fetchAuditForms = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit-forms`);
      const data = await res.json();
      setAuditForms(data);
    } catch (err) {
      console.error('Error fetching audit forms:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await fetch(`${API_BASE}/versions`);
      const data = await res.json();
      setVersions(data);
    } catch (err) {
      console.error('Error fetching versions:', err);
    }
  };

  const fetchPredictiveRecs = async () => {
    try {
      const res = await fetch(`${API_BASE}/predictive-analytics`);
      const data = await res.json();
      setPredictiveRecs(data);
    } catch (err) {
      console.error('Error fetching predictive analytics:', err);
    }
  };

  // Event Handlers
  const handleCreateStandard = async (e) => {
    e.preventDefault();
    if (!newStd.nama || !newStd.targetValue || !newStd.unitPenanggungJawab) {
      showToast('Harap isi semua kolom wajib!', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/standards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStd)
      });
      if (res.ok) {
        showToast('Standar IKU Baru berhasil Ditetapkan!');
        setShowAddStdModal(false);
        fetchStandards();
        setNewStd({
          nama: '',
          rumpun: 'Pendidikan',
          formula: '',
          targetType: 'percentage',
          targetValue: '',
          operator: '>=',
          snDikti: 'STANDAR PROSES PEMBELAJARAN',
          unitPenanggungJawab: ''
        });
      }
    } catch (err) {
      showToast('Gagal menetapkan standar baru', 'error');
    }
  };

  const handleManualAchievementSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceUrl) {
      showToast('Harap masukkan URL Bukti Dokumen legalitas!', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standardId: selectedStdForUpload.id,
          actualValue: selectedStdForUpload.tempValue || 0,
          evidenceUrl,
          evidenceFileName: evidenceFile ? evidenceFile.name : 'Bukti_Fisik_Upload.pdf'
        })
      });

      if (res.ok) {
        showToast('Capaian dan Bukti Fisik berhasil diunggah!');
        setShowUploadModal(false);
        setEvidenceUrl('');
        setEvidenceFile(null);
        fetchAchievements();
        fetchPredictiveRecs(); // Reload in case a target hit 100%
      }
    } catch (err) {
      showToast('Gagal mengunggah data capaian', 'error');
    }
  };

  // SISTER and OBE Sync triggers
  const handleSyncSource = async (source) => {
    setSyncingSource(source);

    // Find target standard ID based on source
    const stdId = source === 'SISTER' ? 'IKU-004' : 'IKU-001';
    const currentAch = achievements.find(a => a.standardId === stdId);
    const oldValue = currentAch ? Number(currentAch.actualValue) : 0;

    try {
      const res = await fetch(`${API_BASE}/sync-api/${source}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);

        // Find the new achievement value from the response
        const newAch = data.achievements.find(a => a.standardId === stdId);
        const newValue = newAch ? Number(newAch.actualValue) : 0;

        // Fetch standard details
        const std = standards.find(s => s.id === stdId);
        const target = std ? Number(std.targetValue) : 0;
        const operator = std ? std.operator : '>=';

        // Check if met
        const isMet = operator === '>=' ? newValue >= target : newValue <= target;

        // Generate math explanation
        let mathExplanation = '';
        if (source === 'SISTER') {
          // Count total and S3 in sister
          mathExplanation = `Berdasarkan payload raw-sister.json: Terdeteksi 25 dosen berpendidikan S3 dari total 30 dosen aktif yang terdaftar di SISTER. Formula: (25 / 30) * 100 = 83.3% (dibulatkan menjadi 83%).`;
        } else {
          mathExplanation = `Berdasarkan payload raw-obe.json: Terdeteksi 8 program studi berstatus "OBE Implemented" dari total 10 program studi. Formula: (8 / 10) * 100 = 80%.`;
        }

        setSyncResult({
          source,
          stdId,
          stdName: std ? std.nama : '',
          oldValue,
          newValue,
          target,
          operator,
          isMet,
          mathExplanation
        });
        setShowSyncResultModal(true);

        fetchAchievements();
        fetchPredictiveRecs();
      }
    } catch (err) {
      showToast(`Gagal melakukan sinkronisasi dengan ${source}`, 'error');
    } finally {
      setSyncingSource(null);
    }
  };

  const handleViewRawData = async (source) => {
    try {
      const res = await fetch(`${API_BASE}/raw-data/${source}`);
      const data = await res.json();
      if (res.ok) {
        setRawJsonData(data);
        setRawDataSource(source);
        setShowRawDataModal(true);
      } else {
        showToast(`Gagal memuat data mentah dari ${source}`, 'error');
      }
    } catch (err) {
      showToast(`Gagal memuat data mentah dari ${source}`, 'error');
    }
  };

  // Run Discrepancy detector scanner (Fase 3)
  const handleScanDiscrepancy = async () => {
    setScanningDiscrepancy(true);
    try {
      const res = await fetch(`${API_BASE}/audit-forms/detect-discrepancy`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Audit Selesai. Ditemukan ${data.discrepancyCount} gap, ${data.newTicketsCount} tiket kerja baru digenerate secara objektif.`);
        fetchAuditForms();
        fetchTickets();
      }
    } catch (err) {
      showToast('Gagal menjalankan scan audit', 'error');
    } finally {
      setScanningDiscrepancy(false);
    }
  };

  // Resolve Ticket compliance evidence upload (Fase 4)
  const handleResolveTicket = async (e) => {
    e.preventDefault();
    if (!complianceEvidence) {
      showToast('Harap masukkan URL Bukti Penyelesaian!', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/tickets/${showResolveTicketModal.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceOfCompliance: complianceEvidence })
      });

      if (res.ok) {
        showToast('Tiket perbaikan berhasil diselesaikan! Indikator target di-update.');
        setShowResolveTicketModal(null);
        setComplianceEvidence('');
        fetchTickets();
        fetchAchievements();
        fetchPredictiveRecs();
      }
    } catch (err) {
      showToast('Gagal menyelesaikan tiket', 'error');
    }
  };

  // Escalate manual ticket immediately
  const handleEscalateTicket = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/escalate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast('Tiket Mutu Berhasil Dieksalasi langsung ke Dashboard Rektor!', 'warning');
        fetchTickets();
      }
    } catch (err) {
      showToast('Gagal melakukan eskalasi tiket', 'error');
    }
  };

  // Freeze version snapshot (Fase 5)
  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    if (!newVersionName) return;

    try {
      const res = await fetch(`${API_BASE}/standards/versioning/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionName: newVersionName })
      });

      if (res.ok) {
        showToast(`Versi standard '${newVersionName}' berhasil dibekukan!`);
        setNewVersionName('');
        setShowVersionModal(false);
        fetchVersions();
      }
    } catch (err) {
      showToast('Gagal membekukan snapshot standard', 'error');
    }
  };

  // AI Target elevation confirmation
  const handleElevateStandardTarget = async (rec) => {
    try {
      const stdToUpdate = standards.find(s => s.id === rec.standardId);
      if (!stdToUpdate) return;

      const updatedStd = {
        ...stdToUpdate,
        targetValue: rec.suggestedTarget
      };

      const res = await fetch(`${API_BASE}/standards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStd)
      });

      if (res.ok) {
        showToast(`Target untuk '${stdToUpdate.nama}' berhasil dinaikkan ke ${rec.suggestedTarget}%! (Melampaui SN Dikti)`);
        fetchStandards();
        fetchPredictiveRecs();
      }
    } catch (err) {
      showToast('Gagal meningkatkan standar target', 'error');
    }
  };

  // Helpers
  const getAchievement = (stdId) => {
    return achievements.find(a => a.standardId === stdId);
  };

  const getAuditFormStatus = (stdId) => {
    const af = auditForms.find(a => a.standardId === stdId);
    return af ? af.status : 'Unchecked';
  };

  const getStandardTicket = (stdId) => {
    return tickets.find(t => t.standardId === stdId);
  };

  // Filtering lists
  const filteredStandards = standards.filter(s => {
    if (selectedRumpun === 'All') return true;
    if (selectedRumpun === 'Akademik') {
      return ['Pendidikan', 'Penelitian', 'Pengabdian Kepada Masyarakat'].includes(s.rumpun);
    }
    if (selectedRumpun === 'Non-Akademik') {
      return ['Organisasi', 'Keuangan', 'Kemahasiswaan', 'Ketenagaan', 'Sarana Prasarana'].includes(s.rumpun);
    }
    return s.rumpun === selectedRumpun;
  });

  const getStepIndicator = (step) => {
    if (activeStep === step) return 'timeline-step active';
    return 'timeline-step';
  };

  // Rumpun badges helper style
  const getRumpunColorClass = (rumpun) => {
    switch (rumpun) {
      case 'Pendidikan': return 'badge-success';
      case 'Penelitian': return 'badge-info';
      case 'Pengabdian Kepada Masyarakat': return 'badge-warning';
      case 'Organisasi': return 'badge-primary';
      case 'Keuangan': return 'badge-secondary';
      case 'Kemahasiswaan': return 'badge-danger';
      case 'Ketenagaan': return 'badge-dark';
      case 'Sarana Prasarana': return 'badge-light';
      default: return 'badge-neutral';
    }
  };

  const activeTicketCount = tickets.filter(t => t.status === 'Active').length;
  const breachedTicketCount = tickets.filter(t => t.status === 'Breached').length;
  const metTargetCount = standards.filter(std => {
    const ach = getAchievement(std.id);
    if (!ach) return false;
    return Number(ach.actualValue) >= Number(std.targetValue);
  }).length;

  return (
    <div className="app-container">
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-banner glass-panel toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 color="var(--success)" /> : <XCircle color="var(--danger)" />}
          <div>
            <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              {toast.type === 'success' ? 'Berhasil' : 'Notifikasi'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header glass-panel">
        <div className="logo-container">
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle Sidebar">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <ShieldCheck size={36} className="logo-icon" />
          <div className="logo-text">
            <h1>SPMI - IKU INTELLIGENT DEVIATION ROUTER</h1>
            <p>Sistem Penjaminan Mutu Internal & Eksternal Institusi</p>
          </div>
        </div>
        <div className="system-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Backend Online</span>
          </div>
          <div className="status-indicator" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
            <Database size={16} />
            <span>5 Modul Terintegrasi</span>
          </div>
        </div>
      </header>

      {/* PPEPP Timeline Navigation */}
      <nav className="ppepp-timeline glass-panel">
        <div className={getStepIndicator(0)} onClick={() => setActiveStep(0)}>
          <span className="step-number">Fase 1</span>
          <span className="step-title"><Bookmark size={16} /> Penetapan</span>
          <span className="step-subtitle">Manajemen Target IKU</span>
        </div>
        <div className={getStepIndicator(1)} onClick={() => setActiveStep(1)}>
          <span className="step-number">Fase 2</span>
          <span className="step-title"><Activity size={16} /> Pelaksanaan</span>
          <span className="step-subtitle">Data Tracker & API Sync</span>
        </div>
        <div className={getStepIndicator(2)} onClick={() => setActiveStep(2)}>
          <span className="step-number">Fase 3</span>
          <span className="step-title"><CheckSquare size={16} /> Evaluasi</span>
          <span className="step-subtitle">AMI Borang & Discrepancy</span>
        </div>
        <div className={getStepIndicator(3)} onClick={() => setActiveStep(3)}>
          <span className="step-number">Fase 4</span>
          <span className="step-title"><Ticket size={16} /> Pengendalian</span>
          <span className="step-subtitle">Intelligent Routing & SLA</span>
        </div>
        <div className={getStepIndicator(4)} onClick={() => setActiveStep(4)}>
          <span className="step-number">Fase 5</span>
          <span className="step-title"><TrendingUp size={16} /> Peningkatan</span>
          <span className="step-subtitle">AI delta & Versioning</span>
        </div>
      </nav>

      {/* Quick Metrics */}
      <section className="dashboard-grid">
        <div className="metric-card glass-panel">
          <div className="metric-info">
            <h3>Total Indikator IKU</h3>
            <p>{standards.length}</p>
          </div>
          <div className="metric-icon-box"><Layers size={24} color="var(--primary)" /></div>
        </div>
        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="metric-info">
            <h3>Target Terpenuhi</h3>
            <p>{metTargetCount} <span style={{ fontSize: '0.9rem', color: 'var(--success)' }}>/ {standards.length}</span></p>
          </div>
          <div className="metric-icon-box"><CheckCircle2 size={24} color="var(--success)" /></div>
        </div>
        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="metric-info">
            <h3>Temuan Audit Aktif</h3>
            <p>{activeTicketCount}</p>
          </div>
          <div className="metric-icon-box"><AlertTriangle size={24} color="var(--warning)" /></div>
        </div>
        <div className="metric-card glass-panel animate-pulse-glow" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="metric-info">
            <h3>SLA Breached (Rektor)</h3>
            <p>{breachedTicketCount}</p>
          </div>
          <div className="metric-icon-box"><XCircle size={24} color="var(--danger)" /></div>
        </div>
      </section>

      {/* Main Panel layout */}
      <div className="main-grid">
        {/* Left Side Filter Controls */}
        <aside className={`sidebar-panel glass-panel ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-title">Kategori Standar IKU</div>
          <ul className="filter-list">
            <li className={`filter-item ${selectedRumpun === 'All' ? 'active' : ''}`} onClick={() => setSelectedRumpun('All')}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Layers size={14} /> Semua Rumpun
              </span>
              <span className="filter-count">{standards.length}</span>
            </li>

            {/* Dropdown 1: Akademik (Tridharma) */}
            <li>
              <div
                className={`filter-group-header ${selectedRumpun === 'Akademik' ? 'active' : ''}`}
                onClick={(e) => {
                  // If clicking the text, we filter by 'Akademik'
                  setSelectedRumpun('Akademik');
                }}
              >
                <span className="filter-group-title" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRumpun('Akademik');
                }}>
                  <Scale size={14} /> Akademik (Tridharma)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="filter-count" style={{ opacity: 0.8 }}>
                    {standards.filter(s => ['Pendidikan', 'Penelitian', 'Pengabdian Kepada Masyarakat'].includes(s.rumpun)).length}
                  </span>
                  <span onClick={(e) => {
                    e.stopPropagation();
                    setOpenAkademik(!openAkademik);
                  }} style={{ padding: '2px', display: 'inline-flex', cursor: 'pointer' }}>
                    {openAkademik ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </div>
              </div>

              {openAkademik && (
                <ul className="filter-sub-list">
                  <li
                    className={`filter-sub-item ${selectedRumpun === 'Pendidikan' ? 'active' : ''}`}
                    onClick={() => setSelectedRumpun('Pendidikan')}
                  >
                    <span>1. Pendidikan</span>
                    <span className="filter-count">{standards.filter(s => s.rumpun === 'Pendidikan').length}</span>
                  </li>
                  <li
                    className={`filter-sub-item ${selectedRumpun === 'Penelitian' ? 'active' : ''}`}
                    onClick={() => setSelectedRumpun('Penelitian')}
                  >
                    <span>2. Penelitian</span>
                    <span className="filter-count">{standards.filter(s => s.rumpun === 'Penelitian').length}</span>
                  </li>
                  <li
                    className={`filter-sub-item ${selectedRumpun === 'Pengabdian Kepada Masyarakat' ? 'active' : ''}`}
                    onClick={() => setSelectedRumpun('Pengabdian Kepada Masyarakat')}
                  >
                    <span>3. Pengabdian (PkM)</span>
                    <span className="filter-count">{standards.filter(s => s.rumpun === 'Pengabdian Kepada Masyarakat').length}</span>
                  </li>
                </ul>
              )}
            </li>

            {/* Dropdown 2: Non-Akademik */}
            <li>
              <div
                className={`filter-group-header ${selectedRumpun === 'Non-Akademik' ? 'active' : ''}`}
                onClick={(e) => {
                  setSelectedRumpun('Non-Akademik');
                }}
              >
                <span className="filter-group-title" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRumpun('Non-Akademik');
                }}>
                  <Building size={14} /> Non-Akademik
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="filter-count" style={{ opacity: 0.8 }}>
                    {standards.filter(s => ['Organisasi', 'Keuangan', 'Kemahasiswaan', 'Ketenagaan', 'Sarana Prasarana'].includes(s.rumpun)).length}
                  </span>
                  <span onClick={(e) => {
                    e.stopPropagation();
                    setOpenNonAkademik(!openNonAkademik);
                  }} style={{ padding: '2px', display: 'inline-flex', cursor: 'pointer' }}>
                    {openNonAkademik ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </div>
              </div>

              {openNonAkademik && (
                <ul className="filter-sub-list">
                  <li
                    className={`filter-sub-item ${selectedRumpun === 'Organisasi' ? 'active' : ''}`}
                    onClick={() => setSelectedRumpun('Organisasi')}
                  >
                    <span>1. Organisasi</span>
                    <span className="filter-count">{standards.filter(s => s.rumpun === 'Organisasi').length}</span>
                  </li>
                  <li
                    className={`filter-sub-item ${selectedRumpun === 'Keuangan' ? 'active' : ''}`}
                    onClick={() => setSelectedRumpun('Keuangan')}
                  >
                    <span>2. Keuangan</span>
                    <span className="filter-count">{standards.filter(s => s.rumpun === 'Keuangan').length}</span>
                  </li>
                  <li
                    className={`filter-sub-item ${selectedRumpun === 'Kemahasiswaan' ? 'active' : ''}`}
                    onClick={() => setSelectedRumpun('Kemahasiswaan')}
                  >
                    <span>3. Kemahasiswaan</span>
                    <span className="filter-count">{standards.filter(s => s.rumpun === 'Kemahasiswaan').length}</span>
                  </li>
                  <li
                    className={`filter-sub-item ${selectedRumpun === 'Ketenagaan' ? 'active' : ''}`}
                    onClick={() => setSelectedRumpun('Ketenagaan')}
                  >
                    <span>4. Ketenagaan</span>
                    <span className="filter-count">{standards.filter(s => s.rumpun === 'Ketenagaan').length}</span>
                  </li>
                  <li
                    className={`filter-sub-item ${selectedRumpun === 'Sarana Prasarana' ? 'active' : ''}`}
                    onClick={() => setSelectedRumpun('Sarana Prasarana')}
                  >
                    <span>5. Sarana Prasarana</span>
                    <span className="filter-count">{standards.filter(s => s.rumpun === 'Sarana Prasarana').length}</span>
                  </li>
                </ul>
              )}
            </li>
          </ul>

          <div className="sidebar-title" style={{ marginTop: '16px' }}>Status Audit</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Borang Ter-audit:</span>
              <span style={{ fontWeight: 'bold' }}>{auditForms.length} / {standards.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Penyelesaian Tiket:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                {tickets.filter(t => t.status === 'Resolved').length} Selesai
              </span>
            </div>
          </div>
        </aside>

        {/* Main Display Area based on Step */}
        <main style={{ minWidth: 0 }}>
          {/* FASE 1: PENETAPAN */}
          {activeStep === 0 && (
            <div className="module-container">
              <div className="panel-header">
                <div>
                  <h2><Bookmark size={20} color="var(--primary)" /> Fase 1: Penetapan Standar Mutu</h2>
                  <p>Definisikan standar IKU, formula target kualitatif & kuantitatif, dan petakan ke 7 SN Dikti dasar kementerian.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddStdModal(true)}>
                  <Plus size={16} /> Tambah Standar IKU
                </button>
              </div>

              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID IKU</th>
                      <th>Rumpun</th>
                      <th>Nama Standar / Indikator</th>
                      <th>Formula Penilaian</th>
                      <th>Sasaran Target</th>
                      <th>SN Dikti Kementerian</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandards.map((std) => (
                      <tr key={std.id} className="animate-slide-in">
                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{std.id}</td>
                        <td>
                          <span className={`badge ${getRumpunColorClass(std.rumpun)}`}>
                            {std.rumpun}
                          </span>
                        </td>
                        <td>
                          <div className="indicator-name-cell">
                            <span className="indicator-title">{std.nama}</span>
                            <span className="indicator-meta">PIC: {std.unitPenanggungJawab}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{std.formula}</td>
                        <td style={{ fontWeight: 'bold', color: '#fff' }}>
                          {std.operator} {std.targetValue} {std.targetType === 'percentage' ? '%' : ''}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={12} /> {std.snDikti}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={async () => {
                              if (confirm('Hapus standar ini?')) {
                                await fetch(`${API_BASE}/standards/${std.id}`, { method: 'DELETE' });
                                showToast('Standar berhasil dihapus!');
                                fetchStandards();
                              }
                            }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FASE 2: PELAKSANAAN */}
          {activeStep === 1 && (
            <div className="module-container">
              <div className="panel-header">
                <div>
                  <h2><Activity size={20} color="var(--success)" /> Fase 2: Pelaksanaan & Sinkronisasi Data</h2>
                  <p>Mencatat pencapaian capaian riil tiap unit kerja. Dukung unggah berkas legalitas atau sinkronisasi API data eksternal.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleViewRawData('SISTER')}
                    style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Database size={14} /> Data Mentah SISTER
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSyncSource('SISTER')}
                    disabled={syncingSource !== null}
                  >
                    <CloudSync size={16} />
                    {syncingSource === 'SISTER' ? 'Sync SISTER...' : 'Simulasi Sync SISTER'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleViewRawData('OBE')}
                    style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Database size={14} /> Data Mentah OBE
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSyncSource('OBE')}
                    disabled={syncingSource !== null}
                  >
                    <CloudSync size={16} />
                    {syncingSource === 'OBE' ? 'Sync OBE...' : 'Simulasi Sync Sistem OBE'}
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID IKU</th>
                      <th>Indikator</th>
                      <th>Sasaran Target</th>
                      <th>Capaian Aktual</th>
                      <th>Unggah Dokumen Bukti</th>
                      <th>Sumber Data / Sinkronisasi</th>
                      <th>Status Capaian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandards.map((std) => {
                      const ach = getAchievement(std.id);
                      const isMet = ach && (
                        std.targetType === 'text'
                          ? String(ach.actualValue).toLowerCase().trim() === String(std.targetValue).toLowerCase().trim()
                          : Number(ach.actualValue) >= Number(std.targetValue)
                      );
                      return (
                        <tr key={std.id} className="animate-slide-in">
                          <td style={{ fontWeight: 'bold' }}>{std.id}</td>
                          <td>
                            <div className="indicator-name-cell">
                              <span className="indicator-title">{std.nama}</span>
                              <span className="indicator-meta">Unit: {std.unitPenanggungJawab}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{std.operator} {std.targetValue} {std.targetType === 'percentage' ? '%' : ''}</td>
                          <td style={{ color: isMet ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                            {ach ? `${ach.actualValue}${std.targetType === 'percentage' ? '%' : ''}` : 'Belum Diinput'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {ach && ach.evidenceUrl && (
                                <a
                                  href={ach.evidenceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '0.85rem' }}
                                >
                                  <FileCheck size={14} /> {ach.evidenceFileName || 'Bukti_Fisik.pdf'}
                                </a>
                              )}
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', gap: '4px', justifyContent: 'center' }}
                                onClick={() => {
                                  setSelectedStdForUpload(std);
                                  setShowUploadModal(true);
                                  const config = IKU_FORMULA_CONFIG[std.id];
                                  if (config) {
                                    const initialInputs = {};
                                    config.inputs.forEach(ip => {
                                      initialInputs[ip.key] = ip.defaultValue;
                                    });
                                    setCalcInputs(initialInputs);
                                    const initialCalc = config.calc(initialInputs);
                                    setSelectedStdForUpload({ ...std, tempValue: initialCalc });
                                  } else {
                                    setCalcInputs({});
                                    setSelectedStdForUpload({ ...std, tempValue: ach ? ach.actualValue : '' });
                                  }
                                  if (ach && ach.evidenceUrl) {
                                    setEvidenceUrl(ach.evidenceUrl);
                                  } else {
                                    setEvidenceUrl('');
                                  }
                                }}
                              >
                                <Upload size={12} /> {ach ? 'Edit / Hitung Ulang' : 'Unggah Bukti'}
                              </button>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>
                                {ach ? ach.syncSource : 'Manual'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {ach ? `Updated: ${new Date(ach.lastUpdated).toLocaleDateString()}` : '-'}
                              </span>
                            </div>
                          </td>
                          <td>
                            {ach ? (
                              isMet ? (
                                <span className="badge badge-success">Memenuhi Target</span>
                              ) : (
                                <span className="badge badge-danger">Gagal Target</span>
                              )
                            ) : (
                              <span className="badge badge-warning">Draft</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FASE 3: EVALUASI */}
          {activeStep === 2 && (
            <div className="module-container">
              <div className="panel-header">
                <div>
                  <h2><CheckSquare size={20} color="var(--warning)" /> Fase 3: Audit & Evaluasi Digital (Borang AMI)</h2>
                  <p>Melakukan Penilaian Audit Mutu Internal (AMI) secara otomatis. Jalankan sistem detektor deviasi/discrepancy.</p>
                </div>
                <button
                  className="btn btn-primary animate-pulse-glow"
                  onClick={handleScanDiscrepancy}
                  disabled={scanningDiscrepancy}
                >
                  <Search size={16} />
                  {scanningDiscrepancy ? 'Scanning Capaian...' : 'Jalankan Auto-Discrepancy Scanner'}
                </button>
              </div>

              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Status Audit</th>
                      <th>Indikator</th>
                      <th>Sasaran Target</th>
                      <th>Capaian Riil</th>
                      <th>Status Deviasi</th>
                      <th>Evaluasi Digital (Auditor Notes)</th>
                      <th>Auditor Pemeriksa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandards.map((std) => {
                      const ach = getAchievement(std.id);
                      const audit = auditForms.find(af => af.standardId === std.id);

                      const isMet = ach && (
                        std.targetType === 'text'
                          ? String(ach.actualValue).toLowerCase().trim() === String(std.targetValue).toLowerCase().trim()
                          : Number(ach.actualValue) >= Number(std.targetValue)
                      );

                      return (
                        <tr key={std.id} className="animate-slide-in">
                          <td>
                            {audit ? (
                              <span className="badge badge-success">Ter-Audit</span>
                            ) : (
                              <span className="badge badge-warning">Belum Audit</span>
                            )}
                          </td>
                          <td>
                            <div className="indicator-name-cell">
                              <span className="indicator-title">{std.nama}</span>
                              <span className="indicator-meta">SN Dikti: {std.snDikti}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{std.operator} {std.targetValue}</td>
                          <td style={{ fontWeight: 'bold' }}>
                            {ach ? ach.actualValue : 'N/A'}
                          </td>
                          <td>
                            {ach ? (
                              isMet ? (
                                <span className="badge badge-success" style={{ display: 'inline-flex', gap: '4px' }}>
                                  <CheckSquare size={12} /> OK (Lolos)
                                </span>
                              ) : (
                                <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '4px' }}>
                                  <AlertTriangle size={12} /> Temuan Audit
                                </span>
                              )
                            ) : (
                              <span className="badge badge-warning">Belum Ada Data</span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                            {audit ? audit.auditorNotes : 'Menunggu auto-discrepancy scan untuk menerbitkan borang digital.'}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={14} color="var(--text-muted)" />
                              <span>{audit ? audit.auditorName : '-'}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FASE 4: PENGENDALIAN */}
          {activeStep === 3 && (
            <div className="module-container">
              <div className="panel-header">
                <div>
                  <h2><Ticket size={20} color="var(--danger)" /> Fase 4: Tiket Kerja Mutu & Intelligent Routing</h2>
                  <p>Setiap temuan audit secara otomatis dialirkan secara objektif ke unit kerja pendukung melalui Intelligent Routing Engine.</p>
                </div>
              </div>

              <div className="kanban-board">
                {/* 1. KANBAN COLUMN: ACTIVE */}
                <div className="kanban-column">
                  <div className="column-header active">
                    <h3><Clock size={16} color="var(--primary)" /> Aktif (Dalam SLA)</h3>
                    <span className="badge badge-info">
                      {tickets.filter(t => t.status === 'Active').length}
                    </span>
                  </div>
                  {tickets.filter(t => t.status === 'Active').map(ticket => (
                    <div key={ticket.id} className="ticket-card glass-panel animate-slide-in">
                      <div className="ticket-header">
                        <span className="ticket-id">{ticket.id}</span>
                        <span className="badge badge-warning">Dalam Perbaikan</span>
                      </div>
                      <div className="ticket-body">
                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '4px' }}>
                          {ticket.parameterViolated}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {ticket.description}
                        </p>
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', borderLeft: '2px solid var(--primary)', paddingLeft: '6px' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Rekomendasi:</span> {ticket.recommendation}
                        </div>
                      </div>
                      <div className="ticket-assigned">
                        <Building size={12} />
                        <span>Routed ke: <b>{ticket.assignedToUnit}</b></span>
                      </div>
                      <div className="ticket-footer">
                        <div className="ticket-sla">
                          <Clock size={12} />
                          <span>SLA: {ticket.slaDays} hari</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedTicketForResolve(ticket);
                              setShowResolveTicketModal(ticket);
                            }}
                          >
                            Resolve
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleEscalateTicket(ticket.id)}
                          >
                            Eskalasi
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tickets.filter(t => t.status === 'Active').length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '40px' }}>
                      Tidak ada tiket perbaikan aktif.
                    </p>
                  )}
                </div>

                {/* 2. KANBAN COLUMN: RESOLVED */}
                <div className="kanban-column">
                  <div className="column-header resolved">
                    <h3><CheckCircle2 size={16} color="var(--success)" /> Resolved (Mutu Pulih)</h3>
                    <span className="badge badge-success">
                      {tickets.filter(t => t.status === 'Resolved').length}
                    </span>
                  </div>
                  {tickets.filter(t => t.status === 'Resolved').map(ticket => (
                    <div key={ticket.id} className="ticket-card glass-panel" style={{ opacity: 0.85 }}>
                      <div className="ticket-header">
                        <span className="ticket-id" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                          {ticket.id}
                        </span>
                        <span className="badge badge-success">Selesai</span>
                      </div>
                      <div className="ticket-body">
                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{ticket.parameterViolated}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ticket.description}</p>
                      </div>
                      <div className="ticket-assigned" style={{ background: 'rgba(16, 185, 129, 0.03)' }}>
                        <Building size={12} color="var(--success)" />
                        <span>Resolved by: <b>{ticket.assignedToUnit}</b></span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                        <span style={{ fontWeight: 'bold' }}>Bukti Compliance:</span>{' '}
                        <a href={ticket.evidenceOfCompliance} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                          Unduh Bukti
                        </a>
                      </div>
                    </div>
                  ))}
                  {tickets.filter(t => t.status === 'Resolved').length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '40px' }}>
                      Belum ada tiket perbaikan diselesaikan.
                    </p>
                  )}
                </div>

                {/* 3. KANBAN COLUMN: BREACHED (ESKALASI REKTOR) */}
                <div className="kanban-column" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--danger)' }}>
                  <div className="column-header breached animate-pulse-glow">
                    <h3 style={{ color: 'var(--danger)' }}><AlertTriangle size={16} color="var(--danger)" /> Breached (Eskalasi Rektor)</h3>
                    <span className="badge badge-danger">
                      {tickets.filter(t => t.status === 'Breached').length}
                    </span>
                  </div>
                  {tickets.filter(t => t.status === 'Breached').map(ticket => (
                    <div key={ticket.id} className="ticket-card glass-panel" style={{ borderColor: 'var(--danger)' }}>
                      <div className="ticket-header">
                        <span className="ticket-id" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                          {ticket.id}
                        </span>
                        <span className="badge badge-danger">SLA Breached</span>
                      </div>
                      <div className="ticket-body">
                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{ticket.parameterViolated}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ticket.description}</p>
                      </div>
                      <div className="ticket-assigned" style={{ background: 'rgba(239, 68, 68, 0.03)', color: 'var(--danger)' }}>
                        <Building size={12} />
                        <span>Unit Abai: <b>{ticket.assignedToUnit}</b></span>
                      </div>
                      <div style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '4px', color: '#ffb3b3' }}>
                        <b>Peringatan Rektor:</b> {ticket.escalationNotes}
                      </div>
                      <div className="ticket-footer">
                        <button
                          className="btn btn-success"
                          style={{ padding: '6px 12px', width: '100%' }}
                          onClick={() => {
                            setSelectedTicketForResolve(ticket);
                            setShowResolveTicketModal(ticket);
                          }}
                        >
                          Intervensi & Unggah Bukti
                        </button>
                      </div>
                    </div>
                  ))}
                  {tickets.filter(t => t.status === 'Breached').length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '40px' }}>
                      Tidak ada tiket yang breached. Penanganan unit tepat waktu!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FASE 5: PENINGKATAN */}
          {activeStep === 4 && (
            <div className="module-container">
              <div className="panel-header">
                <div>
                  <h2><TrendingUp size={20} color="var(--info)" /> Fase 5: Predictive Analytics & Versioning Control</h2>
                  <p>Menganalisis delta positif capaian multi-siklus untuk menaikkan target standar, serta membekukan snapshot standard historis.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowVersionModal(true)}>
                  <History size={16} /> Bekukan Versi Standar (Snapshot)
                </button>
              </div>

              <div className="fase5-grid">
                {/* 1. Delta Analytics AI Recommendations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={18} color="var(--info)" /> Rekomendasi Peningkatan Target (AI-Assisted)
                  </h3>

                  {predictiveRecs.map((rec) => (
                    <div key={rec.standardId} className="predictive-card glass-panel animate-slide-in">
                      <div className="predictive-header">
                        <div>
                          <span className="badge badge-info" style={{ marginBottom: '6px' }}>Delta Positif Terdeteksi</span>
                          <h4 style={{ fontSize: '1rem', color: '#fff' }}>{rec.nama}</h4>
                        </div>
                        <button
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleElevateStandardTarget(rec)}
                        >
                          Setujui Kenaikan Target
                        </button>
                      </div>

                      <div className="predictive-comparison">
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Target Saat Ini:</span>{' '}
                          <b style={{ color: '#fff' }}>{rec.currentTarget}%</b>
                        </div>
                        <div className="predictive-arrow"><ArrowRight size={14} /></div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Capaian Konsisten:</span>{' '}
                          <b style={{ color: 'var(--success)' }}>{rec.currentActual}%</b>
                        </div>
                        <div className="predictive-arrow"><ArrowRight size={14} /></div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Usulan Target Baru (+{rec.deltaPercentage}):</span>{' '}
                          <b style={{ color: 'var(--info)' }}>{rec.suggestedTarget}%</b>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {rec.reason}
                      </p>
                    </div>
                  ))}

                  {predictiveRecs.length === 0 && (
                    <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Activity size={32} style={{ margin: '0 auto 12px' }} />
                      <p>Belum ada indikator yang terdeteksi konsisten 100% melampaui target selama 3 siklus. Rekomendasi AI delta akan muncul jika capaian stabil.</p>
                    </div>
                  )}
                </div>

                {/* 2. Versioning snapshots */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <History size={18} color="var(--primary)" /> Riwayat Versi Standard (Freezing)
                  </h3>
                  <div className="version-list">
                    {versions.map((ver, idx) => (
                      <div key={idx} className="version-item glass-panel">
                        <div className="version-meta">
                          <b style={{ color: '#fff' }}>{ver.versionName}</b>
                          <span className="version-date">Dibekukan pada: {new Date(ver.frozenAt).toLocaleString()}</span>
                        </div>
                        <span className="badge badge-success">{ver.standardsCount} Standar</span>
                      </div>
                    ))}
                    {versions.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                        Belum ada snapshot standard dibekukan.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL DIALOGS --- */}

      {/* 1. Modal: Tambah Standar IKU (Fase 1) */}
      {showAddStdModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="modal-close" onClick={() => setShowAddStdModal(false)}><X size={20} /></button>
            <div className="modal-header">
              <h3><Plus size={20} color="var(--primary)" /> Tetapkan Standar Mutu Baru</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Petakan target IKU beserta parameter standarnya ke dalam database.</p>
            </div>
            <form onSubmit={handleCreateStandard}>
              <div className="modal-body">
                <div className="form-group-full">
                  <label>Nama Indikator / Standar IKU*</label>
                  <input
                    type="text"
                    placeholder="Contoh: Persentase Dosen Berkualifikasi S3"
                    value={newStd.nama}
                    onChange={e => setNewStd({ ...newStd, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Rumpun Standar*</label>
                    <select value={newStd.rumpun} onChange={e => setNewStd({ ...newStd, rumpun: e.target.value })}>
                      <option value="Pendidikan">Pendidikan (Tridharma)</option>
                      <option value="Penelitian">Penelitian (Tridharma)</option>
                      <option value="Pengabdian Kepada Masyarakat">Pengabdian Kepada Masyarakat (Tridharma)</option>
                      <option value="Organisasi">Non-Akademik: Organisasi</option>
                      <option value="Keuangan">Non-Akademik: Keuangan</option>
                      <option value="Kemahasiswaan">Non-Akademik: Kemahasiswaan</option>
                      <option value="Ketenagaan">Non-Akademik: Ketenagaan</option>
                      <option value="Sarana Prasarana">Non-Akademik: Sarana Prasarana</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>SN Dikti Kementerian*</label>
                    <select value={newStd.snDikti} onChange={e => setNewStd({ ...newStd, snDikti: e.target.value })}>
                      <option value="STANDAR KOMPETENSI LULUSAN">1. STANDAR KOMPETENSI LULUSAN</option>
                      <option value="STANDAR PROSES PEMBELAJARAN">2. STANDAR PROSES PEMBELAJARAN</option>
                      <option value="STANDAR PENILAIAN">3. STANDAR PENILAIAN</option>
                      <option value="STANDAR PENGELOLAAN">4. STANDAR PENGELOLAAN</option>
                      <option value="STANDAR DOSEN DAN TENAGA KEPENDIDIKAN">5. STANDAR DOSEN DAN TENAGA KEPENDIDIKAN</option>
                      <option value="STANDAR SARANA DAN PRASARANA">6. STANDAR SARANA DAN PRASARANA</option>
                      <option value="STANDAR PEMBIAYAAN PENDIDIKAN TINGGI">7. STANDAR PEMBIAYAAN</option>
                    </select>
                  </div>
                </div>
                <div className="form-group-full">
                  <label>Formula & Rumus Perhitungan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jumlah Dosen Doktor / Total Dosen * 100"
                    value={newStd.formula}
                    onChange={e => setNewStd({ ...newStd, formula: e.target.value })}
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tipe Parameter Target</label>
                    <select value={newStd.targetType} onChange={e => setNewStd({ ...newStd, targetType: e.target.value })}>
                      <option value="percentage">Persentase (%)</option>
                      <option value="number">Angka Nominal</option>
                      <option value="text">Predikat Kualitatif (Teks)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Operator Pembanding</label>
                    <select value={newStd.operator} onChange={e => setNewStd({ ...newStd, operator: e.target.value })}>
                      <option value=">=">&gt;= (Minimal)</option>
                      <option value="<=">&lt;= (Maksimal)</option>
                      <option value="=">= (Sama Dengan)</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nilai Sasaran Target*</label>
                    <input
                      type="text"
                      placeholder="Contoh: 40 atau WTP"
                      value={newStd.targetValue}
                      onChange={e => setNewStd({ ...newStd, targetValue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit Penanggung Jawab (PIC)*</label>
                    <input
                      type="text"
                      placeholder="Contoh: Biro Kepegawaian / Prodi S1"
                      value={newStd.unitPenanggungJawab}
                      onChange={e => setNewStd({ ...newStd, unitPenanggungJawab: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStdModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Standard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Unggah Bukti & Capaian (Fase 2) */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="modal-close" onClick={() => setShowUploadModal(false)}><X size={20} /></button>
            <div className="modal-header">
              <h3><Upload size={20} color="var(--success)" /> Unggah Bukti Pelaksanaan IKU</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Masukkan data capaian riil unit saat ini beserta tautan bukti fisik formal.
              </p>
            </div>
            <form onSubmit={handleManualAchievementSubmit}>
              <div className="modal-body">
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Indikator:</span>{' '}
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>{selectedStdForUpload?.nama}</span>
                  <br />
                  <span style={{ color: 'var(--text-secondary)' }}>Target:</span>{' '}
                  <span style={{ fontWeight: 'bold' }}>{selectedStdForUpload?.operator} {selectedStdForUpload?.targetValue}</span>
                </div>

                {selectedStdForUpload && IKU_FORMULA_CONFIG[selectedStdForUpload.id] && (
                  <div style={{
                    background: 'rgba(29, 78, 216, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginTop: '12px',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🧮</span> Simulator Kalkulator Formula
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 12px 0' }}>
                      Formula Resmi: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: '#f43f5e' }}>{IKU_FORMULA_CONFIG[selectedStdForUpload.id].formula}</code>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {IKU_FORMULA_CONFIG[selectedStdForUpload.id].inputs.map((inp) => (
                        <div key={inp.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: '#d1d5db' }}>{inp.name}</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              step="any"
                              value={calcInputs[inp.key] !== undefined ? calcInputs[inp.key] : inp.defaultValue}
                              style={{
                                padding: '8px',
                                fontSize: '0.85rem',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                borderRadius: '6px',
                                flex: 1
                              }}
                              onChange={(e) => {
                                const newVal = e.target.value === '' ? '' : Number(e.target.value);
                                const updatedInputs = { ...calcInputs, [inp.key]: newVal };
                                setCalcInputs(updatedInputs);

                                // Calculate value dynamically
                                const computed = IKU_FORMULA_CONFIG[selectedStdForUpload.id].calc(updatedInputs);
                                setSelectedStdForUpload({
                                  ...selectedStdForUpload,
                                  tempValue: computed
                                });
                              }}
                            />
                            {inp.unit && <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{inp.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '8px',
                      borderTop: '1px dashed rgba(255,255,255,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Hasil Kalkulasi Formula:</span>
                      <strong style={{ fontSize: '1rem', color: '#34d399' }}>
                        {IKU_FORMULA_CONFIG[selectedStdForUpload.id].calc(calcInputs)}
                        {selectedStdForUpload.targetType === 'percentage' ? '%' : ''}
                      </strong>
                    </div>
                  </div>
                )}

                <div className="form-group-full">
                  <label>Capaian Riil Saat Ini*</label>
                  <input
                    type="text"
                    placeholder="Masukkan angka atau teks kualitatif..."
                    value={selectedStdForUpload?.tempValue !== undefined ? selectedStdForUpload.tempValue : ''}
                    onChange={e => {
                      setSelectedStdForUpload({ ...selectedStdForUpload, tempValue: e.target.value });
                    }}
                    required
                  />
                </div>

                <div className="form-group-full">
                  <label>Link Bukti Fisik / SK Legalitas (Drive / URL)*</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={evidenceUrl}
                    onChange={e => setEvidenceUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-full">
                  <label>Simulasi File Upload (Pilih Berkas PDF/Excel)</label>
                  <div className="uploader-box" onClick={() => {
                    // simulate picking a file
                    setEvidenceFile({ name: `Bukti_Pelaksanaan_${selectedStdForUpload?.id}_2026.pdf` });
                    showToast('File Bukti_Pelaksanaan.pdf terpilih!');
                  }}>
                    <Upload size={24} className="uploader-icon" />
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {evidenceFile ? evidenceFile.name : 'Klik untuk simulasi unggah berkas PDF/Excel'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max file size: 10MB</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Batal</button>
                <button type="submit" className="btn btn-success">Kirim Data Capaian</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Resolve Ticket Evidence (Fase 4) */}
      {showResolveTicketModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="modal-close" onClick={() => setShowResolveTicketModal(null)}><X size={20} /></button>
            <div className="modal-header">
              <h3><CheckCircle2 size={20} color="var(--success)" /> Tindakan Perbaikan Mutu & Pemulihan</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Unggah bukti kepatuhan (evidence of compliance) untuk memulihkan indikator dan menutup tiket kerja digital.
              </p>
            </div>
            <form onSubmit={handleResolveTicket}>
              <div className="modal-body">
                <div style={{ background: 'rgba(239, 68, 68, 0.03)', borderLeft: '3px solid var(--danger)', padding: '12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>Masalah:</span> {showResolveTicketModal.description}
                  <br />
                  <span style={{ color: 'var(--text-secondary)' }}>Divisi routed:</span> {showResolveTicketModal.assignedToUnit}
                </div>

                <div className="form-group-full">
                  <label>URL Dokumen Bukti Penyelesaian / Kepatuhan Mutu*</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/bukti-penyelesaian..."
                    value={complianceEvidence}
                    onChange={e => setComplianceEvidence(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Unggahan ini akan otomatis meng-update capaian di Fase 2 agar memenuhi target IKU asli.
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResolveTicketModal(null)}>Batal</button>
                <button type="submit" className="btn btn-success">Selesaikan Tiket Mutu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Freeze Snapshot (Fase 5) */}
      {showVersionModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="modal-close" onClick={() => setShowVersionModal(false)}><X size={20} /></button>
            <div className="modal-header">
              <h3><History size={20} color="var(--primary)" /> Bekukan Snapshot Standard (Versioning)</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Mengunci schema standar saat ini. Data AMI masa lampau aman dari kerusakan referensi ketika target dinaikkan.
              </p>
            </div>
            <form onSubmit={handleCreateSnapshot}>
              <div className="modal-body">
                <div className="form-group-full">
                  <label>Nama Versi Snapshot*</label>
                  <input
                    type="text"
                    placeholder="Contoh: Versi Standard IKU Kampus 2026"
                    value={newVersionName}
                    onChange={e => setNewVersionName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVersionModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Bekukan Standard Sekarang</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Inspeksi Data Mentah API (SISTER / OBE) */}
      {showRawDataModal && rawJsonData && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '650px', width: '90%' }}>
            <button className="modal-close" onClick={() => setShowRawDataModal(false)}><X size={20} /></button>
            <div className="modal-header">
              <h3><Database size={20} color="var(--primary)" /> API Payload Mentah: {rawDataSource}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Response JSON mentah yang diterima dari API {rawDataSource} eksternal sebelum dievaluasi formula.
              </p>
            </div>
            <div className="modal-body">
              <div style={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '16px',
                maxHeight: '350px',
                overflowY: 'auto',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                color: '#38bdf8',
                whiteSpace: 'pre-wrap',
                textAlign: 'left'
              }}>
                {JSON.stringify(rawJsonData, null, 2)}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowRawDataModal(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
