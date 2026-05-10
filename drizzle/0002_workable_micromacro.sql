CREATE TABLE `affirmation_audio_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`voiceGender` enum('female','male','neutral') NOT NULL DEFAULT 'female',
	`speechRate` decimal(3,2) NOT NULL DEFAULT '1.0',
	`volume` tinyint NOT NULL DEFAULT 100,
	`autoPlay` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affirmation_audio_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `affirmation_audio_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `affirmations` ADD `audioUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `affirmations` ADD `audioGeneratedAt` timestamp;