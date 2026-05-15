-- CreateEnum
CREATE TYPE "Brand" AS ENUM ('NIKE', 'JORDAN', 'ADIDAS', 'OTROS');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "trackingNumber" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" "Brand" NOT NULL DEFAULT 'OTROS';

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");
