import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const {
  USE_FIREBASE_EMULATORS,
  FIREBASE_EMULATOR_AUTH_URL,
  FIREBASE_AUTH_URL,
} = process.env;

export class InvalidAuthToken extends Error {
  constructor() {
    super("Invalid auth token.");
  }
}

/**
 * @param {string} authToken
 **/
export async function getUser(authToken) {
  const response =
    USE_FIREBASE_EMULATORS == "true"
      ? await fetch(FIREBASE_EMULATOR_AUTH_URL, {
          method: "POST",
          body: JSON.stringify({ idToken: authToken }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      : await fetch(FIREBASE_AUTH_URL, {
          method: "POST",
          body: JSON.stringify({ data: { idToken: authToken } }),
          headers: {
            "Content-Type": "application/json",
          },
        });

  if (!response.ok) {
    console.error(await response.text());
    throw new InvalidAuthToken();
  }

  const data = await response.json();

  const userData =
    USE_FIREBASE_EMULATORS == "true"
      ? {
          ...data.users[0],
          uid: data.users[0].localId,
          username: data.users[0].displayName,
        }
      : data.result;

  const user = await prisma.user.upsert({
    create: {
      photoUrl: userData.photoUrl || null,
      uid: userData.uid,
      username: userData.username,
      lowercaseUsername: userData.username.toLowerCase(),
      email: userData.email,

      nameColor: userData.nameColor ?? "#000000",
      msgBgColor: userData.msgBgColor ?? "#FFFFFF",
      emailVerified: userData.emailVerified ?? false,
      isStreamer: userData.isStreamer ?? false,

      isAdmin: userData.isAdmin ?? false,
      isModerator: userData.isModerator ?? false,
      isBanned: userData.isBanned ?? false,
    },
    update: {},
    where: { uid: userData.uid },
  });

  return user;
}

/** @param {import("express").Request} req  */
export async function getCurrentUser(req) {
  if (!req.session.token) {
    return null;
  }

  return await getUser(req.session.token);
}
