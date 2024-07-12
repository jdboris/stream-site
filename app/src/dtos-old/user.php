<?php

use Api\HttpError;

require_once "dtos/dto.php";
require_once "utils/fetch.php";

class User extends \Dto {
    static function getTableName() {
        return "users";
    }

    static function canUserCreate(?Full\User $user): bool {
        return $user && $user->isAdmin;
    }

    static function canUserRead(?Full\User $user): bool {
        return $user && $user->isAdmin;
    }

    static function canUserUpdate(?Full\User $user): bool {
        return $user && $user->isAdmin;
    }

    public $id;
    public bool $isStreamer = false;
    // NOTE: Properties from Firebase Authentication
    public $uid;
    public $username;
    public $lowercaseUsername;
    public $nameColor;
    public $msgBgColor;
    public bool $emailVerified = false;
    public bool $isModerator = false;
    public bool $isAdmin = false;
    public bool $isBanned = false;

    public function validate(): bool {
        if (empty($this->uid)) {
            throw new HttpError("Uid required.", 400);
        }

        if (empty($this->username)) {
            throw new HttpError("Username required.", 400);
        }

        return true;
    }

    static function login($idToken): ?User {
        static::logout();
        $_SESSION["idToken"] = $idToken;
        $user = self::current();
        return $user;
    }

    static function logout() {
        $_SESSION["idToken"] = null;
    }

    static function current(): ?User {
        $user = null;

        if (!array_key_exists("HTTP_COOKIE", $_SERVER)) {
            error_log(
                "Error: missing cookies in API request. Ensure fetch() has 'credentials' option set to 'include' or 'same-origin'."
            );
            throw new HttpError("Something went wrong.", 400);
        }

        $token = $_SESSION["idToken"] ?? null;

        if (!$token) {
            return null;
        }

        $response = fetch($_ENV["FIREBASE_AUTH_URL"], [
            "method" => "POST",
            "body" => ["data" => ["idToken" => $token]],
        ]);

        if (!$response->ok) {
            throw new \Api\HttpError("Invalid token. Please refresh.", 401);
        }

        $userData = $response->body->result;

        $user = User::get(filters: ["uid" => $userData->uid], bypassAuth: true);

        if (!$user) {
            $user = new User();
            $user->copyFrom($userData, true);
            $user->save(null, true);
        } else {
            $user->copyFrom($userData, true);
        }

        return $user;
    }
}
