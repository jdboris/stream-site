<?php
namespace Full;

use Api\HttpError;

require_once "dtos/dto.php";

class Banner extends \Dto {
    static function getTableName() {
        return "banners";
    }

    static function canUserRead(?User $user): bool {
        return true;
    }

    static function canUserCreate(?User $user): bool {
        return $user && $user->isAdmin;
    }

    static function canUserDelete(?User $user, $dto): bool {
        return $user && $user->isAdmin;
    }

    public $id;
    public $name;
    public $url;

    public function validate(): bool {
        if (empty($this->name)) {
            throw new HttpError("Name required.", 400);
        }

        if (empty($this->url)) {
            throw new HttpError("URL required.", 400);
        }

        return true;
    }
}
