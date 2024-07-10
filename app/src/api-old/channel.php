<?php

namespace Api;

require_once "dtos/full/user.php";
require_once "dtos/full/settings.php";
require_once "dtos/channel.php";
require_once "dtos/full/channel.php";

route("/", "GET", function ($filters) {
    $settings = $filters
        ? null
        : \Full\Settings::get(filters: ["id" => 1], bypassAuth: true);

    $channel = \Channel::get(
        filters: $filters
            ? (array) $filters
            : ["id" => $settings->liveChannelId],
        bypassAuth: true
    );

    if (empty($channel->id)) {
        throw new HttpError("Channel not found.", 404);
    }

    return $channel;
});

route("/all", "GET", function ($filters) {
    $channels = \Full\Channel::get(filters: (array) $filters, limit: 50, orderBy: "`name`");
    if ($filters && count($channels) == 0) {
        throw new HttpError("Channel(s) not found.", 404);
    }

    return $channels;
});

route("/", "PUT", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $channel = new \Full\Channel();
    $channel->copyFrom($data);
    $channel->save();

    return ["success" => true];
});

route("/", "POST", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $channel = new \Full\Channel();
    $channel->copyFrom($data);

    $user = \Full\User::current();
    $channel->creatorId = $user->id;

    if (!$channel->save()) {
        throw new HttpError("Failed to create channel.", 400);
    }

    return ["success" => true];
});

route("/", "DELETE", function ($data) {
    try {
        if (!$data) {
            throw new HttpError("Invalid arguments.", 400);
        }

        $channel = new \Full\Channel();
        $channel->copyFrom($data);
        if (!$channel->delete()) {
            throw new HttpError("Failed to delete channel.", 400);
        }

        return ["success" => true];
    } catch (\Exception $e) {
        // Cannot delete or update a parent row: a foreign key constraint fails
        if ($e->getCode() == 1451) {
            throw new HttpError("Can't delete the \"Live\" channel.", 400);
        }

        throw $e;
    }
});
