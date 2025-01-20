FROM ghcr.io/amacneil/dbmate:2.24
WORKDIR /app

ENV DBMATE_MIGRATIONS_DIR="./migrations"
ENV DBMATE_NO_DUMP_SCHEMA="true"
ENV DBMATE_STRICT="true"

COPY ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

COPY ./migrations ./migrations

ENTRYPOINT ["sh", "-c", "./entrypoint.sh"]
