#!/bin/bash

if [ "${NGINX_HTTPS_ENABLED}" == true ]; then
    # Check if the certificate and key files for the specified domain exist
    if [ -n "${CERTBOT_DOMAIN}" ] && \
       [ -f "/etc/letsencrypt/live/${CERTBOT_DOMAIN}/fullchain.pem" ] && \
       [ -f "/etc/letsencrypt/live/${CERTBOT_DOMAIN}/privkey.pem" ]; then
        SSL_CERTIFICATE_PATH="/etc/letsencrypt/live/${CERTBOT_DOMAIN}/fullchain.pem"
        SSL_CERTIFICATE_KEY_PATH="/etc/letsencrypt/live/${CERTBOT_DOMAIN}/privkey.pem"
    else
        SSL_CERTIFICATE_PATH="/etc/ssl/${NGINX_SSL_CERT_FILENAME}"
        SSL_CERTIFICATE_KEY_PATH="/etc/ssl/${NGINX_SSL_CERT_KEY_FILENAME}"
    fi
    export SSL_CERTIFICATE_PATH
    export SSL_CERTIFICATE_KEY_PATH

    # Substitute the HTTPS_CONFIG in the default.conf.template with content from https.conf.template
    if [ -f "${SSL_CERTIFICATE_PATH}" ] && [ -f "${SSL_CERTIFICATE_KEY_PATH}" ]; then
        "${SSL_HTTP2}" == true && SSL_HTTP2="http2 on;" || SSL_HTTP2=""
        # set the HTTPS_CONFIG environment variable to the content of the https.conf.template
        HTTPS_CONFIG=$(envsubst < /etc/nginx/https.conf.template)
        export HTTPS_CONFIG
        envsubst '${HTTPS_CONFIG}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
    fi
fi

if [ "${NGINX_ENABLE_CERTBOT_CHALLENGE}" == true ]; then
    ACME_CHALLENGE_LOCATION='location /.well-known/acme-challenge/ { root /var/www/html; }'
    #使用CERTBOT时放开根目录访问
    CERTBOT_CONFIG=$(cat /etc/nginx/certbot.conf.template)
else
    ACME_CHALLENGE_LOCATION=''
    #不使用CERTBOT时访问根目录301跳转至dify-chat
    CERTBOT_CONFIG=$(cat /etc/nginx/301.conf.template)
fi
export ACME_CHALLENGE_LOCATION
export CERTBOT_CONFIG
envsubst '${CERTBOT_CONFIG}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
env_vars=$(printenv | cut -d= -f1 | sed 's/^/$/g' | paste -sd, -)

envsubst "$env_vars" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx using the default entrypoint
exec nginx -g 'daemon off;'