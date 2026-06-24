-- CreateEnum
CREATE TYPE "Supplier" AS ENUM ('GM', 'KIT', 'S23', 'ADJ');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingBreakdown" JSONB;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "supplier" "Supplier";
