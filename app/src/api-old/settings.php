<?php
namespace Api;
require_once "dtos/full/user.php";
require_once "dtos/channel.php";
require_once "dtos/full/channel.php";
require_once "dtos/streamer/settings.php";
require_once "dtos/full/settings.php";

route("/", "GET", function ($data) {
    return \Full\Settings::get(filters: ["id" => 1], bypassAuth: true);
});

route("/", "PUT", function ($data) {
    $user = \Full\User::current();

    if (!$user) {
        throw new HttpError("Insufficient permissions.", 403);
    }

    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    if ($user->isAdmin) {
        $settings = \Full\Settings::get(["id" => 1]);
    } elseif ($user->isStreamer) {
        $settings = \Streamer\Settings::get(["id" => 1]);
    } else {
        $settings = \Full\Settings::get(["id" => 1]);
    }

    $settings->copyFrom($data);
    $settings->save();

    $settings = \Full\Settings::get(["id" => $settings->id]);

    return $settings;
});

?>
