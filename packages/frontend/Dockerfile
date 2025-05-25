# Install dependencies and copy source code
FROM node:22-alpine AS prepare
WORKDIR /app

COPY .npmrc .
COPY package.json .
COPY package-lock.json .
COPY ./packages/frontend/package.json ./packages/frontend/package.json
COPY ./packages/common ./packages/common
RUN npm --workspace=itam-edu-frontend ci

COPY ./packages/db ./packages/db
COPY ./packages/api ./packages/api
COPY ./packages/frontend ./packages/frontend

# Build for production and prune dev dependencies
FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prepare /app .
RUN npm --workspace=itam-edu-frontend run build
RUN npm --workspace=itam-edu-frontend prune --omit=dev 

# Serve production build
FROM oven/bun:1.2-alpine AS serve
WORKDIR /app
ENV NODE_ENV=production

COPY package.json .
COPY --from=build /app/packages/common ./packages/common
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/frontend/build ./build
CMD ["bun", "./build"]
