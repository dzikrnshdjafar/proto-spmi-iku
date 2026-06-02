const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

let DATA_FILE = path.join(__dirname, 'data.json');
let UPLOADS_DIR = path.join(__dirname, 'uploads');

// Vercel Serverless environment compatibility (Writeable /tmp folder)
if (process.env.VERCEL) {
  DATA_FILE = path.join('/tmp', 'data.json');
  UPLOADS_DIR = path.join('/tmp', 'uploads');
  
  // Seed initial data.json to /tmp if it does not exist there yet
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialDataPath = path.join(__dirname, 'data.json');
      if (fs.existsSync(initialDataPath)) {
        fs.copyFileSync(initialDataPath, DATA_FILE);
        console.log('Seeded initial data.json to /tmp/data.json');
      }
    }
  } catch (err) {
    console.error('Error copying initial data to /tmp:', err);
  }
}

// Create uploads directory if not exists (inside try/catch to avoid EROFS crash)
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create uploads directory:', err.message);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Read Data
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { standards: [], achievements: [], auditForms: [], tickets: [], historicalCycles: [], versions: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data file:', err);
    return { standards: [], achievements: [], auditForms: [], tickets: [], historicalCycles: [], versions: [] };
  }
}

// Helper: Write Data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data file:', err);
    return false;
  }
}

// Multer Config for Evidence Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// --- ROUTES ---

app.get('/', (req, res) => {
  res.json({ message: "SPMI IKU Intelligent Deviation Router API is active and running." });
});

// 1. Standards (Fase 1: Penetapan)
app.get('/api/standards', (req, res) => {
  const data = readData();
  res.json(data.standards);
});

app.post('/api/standards', (req, res) => {
  const data = readData();
  const { id, rumpun, nama, formula, targetType, targetValue, operator, snDikti, unitPenanggungJawab } = req.body;

  const newStandard = {
    id: id || `IKU-${String(data.standards.length + 1).padStart(3, '0')}`,
    rumpun,
    nama,
    formula,
    targetType,
    targetValue: Number(targetValue) || targetValue,
    operator,
    snDikti,
    unitPenanggungJawab
  };

  // Check if update or insert
  const idx = data.standards.findIndex(s => s.id === newStandard.id);
  if (idx > -1) {
    data.standards[idx] = newStandard;
  } else {
    data.standards.push(newStandard);
  }

  writeData(data);
  res.status(201).json(newStandard);
});

app.delete('/api/standards/:id', (req, res) => {
  const data = readData();
  const filtered = data.standards.filter(s => s.id !== req.params.id);
  data.standards = filtered;
  writeData(data);
  res.json({ message: 'Standard deleted successfully' });
});

// 2. Achievements (Fase 2: Pelaksanaan)
app.get('/api/achievements', (req, res) => {
  const data = readData();
  res.json(data.achievements);
});

app.post('/api/achievements', (req, res) => {
  const data = readData();
  const { standardId, actualValue, evidenceUrl, evidenceFileName } = req.body;

  const existingIdx = data.achievements.findIndex(a => a.standardId === standardId);
  const achievement = {
    id: existingIdx > -1 ? data.achievements[existingIdx].id : `ACH-${String(data.achievements.length + 1).padStart(3, '0')}`,
    standardId,
    actualValue: isNaN(Number(actualValue)) ? actualValue : Number(actualValue),
    evidenceUrl: evidenceUrl || '',
    evidenceFileName: evidenceFileName || '',
    lastUpdated: new Date().toISOString(),
    syncSource: 'Manual Input'
  };

  if (existingIdx > -1) {
    data.achievements[existingIdx] = achievement;
  } else {
    data.achievements.push(achievement);
  }

  writeData(data);
  res.json(achievement);
});

// Evidence File Upload
app.post('/api/upload-evidence', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    filePath: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname
  });
});

