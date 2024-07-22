-- AlterTable
ALTER TABLE `Channel` MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email` VARCHAR(191) NULL,
    MODIFY `photoUrl` VARCHAR(191) NULL;
