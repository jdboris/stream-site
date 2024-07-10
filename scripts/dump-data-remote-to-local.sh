source .env

ssh -i ./secrets/id_rsa root@xxxxxxxx '
  rm -rf /tmp/data.sql
  mariadb-dump -u root -pxxxxxxxx --no-create-db --no-create-info  stream_site > /tmp/data.sql
'

mkdir ./tmp
scp -i ./secrets/id_rsa -r root@xxxxxxxx:/tmp/data.sql ./tmp/data.sql

$SHELL
