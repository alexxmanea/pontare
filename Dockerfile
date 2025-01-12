FROM node:jod-alpine3.21 AS base-container

RUN npm install -g npm@latest && npm install -g pnpm@latest

RUN apk add --no-cache udev ttf-freefont chromium

WORKDIR /pontare

FROM base-container AS frontend-builder
ARG CACHEBUST=1
COPY frontend /pontare
RUN pnpm install && pnpm run build

FROM base-container AS runner

COPY backend /pontare
RUN pnpm install

COPY --from=frontend-builder /pontare/frontend-build /pontare/frontend-build

RUN pnpm install && npm uninstall -g pnpm && npm cache clean --force

EXPOSE 443

ENV NODE_ENV=production

CMD ["node", "src/pontare.js"]
