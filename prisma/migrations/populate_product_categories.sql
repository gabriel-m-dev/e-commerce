-- One-shot data migration: populate ProductCategory from existing Product.categoryId
-- Every existing product gets one ProductCategory row with isPrimary = true.
-- Run ONCE after migration 20260622052216_add_product_category_join_table has been applied.
-- Safe to re-run (ON CONFLICT DO NOTHING).

INSERT INTO "ProductCategory" ("productId", "categoryId", "isPrimary")
SELECT "id", "categoryId", true
FROM "Product"
ON CONFLICT ("productId", "categoryId") DO NOTHING;
