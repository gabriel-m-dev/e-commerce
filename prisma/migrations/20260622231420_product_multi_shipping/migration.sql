-- RenameForeignKey
ALTER TABLE "ProductShippingMethod" RENAME CONSTRAINT "PSM_method_fk" TO "ProductShippingMethod_shippingMethodId_fkey";

-- RenameForeignKey
ALTER TABLE "ProductShippingMethod" RENAME CONSTRAINT "PSM_product_fk" TO "ProductShippingMethod_productId_fkey";
