<?php
namespace Api;
require_once "dtos/full/user.php";
require_once "dtos/banner.php";

route("/", "GET", function ($filters) {
    $settings = \Full\Settings::get(filters: ["id" => 1], bypassAuth: true);

    return \Full\Banner::get(
        filters: ["id" => $settings->bannerId],
        bypassAuth: true
    );
});

route("/all", "GET", function ($filters) {
    $banners = \Full\Banner::get(
        filters: (array) $filters,
        limit: 50,
        bypassAuth: true
    );

    if ($filters && count($banners) == 0) {
        throw new HttpError("Banners(s) not found.", 404);
    }

    return $banners;
});

route("/", "PUT", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $banner = new \Full\Banner();
    $banner->copyFrom($data);
    $banner->save();

    return ["success" => true];
});

route("/", "POST", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $banner = new \Full\Banner();
    $banner->copyFrom($data);
    if (!$banner->save()) {
        throw new HttpError("Failed to create banner.", 400);
    }

    return ["success" => true];
});

?>
