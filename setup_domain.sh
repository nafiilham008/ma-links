#!/bin/bash
set -x

DOMAIN="malinks.web.id"
APP_DIR="/var/www/ma-links"

echo "Installing nodemailer on VPS..."
cd $APP_DIR
npm install nodemailer

echo "Updating email.js..."
mv /root/email.js $APP_DIR/src/lib/email.js

echo "Setting up Nginx..."
mv /root/nginx.conf /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo "Obtaining SSL Cert..."
# Verify domain points to IP first to avoid rate limits? User showed screenshot, should be fine.
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect

echo "Updating .env..."
# Only append if not exists
if ! grep -q "SMTP_HOST" .env; then
    echo "SMTP_HOST=mail.malinks.web.id" >> .env
    echo "SMTP_PORT=465" >> .env
    echo "SMTP_USER=admin@malinks.web.id" >> .env
    echo "SMTP_PASSWORD=CHANGE_ME" >> .env
    echo "SMTP_FROM=\"Ma-Links\" <admin@malinks.web.id>" >> .env
fi

if ! grep -q "NEXT_PUBLIC_App_URL" .env; then
     # Handle existing or new
     echo "NEXT_PUBLIC_App_URL=\"https://$DOMAIN\"" >> .env
else
     # Replace existing
     sed -i "s|NEXT_PUBLIC_App_URL=.*|NEXT_PUBLIC_App_URL=\"https://$DOMAIN\"|g" .env
fi

echo "Restarting App..."
pm2 restart ma-links

echo "Setup Complete!"
