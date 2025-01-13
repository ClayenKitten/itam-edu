# ITAM educational platform

An LMS for [ITAM](https://itatmisis.ru) Courses.

## Packages

- [itam-edu-web](./packages/web) - frontend web application
- [itam-edu-api](./packages/api) - REST API backend
- [itam-edu-tg](./packages/tg) - companion Telegram bot
- [itam-edu-db](./packages/db) - database migrations
- [itam-edu-s3](./packages/s3) - S3 proxy and Minio configuration (work in progress)

## Development

Taskfile is used to run custom commands. Write `task` in CLI to see a list of available commands.

Development environment is setup via [docker compose](./compose.dev.yaml).

|   Service    | Description               |                  URL                  |
| :----------: | ------------------------- | :-----------------------------------: |
| itam-edu-web | Web server                | [www.localhost](http://www.localhost) |
| itam-edu-api | API server                | [api.localhost](http://api.localhost) |
| itam-edu-tg  | Telegram bot              |                                       |
|    dbgate    | Web interface to Postgres |  [db.localhost](http://db.localhost)  |
|   postgres   | Postgres RDBMS            |            localhost:5432             |
