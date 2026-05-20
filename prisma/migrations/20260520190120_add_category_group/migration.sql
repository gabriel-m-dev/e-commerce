-- CreateEnum
CREATE TYPE "CategoryGroup" AS ENUM ('ROPA', 'ACCESORIOS', 'NONE');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "group" "CategoryGroup" NOT NULL DEFAULT 'NONE';
