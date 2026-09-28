-- CreateTable
CREATE TABLE "DailyTasklist" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTasklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TasklistTask" (
    "id" TEXT NOT NULL,
    "tasklistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedMins" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "parentTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TasklistTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyTasklist_memberId_idx" ON "DailyTasklist"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTasklist_memberId_date_key" ON "DailyTasklist"("memberId", "date");

-- CreateIndex
CREATE INDEX "TasklistTask_tasklistId_idx" ON "TasklistTask"("tasklistId");

-- AddForeignKey
ALTER TABLE "DailyTasklist" ADD CONSTRAINT "DailyTasklist_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TasklistTask" ADD CONSTRAINT "TasklistTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "TasklistTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TasklistTask" ADD CONSTRAINT "TasklistTask_tasklistId_fkey" FOREIGN KEY ("tasklistId") REFERENCES "DailyTasklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
