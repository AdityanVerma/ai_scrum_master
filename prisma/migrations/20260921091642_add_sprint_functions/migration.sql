-- CreateTable
CREATE TABLE "SprintFunction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sprintId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintFunction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentFunctionRelation" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentFunctionRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SprintFunction_sprintId_name_key" ON "SprintFunction"("sprintId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentFunctionRelation_documentId_functionId_key" ON "DocumentFunctionRelation"("documentId", "functionId");

-- AddForeignKey
ALTER TABLE "SprintFunction" ADD CONSTRAINT "SprintFunction_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFunctionRelation" ADD CONSTRAINT "DocumentFunctionRelation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFunctionRelation" ADD CONSTRAINT "DocumentFunctionRelation_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "SprintFunction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
