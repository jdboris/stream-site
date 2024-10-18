ARG BASE_IMAGE=node:22.4.0-alpine3.20

FROM ${BASE_IMAGE} AS base-stage

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN
ARG PORT
ENV PORT=$PORT

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

# Install OpenSSL
RUN apk add --no-cache openssl

RUN chmod +x ./scripts/generate-ssl-cert.sh
RUN ./scripts/generate-ssl-cert.sh $PUBLIC_DOMAIN

# NOTE: 80 is required for certbot ACME challenge
EXPOSE 80 $PORT

# DEV STAGE
FROM base-stage AS dev-stage

CMD ["npm", "run", "dev"]

# PROD STAGE
FROM base-stage AS prod-stage

# Reinstall dependencies to fix broken symlinks
RUN npm install

RUN npm run build

# Remove dev dependencies to optimize the image for production
RUN npm prune --production

CMD ["npm", "run", "start"]
