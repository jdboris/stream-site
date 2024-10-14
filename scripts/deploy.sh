source .env

# Exit if the repo isn't clean
if ! git diff-index --quiet HEAD --; then
  echo "ERROR: Commit or stash all changes before continuing."

  $SHELL
  exit 1
fi

echo "Pushing repo changes to origin..."
git push origin main

REPO_URL=$(git remote get-url origin)
# Insert the access token into the URL
REPO_URL_WITH_AUTH=$(echo "$REPO_URL" | sed "s|https://|https://${GITHUB_PERSONAL_ACCESS_TOKEN}@|")

ssh -i ./secrets/id_rsa root@$SSH_ADDRESS "rm -rf /stream-site/ && mkdir -p /stream-site/ && cd /stream-site/ && git clone --recurse-submodules -j8 $REPO_URL_WITH_AUTH . ; git pull"

# Copy/upload untracked files
scp -i ./secrets/id_rsa -r ./.env.production root@$SSH_ADDRESS:/stream-site/.env

scp -i ./secrets/id_rsa -r ./app/client/react-firebase-chat/firebase/.firebaserc root@$SSH_ADDRESS:/stream-site/app/client/react-firebase-chat/firebase/
scp -i ./secrets/id_rsa -r ./app/client/react-firebase-chat/firebase/functions/.runtimeconfig.json root@$SSH_ADDRESS:/stream-site/app/client/react-firebase-chat/firebase/functions/

echo Building and running...

# Build/run from the temporary folder
ssh -i ./secrets/id_rsa root@$SSH_ADDRESS '
  cd /stream-site/ && docker compose pull && docker compose -p stream-site -f docker-compose.yml --profile production up --build --force-recreate --renew-anon-volumes --detach
'

ssh -i ./secrets/id_rsa root@$SSH_ADDRESS 'docker system prune --all'

$SHELL
