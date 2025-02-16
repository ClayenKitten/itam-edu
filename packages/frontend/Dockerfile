# Install dependencies and copy source code
FROM node:22-alpine AS prepare
WORKDIR /app

COPY .npmrc .
COPY package.json .
COPY package-lock.json .
COPY ./packages/frontend/package.json ./packages/frontend/package.json
RUN npm --workspace=itam-edu-frontend ci

COPY ./packages/db ./packages/db
COPY ./packages/api ./packages/api
COPY ./packages/frontend ./packages/frontend

# Start development server
FROM node:22-alpine AS dev
WORKDIR /app
ENV NODE_ENV development

COPY --from=prepare /app .
ENTRYPOINT npm --workspace=itam-edu-frontend run dev -- --host=0.0.0.0 --port=3000

# Build for production and prune dev dependencies
FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV production

COPY --from=prepare /app .
RUN npm --workspace=itam-edu-frontend run build
RUN npm --workspace=itam-edu-frontend prune --omit=dev 

# Serve production build
FROM node:22-alpine AS serve
WORKDIR /app
ENV NODE_ENV production

COPY package.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/frontend/build ./build
CMD ["node", "./build"]
