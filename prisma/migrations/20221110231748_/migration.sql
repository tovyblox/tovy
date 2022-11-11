-- CreateTable
CREATE TABLE "_documentTorole" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_documentTorole_AB_unique" ON "_documentTorole"("A", "B");

-- CreateIndex
CREATE INDEX "_documentTorole_B_index" ON "_documentTorole"("B");

-- AddForeignKey
ALTER TABLE "_documentTorole" ADD CONSTRAINT "_documentTorole_A_fkey" FOREIGN KEY ("A") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_documentTorole" ADD CONSTRAINT "_documentTorole_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
