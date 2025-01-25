# Run dbmate command
#
# Expects ITAM_EDU_DB_COMMAND environment variable.
FROM ghcr.io/amacneil/dbmate:2.24 AS dbmate
WORKDIR /app

ENV DBMATE_MIGRATIONS_DIR="./migrations"
ENV DBMATE_NO_DUMP_SCHEMA="true"
ENV DBMATE_STRICT="true"

ENTRYPOINT DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST/$POSTGRES_DB?sslmode=disable" dbmate $ITAM_EDU_DB_COMMAND

# Run kysely-codegen
FROM node:22-alpine AS kysely-codegen
WORKDIR /app

RUN npm install -g kysely-codegen@^0.17.0 kysely@^0.27.5 pg@^8.13.1
RUN echo "DATABASE_URL=\"postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST/$POSTGRES_DB?sslmode=disable\"" > ./.env

ENTRYPOINT DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST/$POSTGRES_DB?sslmode=disable" npx kysely-codegen --out-file ./index.ts --camel-case --dialect postgres
