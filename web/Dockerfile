FROM node:22-alpine AS builder

WORKDIR /app

COPY .npmrc .
COPY package.json .
COPY package-lock.json .
RUN npm ci --omit=dev

COPY . .
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
CMD ["node", "./build"]
