CREATE TABLE `HR`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `hashed_password` VARCHAR(255) NOT NULL,
    `phone_number` BIGINT NOT NULL,
    `status` ENUM('inactive active blocked') NULL DEFAULT 'inactive',
    `last_login` DATE NOT NULL,
    `verified_at` DATE NOT NULL,
    `role` ENUM('') NOT NULL DEFAULT 'hr' COMMENT 'hr  super_hr',
    `refresh_token` VARCHAR(255) NOT NULL,
    `confirm_by` BIGINT NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `tg_user_id` BIGINT NOT NULL
);
ALTER TABLE
    `HR` ADD UNIQUE `hr_email_unique`(`email`);
CREATE TABLE `company`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT NOT NULL,
    `company_type_id` BIGINT NOT NULL,
    `director_full_name` BIGINT NOT NULL,
    `director_phone` VARCHAR(255) NOT NULL,
    `director_email` VARCHAR(255) NOT NULL,
    `company_inn` BIGINT NOT NULL,
    `status` ENUM(
        'active inactive blocked pending'
    ) NOT NULL,
    `confirm_by` BIGINT NOT NULL
);
ALTER TABLE
    `company` ADD UNIQUE `company_name_unique`(`name`);
ALTER TABLE
    `company` ADD UNIQUE `company_director_email_unique`(`director_email`);
CREATE TABLE `company_types`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `createdAt` DATE NOT NULL
);
CREATE TABLE `employee`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` BIGINT NOT NULL,
    `verified_at` BIGINT NOT NULL,
    `status` ENUM('') NOT NULL,
    `last_login` BIGINT NOT NULL,
    `hashed_password` VARCHAR(255) NOT NULL,
    `hashed_refresh_token` BIGINT NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `profile_image` VARCHAR(255) NOT NULL,
    `bio` BIGINT NOT NULL,
    `activation_link` BIGINT NOT NULL,
    `tg_user_id` BIGINT NOT NULL,
    `is_temprary` BOOLEAN NOT NULL DEFAULT '0' COMMENT 'agar hr yaratsa is_temprary true boladi'
);
ALTER TABLE
    `employee` ADD UNIQUE `employee_email_unique`(`email`);
ALTER TABLE
    `employee` ADD UNIQUE `employee_user_name_unique`(`user_name`);
CREATE TABLE `social_media`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` BIGINT NOT NULL,
    `icon` BIGINT NOT NULL
);
CREATE TABLE `employe_social_media`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `employee_id` BIGINT NOT NULL,
    `url` BIGINT NOT NULL
);
CREATE TABLE `worker_history`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `company_id` BIGINT NOT NULL,
    `empolyee_id` BIGINT NOT NULL,
    `hired_at` DATE NOT NULL,
    `employment_type` ENUM('') NOT NULL,
    `position` VARCHAR(255) NOT NULL,
    `left_at` DATE NOT NULL,
    `status` ENUM('Active leaved') NOT NULL,
    `left_reason` VARCHAR(255) NOT NULL,
    `hired_by` BIGINT NOT NULL,
    `working_mode` ENUM('onlyan oflayn gbrid') NOT NULL,
    `performance_score` BIGINT NOT NULL
);
CREATE TABLE `position`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL
);
CREATE TABLE `admin`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `full_name` BIGINT NOT NULL,
    `phone_number` BIGINT NOT NULL,
    `email` BIGINT NOT NULL,
    `hashed_password` BIGINT NOT NULL,
    `hashed_refresh_token` BIGINT NOT NULL,
    `status` ENUM('') NOT NULL,
    `is_creator` BIGINT NOT NULL,
    `role` ENUM('super admin  hr admin support') NOT NULL,
    `tg_user_id` BIGINT NOT NULL
);
CREATE TABLE `access_request`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `requesting_hr_id` BIGINT NOT NULL,
    `employe_id` BIGINT NOT NULL,
    `request_type` ENUM('') NOT NULL,
    `status` ENUM('') NOT NULL,
    `request_date` BIGINT NOT NULL,
    `token` BIGINT NOT NULL
);
CREATE TABLE `subscription_plan`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `duration` INT NOT NULL,
    `feature` TEXT NOT NULL,
    `price` DECIMAL(8, 2) NOT NULL,
    `status` ENUM('') NOT NULL
);
CREATE TABLE `company_subscription`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `plan_id` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL,
    `start_date` BIGINT NOT NULL,
    `end_date` BIGINT NOT NULL,
    `status` ENUM('') NOT NULL
);
CREATE TABLE `empolyee_cv`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `employee_id` BIGINT NOT NULL,
    `skilss` BIGINT NOT NULL,
    `education` BIGINT NOT NULL,
    `work_experience` BIGINT NOT NULL,
    `address` BIGINT NOT NULL,
    `employment_type` BIGINT NOT NULL,
    `language` VARCHAR(255) NOT NULL,
    `custom_company_experience` VARCHAR(255) NOT NULL
);
CREATE TABLE `company_hr`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `hr_id` BIGINT NOT NULL,
    `reg_date` BIGINT NOT NULL,
    `company_id` BIGINT NOT NULL,
    `status` BIGINT NOT NULL,
    `document` BIGINT NOT NULL,
    `status` ENUM('') NOT NULL
);
CREATE TABLE `tg_user`(
    `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_name` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `last_state` VARCHAR(255) NOT NULL,
    `user_lang` VARCHAR(255) NOT NULL,
    `status` ENUM('') NOT NULL
);
ALTER TABLE
    `position` ADD CONSTRAINT `position_company_id_foreign` FOREIGN KEY(`company_id`) REFERENCES `company`(`id`);
