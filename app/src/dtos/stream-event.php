<?php

use Api\HttpError;

require_once "dtos/dto.php";
require_once "dtos/user.php";

class StreamEvent extends Dto {
    static function getTableName() {
        return "stream_events";
    }

    static function canUserCreate(?Full\User $user): bool {
        return $user && ($user->isStreamer || $user->isAdmin);
    }

    static function canUserRead(?Full\User $user): bool {
        return true;
    }

    static function canUserUpdate(?Full\User $user): bool {
        return $user && ($user->isStreamer || $user->isAdmin);
    }

    static function canUserDelete(?Full\User $user, $dto): bool {
        return $user && ($user->isStreamer || $user->isAdmin);
    }

    public $id;
    public $title;
    public $streamerId;
    /**
     * @fk streamerId
     * */
    public ?\User $streamer;
    public $start;
    public $end;

    public function validate(): bool {
        if (empty($this->title)) {
            throw new HttpError("Title required.", 400);
        }

        if (strlen($this->title) > 255) {
            throw new HttpError("Title too long (255 character limit).", 400);
        }

        if (empty($this->streamerId)) {
            throw new HttpError("Streamer ID required.", 400);
        }

        if (empty($this->start)) {
            throw new HttpError("Start time required.", 400);
        }

        if (empty($this->end)) {
            throw new HttpError("End time required.", 400);
        }

        return true;
    }
}
