# Create development environment database
#
# TODO: cleanup DB on start and run seed scripts
FROM ghcr.io/amacneil/dbmate:2.24 AS dev
WORKDIR /app

COPY ./migrations ./migrations

ENTRYPOINT [ "dbmate", "up" ]

# Migrate production database
FROM ghcr.io/amacneil/dbmate:2.24 AS production
WORKDIR /app

COPY ./migrations ./migrations

ENTRYPOINT [ "dbmate", "up" ]