// Sync Simulation (SISTER or OBE System)
app.post('/api/sync-api/:source', (req, res) => {
  const { source } = req.params;
  const data = readData();
  let updatedCount = 0;

  if (source === 'SISTER') {
    // SISTER handles lecturers qualification IKU-001
    const s1Index = data.achievements.findIndex(a => a.standardId === 'IKU-001');
    // Simulate updating S3 lecturer percentage from 32% to 42% (or higher, crossing the 40% threshold!)
    const newValue = Math.floor(Math.random() * (46 - 38 + 1)) + 38; // between 38 and 46
    const updatedAchievement = {
      id: s1Index > -1 ? data.achievements[s1Index].id : 'ACH-001',
      standardId: 'IKU-001',
      actualValue: newValue,
      evidenceUrl: 'https://sister.kemdikbud.go.id/universitas/sister-sync',
      evidenceFileName: `SISTER_Sync_Snapshot_${new Date().toISOString().split('T')[0]}.pdf`,
      lastUpdated: new Date().toISOString(),
      syncSource: 'SISTER API'
    };

    if (s1Index > -1) {
      data.achievements[s1Index] = updatedAchievement;
    } else {
      data.achievements.push(updatedAchievement);
    }
    updatedCount++;
  } else if (source === 'OBE') {
    // OBE system updates IKU-002
    const s2Index = data.achievements.findIndex(a => a.standardId === 'IKU-002');
    const newValue = Math.floor(Math.random() * (100 - 85 + 1)) + 85; // between 85 and 100
    const updatedAchievement = {
      id: s2Index > -1 ? data.achievements[s2Index].id : 'ACH-002',
      standardId: 'IKU-002',
      actualValue: newValue,
      evidenceUrl: 'https://obe.kampus.ac.id/curriculum-api',
      evidenceFileName: `OBE_Export_${new Date().toISOString().split('T')[0]}.xlsx`,
      lastUpdated: new Date().toISOString(),
      syncSource: 'OBE API'
    };

    if (s2Index > -1) {
      data.achievements[s2Index] = updatedAchievement;
    } else {
      data.achievements.push(updatedAchievement);
    }
    updatedCount++;
  }

  writeData(data);
  res.json({ message: `Fetched success from ${source} Sync. Updated ${updatedCount} indicator(s).`, achievements: data.achievements });
});

// 3. Audit & Discrepancy (Fase 3: Evaluasi)
app.get('/api/audit-forms', (req, res) => {
  const data = readData();
  res.json(data.auditForms);
});

