-- AlterTable: add nullable color column to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "color" TEXT;

-- CreateIndex: add email index to Order for search performance
CREATE INDEX "Order_email_idx" ON "Order"("email");
