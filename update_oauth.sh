#!/bin/bash
TARGET="/var/www/ma-links/.env"

# Set/Update Keys
# Using strict sed with double quotes for variables

# 1. Google Client ID
if grep -q "^NEXT_PUBLIC_GOOGLE_CLIENT_ID=" "$TARGET"; then
    sed -i 's|^NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*|NEXT_PUBLIC_GOOGLE_CLIENT_ID="49020207950-fo5g8htdmnbs5it9894im5589knqus5r.apps.googleusercontent.com"|g' "$TARGET"
else
    echo 'NEXT_PUBLIC_GOOGLE_CLIENT_ID="49020207950-fo5g8htdmnbs5it9894im5589knqus5r.apps.googleusercontent.com"' >> "$TARGET"
fi

# 2. Google Client Secret
if grep -q "^GOOGLE_CLIENT_SECRET=" "$TARGET"; then
    sed -i 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET="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"|g' "$TARGET"
else
    echo 'GOOGLE_CLIENT_SECRET="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"' >> "$TARGET"
fi

# 3. JWT Secret
if grep -q "^JWT_SECRET=" "$TARGET"; then
    sed -i 's|^JWT_SECRET=.*|JWT_SECRET="rahasia_donk_wulan_linktree_2024"|g' "$TARGET"
else
    echo 'JWT_SECRET="rahasia_donk_wulan_linktree_2024"' >> "$TARGET"
fi

# Restart App
pm2 restart ma-links
