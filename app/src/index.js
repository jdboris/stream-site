import {
  createServer as createServerHttps,
  Server as HttpsServer,
} from "https";
import { createServer as createServerHttp, Server as HttpServer } from "http";
import express from "express";
import session from "express-session";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRouter from "./routes/auth.js";
import bannersRouter from "./routes/banners.js";
import channelsRouter from "./routes/channels.js";
import settingsRouter from "./routes/settings.js";
import streamEventsRouter from "./routes/stream-events.js";
import suggestionsRouter from "./routes/suggestions.js";

import requestLogger from "./utils/request-logger.js";
import { existsSync, readFileSync } from "fs";
import HttpError from "./utils/http-error.js";

const { NODE_ENV, PORT, PUBLIC_DOMAIN } = process.env;

/** @type {HttpsServer|null} */
let server = null;
/** @type {HttpServer|null} */
let httpAcmeChallengeServer = null;
/** @type {HttpsServer|null} */
let httpsAcmeChallengeServer = null;

// Periodically check for cert files and start acme challenge servers if they're missing.
const interval = setInterval(async () => {
  const keyPath = path.resolve(
    __dirname,
    `../../certbot/volumes/etc/letsencrypt/live/${PUBLIC_DOMAIN}/privkey.pem`
  );

  const certPath = path.resolve(
    __dirname,
    `../../certbot/volumes/etc/letsencrypt/live/${PUBLIC_DOMAIN}/fullchain.pem`
  );

  if (existsSync(keyPath) && existsSync(certPath)) {
    clearInterval(interval);

    if (httpAcmeChallengeServer) httpAcmeChallengeServer.close();
    if (httpsAcmeChallengeServer) httpsAcmeChallengeServer.close();
    server = startServer(keyPath, certPath);
    return;
  }

  if (server) server.close();
  httpAcmeChallengeServer = startHttpAcmeChallengeServer();
  httpsAcmeChallengeServer = startHttpsAcmeChallengeServer();
}, 5000);

/**
 * @param {string} certPath
 * @param {string} keyPath
 * */
function startServer(keyPath, certPath) {
  const app = express();

  if (NODE_ENV != "production") {
    // NOTE: Must come BEFORE express.json() to get raw text body
    app.use(requestLogger);
  }

  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.use(express.json());

  app.use(
    session({
      secret: readFileSync(
        path.resolve(__dirname, "../secrets/session-key.key"),
        "utf8"
      ),
      resave: false,
      saveUninitialized: false,
      cookie: { secure: true },
    })
  );

  // Routers
  app.use(authRouter);
  app.use(bannersRouter);
  app.use(channelsRouter);
  app.use(settingsRouter);
  app.use(streamEventsRouter);
  app.use(suggestionsRouter);

  app.use(
    /**
     * @param {Error} error
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     *
     **/
    async (error, req, res, next) => {
      if (error instanceof HttpError) {
        res.status(error.status).send({
          error: error.message,
        });
        return;
      }

      console.error(error);
      res.status(500).send({
        error: "Something went wrong. Please try again.",
      });
    }
  );

  const privateKey = readFileSync(keyPath, "utf8");
  const certificate = readFileSync(certPath, "utf8");

  return createServerHttps(
    {
      key: privateKey,
      cert: certificate,
    },
    app
  ).listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}

// HTTPS (in case of proxies like cloudflare)
function startHttpsAcmeChallengeServer() {
  // Use self-signed cert for now
  const keyPath = path.resolve(
    __dirname,
    `../../certbot/volumes/etc/letsencrypt/live/localhost/privkey.pem`
  );

  const certPath = path.resolve(
    __dirname,
    `../../certbot/volumes/etc/letsencrypt/live/localhost/fullchain.pem`
  );

  const app = express();

  app.use(
    "/.well-known",
    express.static(path.join(__dirname, "../client/.well-known"))
  );

  const privateKey = readFileSync(keyPath, "utf8");
  const certificate = readFileSync(certPath, "utf8");

  return createServerHttps(
    {
      key: privateKey,
      cert: certificate,
    },
    app
  ).listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}

// HTTP
function startHttpAcmeChallengeServer() {
  const app = express();

  app.get("/healthcheck", (req, res) => {
    res.send();
  });

  // Certbot ACME challenge...
  app.use(
    "/.well-known",
    express.static(path.join(__dirname, "../client/.well-known"))
  );

  return createServerHttp(app).listen(80, () => {
    console.log(`Example app listening on port 80`);
  });
}
