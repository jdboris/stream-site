"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { optionsFromArgs, grantPremium } = require("./grant-premium");

const NOW = new Date("2026-10-18T06:00:00Z");
const timestamp = (iso) => ({ toDate: () => new Date(iso) });

function database(user = {}, subscriptions = [], matchCount = 1) {
  const writes = [];
  const ref = { id: "test-uid", collection: () => ({ where: () => ({ subscriptions: true }) }) };
  const db = {
    collection: () => ({
      doc: (uid) => { assert.equal(uid, ref.id); return ref; },
      where: (field, operator, value) => {
        assert.deepEqual([field, operator, value], ["lowercaseUsername", "==", "tester"]);
        return { limit: () => ({ get: async () => ({ size: matchCount, docs: [{ ref }] }) }) };
      },
    }),
    runTransaction: async (callback) => callback({
      get: async (target) => target === ref
        ? { exists: user !== null, data: () => user }
        : { docs: subscriptions.map((data) => ({ data: () => data })) },
      update: (target, data) => { assert.equal(target, ref); writes.push(data); },
    }),
  };
  return { db, writes };
}

test("requires explicit target, project, and one user selector", () => {
  for (const args of [[], ["--emulator"], ["--emulator", "--production"],
    ["--emulator", "--project", "demo-chat"],
    ["--emulator", "--project", "demo-chat", "--uid", "a", "--username", "b"],
    ["--emulator", "--project", "demo-chat", "--uid", "a/b"]]) {
    assert.throws(() => optionsFromArgs(args, {}));
  }
});

test("production requires confirmation and rejects emulator configuration", () => {
  const args = ["--production", "--project", "live-chat", "--uid", "test-uid"];
  assert.throws(() => optionsFromArgs(args, {}), /confirm-production/);
  assert.equal(optionsFromArgs([...args, "--dry-run"], {}).production, true);
  assert.equal(optionsFromArgs([...args, "--confirm-production"], {}).production, true);
  assert.throws(() => optionsFromArgs([...args, "--confirm-production"], {
    FIRESTORE_EMULATOR_HOST: "localhost:8080",
  }), /Remove FIRESTORE_EMULATOR_HOST/);
  assert.throws(() => optionsFromArgs([...args, "--dry-run", "--emulator-host", "localhost:8080"], {}));
});

test("emulator defaults and overrides are explicit", () => {
  const args = ["--emulator", "--project", "demo-chat", "--uid", "test-uid"];
  assert.equal(optionsFromArgs(args, {})["emulator-host"], "127.0.0.1:8080");
  assert.equal(optionsFromArgs(args, { FIRESTORE_EMULATOR_HOST: "firebase:8080" })["emulator-host"], "firebase:8080");
  assert.throws(() => optionsFromArgs([...args, "--emulator-host", "http://localhost:8080"], {}));
});

test("grants an immediate 30-day timestamp interval to an existing user", async () => {
  const { db, writes } = database({ username: "Tester" });
  const result = await grantPremium(db, { uid: "test-uid" }, NOW);
  assert.equal(result.start, NOW.toISOString());
  assert.equal(result.end, "2026-11-17T06:00:00.000Z");
  assert.deepEqual(writes, [{ giftedPremiumStart: NOW, giftedPremiumEnd: new Date(result.end) }]);
});

test("extends existing gifts without moving their start", async () => {
  const { db, writes } = database({
    giftedPremiumStart: timestamp("2026-10-01T00:00:00Z"),
    giftedPremiumEnd: timestamp("2026-11-01T00:00:00Z"),
  });
  const result = await grantPremium(db, { uid: "test-uid" }, NOW);
  assert.equal(result.start, "2026-10-01T00:00:00.000Z");
  assert.equal(result.end, "2026-12-01T00:00:00.000Z");
  assert.equal(writes.length, 1);
});

test("queues gifts after the latest paid Premium period", async () => {
  const { db } = database({}, [
    { role: "premium", current_period_end: timestamp("2026-11-01T00:00:00Z") },
    { role: "premium", current_period_end: timestamp("2026-12-01T00:00:00Z") },
    { role: "other", current_period_end: timestamp("2027-01-01T00:00:00Z") },
  ]);
  const result = await grantPremium(db, { uid: "test-uid" }, NOW);
  assert.equal(result.start, "2026-12-01T00:00:00.000Z");
  assert.equal(result.end, "2026-12-31T00:00:00.000Z");
});

test("expired gifts and paid periods do not backdate the grant", async () => {
  const { db } = database({
    giftedPremiumStart: timestamp("2026-09-01T00:00:00Z"),
    giftedPremiumEnd: timestamp("2026-10-01T00:00:00Z"),
  }, [{ role: "premium", current_period_end: timestamp("2026-10-01T00:00:00Z") }]);
  const result = await grantPremium(db, { uid: "test-uid" }, NOW);
  assert.equal(result.start, NOW.toISOString());
});

test("dry run resolves usernames case-insensitively and never writes", async () => {
  const { db, writes } = database();
  await grantPremium(db, { username: "TeStEr", "dry-run": true }, NOW);
  assert.equal(writes.length, 0);
});

test("refuses missing or ambiguous users", async () => {
  await assert.rejects(grantPremium(database(null).db, { uid: "test-uid" }, NOW), /does not exist/);
  for (const count of [0, 2]) {
    await assert.rejects(grantPremium(database({}, [], count).db, { username: "tester" }, NOW), /exactly one user/);
  }
});
