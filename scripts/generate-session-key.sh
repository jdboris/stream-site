mkdir -p ./app/secrets
ssh-keygen -t rsa -b 4096 -m PEM -f ./app/secrets/session-key.key -N ""
openssl rsa -in ./app/secrets/session-key.key -pubout -outform PEM -out ./app/secrets/session-key.key.pub

$SHELL
