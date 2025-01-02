FROM node:22-alpine AS build

WORKDIR /app

# Dependencies
COPY .npmrc .
COPY package.json .
COPY package-lock.json .
COPY ./packages/api/package.json ./packages/api/package.json
RUN npm ci --workspace itam-edu-api

# Source
COPY ./packages/db ./packages/db
COPY ./packages/api ./packages/api

# Build
RUN npm run build --workspace itam-edu-api
RUN npm prune --omit=dev

FROM node:22-alpine AS serve

WORKDIR /app
COPY --from=build /app/packages/api/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY package.json .
CMD ["node", "./build"]
