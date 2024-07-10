-- CreateTable
CREATE TABLE `AllowedService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AllowedService_name_key`(`name`),
    UNIQUE INDEX `AllowedService_domain_key`(`domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Banner_name_key`(`name`),
    UNIQUE INDEX `Banner_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isStreamer` BOOLEAN NOT NULL,
    `uid` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `lowercaseUsername` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `photoUrl` VARCHAR(191) NOT NULL,
    `nameColor` VARCHAR(191) NOT NULL,
    `msgBgColor` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL,
    `isModerator` BOOLEAN NOT NULL,
    `isAdmin` BOOLEAN NOT NULL,
    `isBanned` BOOLEAN NOT NULL,

    UNIQUE INDEX `User_uid_key`(`uid`),
    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_lowercaseUsername_key`(`lowercaseUsername`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Channel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creatorId` INTEGER NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `isSecure` BOOLEAN NOT NULL,
    `streamUrl` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `liveChannelId` INTEGER NOT NULL,
    `isStreamLocked` BOOLEAN NOT NULL,
    `announcement` VARCHAR(191) NOT NULL,
    `isStatic` BOOLEAN NOT NULL,
    `bannerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StreamEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `streamerId` INTEGER NOT NULL,
    `start` DATETIME(3) NOT NULL,
    `end` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `suggestedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Channel` ADD CONSTRAINT `Channel_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Setting` ADD CONSTRAINT `Setting_liveChannelId_fkey` FOREIGN KEY (`liveChannelId`) REFERENCES `Channel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Setting` ADD CONSTRAINT `Setting_bannerId_fkey` FOREIGN KEY (`bannerId`) REFERENCES `Banner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StreamEvent` ADD CONSTRAINT `StreamEvent_streamerId_fkey` FOREIGN KEY (`streamerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Suggestion` ADD CONSTRAINT `Suggestion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