// Detect Discrepancies and Auto-generate tickets
app.post('/api/audit-forms/detect-discrepancy', (req, res) => {
  const data = readData();
  const discrepancies = [];
  const generatedTickets = [];

  data.standards.forEach(std => {
    const ach = data.achievements.find(a => a.standardId === std.id);
    let breached = false;
    let actualStr = 'N/A';

    if (!ach) {
      breached = true;
    } else {
      const target = std.targetValue;
      const actual = ach.actualValue;
      actualStr = String(actual);

      if (std.targetType === 'percentage' || std.targetType === 'number') {
        const actNum = Number(actual);
        const tgtNum = Number(target);
        if (std.operator === '>=') {
          breached = actNum < tgtNum;
        } else if (std.operator === '<=') {
          breached = actNum > tgtNum;
        } else if (std.operator === '>') {
          breached = actNum <= tgtNum;
        } else if (std.operator === '<') {
          breached = actNum >= tgtNum;
        }
      } else if (std.targetType === 'text') {
        if (std.operator === 'equals') {
          breached = String(actual).toLowerCase().trim() !== String(target).toLowerCase().trim();
        }
      }
    }

    // Auto borang creation or updates
    let auditForm = data.auditForms.find(af => af.standardId === std.id);
    const auditorName = "System Audit Evaluator (Automated)";
    const auditedAt = new Date().toISOString();

    if (breached) {
      const description = `Audit Temuan: ${std.nama} tidak memenuhi standar. Target: ${std.operator} ${std.targetValue}, Capaian Riil: ${actualStr}.`;
      
      if (!auditForm) {
        auditForm = {
          id: `AUD-${String(data.auditForms.length + 1).padStart(3, '0')}`,
          standardId: std.id,
          status: "Checked",
          auditorNotes: description,
          auditedAt,
          auditorName
        };
        data.auditForms.push(auditForm);
      } else {
        auditForm.status = "Checked";
        auditForm.auditorNotes = description;
        auditForm.auditedAt = auditedAt;
      }

      discrepancies.push({
        standardId: std.id,
        nama: std.nama,
        target: `${std.operator} ${std.targetValue}`,
        actual: actualStr,
        unit: std.unitPenanggungJawab
      });

      // Auto Ticket Generation (Fase 4)
      // Check if ticket already exists for this breach
      const existingTicket = data.tickets.find(t => t.standardId === std.id && (t.status === 'Active' || t.status === 'Breached'));
      if (!existingTicket) {
        // Intelligent Routing Engine Mapping
        let assignedToUnit = "BPM (Badan Penjamin Mutu) Pusat";
        if (std.id === 'IKU-001') {
          assignedToUnit = "Lembaga Konsultan Pengembangan Karier Dosen (Unit 4)";
        } else if (std.id === 'IKU-002') {
          assignedToUnit = "Lembaga Pengembangan Pembelajaran & Penjaminan Mutu";
        } else if (std.id === 'IKU-003' || std.id === 'IKU-004') {
          assignedToUnit = "Lembaga Penelitian & Pengabdian Masyarakat";
        } else if (std.id === 'IKU-005') {
          assignedToUnit = "Badan Penjaminan Mutu";
        } else if (std.id === 'IKU-006') {
          assignedToUnit = "Kantor Akuntan Publik (Unit 6)";
        } else if (std.id === 'IKU-007') {
          assignedToUnit = "Pusat Karier & Alumni";
        } else if (std.id === 'IKU-008') {
          assignedToUnit = "Biro Administrasi Kepegawaian";
        } else if (std.id === 'IKU-009') {
          assignedToUnit = "Biro Sarana dan Prasarana";
        } else if (std.nama.toLowerCase().includes('legal') || std.nama.toLowerCase().includes('hukum') || std.nama.toLowerCase().includes('sk')) {
          assignedToUnit = "Lembaga Konsultan Bantuan Hukum Perguruan Tinggi (Unit 3)";
        }

        const newTicket = {
          id: `TCK-${String(data.tickets.length + 1).padStart(3, '0')}`,
          standardId: std.id,
          auditId: auditForm.id,
          description: `Discrepancy detected for standard: ${std.nama}. Capaian riil ${actualStr} gagal memenuhi target ${std.operator} ${std.targetValue}.`,
          parameterViolated: `${std.nama} (${std.operator} ${std.targetValue})`,
          recommendation: `Lakukan koordinasi internal dan evaluasi operasional unit untuk memenuhi IKU ${std.id}.`,
          assignedToUnit,
          slaDays: 30,
          createdAt: auditedAt,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Active",
          evidenceOfCompliance: null,
          resolvedAt: null,
          escalated: false,
          escalationNotes: null
        };
        
        data.tickets.push(newTicket);
        generatedTickets.push(newTicket);
      }
    } else {
      // Standard is met, update existing ticket if any to "Resolved" automatically or allow manual close
      if (auditForm) {
        auditForm.auditorNotes = `Audit Lolos: Capaian ${actualStr} telah memenuhi target ${std.operator} ${std.targetValue}.`;
        auditForm.auditedAt = auditedAt;
      }
    }
  });

  // Handle auto escalations for overdue tickets
  data.tickets.forEach(ticket => {
    if (ticket.status === 'Active') {
      const now = new Date();
      const due = new Date(ticket.dueDate);
      if (now > due) {
        ticket.status = 'Breached';
        ticket.escalated = true;
        ticket.escalationNotes = 'SLA Terlampaui (Breached). Tiket otomatis dieksalasi ke Dashboard Rektor / Pimpinan Yayasan untuk intervensi struktural.';
      }
    }
  });

  writeData(data);
  res.json({
    message: "Discrepancy scan completed.",
    discrepancyCount: discrepancies.length,
    discrepancies,
    newTicketsCount: generatedTickets.length,
    newTickets: generatedTickets
  });
});

// 4. Ticket Management (Fase 4: Pengendalian)
app.get('/api/tickets', (req, res) => {
  const data = readData();
  res.json(data.tickets);
});

