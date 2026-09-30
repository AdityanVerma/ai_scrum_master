/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AccessRole" AS ENUM ('SCRUM_MASTER', 'MEMBER');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "accessRole" "AccessRole" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passwordHash" TEXT;

-- CreateIndex
CREATE INDEX "Document_createdById_idx" ON "Document"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
