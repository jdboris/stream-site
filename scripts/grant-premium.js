#!/usr/bin/env node
"use strict";

const { createRequire } = require("node:module");
const path = require("node:path");
const { parseArgs } = require("node:util");

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const HELP = `Grant one month (30 days) of chat Premium using Node.js 18+.

Usage:
  node scripts/grant-premium.js --emulator --project PROJECT_ID --username USERNAME
  node scripts/grant-premium.js --production --project PROJECT_ID --uid UID --dry-run
  node scripts/grant-premium.js --production --project PROJECT_ID --uid UID --confirm-production

Options:
  --emulator             Use Firestore emulator; never falls back to production.
  --emulator-host HOST   Emulator host:port (default: FIRESTORE_EMULATOR_HOST or 127.0.0.1:8080).
  --production           Use the live Firestore database with Application Default Credentials.
  --project PROJECT_ID   Required explicit Firebase project ID, including for emulators.
  --uid UID              Firebase Auth UID (users document ID).
  --username USERNAME    Chat username, case-insensitive. Specify exactly one user selector.
  --dry-run              Print the proposed grant without writing anything.
  --confirm-production   Required for production writes.
  --help                 Show this help.

Install dependencies once:
  npm --prefix app/client/react-firebase-chat/firebase/functions install

Production credentials: set GOOGLE_APPLICATION_CREDENTIALS to an authorized service
account JSON file, or run gcloud auth application-default login. Firebase CLI login
alone is not sufficient. Existing gift time and active/trialing paid subscription
periods are preserved. Every successful invocation adds another 30 days.
`;

function optionsFromArgs(args, env = process.env) {
  const { values } = parseArgs({
    args,
    options: {
      emulator: { type: "boolean" },
      production: { type: "boolean" },
      project: { type: "string" },
      uid: { type: "string" },
      username: { type: "string" },
      "emulator-host": { type: "string" },
      "dry-run": { type: "boolean" },
      "confirm-production": { type: "boolean" },
      help: { type: "boolean" },
    },
  });
  if (values.help) return values;
  if (!!values.emulator === !!values.production) {
    throw new Error("Specify exactly one of --emulator or --production.");
  }
  if (!values.project?.trim()) throw new Error("--project is required.");
  if (!!values.uid === !!values.username || !(values.uid || values.username).trim()) {
    throw new Error("Specify exactly one nonempty --uid or --username.");
  }
  if (values.uid?.includes("/")) throw new Error("--uid must be a document ID, not a path.");
  if (values.production) {
    if (env.FIRESTORE_EMULATOR_HOST || values["emulator-host"]) {
      throw new Error("Remove FIRESTORE_EMULATOR_HOST and --emulator-host for production.");
    }
    if (!values["dry-run"] && !values["confirm-production"]) {
      throw new Error("Production writes require --confirm-production. Preview with --dry-run first.");
    }
  } else {
    values["emulator-host"] = values["emulator-host"] || env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
    if (!/^(?:\[[\da-fA-F:]+\]|[\w.-]+):\d+$/.test(values["emulator-host"])) {
      throw new Error("--emulator-host must be host:port without http://.");
    }
  }
  return values;
}

async function grantPremium(db, options, now = new Date()) {
  let ref;
  if (options.uid) {
    ref = db.collection("users").doc(options.uid);
  } else {
    const matches = await db.collection("users")
      .where("lowercaseUsername", "==", options.username.toLowerCase()).limit(2).get();
    if (matches.size !== 1) {
      throw new Error(`Expected exactly one user matching ${JSON.stringify(options.username)}; found ${matches.size}. Use --uid instead.`);
    }
    ref = matches.docs[0].ref;
  }

  // A transaction prevents concurrent grants from losing existing gifted time.
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new Error(`User document users/${ref.id} does not exist.`);
    const user = snapshot.data();
    const subscriptions = await transaction.get(ref.collection("subscriptions")
      .where("status", "in", ["active", "trialing"]));
    const giftStart = user.giftedPremiumStart?.toDate();
    const giftEnd = user.giftedPremiumEnd?.toDate();
    const hasGift = giftStart && giftEnd && giftStart <= giftEnd && giftEnd > now;
    let end = hasGift ? giftEnd : now;
    let start = hasGift ? giftStart : now;

    for (const subscription of subscriptions.docs) {
      const data = subscription.data();
      const paidEnd = data.current_period_end?.toDate();
      if (data.role === "premium" && paidEnd > end) end = paidEnd;
    }
    // Queue a new gift after paid time, but retain the start of an existing gift.
    if (!hasGift) start = end;
    end = new Date(end.getTime() + MONTH_MS);
    if (!options["dry-run"]) {
      transaction.update(ref, { giftedPremiumStart: start, giftedPremiumEnd: end });
    }
    return { uid: ref.id, username: user.username || null, start: start.toISOString(), end: end.toISOString() };
  });
}

async function main() {
  const options = optionsFromArgs(process.argv.slice(2));
  if (options.help) return console.log(HELP);
  if (options.emulator) process.env.FIRESTORE_EMULATOR_HOST = options["emulator-host"];

  // Reuse the chat functions' Admin SDK rather than adding a second dependency tree.
  const requireFunctions = createRequire(path.join(__dirname, "../app/client/react-firebase-chat/firebase/functions/package.json"));
  let adminApp, adminFirestore;
  try {
    adminApp = requireFunctions("firebase-admin/app");
    adminFirestore = requireFunctions("firebase-admin/firestore");
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    throw new Error("Install the chat functions dependencies first: npm --prefix app/client/react-firebase-chat/firebase/functions install");
  }
  const app = adminApp.initializeApp({
    projectId: options.project,
    ...(options.production ? { credential: adminApp.applicationDefault() } : {}),
  });
  try {
    const target = options.emulator ? `emulator ${options["emulator-host"]}` : "PRODUCTION";
    console.log(`${options["dry-run"] ? "Previewing" : "Granting"} 30 days: ${target}, project ${options.project}`);
    const result = await grantPremium(adminFirestore.getFirestore(app), options);
    console.log(JSON.stringify({ written: !options["dry-run"], ...result }, null, 2));
  } finally {
    await adminApp.deleteApp(app);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { optionsFromArgs, grantPremium };
