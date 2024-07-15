source .env

docker build -t stream-site/stream-site-firebase:1.0 --build-arg FIREBASE_TOKEN=$FIREBASE_TOKEN .
