FROM php:8.2-apache

ARG ENVIRONMENT
ENV ENVIRONMENT=$ENVIRONMENT
ENV PORT=443
# RUN echo 'SetEnv PORT ${PORT}' > /etc/apache2/conf-enabled/environment.conf
ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN
# RUN echo 'SetEnv PUBLIC_DOMAIN ${PUBLIC_DOMAIN}' > /etc/apache2/conf-enabled/environment.conf

COPY ./src/ /var/www/html/

# Copy PHP.inis
COPY ./config/php.ini-development /usr/local/etc/php/
COPY ./config/php.ini-production /usr/local/etc/php/

RUN mv "/usr/local/etc/php/php.ini-${ENVIRONMENT}" "/usr/local/etc/php/php.ini"

# Copy apache config files
COPY ./config/000-default.conf /etc/apache2/sites-available/
COPY ./config/default-ssl.conf /etc/apache2/sites-available/

# Enable RewriteEngine in .htaccess
RUN a2enmod rewrite
RUN a2enmod headers
RUN docker-php-ext-install mysqli pdo pdo_mysql

EXPOSE 80 443