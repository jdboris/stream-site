docker compose down
docker compose pull

# docker compose --progress=plain -p stream-site build --no-cache && docker compose --progress=plain -p stream-site -f docker-compose.yml -f docker-compose.dev.yml up --watch

docker compose --progress=plain -p stream-site --profile development -f docker-compose.yml -f docker-compose.dev.yml build &&
  docker compose --progress=plain -p stream-site --profile development -f docker-compose.yml -f docker-compose.dev.yml up --watch

# docker compose --progress=plain -p stream-site -f docker-compose.yml -f docker-compose.dev.yml up
# docker system prune --all --force

$SHELL
