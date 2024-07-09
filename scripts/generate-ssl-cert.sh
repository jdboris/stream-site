echo Generating local SSL certificate...

# Generate a private key
openssl genpkey -algorithm RSA -out privkey.pem -pkeyopt rsa_keygen_bits:2048

# Generate a CSR
# openssl req -new -key privkey.pem -out cert.csr <<EOF
# US
# State
# City
# Organization
# Unit
# localhost
# admin@localhost
# EOF

# NOTE: MSYS_NO_PATHCONV=1 stops mingw from converting / to a file path
# Source: https://github.com/openssl/openssl/issues/8795
MSYS_NO_PATHCONV=1 openssl req -new -key privkey.pem -out cert.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate a self-signed certificate
openssl x509 -req -days 365 -in cert.csr -signkey privkey.pem -out fullchain.pem

# Clean up CSR
rm cert.csr

$SHELL
