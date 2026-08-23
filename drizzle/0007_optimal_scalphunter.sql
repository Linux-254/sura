CREATE TABLE `personal_edit_collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`editType` enum('wardrobe','tattoo','room','books','lighting','inspiration') NOT NULL,
	`isPrivate` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personal_edit_collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_edit_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('wardrobe','tattoo','room','books','lighting','inspiration') NOT NULL,
	`title` varchar(160) NOT NULL,
	`note` text,
	`tags` text,
	`imageKey` varchar(500),
	`imageUrl` text,
	`analysisConsentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personal_edit_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `personal_edit_collections_user_idx` ON `personal_edit_collections` (`userId`);--> statement-breakpoint
CREATE INDEX `personal_edit_collections_type_idx` ON `personal_edit_collections` (`editType`);--> statement-breakpoint
CREATE INDEX `personal_edit_items_user_idx` ON `personal_edit_items` (`userId`);--> statement-breakpoint
CREATE INDEX `personal_edit_items_collection_idx` ON `personal_edit_items` (`collectionId`);--> statement-breakpoint
CREATE INDEX `personal_edit_items_type_idx` ON `personal_edit_items` (`itemType`);