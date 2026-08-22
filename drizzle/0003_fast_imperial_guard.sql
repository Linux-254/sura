CREATE TABLE `company_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`label` varchar(80) NOT NULL,
	`contactType` enum('email','phone','whatsapp','address') NOT NULL,
	`value` varchar(320) NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discount_offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`createdByUserId` int NOT NULL,
	`code` varchar(48) NOT NULL,
	`title` varchar(140) NOT NULL,
	`description` varchar(500),
	`discountType` enum('percentage','fixed_kes') NOT NULL,
	`discountValue` int NOT NULL,
	`minimumSpendKes` int,
	`validFrom` timestamp NOT NULL DEFAULT (now()),
	`validUntil` timestamp,
	`status` enum('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft',
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discount_offers_id` PRIMARY KEY(`id`),
	CONSTRAINT `discount_offers_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `platform_announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` varchar(500) NOT NULL,
	`linkUrl` varchar(300),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`label` varchar(80) NOT NULL,
	`contactType` enum('email','phone','whatsapp','address') NOT NULL,
	`value` varchar(320) NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planKey` enum('sura_free') NOT NULL DEFAULT 'sura_free',
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_memberships_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `web_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('membership','offer','company','platform') NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` varchar(500) NOT NULL,
	`linkUrl` varchar(300),
	`isRead` boolean NOT NULL DEFAULT false,
	`isDismissed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `web_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `company_contacts_company_idx` ON `company_contacts` (`companyId`);--> statement-breakpoint
CREATE INDEX `discount_offers_company_idx` ON `discount_offers` (`companyId`);--> statement-breakpoint
CREATE INDEX `discount_offers_status_idx` ON `discount_offers` (`status`);--> statement-breakpoint
CREATE INDEX `platform_announcements_active_idx` ON `platform_announcements` (`isActive`);--> statement-breakpoint
CREATE INDEX `platform_contacts_public_idx` ON `platform_contacts` (`isPublic`);--> statement-breakpoint
CREATE INDEX `user_memberships_status_idx` ON `user_memberships` (`status`);--> statement-breakpoint
CREATE INDEX `web_notifications_user_idx` ON `web_notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `web_notifications_read_idx` ON `web_notifications` (`isRead`);