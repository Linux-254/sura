CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`slug` varchar(96) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`city` varchar(80),
	`websiteUrl` text,
	`verificationStatus` enum('draft','pending','verified','rejected') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `company_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`memberRole` enum('owner','manager','editor') NOT NULL DEFAULT 'editor',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `company_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_members_company_user_unique` UNIQUE(`companyId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `legal_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('terms','privacy') NOT NULL,
	`version` varchar(32) NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `legal_consents_id` PRIMARY KEY(`id`),
	CONSTRAINT `legal_consents_user_document_version_unique` UNIQUE(`userId`,`documentType`,`version`)
);
--> statement-breakpoint
CREATE TABLE `payment_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyId` int,
	`orderType` enum('company_membership','vendor_feature','build_consultation') NOT NULL,
	`amountKes` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'KES',
	`provider` enum('gateway_pending','mpesa','stripe') NOT NULL DEFAULT 'gateway_pending',
	`status` enum('draft','pending','paid','failed','cancelled') NOT NULL DEFAULT 'draft',
	`reference` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_orders_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`companyId` int,
	`platform` enum('instagram','tiktok','linkedin','youtube','x','website') NOT NULL,
	`url` varchar(500) NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(120),
	`bio` varchar(500),
	`city` varchar(80),
	`avatarUrl` text,
	`publicSlug` varchar(96),
	`isPublic` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `user_profiles_publicSlug_unique` UNIQUE(`publicSlug`)
);
--> statement-breakpoint
CREATE INDEX `companies_owner_idx` ON `companies` (`ownerUserId`);--> statement-breakpoint
CREATE INDEX `companies_status_idx` ON `companies` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `company_members_user_idx` ON `company_members` (`userId`);--> statement-breakpoint
CREATE INDEX `legal_consents_user_idx` ON `legal_consents` (`userId`);--> statement-breakpoint
CREATE INDEX `payment_orders_user_idx` ON `payment_orders` (`userId`);--> statement-breakpoint
CREATE INDEX `payment_orders_company_idx` ON `payment_orders` (`companyId`);--> statement-breakpoint
CREATE INDEX `payment_orders_status_idx` ON `payment_orders` (`status`);--> statement-breakpoint
CREATE INDEX `social_links_user_idx` ON `social_links` (`userId`);--> statement-breakpoint
CREATE INDEX `social_links_company_idx` ON `social_links` (`companyId`);--> statement-breakpoint
CREATE INDEX `user_profiles_user_idx` ON `user_profiles` (`userId`);