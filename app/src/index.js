import { createServer } from "https";
import express from "express";
import { config } from "dotenv";
config();

// import usersRouter from "./routes/users.js";
// import webhookTargetsRouter from "./routes/webhook-targets.js";
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

// app.use(usersRouter);

const privateKey = readFileSync(
  `/etc/letsencrypt/live/${PUBLIC_DOMAIN}/privkey.pem`
);
const certificate = readFileSync(
  `/etc/letsencrypt/live/${PUBLIC_DOMAIN}/fullchain.pem`
);

createServer(
  {
    key: privateKey,
    cert: certificate,
  },
  app
).listen(PORT);

console.log(`App listening on port ${PORT}`);
