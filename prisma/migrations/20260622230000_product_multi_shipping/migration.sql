-- Step 1: Create the join table with composite PK and cascade FKs
CREATE TABLE "ProductShippingMethod" (
    "productId"        TEXT NOT NULL,
    "shippingMethodId" TEXT NOT NULL,

    CONSTRAINT "ProductShippingMethod_pkey" PRIMARY KEY ("productId","shippingMethodId"),
    CONSTRAINT "PSM_product_fk"  FOREIGN KEY ("productId")        REFERENCES "Product"("id")        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PSM_method_fk"   FOREIGN KEY ("shippingMethodId") REFERENCES "ShippingMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 2: Migrate existing FK data into the join table (preserves all assignments)
INSERT INTO "ProductShippingMethod" ("productId", "shippingMethodId")
    SELECT "id", "shippingMethodId"
    FROM "Product"
    WHERE "shippingMethodId" IS NOT NULL;

-- Step 3: Drop the now-redundant scalar FK column
ALTER TABLE "Product" DROP COLUMN "shippingMethodId";
