CREATE TABLE `ai_assist_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentId` int NOT NULL,
	`kind` enum('home_refresh','personal_style','footwear_fit','inspiration') NOT NULL,
	`inputImageKey` varchar(500),
	`inputImageUrl` text,
	`brief` text NOT NULL,
	`city` varchar(80) NOT NULL,
	`budgetKes` int NOT NULL,
	`sizeProfile` varchar(500),
	`outputJson` text,
	`generatedImageUrl` text,
	`status` enum('draft','processing','complete','failed','revoked') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_assist_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_image_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('home_refresh','personal_style','footwear_fit','inspiration') NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `ai_image_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commerce_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyId` int NOT NULL,
	`productId` int NOT NULL,
	`deliveryQuoteId` int,
	`paymentOrderId` int,
	`quantity` int NOT NULL DEFAULT 1,
	`merchandiseSubtotalKes` int NOT NULL,
	`commissionRatePct` int NOT NULL,
	`commissionKes` int NOT NULL,
	`sellerSettlementKes` int NOT NULL,
	`deliveryKes` int NOT NULL,
	`customerTotalKes` int NOT NULL,
	`status` enum('draft','awaiting_payment','paid','processing','delivered','cancelled','refunded') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerce_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` enum('apparel','footwear','home','accessory') NOT NULL,
	`description` text NOT NULL,
	`priceKes` int NOT NULL,
	`imageUrl` text,
	`sizeOptions` text,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delivery_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`destinationCity` varchar(80) NOT NULL,
	`distanceBand` enum('same_neighbourhood','same_city','national') NOT NULL,
	`deliveryKes` int NOT NULL,
	`providerLabel` varchar(120) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verified_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`companyId` int NOT NULL,
	`productId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` varchar(1000),
	`status` enum('pending','published','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verified_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `verified_reviews_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE INDEX `ai_assist_requests_user_idx` ON `ai_assist_requests` (`userId`);--> statement-breakpoint
CREATE INDEX `ai_assist_requests_status_idx` ON `ai_assist_requests` (`status`);--> statement-breakpoint
CREATE INDEX `ai_image_consents_user_idx` ON `ai_image_consents` (`userId`);--> statement-breakpoint
CREATE INDEX `commerce_orders_user_idx` ON `commerce_orders` (`userId`);--> statement-breakpoint
CREATE INDEX `commerce_orders_company_idx` ON `commerce_orders` (`companyId`);--> statement-breakpoint
CREATE INDEX `commerce_orders_status_idx` ON `commerce_orders` (`status`);--> statement-breakpoint
CREATE INDEX `company_products_company_idx` ON `company_products` (`companyId`);--> statement-breakpoint
CREATE INDEX `company_products_category_idx` ON `company_products` (`category`);--> statement-breakpoint
CREATE INDEX `company_products_active_idx` ON `company_products` (`isActive`);--> statement-breakpoint
CREATE INDEX `delivery_quotes_product_idx` ON `delivery_quotes` (`productId`);--> statement-breakpoint
CREATE INDEX `delivery_quotes_city_idx` ON `delivery_quotes` (`destinationCity`);--> statement-breakpoint
CREATE INDEX `verified_reviews_company_idx` ON `verified_reviews` (`companyId`);--> statement-breakpoint
CREATE INDEX `verified_reviews_product_idx` ON `verified_reviews` (`productId`);--> statement-breakpoint
CREATE INDEX `verified_reviews_status_idx` ON `verified_reviews` (`status`);