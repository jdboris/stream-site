# Use the official Alpine image
FROM alpine:latest

ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN

# Install OpenSSL
RUN apk add --no-cache openssl

COPY ./scripts /scripts

# Generate a self-signed cert to fall back on
RUN chmod +x /scripts/generate-ssl-cert.sh

CMD /scripts/generate-ssl-cert.sh "$PUBLIC_DOMAIN" "/etc/letsencrypt/live/$PUBLIC_DOMAIN"

# Cert files
VOLUME [ "/etc/letsencrypt" ]