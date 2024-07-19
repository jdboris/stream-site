FROM node:18

ARG FIREBASE_TOKEN
ENV FIREBASE_TOKEN=$FIREBASE_TOKEN

WORKDIR /app

RUN apt update && apt upgrade -y && apt-get install openjdk-17-jdk -y && npm i -g firebase-tools@13.6.0

COPY package*.json ./
COPY functions/package*.json ./functions/

RUN npm install --unsafe-perm

COPY . .

EXPOSE 9099 5000 8080 9000 9199 4000 4500 9150 9299

CMD [ "npm", "start" ]