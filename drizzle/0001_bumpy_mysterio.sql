CREATE TABLE `build_board_selections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`buildId` int,
	`vendorId` int,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `build_board_selections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `build_share_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shareId` int NOT NULL,
	`buildId` int,
	`vendorId` int,
	`sortOrder` int NOT NULL,
	CONSTRAINT `build_share_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `build_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shareToken` varchar(48) NOT NULL,
	`title` varchar(160) NOT NULL,
	`summary` text,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `build_shares_id` PRIMARY KEY(`id`),
	CONSTRAINT `build_shares_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `curated_build_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buildId` int NOT NULL,
	`vendorId` int,
	`label` varchar(140) NOT NULL,
	`category` varchar(80) NOT NULL,
	`estimatedCostKes` int NOT NULL,
	`note` text NOT NULL,
	`sortOrder` int NOT NULL,
	CONSTRAINT `curated_build_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `curated_builds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`title` varchar(160) NOT NULL,
	`city` varchar(80) NOT NULL,
	`lifestyle` varchar(100) NOT NULL,
	`aesthetic` varchar(100) NOT NULL,
	`priority` varchar(100) NOT NULL,
	`totalMinKes` int NOT NULL,
	`totalMaxKes` int NOT NULL,
	`headline` varchar(220) NOT NULL,
	`rationale` text NOT NULL,
	`heroImageUrl` text NOT NULL,
	`isDemo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `curated_builds_id` PRIMARY KEY(`id`),
	CONSTRAINT `curated_builds_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`vendorId` int,
	`buildId` int,
	`name` varchar(120) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`city` varchar(80) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','reviewed','contacted','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vendorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_vendors_id` PRIMARY KEY(`id`),
	CONSTRAINT `saved_vendors_user_vendor_unique` UNIQUE(`userId`,`vendorId`)
);
--> statement-breakpoint
CREATE TABLE `vendor_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`title` varchar(140) NOT NULL,
	`category` varchar(80) NOT NULL,
	`priceFromKes` int NOT NULL,
	`priceToKes` int NOT NULL,
	`leadTime` varchar(100) NOT NULL,
	`aestheticTags` text NOT NULL,
	CONSTRAINT `vendor_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`name` varchar(160) NOT NULL,
	`type` enum('thrift','tailor','home_studio','stylist','creative') NOT NULL,
	`city` varchar(80) NOT NULL,
	`neighbourhood` varchar(120) NOT NULL,
	`locationText` varchar(220) NOT NULL,
	`description` text NOT NULL,
	`pointOfView` text NOT NULL,
	`priceFloorKes` int NOT NULL,
	`priceCeilingKes` int NOT NULL,
	`budgetTier` enum('considered','signature','statement') NOT NULL,
	`portfolioImageUrl` text NOT NULL,
	`socialHandle` varchar(160),
	`socialUrl` text,
	`isDemo` boolean NOT NULL DEFAULT true,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendors_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `build_board_selections_user_idx` ON `build_board_selections` (`userId`);--> statement-breakpoint
CREATE INDEX `build_share_items_share_idx` ON `build_share_items` (`shareId`);--> statement-breakpoint
CREATE INDEX `build_shares_user_idx` ON `build_shares` (`userId`);--> statement-breakpoint
CREATE INDEX `curated_build_items_build_idx` ON `curated_build_items` (`buildId`);--> statement-breakpoint
CREATE INDEX `curated_builds_city_idx` ON `curated_builds` (`city`);--> statement-breakpoint
CREATE INDEX `curated_builds_aesthetic_idx` ON `curated_builds` (`aesthetic`);--> statement-breakpoint
CREATE INDEX `inquiries_vendor_idx` ON `inquiries` (`vendorId`);--> statement-breakpoint
CREATE INDEX `inquiries_status_idx` ON `inquiries` (`status`);--> statement-breakpoint
CREATE INDEX `saved_vendors_user_idx` ON `saved_vendors` (`userId`);--> statement-breakpoint
CREATE INDEX `vendor_services_vendor_idx` ON `vendor_services` (`vendorId`);--> statement-breakpoint
CREATE INDEX `vendors_city_idx` ON `vendors` (`city`);--> statement-breakpoint
CREATE INDEX `vendors_type_idx` ON `vendors` (`type`);--> statement-breakpoint
CREATE INDEX `vendors_budget_idx` ON `vendors` (`budgetTier`);