FROM php:8.2-apache

ARG ENVIRONMENT
ENV ENVIRONMENT=$ENVIRONMENT
ENV PORT=443
ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN

COPY ./src/ /var/www/html/

# TODO:

# COPY ./client/package*.json /client/

# RUN cd /client && npm install

# COPY ./client/ /client/

# RUN cd /client && npm run build && cp -r /client/dist/* /var/www/html/

# Copy PHP.inis
COPY ./config/php.ini-development /usr/local/etc/php/
COPY ./config/php.ini-production /usr/local/etc/php/

RUN mv "/usr/local/etc/php/php.ini-${ENVIRONMENT}" "/usr/local/etc/php/php.ini"

# Copy apache config file for this site
COPY ./config/stream-site.conf /etc/apache2/sites-available/
# "Disable" the default sites
RUN a2dissite 000-default.conf
RUN a2dissite default-ssl.conf
# "Enable" this site
RUN a2ensite stream-site.conf

RUN a2enmod ssl
# Enable RewriteEngine in .htaccess
RUN a2enmod rewrite
RUN a2enmod headers
RUN docker-php-ext-install mysqli pdo pdo_mysql

EXPOSE 80 443