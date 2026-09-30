-- AlterTable
ALTER TABLE "SprintFunction" ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "targetDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SprintTask" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Development',
ADD COLUMN     "functionId" TEXT;

-- AlterTable
ALTER TABLE "TasklistTask" ADD COLUMN     "spentMins" INTEGER,
ADD COLUMN     "sprintTaskId" TEXT,
ADD COLUMN     "totalEstimateMins" INTEGER;

-- CreateTable
CREATE TABLE "ProgressMark" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "functionId" TEXT,
    "category" TEXT,
    "scope" TEXT NOT NULL,
    "mark" INTEGER NOT NULL,
    "reachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgressMark_sprintId_scope_mark_key" ON "ProgressMark"("sprintId", "scope", "mark");

-- CreateIndex
CREATE INDEX "SprintTask_functionId_idx" ON "SprintTask"("functionId");

-- CreateIndex
CREATE INDEX "TasklistTask_sprintTaskId_idx" ON "TasklistTask"("sprintTaskId");

-- AddForeignKey
ALTER TABLE "SprintTask" ADD CONSTRAINT "SprintTask_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "SprintFunction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressMark" ADD CONSTRAINT "ProgressMark_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressMark" ADD CONSTRAINT "ProgressMark_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "SprintFunction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TasklistTask" ADD CONSTRAINT "TasklistTask_sprintTaskId_fkey" FOREIGN KEY ("sprintTaskId") REFERENCES "SprintTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
