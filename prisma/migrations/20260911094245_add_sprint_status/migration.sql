-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- AlterTable
ALTER TABLE "SprintTask" ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';