ALTER TABLE
    `worker_history` ADD CONSTRAINT `worker_history_hired_by_foreign` FOREIGN KEY(`hired_by`) REFERENCES `HR`(`id`);
ALTER TABLE
    `company_subscription` ADD CONSTRAINT `company_subscription_id_foreign` FOREIGN KEY(`id`) REFERENCES `subscription_plan`(`id`);
ALTER TABLE
    `access_request` ADD CONSTRAINT `access_request_employe_id_foreign` FOREIGN KEY(`employe_id`) REFERENCES `employee`(`id`);
ALTER TABLE
    `company_subscription` ADD CONSTRAINT `company_subscription_plan_id_foreign` FOREIGN KEY(`plan_id`) REFERENCES `company`(`id`);
ALTER TABLE
    `access_request` ADD CONSTRAINT `access_request_requesting_hr_id_foreign` FOREIGN KEY(`requesting_hr_id`) REFERENCES `HR`(`id`);
ALTER TABLE
    `company_hr` ADD CONSTRAINT `company_hr_company_id_foreign` FOREIGN KEY(`company_id`) REFERENCES `company`(`id`);
ALTER TABLE
    `worker_history` ADD CONSTRAINT `worker_history_company_id_foreign` FOREIGN KEY(`company_id`) REFERENCES `company`(`id`);
ALTER TABLE
    `employee` ADD CONSTRAINT `employee_tg_user_id_foreign` FOREIGN KEY(`tg_user_id`) REFERENCES `tg_user`(`user_id`);
ALTER TABLE
    `employe_social_media` ADD CONSTRAINT `employe_social_media_id_foreign` FOREIGN KEY(`id`) REFERENCES `social_media`(`id`);
ALTER TABLE
    `company_hr` ADD CONSTRAINT `company_hr_hr_id_foreign` FOREIGN KEY(`hr_id`) REFERENCES `HR`(`id`);
ALTER TABLE
    `employe_social_media` ADD CONSTRAINT `employe_social_media_employee_id_foreign` FOREIGN KEY(`employee_id`) REFERENCES `empolyee_cv`(`id`);
ALTER TABLE
    `empolyee_cv` ADD CONSTRAINT `empolyee_cv_work_experience_foreign` FOREIGN KEY(`work_experience`) REFERENCES `worker_history`(`id`);
ALTER TABLE
    `worker_history` ADD CONSTRAINT `worker_history_position_foreign` FOREIGN KEY(`position`) REFERENCES `position`(`id`);
ALTER TABLE
    `company` ADD CONSTRAINT `company_company_type_id_foreign` FOREIGN KEY(`company_type_id`) REFERENCES `company_types`(`id`);
ALTER TABLE
    `HR` ADD CONSTRAINT `hr_tg_user_id_foreign` FOREIGN KEY(`tg_user_id`) REFERENCES `tg_user`(`user_id`);
ALTER TABLE
    `HR` ADD CONSTRAINT `hr_confirm_by_foreign` FOREIGN KEY(`confirm_by`) REFERENCES `admin`(`id`);
ALTER TABLE
    `company` ADD CONSTRAINT `company_confirm_by_foreign` FOREIGN KEY(`confirm_by`) REFERENCES `admin`(`id`);
ALTER TABLE
    `empolyee_cv` ADD CONSTRAINT `empolyee_cv_id_foreign` FOREIGN KEY(`id`) REFERENCES `employee`(`id`);
ALTER TABLE
    `worker_history` ADD CONSTRAINT `worker_history_empolyee_id_foreign` FOREIGN KEY(`empolyee_id`) REFERENCES `employee`(`id`);
ALTER TABLE
    `HR` ADD CONSTRAINT `hr_confirm_by_foreign` FOREIGN KEY(`confirm_by`) REFERENCES `HR`(`id`);