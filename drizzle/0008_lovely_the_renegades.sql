ALTER TABLE `company_products` ADD `imageUrls` text;--> statement-breakpoint
ALTER TABLE `discount_offers` ADD `productId` int;--> statement-breakpoint
CREATE INDEX `discount_offers_product_idx` ON `discount_offers` (`productId`);