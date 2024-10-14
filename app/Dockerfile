ARG BASE_IMAGE=node:22.4.0-alpine3.20

FROM ${BASE_IMAGE} AS base-stage

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN
ENV PORT=443

WORKDIR /app

RUN mkdir -p client/react-firebase-chat

COPY package*.json .
COPY client/package*.json client
COPY client/react-firebase-chat/package*.json client/react-firebase-chat/

RUN npm config set registry https://registry.npmjs.org/

RUN npm ci --unsafe-perm

COPY . .

# NOTE: Repeat install as workaround for symlink package bug
RUN cd client && npm install react-firebase-chat

# NOTE: 80 is required for certbot ACME challenge
EXPOSE 80 443

# DEV STAGE
FROM ${BASE_IMAGE} AS dev-stage

WORKDIR /app

COPY --from=base-stage /app .

CMD ["npm", "run", "dev"]

# PROD STAGE
FROM ${BASE_IMAGE} AS prod-stage

WORKDIR /app

COPY --from=base-stage /app .

RUN npm run build

CMD ["npm", "run", "start"]
