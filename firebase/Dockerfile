FROM node:18.20.4

ARG FIREBASE_TOKEN
ENV FIREBASE_TOKEN=$FIREBASE_TOKEN

ARG FIREBASE_APP_PATH
ENV FIREBASE_APP_PATH=$FIREBASE_APP_PATH

WORKDIR /app

RUN apt update && apt upgrade -y && apt-get install openjdk-17-jdk -y

COPY ./firebase/package*.json ./
COPY ${FIREBASE_APP_PATH}/firebase/functions/package*.json ./functions/

RUN npm install --unsafe-perm

COPY ${FIREBASE_APP_PATH}/firebase .

EXPOSE 9099 5000 8080 9000 9199 4000 4500 9150 9299

CMD [ "npm", "start" ]

# ENTRYPOINT ["tail"]
# CMD ["-f","/dev/null"]
