<?php
namespace Full;

use Api\HttpError;

require_once "dtos/dto.php";
require_once "dtos/banner.php";

class Settings extends \Dto {
    static function getTableName() {
        return "settings";
    }

    static function canUserRead(?User $user): bool {
        return true;
    }

    static function canUserUpdate(?User $user): bool {
        return $user && $user->isAdmin;
    }

    public $id;
    public $liveChannelId;
    public bool $isStreamLocked = false;
    public $announcement;
    public bool $isStatic = false;
    public $bannerId;

    /**
     * @fk bannerId
     * */
    public ?Banner $banner;

    public function validate(): bool {
        if (empty($this->liveChannelId)) {
            throw new HttpError("Live Channel ID required.", 400);
        }

        return true;
    }
}
?>
