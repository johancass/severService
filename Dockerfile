FROM php:8.2-apache

# Copia tus archivos al contenedor
COPY ./public/ /var/www/html/

# Habilita mod_rewrite si lo necesitas
RUN a2enmod rewrite
