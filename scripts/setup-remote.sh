source .env

echo "Uninstalling apache, if any..."
ssh -i ./secrets/id_rsa root@$SSH_ADDRESS 'sudo service httpd stop && sudo apt remove --purge apache2* -y'

echo "Uninstalling mariadb, if any..."
ssh -i ./secrets/id_rsa root@$SSH_ADDRESS 'sudo service mariadb stop && sudo apt remove --purge mariadb-server mariadb-client -y'

echo "Installing git on remote..."
ssh -i ./secrets/id_rsa root@$SSH_ADDRESS 'sudo apt-get update && sudo apt-get install git-all -y'

echo "Installing docker on remote..."
ssh -i ./secrets/id_rsa root@$SSH_ADDRESS '
  # Add Docker official GPG key:
  sudo apt-get update
  sudo apt-get install ca-certificates curl -y
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc

  # Add the repository to Apt sources:
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
'

ssh -i ./secrets/id_rsa root@$SSH_ADDRESS '
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
'

$SHELL
