CREATE TABLE `auth_visual_sets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`imageUrls` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auth_visual_sets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `auth_visual_sets_active_idx` ON `auth_visual_sets` (`isActive`);