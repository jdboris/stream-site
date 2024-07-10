<?php
namespace Api;
require_once "utils/sql.php";
require_once "dtos/full/user.php";
require_once "dtos/full/settings.php";
require_once "dtos/suggestion.php";

route("/all", "GET", function ($data) {
    $suggestions = \Suggestion::get(
        filters: (array) ($data->filters ?? null),
        limit: $data->itemsPerPage,
        offset: ($data->page - 1) * $data->itemsPerPage,
        orderBy: "suggestedAt DESC",
        bypassAuth: true
    );

    if (($data->filters ?? null) && count($suggestions) == 0) {
        throw new HttpError("Suggestions(s) not found.", 404);
    }

    $rows = \Sql\query(
        "SELECT count(id) AS rowCount FROM " . \Suggestion::getTableName()
    );

    $pageCount = (int) (1 + $rows[0]["rowCount"] / $data->itemsPerPage);

    return ["suggestions" => $suggestions, "pageCount" => $pageCount];
});

route("/", "POST", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $user = \Full\User::current();

    if (!$user) {
        throw new HttpError("Please login to do that.", 401);
    }

    if ($user->isBanned) {
        throw new HttpError("Sorry, you're banned.", 403);
    }

    if (!$user->emailVerified) {
        throw new HttpError("Please verify your email.", 403);
    }

    $data->text = trim($data->text);

    $suggestion = new \Suggestion();
    $suggestion->copyFrom($data);

    $others = \Suggestion::get(
        // filters: ["text" => $suggestion->text],
        orderBy: "suggestedAt DESC",
        limit: 30,
        bypassAuth: true
    );

    if (count($others)) {
        foreach ($others as $key => $other) {
            similar_text($suggestion->text, $other->text, $percent);
            if ($percent > 60) {
                throw new HttpError("Something similar suggested recently.", 400);
            }
        }
    }

    if (!$suggestion->save()) {
        throw new HttpError("Failed to create suggestion.", 400);
    }

    return ["success" => true];
});

route("/", "DELETE", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $suggestion = new \Suggestion();
    $suggestion->copyFrom($data);
    if (!$suggestion->delete()) {
        throw new HttpError("Failed to delete suggestion.", 400);
    }

    return ["success" => true];
});

?>
