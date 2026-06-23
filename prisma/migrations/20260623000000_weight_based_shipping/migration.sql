-- Migration: weight_based_shipping
-- Replace fixed `price Int` on ShippingMethod with four USD formula Float fields.
-- Add `weightKg Float?` (nullable) to Product.
-- Strategy: add new columns with DEFAULT 0 first, then drop price.

-- Step 1: Add formula columns to ShippingMethod with DEFAULT 0 (handles existing rows)
ALTER TABLE "ShippingMethod" ADD COLUMN "baseWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "ShippingMethod" ADD COLUMN "baseCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "ShippingMethod" ADD COLUMN "additionalCostPerKgUsd" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "ShippingMethod" ADD COLUMN "additionalUnitKg" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Step 2: Add weightKg (nullable) to Product
ALTER TABLE "Product" ADD COLUMN "weightKg" DOUBLE PRECISION;

-- Step 3: Drop price from ShippingMethod
ALTER TABLE "ShippingMethod" DROP COLUMN "price";

-- Step 4: Remove DEFAULT constraints so columns are plain NOT NULL (Prisma schema has no default)
ALTER TABLE "ShippingMethod" ALTER COLUMN "baseWeightKg" DROP DEFAULT;
ALTER TABLE "ShippingMethod" ALTER COLUMN "baseCostUsd" DROP DEFAULT;
ALTER TABLE "ShippingMethod" ALTER COLUMN "additionalCostPerKgUsd" DROP DEFAULT;
ALTER TABLE "ShippingMethod" ALTER COLUMN "additionalUnitKg" DROP DEFAULT;
