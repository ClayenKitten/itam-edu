# ITAM.Education

An LMS for the [ITAM](https://itatmisis.ru) community.

## ✨ Features

- Courses
- Homeworks
- Live Streams
- Admin panel

## 🚀 Installation

### 🐋 Docker Compose

_WIP_

### ☸️ Helm

_WIP_

## 📦 Packages

ITAM.Education platform consists of multiple NodeJS/Bun packages that communicate with each other over typesafe HTTP powered by [Elysia](https://github.com/elysiajs/elysia).

- [itam-edu-web](./packages/web) - frontend web application
- [itam-edu-api](./packages/api) - REST API backend
- [itam-edu-tg](./packages/tg) - companion Telegram bot
- [itam-edu-db](./packages/db) - database migrations

All packages are built into OCI images and hosted on [GitHub Container Registry](https://github.com/ClayenKitten?tab=packages&repo_name=itam-edu).

## 🛠️ Development

Run `task` to see a list of available commands.

### Prerequisites

- [Taskfile](https://taskfile.dev/installation/)
- [Docker Desktop](https://docs.docker.com/desktop/) or [Docker Engine](https://docs.docker.com/engine/install/)

### Environment

The [development environment](./compose.dev.yaml) is setup by running `task dev:up`.

This command starts the reverse proxy, PostgreSQL, and all packages in development mode with hot reloading enabled.

| Service      | Description               | URL                                    |
| ------------ | ------------------------- | -------------------------------------- |
| itam-edu-web | Frontend                  | [www.localhost](https://www.localhost) |
| itam-edu-api | Backend                   | [api.localhost](https://api.localhost) |
| itam-edu-tg  | Telegram bot              |                                        |
| dbgate       | Web interface to Postgres | [db.localhost](https://db.localhost)   |
| PostgreSQL   | PostgresSQL RDBMS         | localhost:5432                         |

> [!NOTE]
> HTTPS with self-signed certificates is used to ensure browser security features behave just like in production. Warnings may be shown.
