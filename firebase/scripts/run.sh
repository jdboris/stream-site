source .env

./scripts/build.sh

docker network create stream-site-network
# Stop
docker container stop stream-site-firebase-1
docker rm stream-site-firebase-1
# Start
docker run -d \
  -p 9099:9099 \
  -p 5000:5000 \
  -p 8080:8080 \
  -p 9000:9000 \
  -p 9199:9199 \
  -p 4000:4000 \
  -p 4500:4500 \
  -p 9150:9150 \
  -p 9299:9299 \
  -v "/$PWD/.env":/app/.env \
  -v "/$PWD/volumes/.cache":/root/.cache/firebase/emulators \
  --name stream-site-firebase-1 -t stream-site/stream-site-firebase:1.0
docker network connect stream-site-network stream-site-firebase

$SHELL
