FROM ghcr.io/amacneil/dbmate:2.24
WORKDIR /app

ENV DBMATE_MIGRATIONS_DIR="./migrations"
ENV DBMATE_NO_DUMP_SCHEMA="true"
ENV DBMATE_STRICT="true"

COPY ./migrations ./migrations

ENTRYPOINT DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST/$POSTGRES_DB?sslmode=disable" dbmate up
