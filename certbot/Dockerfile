FROM certbot/certbot:latest

ARG CERTBOT_EMAIL
ENV CERTBOT_EMAIL=$CERTBOT_EMAIL
ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN

RUN certbot certonly --standalone --non-interactive --agree-tos -m $CERTBOT_EMAIL -d $PUBLIC_DOMAIN