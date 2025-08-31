## Global defaults
ARG ITAM_PACKAGE_NAME="itam-edu-files"
ARG ITAM_PACKAGE_SHORT_NAME="files"


## Prepare and build
FROM node:22-alpine AS build
WORKDIR /app
ARG ITAM_PACKAGE_NAME
ARG ITAM_PACKAGE_SHORT_NAME

# Copy workspace-level stuff
COPY .npmrc .
COPY package.json .
COPY package-lock.json .

# Copy package manifest and file dependencies, and install other dependencies
COPY ./packages/${ITAM_PACKAGE_SHORT_NAME}/package.json ./packages/${ITAM_PACKAGE_SHORT_NAME}/package.json
COPY ./packages/common ./packages/common
RUN npm --workspace=${ITAM_PACKAGE_NAME} ci

# Copy package source and build
COPY ./packages/${ITAM_PACKAGE_SHORT_NAME} ./packages/${ITAM_PACKAGE_SHORT_NAME}
RUN npm --workspace=${ITAM_PACKAGE_NAME} run build
RUN npm --workspace=${ITAM_PACKAGE_NAME} prune --omit=dev 


## Serve production build
FROM oven/bun:1.2-alpine AS serve
WORKDIR /app
ENV NODE_ENV=production
ARG ITAM_PACKAGE_NAME
ARG ITAM_PACKAGE_SHORT_NAME

COPY package.json .
COPY --from=build /app/packages/common ./packages/common
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/${ITAM_PACKAGE_SHORT_NAME}/build ./build
CMD ["bun", "./build"]
