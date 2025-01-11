FROM node:22-alpine AS build

WORKDIR /app

# Dependencies
COPY .npmrc .
COPY package.json .
COPY package-lock.json .
COPY ./packages/web/package.json ./packages/web/package.json
RUN npm ci --workspace itam-edu-web

# Source
COPY ./packages/api ./packages/api
COPY ./packages/db ./packages/db
COPY ./packages/web ./packages/web

# Build
RUN npm run build --workspace itam-edu-web
RUN npm prune --omit=dev

FROM node:22-alpine AS serve

WORKDIR /app
COPY --from=build /app/packages/web/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY package.json .
CMD ["node", "./build"]
