ALTER TABLE `companies` ADD `deliverySameCityKes` int DEFAULT 450 NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `deliveryNationalKes` int DEFAULT 950 NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `deliveryProviderLabel` varchar(100) DEFAULT 'Company delivery estimate' NOT NULL;