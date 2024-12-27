# ITAM educational platform

An LMS for ITAM Courses.

## Packages

- web - frontend web application
- api - REST API backend
- tg - companion Telegram bot
- db - database migrations
- s3 - S3 proxy and Minio configuration

## Development

Taskfile is used to run custom commands. Write `task` in CLI to see a list of available commands.

Development environment is setup via docker compose.

|    Service    | Description            | Credentials     |             Port              |
| :-----------: | ---------------------- | --------------- | :---------------------------: |
|   Postgres    | Postgres database      | user / password |             5432              |
|    dbgate     | Postgres web interface |                 | [5500](http://localhost:5500) |
|     Minio     | Minio S3 storage       | user / password |             9000              |
| Minio Console | Minio web interface    | user / password | [9001](http://localhost:9001) |
