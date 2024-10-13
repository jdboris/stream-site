FROM certbot/certbot:latest

ARG CERTBOT_EMAIL
ENV CERTBOT_EMAIL=$CERTBOT_EMAIL
ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN

ENV XDG_CONFIG_HOME=/certbot-config/

RUN mkdir -p /certbot-config/letsencrypt/
RUN mkdir -p /var/www/html/.well-known/

# Source: https://eff-certbot.readthedocs.io/en/latest/using.html#configuration-file
COPY /config/cli.ini /certbot-config/letsencrypt/cli.ini
RUN echo "email = $CERTBOT_EMAIL" >> /certbot-config/letsencrypt/cli.ini

# ACME challenge files
VOLUME [ "/var/www/html/.well-known/" ]
# Certbot config files
VOLUME [ "/var/lib/letsencrypt/" ]
# Cert files
VOLUME [ "/etc/letsencrypt/" ]

# USAGE:

# 1. Run this container with...
# certonly -d "$PUBLIC_DOMAIN"

# 2. Bind the above volumes to the host

# 3. Share the ACME challenge volume and cert files volume with the web server container
