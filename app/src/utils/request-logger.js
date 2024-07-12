import express from "express";

/**
 * Logs the entire request in raw HTTP format.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 */
export default function requestLogger(req, res, next) {
  express.raw({ type: "*/*" })(req, res, () => {
    console.log(
      "------------------------------ REQUEST ------------------------------"
    );
    console.log(
      `${req.method.toUpperCase()} ${`${req.protocol}://${req.get("host")}${
        req.originalUrl
      }`} ${req.protocol.toUpperCase()}/${
        req.httpVersion
      }\n${req.rawHeaders.reduce(
        // Convert raw headers array into key/value pairs with ':' between
        (total, x, i) => total + (i % 2 == 0 ? x : `: ${x}\r\n`),
        ""
      )}\r\n${req.body}`
    );
    console.log(
      "---------------------------- REQUEST END ----------------------------"
    );
  });

  next();
}
