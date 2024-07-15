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
        })
      : await fetch(FIREBASE_AUTH_URL, {
          method: "POST",
          body: JSON.stringify({ data: { idToken: authToken } }),
        });

  if (!response.ok) {
    console.error(new InvalidAuthToken());
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

  const user =
    (await prisma.user.findFirst({ where: { uid: userData.uid } })) ||
    (await prisma.user.create({ data: userData }));

  return user;
}
