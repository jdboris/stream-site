import { createServer as createServerHttps } from "https";
import { createServer as createServerHttp } from "http";
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

const { PORT, PUBLIC_DOMAIN } = process.env;

const app = express();

if (process.env.NODE_ENV != "production") {
  // NOTE: Must come BEFORE express.json() to get raw text body
  app.use(requestLogger);
}

app.use(express.static(path.join(__dirname, "../client/dist")));

app.use(express.json());

app.use(
  session({
    secret: await readFileSync(
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

const keyPath = path.resolve(
  __dirname,
  `../../certbot/volumes/etc/letsencrypt/live/${PUBLIC_DOMAIN}/privkey.pem`
);

const certPath = path.resolve(
  __dirname,
  `../../certbot/volumes/etc/letsencrypt/live/${PUBLIC_DOMAIN}/fullchain.pem`
);

const interval = setInterval(async () => {
  if (startServer()) {
    clearInterval(interval);
  }
}, 5000);

function startServer() {
  if (!existsSync(keyPath) || !existsSync(certPath)) {
    return false;
  }

  const privateKey = readFileSync(keyPath, "utf8");
  const certificate = readFileSync(certPath, "utf8");

  createServerHttps(
    {
      key: privateKey,
      cert: certificate,
    },
    app
  ).listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });

  return true;
}

// Certbot ACME challenge...

const httpApp = express();

httpApp.use(
  "/.well-known",
  express.static(path.join(__dirname, "../client/.well-known"))
);

httpApp.use((req, res) => {
  res.redirect(`https://${PUBLIC_DOMAIN}${req.url}`);
});

createServerHttp(httpApp).listen(80, () => {
  console.log(`Example app listening on port 80`);
});
