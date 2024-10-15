echo Generating local SSL certificate...

mkdir -p ./ssl

# Generate a private key
openssl genpkey -algorithm RSA -out ./ssl/privkey.pem -pkeyopt rsa_keygen_bits:2048

# Generate a CSR
# openssl req -new -key privkey.pem -out cert.csr <<EOF
# US
# State
# City
# Organization
# Unit
# $1
# admin@$1
# EOF

# NOTE: MSYS_NO_PATHCONV=1 stops mingw from converting / to a file path
# Source: https://github.com/openssl/openssl/issues/8795
MSYS_NO_PATHCONV=1 openssl req -new -key ./ssl/privkey.pem -out ./ssl/cert.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=$1"

# Generate a self-signed certificate
openssl x509 -req -days 365 -in ./ssl/cert.csr -signkey ./ssl/privkey.pem -out ./ssl/fullchain.pem

# Clean up CSR
rm ./ssl/cert.csr

$SHELL
