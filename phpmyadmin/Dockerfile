FROM phpmyadmin:latest

ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN

ARG UPLOAD_LIMIT
ENV UPLOAD_LIMIT=$UPLOAD_LIMIT

ENV PMA_ARBITRARY=1

# Copy apache config files
COPY ./config/phpmyadmin.conf /etc/apache2/sites-available/
COPY ./config/ports.conf /etc/apache2/

# Copy apache config file for this site
COPY ./config/phpmyadmin.conf /etc/apache2/sites-available/
# "Disable" the default sites
RUN a2dissite 000-default.conf
RUN a2dissite default-ssl.conf
# "Enable" this site
RUN a2ensite phpmyadmin.conf

RUN a2enmod ssl
# Enable RewriteEngine in .htaccess
RUN a2enmod rewrite
RUN a2enmod headers
RUN docker-php-ext-install mysqli pdo pdo_mysql

EXPOSE 8080 8443