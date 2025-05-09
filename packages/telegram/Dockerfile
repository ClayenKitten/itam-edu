# Install dependencies and copy source code
FROM node:22-alpine AS build
WORKDIR /app

COPY .npmrc .
COPY package.json .
COPY package-lock.json .
COPY ./packages/telegram/package.json ./packages/telegram/package.json
COPY ./packages/common ./packages/common
RUN npm --workspace=itam-edu-telegram ci

COPY ./packages/telegram ./packages/telegram

RUN npm --workspace=itam-edu-telegram run build
RUN npm --workspace=itam-edu-telegram prune --omit=dev 

# Serve production build
FROM oven/bun:1.2-alpine AS serve
WORKDIR /app
ENV NODE_ENV=production

COPY package.json .
COPY --from=build /app/packages/common ./packages/common
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/telegram/build ./build
CMD ["bun", "./build"]
