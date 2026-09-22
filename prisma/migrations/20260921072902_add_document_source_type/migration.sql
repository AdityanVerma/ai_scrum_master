-- CreateEnum
CREATE TYPE "DocumentSourceType" AS ENUM ('DOCUMENT', 'LINK');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "sourceType" "DocumentSourceType" NOT NULL DEFAULT 'DOCUMENT',
ADD COLUMN     "url" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