// Submit Ticket Resolution Evidence
app.post('/api/tickets/:id/resolve', (req, res) => {
  const data = readData();
  const { evidenceOfCompliance } = req.body;
  const ticket = data.tickets.find(t => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  ticket.evidenceOfCompliance = evidenceOfCompliance;
  ticket.status = 'Resolved';
  ticket.resolvedAt = new Date().toISOString();
  ticket.escalated = false;

  // Also auto-update standard achievements
  const standard = data.standards.find(s => s.id === ticket.standardId);
  if (standard) {
    const achIdx = data.achievements.findIndex(a => a.standardId === standard.id);
    
    // We assume the evidence of compliance successfully resolves the indicator target
    const resolvedValue = standard.targetValue; // Set actual to target to simulate completion
    
    const achievement = {
      id: achIdx > -1 ? data.achievements[achIdx].id : `ACH-${String(data.achievements.length + 1).padStart(3, '0')}`,
      standardId: standard.id,
      actualValue: resolvedValue,
      evidenceUrl: evidenceOfCompliance,
      evidenceFileName: 'Evidence_Compliance_Resolved.pdf',
      lastUpdated: new Date().toISOString(),
      syncSource: 'Compliance Resolution Upload'
    };

    if (achIdx > -1) {
      data.achievements[achIdx] = achievement;
    } else {
      data.achievements.push(achievement);
    }
  }

  writeData(data);
  res.json({ message: 'Ticket resolved successfully.', ticket });
});

// Manual Escalation to Rektor
app.post('/api/tickets/:id/escalate', (req, res) => {
  const data = readData();
  const ticket = data.tickets.find(t => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  ticket.escalated = true;
  ticket.escalationNotes = "Eskalasi Manual oleh BPM. Tiket dikirim langsung ke Rektor / Ketua Pimpinan Yayasan untuk intervensi struktural segera.";
  
  writeData(data);
  res.json({ message: 'Ticket escalated to Rektor dashboard.', ticket });
});

// 5. Predictive Analytics & Versioning (Fase 5: Peningkatan)
app.get('/api/predictive-analytics', (req, res) => {
  const data = readData();
  const recommendations = [];

  // Look for consistently achieved targets (we mock/analyze the historicalCycles + current achievements)
  data.standards.forEach(std => {
    // 1. Check current achievement
    const currentAch = data.achievements.find(a => a.standardId === std.id);
    if (!currentAch) return;

    const actual = currentAch.actualValue;
    const target = std.targetValue;

    let currentStatusOk = false;
    if (std.targetType === 'percentage' || std.targetType === 'number') {
      if (std.operator === '>=') currentStatusOk = Number(actual) >= Number(target);
      else if (std.operator === '<=') currentStatusOk = Number(actual) <= Number(target);
    } else {
      currentStatusOk = String(actual).toLowerCase() === String(target).toLowerCase();
    }

    // 2. Check history (simulating 3 cycles of consistent target hitting)
    const histories = data.historicalCycles.filter(h => h.standardId === std.id);
    const consistentPerformers = histories.length >= 2 && histories.every(h => h.actualValue >= h.targetValue);

    // If current is also met, and we have histories (or it's the premium curriculum OBE)
    if (currentStatusOk && (consistentPerformers || std.id === 'IKU-002')) {
      const suggestedRaise = Math.round(Number(target) * 1.15); // suggest 15% increase
      recommendations.push({
        standardId: std.id,
        nama: std.nama,
        currentTarget: target,
        currentActual: actual,
        historicalTrend: histories.length ? histories.map(h => `${h.cycle}: ${h.actualValue}%`).join(', ') : 'Siklus konsisten > 90%',
        suggestedTarget: suggestedRaise,
        deltaPercentage: '15%',
        reason: `Standar '${std.nama}' konsisten tercapai selama beberapa siklus. AI memprediksi delta positif dan merekomendasikan kenaikan target 15% untuk mencapai standar Terakreditasi Unggul/Internasional.`
      });
    }
  });

  res.json(recommendations);
});

// Version Snapshot (Freeze Standards)
app.get('/api/versions', (req, res) => {
  const data = readData();
  res.json(data.versions);
});

app.post('/api/standards/versioning/snapshot', (req, res) => {
  const data = readData();
  const { versionName } = req.body;

  if (!versionName) {
    return res.status(400).json({ error: 'Version name is required' });
  }

  const snapshot = {
    versionName,
    frozenAt: new Date().toISOString(),
    standardsCount: data.standards.length,
    standards: JSON.parse(JSON.stringify(data.standards)) // Deep copy current standards
  };

  data.versions.push(snapshot);
  writeData(data);

  res.status(201).json({ message: `Snapshot version '${versionName}' frozen successfully.`, snapshot });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`IKU Backend is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
