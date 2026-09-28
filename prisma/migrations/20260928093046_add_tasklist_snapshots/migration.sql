-- CreateTable
CREATE TABLE "TasklistSnapshot" (
    "id" TEXT NOT NULL,
    "tasklistId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tasks" JSONB NOT NULL,

    CONSTRAINT "TasklistSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TasklistSnapshot_tasklistId_idx" ON "TasklistSnapshot"("tasklistId");

-- CreateIndex
CREATE INDEX "TasklistSnapshot_tasklistId_type_idx" ON "TasklistSnapshot"("tasklistId", "type");

-- AddForeignKey
ALTER TABLE "TasklistSnapshot" ADD CONSTRAINT "TasklistSnapshot_tasklistId_fkey" FOREIGN KEY ("tasklistId") REFERENCES "DailyTasklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
