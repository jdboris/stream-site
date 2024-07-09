<?php

class FetchResponse {
    public $ok, $status, $headers, $body;

    public function __construct($headers, $body) {
        $this->headers = $headers;
        $this->status = (int) substr($headers[0], 9, 3);
        $this->ok = $this->status >= 200 && $this->status <= 300;
        $this->body = $body;
    }
}

function fetch($url, $options = ["method" => "GET", "body" => []]) {
    // NOTE: use key 'http' even if you send the request to https://...
    $options = [
        "http" => [
            "header" => "Content-type: application/json\r\n",
            "method" => $options["method"],
            "content" => json_encode($options["body"]),
            "ignore_errors" => true,
        ],
    ];

    $context = stream_context_create($options);
    $body = file_get_contents($url, false, $context);
    if ($body === false) {
        throw new Error("Failed to fetch.");
    }

    return new FetchResponse($http_response_header, json_decode($body));
}

?>
