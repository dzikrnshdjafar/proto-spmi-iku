-- Create Table Standard
CREATE TABLE "Standard" (
    "id" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "rumpun" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "operator" TEXT NOT NULL,
    "snDikti" TEXT NOT NULL,
    "unitPenanggungJawab" TEXT NOT NULL,

    CONSTRAINT "Standard_pkey" PRIMARY KEY ("id", "cycle")
);

-- Create Table Achievement
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "evidenceUrl" TEXT,
    "evidenceFileName" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncSource" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id", "cycle"),
    CONSTRAINT "Achievement_standardId_cycle_fkey" FOREIGN KEY ("standardId", "cycle") REFERENCES "Standard"("id", "cycle") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Table AuditForm
CREATE TABLE "AuditForm" (
    "id" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "auditorNotes" TEXT NOT NULL,
    "auditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditorName" TEXT NOT NULL,

    CONSTRAINT "AuditForm_pkey" PRIMARY KEY ("id", "cycle"),
    CONSTRAINT "AuditForm_standardId_cycle_fkey" FOREIGN KEY ("standardId", "cycle") REFERENCES "Standard"("id", "cycle") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Table Ticket
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "auditId" TEXT,
    "description" TEXT NOT NULL,
    "parameterViolated" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "assignedToUnit" TEXT NOT NULL,
    "slaDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "evidenceOfCompliance" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalationNotes" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id", "cycle"),
    CONSTRAINT "Ticket_standardId_cycle_fkey" FOREIGN KEY ("standardId", "cycle") REFERENCES "Standard"("id", "cycle") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Table HistoricalCycle
CREATE TABLE "HistoricalCycle" (
    "id" SERIAL NOT NULL,
    "cycle" TEXT NOT NULL,
    "historicalCycleName" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HistoricalCycle_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "HistoricalCycle_standardId_cycle_fkey" FOREIGN KEY ("standardId", "cycle") REFERENCES "Standard"("id", "cycle") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Table Version
CREATE TABLE "Version" (
    "id" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "frozenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "standardsCount" INTEGER NOT NULL,
    "standardsJson" JSONB NOT NULL,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);
