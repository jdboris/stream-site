import { createServer } from "https";
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
import requestLogger from "./utils/request-logger.js";
import { readFileSync } from "fs";

const { PORT, PUBLIC_DOMAIN } = process.env;

const app = express();

if (process.env.NODE_ENV != "production") {
  // NOTE: Must come BEFORE express.json() to get raw text body
  app.use(requestLogger);
}

app.use(express.static("./client/dist"));

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

const privateKey = readFileSync(
  path.resolve(
    __dirname,
    `../../certbot/volumes/etc/letsencrypt/live/${PUBLIC_DOMAIN}/privkey.pem`
  ),
  "utf8"
);
const certificate = readFileSync(
  path.resolve(
    __dirname,
    `../../certbot/volumes/etc/letsencrypt/live/${PUBLIC_DOMAIN}/fullchain.pem`
  ),
  "utf8"
);

createServer(
  {
    key: privateKey,
    cert: certificate,
  },
  app
).listen(PORT);

console.log(`App listening on port ${PORT}`);
