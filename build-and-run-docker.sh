#!/bin/bash

# !!! INCREMENT VERSION BEFORE RUNNING THIS SCRIPT IN THE FOLLOWING FILES !!!
# backend/package.json
# frontend/package.json

VERSION_BACKEND=$(grep '"version"' backend/package.json | awk -F '"' '{print $4}')
VERSION_FRONTEND=$(grep '"version"' frontend/package.json | awk -F '"' '{print $4}')

if [ "$VERSION_BACKEND" != "$VERSION_FRONTEND" ]; then
    echo "Versions are not the same. Exiting..."
    exit 1
fi

VERSION=$VERSION_BACKEND

docker build --build-arg CACHEBUST=$(date +%s) --squash -t alexxmanea/personal:pontare-$VERSION .

docker push alexxmanea/personal:pontare-$VERSION

docker rm --force pontare

docker run -d -ti --privileged --restart unless-stopped --name pontare -p 443:443 alexxmanea/personal:pontare-$VERSION
