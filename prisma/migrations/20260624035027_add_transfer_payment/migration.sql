-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PENDING_TRANSFER';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" TEXT;
