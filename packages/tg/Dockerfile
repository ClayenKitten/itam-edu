FROM node:22-alpine AS build

WORKDIR /app

# Dependencies
COPY .npmrc .
COPY package.json .
COPY package-lock.json .
COPY ./packages/tg/package.json ./packages/tg/package.json
RUN npm ci --workspace itam-edu-tg

# Source
COPY ./packages/api ./packages/api
COPY ./packages/tg ./packages/tg

# Build
RUN npm run build --workspace itam-edu-tg
RUN npm prune --omit=dev

FROM node:22-alpine AS serve

WORKDIR /app
COPY --from=build /app/packages/tg/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY package.json .
CMD ["node", "./build"]
