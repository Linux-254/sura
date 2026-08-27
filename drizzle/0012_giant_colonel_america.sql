CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`selectedOfferId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `cart_items_cart_product_unique` UNIQUE(`cartId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('active','checked_out','abandoned') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`),
	CONSTRAINT `carts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `company_analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`productId` int,
	`postId` int,
	`eventType` enum('profile_view','product_view','post_view','save','repost','inquiry','checkout_start','purchase') NOT NULL,
	`actorUserId` int,
	`metadataJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `company_analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderUserId` int NOT NULL,
	`body` text NOT NULL,
	`attachmentUrl` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`lastReadAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_participants_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversation_participants_unique` UNIQUE(`conversationId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`companyId` int,
	`inquiryId` int,
	`projectBriefId` int,
	`subject` varchar(180) NOT NULL,
	`status` enum('open','archived','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiry_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiryId` int NOT NULL,
	`companyId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`amountKes` int NOT NULL,
	`description` text NOT NULL,
	`estimatedDays` int,
	`status` enum('draft','sent','accepted','declined','expired') NOT NULL DEFAULT 'draft',
	`validUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiry_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_handoff_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`handoffId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`status` enum('pending','accepted','in_production','ready','in_transit','delivered','issue','cancelled') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_handoff_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_handoffs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`companyId` int NOT NULL,
	`assignedPartner` varchar(160),
	`destinationCity` varchar(80) NOT NULL,
	`status` enum('pending','accepted','in_production','ready','in_transit','delivered','issue','cancelled') NOT NULL DEFAULT 'pending',
	`trackingReference` varchar(160),
	`customerNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_handoffs_id` PRIMARY KEY(`id`),
	CONSTRAINT `order_handoffs_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `project_brief_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`briefId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`eventType` enum('created','submitted','quoted','accepted','payment_requested','payment_received','handoff_started','completed','cancelled') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_brief_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_brief_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`briefId` int NOT NULL,
	`itemType` enum('post','product','vendor','collage','image') NOT NULL,
	`itemId` int,
	`imageUrl` text,
	`note` varchar(280),
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `project_brief_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_briefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`companyId` int,
	`title` varchar(160) NOT NULL,
	`intent` enum('shape_direction','ask_product','field_note','ai_studio') NOT NULL,
	`lane` varchar(80),
	`fieldNote` text,
	`direction` varchar(500),
	`budgetKes` int,
	`timeline` varchar(120),
	`status` enum('draft','submitted','in_review','quoted','accepted','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_briefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_collage_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collageId` int NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('post','product','vendor','build','image') NOT NULL,
	`itemId` int,
	`imageUrl` text,
	`note` varchar(280),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_collage_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_collages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_collages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `company_products` MODIFY COLUMN `category` enum('apparel','footwear','home','accessory','appliance','art','tattoo','beauty','pet','vehicle','detailing','architecture','food','travel','technology') NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` MODIFY COLUMN `status` enum('new','reviewed','quoted','accepted','declined','closed') NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `payment_orders` MODIFY COLUMN `orderType` enum('company_membership','vendor_feature','build_consultation','commerce_purchase') NOT NULL;--> statement-breakpoint
ALTER TABLE `web_notifications` MODIFY COLUMN `kind` enum('membership','offer','company','platform','social','message','inquiry','order','project') NOT NULL;--> statement-breakpoint
ALTER TABLE `commerce_orders` ADD `paymentStatus` enum('unpaid','pending','paid','failed','refunded') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `neighbourhood` varchar(120);--> statement-breakpoint
ALTER TABLE `companies` ADD `locationText` varchar(220);--> statement-breakpoint
ALTER TABLE `companies` ADD `latitude` varchar(32);--> statement-breakpoint
ALTER TABLE `companies` ADD `longitude` varchar(32);--> statement-breakpoint
ALTER TABLE `company_products` ADD `status` enum('draft','pending','published','rejected') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `discount_offers` ADD `usageLimit` int;--> statement-breakpoint
ALTER TABLE `discount_offers` ADD `usedCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `companyId` int;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `commerceOrderId` int;--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `providerReference` varchar(128);--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `failureReason` varchar(300);--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `paidAt` timestamp;--> statement-breakpoint
CREATE INDEX `cart_items_cart_idx` ON `cart_items` (`cartId`);--> statement-breakpoint
CREATE INDEX `cart_items_product_idx` ON `cart_items` (`productId`);--> statement-breakpoint
CREATE INDEX `carts_user_idx` ON `carts` (`userId`);--> statement-breakpoint
CREATE INDEX `carts_status_idx` ON `carts` (`status`);--> statement-breakpoint
CREATE INDEX `company_analytics_company_idx` ON `company_analytics_events` (`companyId`);--> statement-breakpoint
CREATE INDEX `company_analytics_type_idx` ON `company_analytics_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `company_analytics_created_idx` ON `company_analytics_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `conversation_messages_conversation_idx` ON `conversation_messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `conversation_messages_sender_idx` ON `conversation_messages` (`senderUserId`);--> statement-breakpoint
CREATE INDEX `conversation_messages_created_idx` ON `conversation_messages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `conversation_participants_user_idx` ON `conversation_participants` (`userId`);--> statement-breakpoint
CREATE INDEX `conversations_creator_idx` ON `conversations` (`createdByUserId`);--> statement-breakpoint
CREATE INDEX `conversations_company_idx` ON `conversations` (`companyId`);--> statement-breakpoint
CREATE INDEX `conversations_inquiry_idx` ON `conversations` (`inquiryId`);--> statement-breakpoint
CREATE INDEX `inquiry_quotes_inquiry_idx` ON `inquiry_quotes` (`inquiryId`);--> statement-breakpoint
CREATE INDEX `inquiry_quotes_company_idx` ON `inquiry_quotes` (`companyId`);--> statement-breakpoint
CREATE INDEX `inquiry_quotes_status_idx` ON `inquiry_quotes` (`status`);--> statement-breakpoint
CREATE INDEX `order_handoff_events_handoff_idx` ON `order_handoff_events` (`handoffId`);--> statement-breakpoint
CREATE INDEX `order_handoff_events_actor_idx` ON `order_handoff_events` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `order_handoffs_company_idx` ON `order_handoffs` (`companyId`);--> statement-breakpoint
CREATE INDEX `order_handoffs_status_idx` ON `order_handoffs` (`status`);--> statement-breakpoint
CREATE INDEX `project_brief_events_brief_idx` ON `project_brief_events` (`briefId`);--> statement-breakpoint
CREATE INDEX `project_brief_events_actor_idx` ON `project_brief_events` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `project_brief_items_brief_idx` ON `project_brief_items` (`briefId`);--> statement-breakpoint
CREATE INDEX `project_briefs_owner_idx` ON `project_briefs` (`ownerUserId`);--> statement-breakpoint
CREATE INDEX `project_briefs_company_idx` ON `project_briefs` (`companyId`);--> statement-breakpoint
CREATE INDEX `project_briefs_status_idx` ON `project_briefs` (`status`);--> statement-breakpoint
CREATE INDEX `saved_collage_items_collage_idx` ON `saved_collage_items` (`collageId`);--> statement-breakpoint
CREATE INDEX `saved_collage_items_user_idx` ON `saved_collage_items` (`userId`);--> statement-breakpoint
CREATE INDEX `saved_collages_user_idx` ON `saved_collages` (`userId`);--> statement-breakpoint
CREATE INDEX `saved_collages_public_idx` ON `saved_collages` (`isPublic`);--> statement-breakpoint
CREATE INDEX `inquiries_company_idx` ON `inquiries` (`companyId`);