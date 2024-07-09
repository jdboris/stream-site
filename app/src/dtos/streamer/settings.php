<?php
namespace Streamer;

use Api\HttpError;
use Full\User;

require_once "dtos/dto.php";

class Settings extends \Dto {
    static function getTableName() {
        return "settings";
    }

    static function canUserRead(?User $user): bool {
        return true;
    }

    static function canUserUpdate(?User $user): bool {
        return $user && ($user->isStreamer || $user->isAdmin);
    }

    public $id;
    public $liveChannelId;

    public function validate(): bool {
        if (empty($this->liveChannelId)) {
            throw new HttpError("Live Channel ID required.", 400);
        }

        return true;
    }
}
?>
