CREATE TABLE `company_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerUserId` int NOT NULL,
	`companyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `company_follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_follows_pair_unique` UNIQUE(`followerUserId`,`companyId`)
);
--> statement-breakpoint
CREATE TABLE `company_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`caption` text,
	`imageUrl` text NOT NULL,
	`aestheticTags` text,
	`status` enum('draft','pending','published','rejected') NOT NULL DEFAULT 'pending',
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_likes_user_post_unique` UNIQUE(`userId`,`postId`)
);
--> statement-breakpoint
CREATE TABLE `post_reposts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int NOT NULL,
	`note` varchar(280),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_reposts_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_reposts_user_post_unique` UNIQUE(`userId`,`postId`)
);
--> statement-breakpoint
CREATE TABLE `user_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerUserId` int NOT NULL,
	`followedUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_follows_pair_unique` UNIQUE(`followerUserId`,`followedUserId`)
);
--> statement-breakpoint
CREATE INDEX `company_follows_follower_idx` ON `company_follows` (`followerUserId`);--> statement-breakpoint
CREATE INDEX `company_follows_company_idx` ON `company_follows` (`companyId`);--> statement-breakpoint
CREATE INDEX `company_posts_company_idx` ON `company_posts` (`companyId`);--> statement-breakpoint
CREATE INDEX `company_posts_status_idx` ON `company_posts` (`status`);--> statement-breakpoint
CREATE INDEX `company_posts_created_idx` ON `company_posts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `post_likes_post_idx` ON `post_likes` (`postId`);--> statement-breakpoint
CREATE INDEX `post_likes_user_idx` ON `post_likes` (`userId`);--> statement-breakpoint
CREATE INDEX `post_reposts_post_idx` ON `post_reposts` (`postId`);--> statement-breakpoint
CREATE INDEX `post_reposts_user_idx` ON `post_reposts` (`userId`);--> statement-breakpoint
CREATE INDEX `user_follows_follower_idx` ON `user_follows` (`followerUserId`);--> statement-breakpoint
CREATE INDEX `user_follows_followed_idx` ON `user_follows` (`followedUserId`);