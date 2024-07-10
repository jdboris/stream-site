<?php
namespace Api;
require_once "utils/sql.php";
require_once "dtos/full/user.php";
require_once "dtos/stream-event.php";

route("/all", "GET", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    if ($data->filters ?? null) {
        $streamEvents = \StreamEvent::get(
            filters: (array) $data->filters,
            limit: 999,
            bypassAuth: true
        );
    } else {
        $start = mktime(0, 0, 0, $data->month, 1, $data->year);
        $end = mktime(23, 59, 59, $data->month, date("t", $start));

        $streamEvents = \StreamEvent::get(
            customClause: [
                "WHERE (`start` >= ? AND `start` <= ?) OR (`end` >= ? AND `end` <= ?)",
                date("Y-m-d H:i:s", $start),
                date("Y-m-d H:i:s", $end),
                date("Y-m-d H:i:s", $start),
                date("Y-m-d H:i:s", $end),
            ],
            limit: 999,
            bypassAuth: true
        );
    }

    if (($data->filters ?? null) && count($streamEvents) == 0) {
        throw new HttpError("Stream Event(s) not found.", 404);
    }

    return $streamEvents;
});

route("/", "POST", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $streamEvent = new \StreamEvent();
    $streamEvent->copyFrom($data, skipDependants: true);

    if (!$streamEvent->save()) {
        throw new HttpError("Failed to create event.", 400);
    }

    return ["success" => true];
});

route("/", "PUT", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $streamEvent = new \StreamEvent();
    $streamEvent->copyFrom($data);
    $streamEvent->save();

    return ["success" => true];
});

route("/", "DELETE", function ($data) {
    if (!$data) {
        throw new HttpError("Invalid arguments.", 400);
    }

    $streamEvent = new \StreamEvent();
    $streamEvent->copyFrom($data);
    if (!$streamEvent->delete()) {
        throw new HttpError("Failed to delete event.", 400);
    }

    return ["success" => true];
});

?>
