source .env

ssh-keygen -t rsa -b 4096 -f ./secrets/id_rsa -N "" -y
ssh-copy-id -i ./secrets/id_rsa.pub root@$SSH_ADDRESS
$SHELL
