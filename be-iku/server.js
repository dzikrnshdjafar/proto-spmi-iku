const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

let UPLOADS_DIR = path.join(__dirname, 'uploads');

// Vercel Serverless environment compatibility (Writeable /tmp folder)
if (process.env.VERCEL) {
  UPLOADS_DIR = path.join('/tmp', 'uploads');
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

// Helper: Get raw data file path
function getRawFilePath(fileName) {
  const tmpPath = path.join('/tmp', fileName);
  if (process.env.VERCEL && fs.existsSync(tmpPath)) {
    return tmpPath;
  }
  return path.join(__dirname, fileName);
}

// Vercel Serverless environment compatibility (Seed initial files to /tmp)
if (process.env.VERCEL) {
  // Statically reference the files using string literals so Vercel's bundler (NFT)
  // knows to include them in the Serverless Function bundle.
  if (false) {
    path.join(__dirname, 'raw-sister.json');
    path.join(__dirname, 'raw-obe.json');
  }

  ['raw-sister.json', 'raw-obe.json'].forEach(file => {
    try {
      const tmpPath = path.join('/tmp', file);
      if (!fs.existsSync(tmpPath)) {
        const srcPath = path.join(__dirname, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, tmpPath);
          console.log(`Seeded initial ${file} to ${tmpPath}`);
        } else {
          console.warn(`Source file for seeding not found at: ${srcPath}`);
        }
      }
    } catch (err) {
      console.error(`Error copying initial ${file} to /tmp:`, err);
    }
  });
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
app.get('/api/standards', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  try {
    const standards = await prisma.standard.findMany({
      where: { cycle },
      orderBy: { id: 'asc' }
    });
    res.json(standards);
  } catch (err) {
    console.error('Error fetching standards:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/standards', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  const { id, rumpun, nama, formula, targetType, targetValue, operator, snDikti, unitPenanggungJawab } = req.body;

  try {
    let finalId = id;
    if (!finalId) {
      const count = await prisma.standard.count({ where: { cycle } });
      finalId = `IKU-${String(count + 1).padStart(3, '0')}`;
    }

    const targetValNum = Number(targetValue) || 0;

    const standard = await prisma.standard.upsert({
      where: {
        id_cycle: { id: finalId, cycle }
      },
      update: {
        rumpun,
        nama,
        formula,
        targetType,
        targetValue: targetValNum,
        operator,
        snDikti,
        unitPenanggungJawab
      },
      create: {
        id: finalId,
        cycle,
        rumpun,
        nama,
        formula,
        targetType,
        targetValue: targetValNum,
        operator,
        snDikti,
        unitPenanggungJawab
      }
    });

    res.status(201).json(standard);
  } catch (err) {
    console.error('Error saving standard:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/standards/:id', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  try {
    await prisma.standard.delete({
      where: {
        id_cycle: { id: req.params.id, cycle }
      }
    });
    res.json({ message: 'Standard deleted successfully' });
  } catch (err) {
    console.error('Error deleting standard:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Achievements (Fase 2: Pelaksanaan)
app.get('/api/achievements', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  try {
    const achievements = await prisma.achievement.findMany({
      where: { cycle },
      orderBy: { id: 'asc' }
    });
    res.json(achievements);
  } catch (err) {
    console.error('Error fetching achievements:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/achievements', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  const { standardId, actualValue, evidenceUrl, evidenceFileName } = req.body;

  try {
    const existing = await prisma.achievement.findFirst({
      where: { standardId, cycle }
    });

    const finalId = existing ? existing.id : `ACH-${String((await prisma.achievement.count({ where: { cycle } })) + 1).padStart(3, '0')}`;
    const actValNum = isNaN(Number(actualValue)) ? 0 : Number(actualValue);

    const achievement = await prisma.achievement.upsert({
      where: {
        id_cycle: { id: finalId, cycle }
      },
      update: {
        standardId,
        actualValue: actValNum,
        evidenceUrl: evidenceUrl || '',
        evidenceFileName: evidenceFileName || '',
        lastUpdated: new Date(),
        syncSource: 'Manual Input'
      },
      create: {
        id: finalId,
        cycle,
        standardId,
        actualValue: actValNum,
        evidenceUrl: evidenceUrl || '',
        evidenceFileName: evidenceFileName || '',
        lastUpdated: new Date(),
        syncSource: 'Manual Input'
      }
    });

    res.json(achievement);
  } catch (err) {
    console.error('Error saving achievement:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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

// Expose simulated raw data from SISTER/OBE
app.get('/api/raw-data/:source', (req, res) => {
  const { source } = req.params;
  const fileName = source.toLowerCase() === 'sister' ? 'raw-sister.json' : 'raw-obe.json';
  const filePath = getRawFilePath(fileName);

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return res.json(JSON.parse(raw));
    }
    return res.status(404).json({ error: `Raw data for ${source} not found` });
  } catch (err) {
    console.error(`Error reading raw data for ${source}:`, err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sync Simulation (SISTER or OBE System)
app.post('/api/sync-api/:source', async (req, res) => {
  const { source } = req.params;
  const cycle = req.headers['x-cycle'] || '2026';
  let updatedCount = 0;

  try {
    if (source === 'SISTER') {
      // Read raw SISTER JSON
      const sisterPath = getRawFilePath('raw-sister.json');
      if (!fs.existsSync(sisterPath)) {
        return res.status(404).json({ error: 'Raw SISTER data not found' });
      }
      const rawData = JSON.parse(fs.readFileSync(sisterPath, 'utf8'));

      // Calculate S3 Ratio: (Number of S3 active lecturers / Total active lecturers) * 100
      const activeLecturers = rawData.dataDosen.filter(d => d.statusAktif);
      const s3Lecturers = activeLecturers.filter(d => d.pendidikanTertinggi === 'S3');
      const calculatedValue = Math.round((s3Lecturers.length / activeLecturers.length) * 100);

      // Update IKU-004 (Rekognisi Kepakaran Dosen / Kualifikasi)
      const existing = await prisma.achievement.findFirst({
        where: { standardId: 'IKU-004', cycle }
      });
      const finalId = existing ? existing.id : 'ACH-004';

      await prisma.achievement.upsert({
        where: { id_cycle: { id: finalId, cycle } },
        update: {
          standardId: 'IKU-004',
          actualValue: calculatedValue,
          evidenceUrl: 'https://sister.kemdikbud.go.id/universitas/sister-sync',
          evidenceFileName: `SISTER_Sync_Snapshot_${new Date().toISOString().split('T')[0]}.pdf`,
          lastUpdated: new Date(),
          syncSource: 'SISTER API'
        },
        create: {
          id: finalId,
          cycle,
          standardId: 'IKU-004',
          actualValue: calculatedValue,
          evidenceUrl: 'https://sister.kemdikbud.go.id/universitas/sister-sync',
          evidenceFileName: `SISTER_Sync_Snapshot_${new Date().toISOString().split('T')[0]}.pdf`,
          lastUpdated: new Date(),
          syncSource: 'SISTER API'
        }
      });
      updatedCount++;
    } else if (source === 'OBE') {
      // Read raw OBE JSON
      const obePath = getRawFilePath('raw-obe.json');
      if (!fs.existsSync(obePath)) {
        return res.status(404).json({ error: 'Raw OBE data not found' });
      }
      const rawData = JSON.parse(fs.readFileSync(obePath, 'utf8'));

      // Calculate OBE Ratio: (Number of prodi with status 'OBE Implemented' / Total prodi) * 100
      const totalProdi = rawData.dataKurikulumProdi.length;
      const obeProdi = rawData.dataKurikulumProdi.filter(p => p.statusKurikulum === 'OBE Implemented').length;
      const calculatedValue = Math.round((obeProdi / totalProdi) * 100);

      // Update IKU-001 (AEE PT / Kurikulum OBE)
      const existing = await prisma.achievement.findFirst({
        where: { standardId: 'IKU-001', cycle }
      });
      const finalId = existing ? existing.id : 'ACH-001';

      await prisma.achievement.upsert({
        where: { id_cycle: { id: finalId, cycle } },
        update: {
          standardId: 'IKU-001',
          actualValue: calculatedValue,
          evidenceUrl: 'https://obe.kampus.ac.id/curriculum-api',
          evidenceFileName: `OBE_Export_${new Date().toISOString().split('T')[0]}.xlsx`,
          lastUpdated: new Date(),
          syncSource: 'OBE API'
        },
        create: {
          id: finalId,
          cycle,
          standardId: 'IKU-001',
          actualValue: calculatedValue,
          evidenceUrl: 'https://obe.kampus.ac.id/curriculum-api',
          evidenceFileName: `OBE_Export_${new Date().toISOString().split('T')[0]}.xlsx`,
          lastUpdated: new Date(),
          syncSource: 'OBE API'
        }
      });
      updatedCount++;
    }

    const achievements = await prisma.achievement.findMany({
      where: { cycle },
      orderBy: { id: 'asc' }
    });

    res.json({ message: `Fetched success from ${source} Sync. Updated ${updatedCount} indicator(s).`, achievements });
  } catch (err) {
    console.error(`Error during ${source} sync:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Audit & Discrepancy (Fase 3: Evaluasi)
app.get('/api/audit-forms', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  try {
    const auditForms = await prisma.auditForm.findMany({
      where: { cycle },
      orderBy: { id: 'asc' }
    });
    res.json(auditForms);
  } catch (err) {
    console.error('Error fetching audit forms:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Detect Discrepancies and Auto-generate tickets
app.post('/api/audit-forms/detect-discrepancy', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  const discrepancies = [];
  const generatedTickets = [];

  try {
    const standards = await prisma.standard.findMany({ where: { cycle } });
    const achievements = await prisma.achievement.findMany({ where: { cycle } });
    const auditForms = await prisma.auditForm.findMany({ where: { cycle } });
    const tickets = await prisma.ticket.findMany({ where: { cycle } });

    for (const std of standards) {
      const ach = achievements.find(a => a.standardId === std.id);
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
      let auditForm = auditForms.find(af => af.standardId === std.id);
      const auditorName = "System Audit Evaluator (Automated)";
      const auditedAt = new Date();

      let auditFormId = auditForm ? auditForm.id : `AUD-${String(auditForms.length + 1 + generatedTickets.length).padStart(3, '0')}`;
      let description = '';

      if (breached) {
        description = `Audit Temuan: ${std.nama} tidak memenuhi standar. Target: ${std.operator} ${std.targetValue}, Capaian Riil: ${actualStr}.`;

        await prisma.auditForm.upsert({
          where: { id_cycle: { id: auditFormId, cycle } },
          update: {
            standardId: std.id,
            status: "Checked",
            auditorNotes: description,
            auditedAt,
            auditorName
          },
          create: {
            id: auditFormId,
            cycle,
            standardId: std.id,
            status: "Checked",
            auditorNotes: description,
            auditedAt,
            auditorName
          }
        });

        discrepancies.push({
          standardId: std.id,
          nama: std.nama,
          target: `${std.operator} ${std.targetValue}`,
          actual: actualStr,
          unit: std.unitPenanggungJawab
        });

        // Auto Ticket Generation (Fase 4)
        const existingTicket = tickets.find(t => t.standardId === std.id && (t.status === 'Active' || t.status === 'Breached'));
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

          const ticketId = `TCK-${String(tickets.length + 1 + generatedTickets.length).padStart(3, '0')}`;
          const newTicket = await prisma.ticket.create({
            data: {
              id: ticketId,
              cycle,
              standardId: std.id,
              auditId: auditFormId,
              description: `Discrepancy detected for standard: ${std.nama}. Capaian riil ${actualStr} gagal memenuhi target ${std.operator} ${std.targetValue}.`,
              parameterViolated: `${std.nama} (${std.operator} ${std.targetValue})`,
              recommendation: `Lakukan koordinasi internal dan evaluasi operasional unit untuk memenuhi IKU ${std.id}.`,
              assignedToUnit,
              slaDays: 30,
              createdAt: auditedAt,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: "Active",
              evidenceOfCompliance: null,
              resolvedAt: null,
              escalated: false,
              escalationNotes: null
            }
          });
          generatedTickets.push(newTicket);
        }
      } else {
        // Standard is met, update existing ticket if any to "Resolved" automatically or allow manual close
        if (auditForm) {
          description = `Audit Lolos: Capaian ${actualStr} telah memenuhi target ${std.operator} ${std.targetValue}.`;
          await prisma.auditForm.update({
            where: { id_cycle: { id: auditForm.id, cycle } },
            data: {
              auditorNotes: description,
              auditedAt
            }
          });
        }
      }
    }

    // Handle auto escalations for overdue tickets
    const activeTickets = await prisma.ticket.findMany({
      where: { cycle, status: 'Active' }
    });

    for (const ticket of activeTickets) {
      const now = new Date();
      const due = new Date(ticket.dueDate);
      if (now > due) {
        await prisma.ticket.update({
          where: { id_cycle: { id: ticket.id, cycle } },
          data: {
            status: 'Breached',
            escalated: true,
            escalationNotes: 'SLA Terlampaui (Breached). Tiket otomatis dieksalasi ke Dashboard Rektor / Pimpinan Yayasan untuk intervensi struktural.'
          }
        });
      }
    }

    res.json({
      message: "Discrepancy scan completed.",
      discrepancyCount: discrepancies.length,
      discrepancies,
      newTicketsCount: generatedTickets.length,
      newTickets: generatedTickets
    });
  } catch (err) {
    console.error('Error during discrepancy scan:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Ticket Management (Fase 4: Pengendalian)
app.get('/api/tickets', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  try {
    const tickets = await prisma.ticket.findMany({
      where: { cycle },
      orderBy: { id: 'asc' }
    });
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Submit Ticket Resolution Evidence
app.post('/api/tickets/:id/resolve', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  const { evidenceOfCompliance } = req.body;
  const ticketId = req.params.id;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id_cycle: { id: ticketId, cycle } }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id_cycle: { id: ticketId, cycle } },
      data: {
        evidenceOfCompliance,
        status: 'Resolved',
        resolvedAt: new Date(),
        escalated: false
      }
    });

    // Also auto-update standard achievements
    const standard = await prisma.standard.findUnique({
      where: { id_cycle: { id: ticket.standardId, cycle } }
    });

    if (standard) {
      const existingAch = await prisma.achievement.findFirst({
        where: { standardId: standard.id, cycle }
      });

      const finalId = existingAch ? existingAch.id : `ACH-${String((await prisma.achievement.count({ where: { cycle } })) + 1).padStart(3, '0')}`;
      const resolvedValue = standard.targetValue;

      await prisma.achievement.upsert({
        where: { id_cycle: { id: finalId, cycle } },
        update: {
          actualValue: resolvedValue,
          evidenceUrl: evidenceOfCompliance,
          evidenceFileName: 'Evidence_Compliance_Resolved.pdf',
          lastUpdated: new Date(),
          syncSource: 'Compliance Resolution Upload'
        },
        create: {
          id: finalId,
          cycle,
          standardId: standard.id,
          actualValue: resolvedValue,
          evidenceUrl: evidenceOfCompliance,
          evidenceFileName: 'Evidence_Compliance_Resolved.pdf',
          lastUpdated: new Date(),
          syncSource: 'Compliance Resolution Upload'
        }
      });
    }

    res.json({ message: 'Ticket resolved successfully.', ticket: updatedTicket });
  } catch (err) {
    console.error('Error resolving ticket:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Manual Escalation to Rektor
app.post('/api/tickets/:id/escalate', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  const ticketId = req.params.id;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id_cycle: { id: ticketId, cycle } }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const updated = await prisma.ticket.update({
      where: { id_cycle: { id: ticketId, cycle } },
      data: {
        status: 'Breached',
        escalated: true,
        escalationNotes: "Eskalasi Manual oleh BPM. Tiket dikirim langsung ke Rektor / Ketua Pimpinan Yayasan untuk intervensi struktural segera."
      }
    });

    res.json({ message: 'Ticket escalated to Rektor dashboard.', ticket: updated });
  } catch (err) {
    console.error('Error escalating ticket:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Predictive Analytics & Versioning (Fase 5: Peningkatan)
app.get('/api/predictive-analytics', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  const recommendations = [];

  try {
    const standards = await prisma.standard.findMany({ where: { cycle } });
    const achievements = await prisma.achievement.findMany({ where: { cycle } });
    const historicalCycles = await prisma.historicalCycle.findMany({ where: { cycle } });

    standards.forEach(std => {
      // 1. Check current achievement
      const currentAch = achievements.find(a => a.standardId === std.id);
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
      const histories = historicalCycles.filter(h => h.standardId === std.id);
      const consistentPerformers = histories.length >= 1 && histories.every(h => h.actualValue >= h.targetValue);

      // If current is also met, and we have histories (or it's the premium curriculum OBE)
      if (currentStatusOk && (consistentPerformers || std.id === 'IKU-002')) {
        const suggestedRaise = Math.round(Number(target) * 1.15); // suggest 15% increase
        recommendations.push({
          standardId: std.id,
          nama: std.nama,
          currentTarget: target,
          currentActual: actual,
          historicalTrend: histories.length ? histories.map(h => `${h.historicalCycleName}: ${h.actualValue}%`).join(', ') : 'Siklus konsisten > 90%',
          suggestedTarget: suggestedRaise,
          deltaPercentage: '15%',
          reason: `Standar '${std.nama}' konsisten tercapai selama beberapa siklus. AI memprediksi delta positif dan merekomendasikan kenaikan target 15% untuk mencapai standar Terakreditasi Unggul/Internasional.`
        });
      }
    });

    res.json(recommendations);
  } catch (err) {
    console.error('Error fetching predictive analytics:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Version Snapshot (Freeze Standards)
app.get('/api/versions', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  try {
    const versions = await prisma.version.findMany({
      where: { cycle },
      orderBy: { frozenAt: 'desc' }
    });
    res.json(versions);
  } catch (err) {
    console.error('Error fetching versions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/standards/versioning/snapshot', async (req, res) => {
  const cycle = req.headers['x-cycle'] || '2026';
  const { versionName } = req.body;

  if (!versionName) {
    return res.status(400).json({ error: 'Version name is required' });
  }

  try {
    const standards = await prisma.standard.findMany({ where: { cycle } });

    const snapshot = await prisma.version.create({
      data: {
        cycle,
        versionName,
        frozenAt: new Date(),
        standardsCount: standards.length,
        standardsJson: standards
      }
    });

    res.status(201).json({ message: `Snapshot version '${versionName}' frozen successfully.`, snapshot });
  } catch (err) {
    console.error('Error creating snapshot:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`IKU Backend is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
