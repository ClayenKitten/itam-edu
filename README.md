# ITAM.Education

An LMS for the [ITAM](https://itatmisis.ru) community.

## ✨ Features

- Courses
- Homeworks
- Live Streams
- Admin panel

## 📦 Packages

ITAM.Education platform consists of multiple NodeJS/Bun packages that communicate with each other over typesafe HTTP powered by [Elysia](https://github.com/elysiajs/elysia).

- [itam-edu-web](./packages/web) - frontend web application
- [itam-edu-api](./packages/api) - REST API backend
- [itam-edu-tg](./packages/tg) - companion Telegram bot
- [itam-edu-db](./packages/db) - database migrations

All packages are built into OCI images and hosted on [GitHub Container Registry](https://github.com/ClayenKitten?tab=packages&repo_name=itam-edu).

## 🚀 Deploy

### 🐋 Docker Compose

#### Clone repository

`git clone https://github.com/ClayenKitten/itam-edu.git`

#### Configure packages

Copy every `.env.example` in `packages/PACKAGE_NAME` as `.env` and modify values

> [!NOTE]
> All services are started at port `3000`, changes to ports in `.env` will be ignored.

#### Configure reverse proxy

Compose deployment includes [Caddy](https://caddyserver.com/) as a reverse-proxy.

Copy [Caddyfile.example](./Caddyfile.example) as `Caddyfile` and adjust its content as needed.

#### Start

`docker compose up --detach`

### ☸️ Helm

_WIP_

## 🛠️ Development

Run `task` to see a list of available commands.

### Prerequisites

- [Taskfile](https://taskfile.dev/installation/)
- [Docker Desktop](https://docs.docker.com/desktop/) or [Docker Engine](https://docs.docker.com/engine/install/)

### Environment

The [development environment](./compose.dev.yaml) is setup by running `task dev:up`.

This command starts the reverse proxy, PostgreSQL, and all packages in development mode with hot reloading enabled.

| Service      | Description               | URL                                   |
| ------------ | ------------------------- | ------------------------------------- |
| itam-edu-web | Frontend                  | [www.localhost](http://www.localhost) |
| itam-edu-api | Backend                   | [api.localhost](http://api.localhost) |
| itam-edu-tg  | Telegram bot              |                                       |
| dbgate       | Web interface to Postgres | [db.localhost](http://db.localhost)   |
| PostgreSQL   | PostgresSQL RDBMS         | localhost:5432                        |
