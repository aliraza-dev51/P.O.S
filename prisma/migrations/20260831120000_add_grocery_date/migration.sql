ALTER TABLE "grocery_items"
ADD COLUMN "entryDate" TIMESTAMP(3);

UPDATE "grocery_items"
SET "entryDate" = "createdAt"
WHERE "entryDate" IS NULL;

ALTER TABLE "grocery_items"
ALTER COLUMN "entryDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "entryDate" SET NOT NULL;

CREATE INDEX "grocery_items_userId_entryDate_idx"
ON "grocery_items"("userId", "entryDate");
