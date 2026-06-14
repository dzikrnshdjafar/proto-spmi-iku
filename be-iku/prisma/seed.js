const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function readJSON(cycle) {
  const fileName = cycle === '2025' ? 'data_2025.json' : 'data.json';
  const filePath = path.join(__dirname, '..', fileName);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error reading ${fileName}:`, err);
  }
  return { standards: [], achievements: [], auditForms: [], tickets: [], historicalCycles: [], versions: [] };
}

async function seedCycle(cycle) {
  console.log(`Seeding cycle: ${cycle}...`);
  const data = readJSON(cycle);

  // 1. Seed Standards
  for (const std of data.standards || []) {
    await prisma.standard.upsert({
      where: {
        id_cycle: { id: std.id, cycle }
      },
      update: {
        rumpun: std.rumpun,
        nama: std.nama,
        formula: std.formula,
        targetType: std.targetType,
        targetValue: Number(std.targetValue) || 0,
        operator: std.operator,
        snDikti: std.snDikti,
        unitPenanggungJawab: std.unitPenanggungJawab
      },
      create: {
        id: std.id,
        cycle,
        rumpun: std.rumpun,
        nama: std.nama,
        formula: std.formula,
        targetType: std.targetType,
        targetValue: Number(std.targetValue) || 0,
        operator: std.operator,
        snDikti: std.snDikti,
        unitPenanggungJawab: std.unitPenanggungJawab
      }
    });
  }

  // 2. Seed Achievements
  for (const ach of data.achievements || []) {
    await prisma.achievement.upsert({
      where: {
        id_cycle: { id: ach.id, cycle }
      },
      update: {
        standardId: ach.standardId,
        actualValue: Number(ach.actualValue) || 0,
        evidenceUrl: ach.evidenceUrl || null,
        evidenceFileName: ach.evidenceFileName || null,
        lastUpdated: ach.lastUpdated ? new Date(ach.lastUpdated) : new Date(),
        syncSource: ach.syncSource || 'Manual Input'
      },
      create: {
        id: ach.id,
        cycle,
        standardId: ach.standardId,
        actualValue: Number(ach.actualValue) || 0,
        evidenceUrl: ach.evidenceUrl || null,
        evidenceFileName: ach.evidenceFileName || null,
        lastUpdated: ach.lastUpdated ? new Date(ach.lastUpdated) : new Date(),
        syncSource: ach.syncSource || 'Manual Input'
      }
    });
  }

  // 3. Seed Audit Forms
  for (const af of data.auditForms || []) {
    await prisma.auditForm.upsert({
      where: {
        id_cycle: { id: af.id, cycle }
      },
      update: {
        standardId: af.standardId,
        status: af.status,
        auditorNotes: af.auditorNotes,
        auditedAt: af.auditedAt ? new Date(af.auditedAt) : new Date(),
        auditorName: af.auditorName
      },
      create: {
        id: af.id,
        cycle,
        standardId: af.standardId,
        status: af.status,
        auditorNotes: af.auditorNotes,
        auditedAt: af.auditedAt ? new Date(af.auditedAt) : new Date(),
        auditorName: af.auditorName
      }
    });
  }

  // 4. Seed Tickets
  for (const ticket of data.tickets || []) {
    await prisma.ticket.upsert({
      where: {
        id_cycle: { id: ticket.id, cycle }
      },
      update: {
        standardId: ticket.standardId,
        auditId: ticket.auditId || null,
        description: ticket.description,
        parameterViolated: ticket.parameterViolated,
        recommendation: ticket.recommendation,
        assignedToUnit: ticket.assignedToUnit,
        slaDays: Number(ticket.slaDays) || 30,
        createdAt: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
        dueDate: ticket.dueDate ? new Date(ticket.dueDate) : new Date(),
        status: ticket.status,
        evidenceOfCompliance: ticket.evidenceOfCompliance || null,
        resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : null,
        escalated: !!ticket.escalated,
        escalationNotes: ticket.escalationNotes || null
      },
      create: {
        id: ticket.id,
        cycle,
        standardId: ticket.standardId,
        auditId: ticket.auditId || null,
        description: ticket.description,
        parameterViolated: ticket.parameterViolated,
        recommendation: ticket.recommendation,
        assignedToUnit: ticket.assignedToUnit,
        slaDays: Number(ticket.slaDays) || 30,
        createdAt: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
        dueDate: ticket.dueDate ? new Date(ticket.dueDate) : new Date(),
        status: ticket.status,
        evidenceOfCompliance: ticket.evidenceOfCompliance || null,
        resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : null,
        escalated: !!ticket.escalated,
        escalationNotes: ticket.escalationNotes || null
      }
    });
  }

  // 5. Seed Historical Cycles
  for (const hc of data.historicalCycles || []) {
    // Filter: Only allow 2025 as historical cycle for 2026, and none for 2025
    if (cycle === '2026' && hc.cycle !== 'Siklus 2025') {
      continue;
    }
    if (cycle === '2025') {
      continue; // 2025 has no history if we only use 2025 and 2026
    }

    const exists = await prisma.historicalCycle.findFirst({
      where: {
        cycle,
        historicalCycleName: hc.cycle,
        standardId: hc.standardId
      }
    });
    if (!exists) {
      await prisma.historicalCycle.create({
        data: {
          cycle,
          historicalCycleName: hc.cycle,
          standardId: hc.standardId,
          targetValue: Number(hc.targetValue) || 0,
          actualValue: Number(hc.actualValue) || 0
        }
      });
    }
  }

  // 6. Seed Versions
  for (const ver of data.versions || []) {
    const exists = await prisma.version.findFirst({
      where: {
        cycle,
        versionName: ver.versionName
      }
    });
    if (!exists) {
      await prisma.version.create({
        data: {
          cycle,
          versionName: ver.versionName,
          frozenAt: ver.frozenAt ? new Date(ver.frozenAt) : new Date(),
          standardsCount: Number(ver.standardsCount) || 0,
          standardsJson: ver.standards || []
        }
      });
    }
  }
}

async function main() {
  console.log('Starting seed...');
  try {
    // Clear all existing data first to avoid stale data
    console.log('Cleaning up existing database records...');
    await prisma.historicalCycle.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.auditForm.deleteMany({});
    await prisma.achievement.deleteMany({});
    await prisma.standard.deleteMany({});
    await prisma.version.deleteMany({});

    await seedCycle('2026');
    await seedCycle('2025');
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
