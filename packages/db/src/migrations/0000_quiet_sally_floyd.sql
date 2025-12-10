CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passkey` (
	`id` varchar(36) NOT NULL,
	`name` text,
	`public_key` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`credential_id` varchar(255) NOT NULL,
	`counter` int NOT NULL,
	`device_type` text NOT NULL,
	`backed_up` boolean NOT NULL,
	`transports` text,
	`created_at` timestamp(3),
	`aaguid` text,
	CONSTRAINT `passkey_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `two_factor` (
	`id` varchar(36) NOT NULL,
	`secret` varchar(255) NOT NULL,
	`backup_codes` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `two_factor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`two_factor_enabled` boolean DEFAULT false,
	`role` text,
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `allowed_host` (
	`host` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`added_by` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `allowed_host_host` PRIMARY KEY(`host`)
);
--> statement-breakpoint
CREATE TABLE `todo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` varchar(255) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `todo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `file` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`size` bigint,
	`folder_id` int,
	`owner_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `file_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `folder` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`parent_id` int,
	`owner_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `folder_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_name` UNIQUE(`parent_id`,`owner_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `folder_closure` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ancestor` int NOT NULL,
	`descendant` int NOT NULL,
	`depth` int NOT NULL,
	CONSTRAINT `folder_closure_id` PRIMARY KEY(`id`),
	CONSTRAINT `folder_closure_unique` UNIQUE(`ancestor`,`descendant`)
);
--> statement-breakpoint
CREATE TABLE `history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`file_id` int,
	`s3_key` varchar(512) NOT NULL,
	`size` int NOT NULL,
	`author_id` varchar(36),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passkey` ADD CONSTRAINT `passkey_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `two_factor` ADD CONSTRAINT `two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `allowed_host` ADD CONSTRAINT `allowed_host_added_by_user_id_fk` FOREIGN KEY (`added_by`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `file` ADD CONSTRAINT `file_folder_id_folder_id_fk` FOREIGN KEY (`folder_id`) REFERENCES `folder`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `file` ADD CONSTRAINT `file_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `folder` ADD CONSTRAINT `folder_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `folder` ADD CONSTRAINT `folder_parent_id_folder_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `folder`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `folder_closure` ADD CONSTRAINT `folder_closure_ancestor_folder_id_fk` FOREIGN KEY (`ancestor`) REFERENCES `folder`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `folder_closure` ADD CONSTRAINT `folder_closure_descendant_folder_id_fk` FOREIGN KEY (`descendant`) REFERENCES `folder`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `history` ADD CONSTRAINT `history_file_id_file_id_fk` FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `history` ADD CONSTRAINT `history_author_id_user_id_fk` FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `passkey_userId_idx` ON `passkey` (`user_id`);--> statement-breakpoint
CREATE INDEX `passkey_credentialID_idx` ON `passkey` (`credential_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `twoFactor_secret_idx` ON `two_factor` (`secret`);--> statement-breakpoint
CREATE INDEX `twoFactor_userId_idx` ON `two_factor` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);