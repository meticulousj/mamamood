CREATE TABLE `user_theta_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredFrequency` decimal(3,1) NOT NULL DEFAULT '6.0',
	`thetaVolume` tinyint NOT NULL DEFAULT 30,
	`enableTheta` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_theta_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_theta_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `meditation_sessions` ADD `thetaFrequency` decimal(3,1);--> statement-breakpoint
ALTER TABLE `meditation_sessions` ADD `includeAmbientTones` boolean DEFAULT false NOT NULL;