declare namespace NodeJS {
  interface ProcessEnv {
    USE_FIREBASE_EMULATORS: "true" | "false";
    PORT: string;
    ALLOWED_ORIGINS: string;
    MYSQL_HOSTNAME: string;
    MYSQL_USERNAME: string;
    MYSQL_PASSWORD: string;
    MYSQL_DATABASE_NAME: string;
    FIREBASE_API_KEY: string;
    FIREBASE_EMULATOR_AUTH_URL: string;
    FIREBASE_AUTH_URL: string;

    DATABASE_URL: string;
  }
}
