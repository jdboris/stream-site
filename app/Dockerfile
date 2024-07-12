FROM node:22-alpine

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN
ENV PORT=443

WORKDIR /app
RUN mkdir client

COPY package*.json .
COPY client/package*.json client

RUN npm install

COPY . .

RUN npm run build
RUN apk add --no-cache inotify-tools

CMD ["npm", "run", "start"]

# NOTE: 80 is required for certbot ACME challenge
EXPOSE 80 443