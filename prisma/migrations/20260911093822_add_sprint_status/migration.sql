-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "status" "SprintStatus" NOT NULL DEFAULT 'PLANNED';
