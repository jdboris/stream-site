<?php

namespace Full;

use Api\HttpError;

require_once "dtos/dto.php";
require_once "dtos/allowed-service.php";

class Channel extends \Dto
{
    static function getTableName()
    {
        return "channels";
    }

    static function canUserCreate(?User $user): bool
    {
        return $user && ($user->isStreamer || $user->isAdmin);
    }

    static function canUserRead(?User $user): bool
    {
        return $user && ($user->isStreamer || $user->isAdmin);
    }

    static function canUserUpdate(?User $user): bool
    {
        return $user && ($user->isStreamer || $user->isAdmin);
    }

    static function canUserDelete(?User $user, $dto): bool
    {
        // User is logged in AND an admin, OR no creatorId, OR the creatorId matches the user's ID
        return $user && ($user->isAdmin || ($user->isStreamer && ($dto->creatorId == null || $dto->creatorId == $user->id)));
    }

    public $id;
    public $creatorId;
    public $service;
    public $description;
    public $name;
    public $source;
    public ?bool $isSecure;

    public $streamUrl;
    public $key;

    public function validate(): bool
    {
        if (empty($this->name)) {
            throw new HttpError("Name required.", 400);
        }

        if (empty($this->source)) {
            throw new HttpError("Embed URL required.", 400);
        }

        // Parse the domain out of the URL
        $host = parse_url($this->source, PHP_URL_HOST);
        $parts = explode(".", $host);
        $domain = $parts[count($parts) - 2] . "." . $parts[count($parts) - 1];

        $allowedDomains = array_map(function ($service) {
            return $service->domain;
        }, AllowedService::get(limit: 999, bypassAuth: true));

        if (!in_array($domain, $allowedDomains)) {
            throw new HttpError("Stream platform not supported.", 400);
        }

        return true;
    }
}
