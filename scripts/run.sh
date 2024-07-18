docker compose down
docker compose pull
# docker compose --progress=plain -p stream-site build --no-cache && docker compose --progress=plain -p stream-site up --watch
docker compose --progress=plain -p stream-site build && docker compose --progress=plain -p stream-site up --watch

$SHELL
