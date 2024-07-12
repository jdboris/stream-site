<?php

use Api\HttpError;

require_once "dtos/dto.php";

class Suggestion extends \Dto {
    static function getTableName() {
        return "suggestions";
    }

    static function canUserCreate(?Full\User $user): bool {
        return $user && $user->emailVerified;
    }

    static function canUserRead(?Full\User $user): bool {
        return true;
    }

    static function canUserDelete(?Full\User $user, $dto): bool {
        return $user && $user->isAdmin;
    }

    public $id;
    public $text;
    public $userId;

    /**
     * @use_default true
     * */
    public $suggestedAt;

    public function validate(): bool {
        if (empty($this->text)) {
            throw new HttpError("Suggestion required.", 400);
        }

        if (strlen($this->text) > 40) {
            throw new HttpError(
                "Suggestion too long (40 character limit).",
                400
            );
        }

        if (empty($this->userId)) {
            throw new HttpError("User ID required.", 400);
        }

        if (!empty($this->suggestedAt)) {
            throw new HttpError("Date may not be provided.", 400);
        }

        return true;
    }
}
