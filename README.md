# Development

## Prerequisites

### `.env`

- `GITHUB_PERSONAL_ACCESS_TOKEN`

  [Personal access token generated with GitHub UI.](https://github.com/settings/tokens?type=beta)

  NOTE: Deployment will fail if this token is expired.

- `ENVIRONMENT`

  `development` or `production`

- `DATABASE_NAME`

  Name of the database.

- `DATABASE_PASSWORD`

  Password of using with access to the database.

- `CERTBOT_EMAIL`

  Email address to use with Let's Encrypt's Certbot.

- `PUBLIC_DOMAIN`

  The app's domain name used to request SSL certs.

- `SSH_ADDRESS`

  The address to use for SSH.

## Build/Run

```
./scripts/run.sh
```

# Deployment

## Prerequisites

- Requires a Debian-based Linux distro on remote machine
- `./scripts/setup-remote.sh`

## Deploy

```
./scripts/deploy.sh
```

# View Container Logs (Local)

```
docker logs --since=1h -f stream-site-app-1
```

# View Container Logs (Remote)

```
ssh -i ./secrets/id_rsa root@$SSH_ADDRESS 'docker logs --since=1h -f stream-site-app-1'
```

# Connect to Container Shell

```
ssh -t -i ./secrets/id_rsa root@$SSH_ADDRESS 'docker exec -it stream-site-app-1 bash'
```
