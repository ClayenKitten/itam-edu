# Install dependencies and copy source code
FROM node:22-alpine AS prepare
WORKDIR /app

COPY .npmrc .
COPY package.json .
COPY package-lock.json .
COPY ./packages/api/package.json ./packages/api/package.json
RUN npm --workspace=itam-edu-api ci

COPY ./packages/db ./packages/db
COPY ./packages/api ./packages/api

# Start development server
FROM oven/bun:1.1-alpine AS dev
WORKDIR /app
ENV NODE_ENV development

COPY --from=prepare /app .
ENTRYPOINT bun --cwd="packages/api" run dev

# Build for production and prune dev dependencies
FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV production

COPY --from=prepare /app .
RUN npm --workspace=itam-edu-api run build
RUN npm --workspace=itam-edu-api prune --omit=dev 

# Serve production build
FROM oven/bun:1.1-alpine AS serve
WORKDIR /app
ENV NODE_ENV production

COPY package.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/api/build ./build
CMD ["bun", "./build"]
