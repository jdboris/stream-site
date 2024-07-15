FROM node:22-alpine

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

RUN npm install

COPY . .

# NOTE: Repeat install as workaround for symlink package bug
RUN cd client && npm install react-firebase-chat

RUN npm run build

CMD ["npm", "run", "start"]

# NOTE: 80 is required for certbot ACME challenge
EXPOSE 80 443
