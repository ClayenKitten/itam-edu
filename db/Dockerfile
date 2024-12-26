FROM ghcr.io/amacneil/dbmate:2.24

WORKDIR /app

COPY ./migrations ./migrations

ENTRYPOINT [ "dbmate", "up" ]