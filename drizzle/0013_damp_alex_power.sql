CREATE TABLE `commerce_order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commerceOrderId` int NOT NULL,
	`productId` int NOT NULL,
	`companyId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPriceKes` int NOT NULL,
	`discountKes` int NOT NULL DEFAULT 0,
	`lineTotalKes` int NOT NULL,
	`offerId` int,
	CONSTRAINT `commerce_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_member_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`invitedByUserId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`memberRole` enum('manager','editor') NOT NULL DEFAULT 'editor',
	`status` enum('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending',
	`token` varchar(48) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `company_member_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_member_invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `content_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterUserId` int NOT NULL,
	`targetType` enum('post','product','company','profile','message','story','review') NOT NULL,
	`targetId` int NOT NULL,
	`reason` enum('spam','misleading','copyright','harassment','unsafe','other') NOT NULL,
	`details` varchar(1000),
	`status` enum('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discount_offer_usages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`userId` int NOT NULL,
	`commerceOrderId` int NOT NULL,
	`discountKes` int NOT NULL,
	`status` enum('reserved','consumed','released') NOT NULL DEFAULT 'reserved',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discount_offer_usages_id` PRIMARY KEY(`id`),
	CONSTRAINT `discount_offer_usages_order_unique` UNIQUE(`offerId`,`commerceOrderId`)
);
--> statement-breakpoint
CREATE TABLE `showroom_annotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`objectId` int,
	`title` varchar(160) NOT NULL,
	`body` text NOT NULL,
	`anchorJson` varchar(500),
	`isVisible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `showroom_annotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `showroom_objects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`objectType` varchar(80) NOT NULL,
	`label` varchar(160) NOT NULL,
	`imageUrl` text,
	`modelUrl` text,
	`positionJson` varchar(500),
	`rotationJson` varchar(500),
	`scaleJson` varchar(500),
	`metadataJson` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `showroom_objects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `showroom_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`kind` enum('home_refresh','personal_style','footwear_fit','inspiration','wardrobe_edit','home_showroom','product_edit','vehicle_garage','detailing_bay','tattoo_concept','pet_accessory') NOT NULL,
	`viewMode` enum('orbit','cover_flow','window_carousel','reverse_columns','explorer') NOT NULL DEFAULT 'orbit',
	`sessionToken` varchar(48) NOT NULL,
	`configJson` text,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `showroom_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `showroom_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `signal_stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorUserId` int NOT NULL,
	`companyId` int,
	`imageUrl` text NOT NULL,
	`caption` varchar(500),
	`aestheticTags` text,
	`expiresAt` timestamp NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signal_stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signal_story_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`userId` int NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signal_story_views_id` PRIMARY KEY(`id`),
	CONSTRAINT `signal_story_views_unique` UNIQUE(`storyId`,`userId`)
);
--> statement-breakpoint
ALTER TABLE `project_brief_events` MODIFY COLUMN `eventType` enum('created','submitted','reviewed','quoted','accepted','payment_requested','payment_received','handoff_started','completed','cancelled') NOT NULL;--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `discountKes` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `selectedOfferId` int;--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `stockReserved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `commerce_order_items_order_idx` ON `commerce_order_items` (`commerceOrderId`);--> statement-breakpoint
CREATE INDEX `commerce_order_items_product_idx` ON `commerce_order_items` (`productId`);--> statement-breakpoint
CREATE INDEX `company_member_invites_company_idx` ON `company_member_invitations` (`companyId`);--> statement-breakpoint
CREATE INDEX `company_member_invites_email_idx` ON `company_member_invitations` (`email`);--> statement-breakpoint
CREATE INDEX `company_member_invites_status_idx` ON `company_member_invitations` (`status`);--> statement-breakpoint
CREATE INDEX `content_reports_status_idx` ON `content_reports` (`status`);--> statement-breakpoint
CREATE INDEX `content_reports_target_idx` ON `content_reports` (`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `content_reports_reporter_idx` ON `content_reports` (`reporterUserId`);--> statement-breakpoint
CREATE INDEX `discount_offer_usages_offer_idx` ON `discount_offer_usages` (`offerId`);--> statement-breakpoint
CREATE INDEX `discount_offer_usages_user_idx` ON `discount_offer_usages` (`userId`);--> statement-breakpoint
CREATE INDEX `showroom_annotations_session_idx` ON `showroom_annotations` (`sessionId`);--> statement-breakpoint
CREATE INDEX `showroom_annotations_object_idx` ON `showroom_annotations` (`objectId`);--> statement-breakpoint
CREATE INDEX `showroom_objects_session_idx` ON `showroom_objects` (`sessionId`);--> statement-breakpoint
CREATE INDEX `showroom_objects_sort_idx` ON `showroom_objects` (`sortOrder`);--> statement-breakpoint
CREATE INDEX `showroom_sessions_user_idx` ON `showroom_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `showroom_sessions_status_idx` ON `showroom_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `showroom_sessions_public_idx` ON `showroom_sessions` (`isPublic`);--> statement-breakpoint
CREATE INDEX `signal_stories_creator_idx` ON `signal_stories` (`creatorUserId`);--> statement-breakpoint
CREATE INDEX `signal_stories_company_idx` ON `signal_stories` (`companyId`);--> statement-breakpoint
CREATE INDEX `signal_stories_expiry_idx` ON `signal_stories` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `signal_story_views_user_idx` ON `signal_story_views` (`userId`);