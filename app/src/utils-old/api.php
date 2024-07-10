<?php
// NOTE: Redirect here with .htaccess for routing...
/*
RewriteEngine on
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.+)$ /utils/api.php [QSA,L]
*/

namespace Api;

define("USE_EMULATORS", true);

// route: /api/auth/login
$route = explode("?", $_SERVER["REQUEST_URI"])[0];

if ($route == "/robots.txt") {
    echo "User-agent: * Disallow: /";
    exit();
}

$routeParts = explode("/", $route);
if (count($routeParts) < 3) {
    respond(null, 404);
}

// file: api/auth.php
$file = $routeParts[1] . "/" . $routeParts[2] . ".php";

// subRoute: /login
array_splice($routeParts, 0, 3);
$subRoute = "/" . implode("/", $routeParts);

if (!file_exists("../" . $file)) {
    respond(null, 404);
}

session_start();

require_once "env.php";

if ($_SERVER["SERVER_NAME"] == "localhost" && USE_EMULATORS) {
    \Env\load(".env.local");
} else {
    \Env\load(".env.production");
}

include_once "utils/sql.php";

// Get the route definitions
include_once $file;

$method = $_SERVER["REQUEST_METHOD"];
$origin = $_SERVER["HTTP_ORIGIN"] ?? null;
if (!$origin) {
    $protocol = $_SERVER["HTTP_HTTPS"] ?? null ? "https" : "http";
    $origin = $protocol . "://" . $_SERVER["HTTP_HOST"];
}


if (in_array($origin, explode(" ", $_ENV["ALLOWED_ORIGINS"]))) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    respond(
        [
            "error" => "CORS error.",
        ],
        400
    );
}
header(
    "Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"
);
header("Access-Control-Allow-Credentials: true");

try {
    if ($method == "OPTIONS") {
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        respond(1);
    } else {
        if ($method == "GET") {
            $data = count($_GET) ? (object) $_GET : null;
        } else {
            $data = json_decode(file_get_contents("php://input"));
        }
        $response = handleRoute($method, $subRoute, $data);
        // NOTE: Reaching this point means no errors/exceptions were thrown
        header("Access-Control-Allow-Methods: " . $method);
        respond($response);
    }
} catch (HttpError $e) {
    if (!$e->getCode()) {
        error_log($e);
    }
    respond(
        [
            "error" => $e->getMessage(),
        ],
        $e->getCode() ? $e->getCode() : 500
    );
} catch (\Error $e) {
    error_log($e);
    respond(
        [
            "error" => "Something went wrong.",
        ],
        500
    );
} catch (\Exception $e) {
    error_log($e);
    respond(
        [
            "error" => "Something went wrong.",
        ],
        500
    );
}

// Error/Exception to throw to send an error response back to the front-end
class HttpError extends \Error
{
}

function respond($body, $code = 200)
{
    http_response_code($code);
    echo json_encode($body);
    exit();
}

$routes = [];

// Registers a route
function route($subRoute, $method, $callback)
{
    global $routes;
    $routes[$subRoute][$method] = $callback;
}

function handleRoute($method, $route, $data)
{
    global $routes;
    return $routes[$route][$method]($data);
}
