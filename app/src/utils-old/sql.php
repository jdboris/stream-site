<?php
// https://websitebeaver.com/prepared-statements-in-php-mysqli-to-prevent-sql-injection
namespace Sql;

// NOTE: Exclude certain warnings from error reporting
// https://stackoverflow.com/a/29170597
mysqli_report((MYSQLI_REPORT_ALL ^ MYSQLI_REPORT_INDEX) | MYSQLI_REPORT_STRICT);
try {
    $mysqli = new \mysqli(
        $_ENV["MYSQL_HOSTNAME"],
        $_ENV["MYSQL_USERNAME"],
        $_ENV["MYSQL_PASSWORD"],
        $_ENV["MYSQL_DATABASE_NAME"]
    );
    $mysqli->set_charset("utf8mb4");
} catch (\Exception $e) {
    error_log($e);
    //throw $e;
}

// NOTE: Make this global to prevent it from going out of scope after query() returns
$stmt = null;

function query($query, ...$params) {
    global $mysqli;
    global $stmt;
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        throw new \Error($mysqli->error . ":\n\r $query");
    }

    if (count($params)) {
        $success = $stmt->bind_param(
            // Reduce the types down to a type string (i.e. "sdis")
            array_reduce(
                // Map booleans to integers
                array_map(
                    function($x) {
                        return gettype($x) == "boolean" ? intval($x) : $x;
                    },
                    $params
                ),
                function ($sum, $param) {
                    $type = gettype($param);
                    // If the type is boolean or NULL, translate them to appropriate types
                    $character = ($type[0] == "b"
                            ? "i"
                            : $type[0] == "N")
                        ? "s"
                        : $type[0];
                    return $sum . $character;
                },
                ""
            ),
            ...$params
        );

        if (!$success) {
            throw new \Error($mysqli->error . ":\n\r $query");
        }
    }

    if (!$stmt->execute()) {
        throw new \Error($mysqli->error . ":\n\r $query");
    }

    // If this was a SELECT
    if ($result = $stmt->get_result()) {
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        if (count($rows)) {
            // Turn ["banner.id"] into ["banner"]["id"], etc...
            $rows = array_map(function ($row) {
                foreach ($row as $key => $value) {
                    $keychain = explode(".", $key);
                    setRowValue($row, $keychain, $value);
                    if (count($keychain) > 1) {
                        unset($row[$key]);
                    }
                }

                return $row;
            }, $rows);
        }

        return $rows;
    }

    // If this was anything but a SELECT
    return $stmt->affected_rows;
}

function setRowValue(&$array, $keychain, $value) {
    $key = array_shift($keychain);
    if (count($keychain) > 0) {
        if (!isset($array[$key])) {
            $array[$key] = [];
        }
        setRowValue($array[$key], $keychain, $value);
    } else {
        $array[$key] = $value;
    }
}

function mysqli(): \mysqli {
    global $mysqli;
    return $mysqli;
}

?>
