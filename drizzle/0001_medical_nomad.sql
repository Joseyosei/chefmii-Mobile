CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chefId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`isAvailable` boolean DEFAULT true,
	`startTime` varchar(8) DEFAULT '10:00',
	`endTime` varchar(8) DEFAULT '22:00',
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingRef` varchar(16) NOT NULL,
	`clientId` int NOT NULL,
	`chefId` int NOT NULL,
	`packageId` int NOT NULL,
	`date` varchar(16) NOT NULL,
	`time` varchar(8) NOT NULL,
	`guests` int NOT NULL,
	`address` text,
	`dietaryNotes` text,
	`status` enum('pending','confirmed','declined','completed','cancelled') NOT NULL DEFAULT 'pending',
	`totalAmount` decimal(10,2) NOT NULL,
	`platformFee` decimal(10,2) NOT NULL,
	`chefEarnings` decimal(10,2) NOT NULL,
	`stripePaymentId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_bookingRef_unique` UNIQUE(`bookingRef`)
);
--> statement-breakpoint
CREATE TABLE `chef_gallery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chefId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`caption` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chef_gallery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chef_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bio` text,
	`experienceYears` int DEFAULT 0,
	`cuisines` json DEFAULT ('[]'),
	`location` varchar(255),
	`postcode` varchar(20),
	`verificationStage` int DEFAULT 0,
	`badgeTier` enum('none','verified','pro','elite') DEFAULT 'none',
	`avgRating` decimal(3,2) DEFAULT '0.00',
	`totalBookings` int DEFAULT 0,
	`stripeConnectId` varchar(128),
	`profilePhotoUrl` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chef_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chef_verification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chefId` int NOT NULL,
	`stage` int NOT NULL,
	`documentUrls` json DEFAULT ('[]'),
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`adminNotes` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `chef_verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`read` boolean DEFAULT false,
	`data` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chefId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`minGuests` int DEFAULT 1,
	`maxGuests` int DEFAULT 10,
	`sampleMenu` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`clientId` int NOT NULL,
	`chefId` int NOT NULL,
	`foodRating` int NOT NULL,
	`presentationRating` int NOT NULL,
	`punctualityRating` int NOT NULL,
	`cleanlinessRating` int NOT NULL,
	`overallRating` decimal(3,2) NOT NULL,
	`writtenReview` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_bookingId_unique` UNIQUE(`bookingId`)
);
--> statement-breakpoint
CREATE TABLE `saved_chefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`chefId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_chefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','client','chef') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;