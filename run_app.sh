#!/bin/bash

ps -ef | grep 'pontare' | grep -v grep | awk '{print $2}' | xargs -r kill -9

cd /mnt/SSD/pontare/backend
nohup node src/pontare.js > /dev/null 2>&1 &
nohup serve -s /mnt/SSD/pontare/frontend/build/ --listen 3000 --ssl-cert /mnt/SSD/pontare/backend/secure/certificates/certificate.pem --ssl-key /mnt/SSD/pontare/backend/secure/certificates/key.pem > /dev/null 2>&1 & 