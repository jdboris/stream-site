<?php
namespace Api;
require_once "dtos/full/user.php";

route("/login", "POST", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $token = $data->idToken ?? null;

    if (!$token) {
        throw new HttpError("Invalid arguments.", 400);
    }

    try {
        $user = \Full\User::login($token);
    } catch (\Error $e) {
        error_log($e);
        throw new HttpError("Login failed.", 400);
    }

    if (!$user) {
        throw new HttpError("Login failed.", 400);
    }

    return $user;
});

route("/logout", "GET", function ($data) {
    \Full\User::logout();
    return ["success" => true];
});

?>
