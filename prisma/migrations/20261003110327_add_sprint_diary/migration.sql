-- CreateEnum
CREATE TYPE "TimeOffType" AS ENUM ('LEAVE', 'PUBLIC_HOLIDAY');

-- CreateEnum
CREATE TYPE "DiaryStatus" AS ENUM ('RED', 'ORANGE', 'GREEN');

-- CreateTable
CREATE TABLE "TimeOff" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "TimeOffType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintDiary" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "phase" TEXT NOT NULL DEFAULT '',
    "macroScope" TEXT NOT NULL DEFAULT '',
    "microScope" TEXT NOT NULL DEFAULT '',
    "status" "DiaryStatus",
    "publishedText" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintDiary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimeOff_memberId_idx" ON "TimeOff"("memberId");

-- CreateIndex
CREATE INDEX "TimeOff_endDate_idx" ON "TimeOff"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "SprintDiary_date_key" ON "SprintDiary"("date");

-- AddForeignKey
ALTER TABLE "TimeOff" ADD CONSTRAINT "TimeOff_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintDiary" ADD CONSTRAINT "SprintDiary_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
