FROM node:18-alpine as build

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci
COPY src /app/src
COPY tsconfig.json /app/tsconfig.json
RUN npm run build && npm prune --omit=dev

FROM alpine:3.18
RUN apk add --no-cache nodejs
COPY --from=build /app/dist /app
COPY --from=build /app/node_modules /app/node_modules
CMD ["node", "/app/index.js"]