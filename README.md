# ITAM Education

An LMS for the [ITAM](https://itatmisis.ru) community.

## ✨ Features

- Courses
- Homeworks
- Live Streams
- Admin panel

## 🧩 Integrations

ITAM Education supports integration with some third-party tools.

### <img height="16" width="16" src="https://cdn.simpleicons.org/telegram/white" />&nbsp;&nbsp;Telegram Bot

Telegram bot is used for user login and notifications. Check integration [README](/packages/api/src/telegram) for more information.

### <img height="16" width="16" src="https://cdn.simpleicons.org/github/white" />&nbsp;&nbsp;GitHub App

GitHub App manages GitHub organization of the course. Check integration [README](https://www.youtube.com/watch?v=dQw4w9WgXcQ) for more information.

> [!IMPORTANT]
> GitHub integration is not implemented yet.

## 📦 Packages

ITAM Education platform consists of multiple packages that communicate over HTTP.

| Package                                  | Implementation                                          | Description         |
| ---------------------------------------- | ------------------------------------------------------- | ------------------- |
| [itam-edu-api](./packages/api)           | [Bun](https://bun.sh)                                   | REST API server     |
| [itam-edu-frontend](./packages/frontend) | [NodeJS](https://nodejs.org)                            | Frontend server     |
| [itam-edu-media](./packages/media)       | Caddy proxy and [dufs](https://github.com/sigoden/dufs) | File server         |
| [itam-edu-db](./packages/db)             | [dbmate](https://github.com/amacneil/dbmate)            | Database migrations |

All packages are built into OCI images and hosted on [GitHub Container Registry](https://github.com/ClayenKitten?tab=packages&repo_name=itam-edu).

## 🚀 Deploy

### 🐋 Docker Compose

1. **Clone repository**

    `git clone https://github.com/ClayenKitten/itam-edu.git`

1. **Configure application**

    Copy `.env.example` as `.env` and modify values as needed.

1. **Configure databases**

    If you host databases, copy `.env.db.example` as `.env.db` and modify values as needed.

1. **Configure reverse proxy**

    Copy `Caddyfile.example` as `Caddyfile` and adjust its content as needed.

#### Start

`docker compose up --detach`

### ☸️ Helm

_WIP_

### 💻 Baremetal

Non-containerized setup on Linux/Windows/etc is theoretically possible, though not tested. Just make sure to setup everything according to docker compose configuration.

## 🛠️ Development

Run `task` to see a list of available commands.

### Prerequisites

- [Taskfile](https://taskfile.dev/installation/)
- [Docker Desktop](https://docs.docker.com/desktop/) or [Docker Engine](https://docs.docker.com/engine/install/)

### Environment

The [development environment](./compose.dev.yaml) is setup by running `task dev:up`.

This command starts the reverse proxy, PostgreSQL, and all packages in development mode with hot reloading enabled.

Simple navigation page is hosted at http://localhost.

| Service           | Description     | Internal URL    | External URL                                      |
| ----------------- | --------------- | --------------- | ------------------------------------------------- |
| itam-edu-api      | Backend server  | `api:3000`      | [api.localhost](http://api.localhost)             |
| itam-edu-frontend | Frontend server | `frontend:3000` | [www.localhost](http://www.localhost)             |
| itam-edu-media    | File server     | `media:3000`    | [www.localhost/media](http://www.localhost/media) |
| PostgreSQL        |                 | `postgres:5432` | localhost:5432                                    |
| Redis             |                 | `redis:6379`    | localhost:6379                                    |
| dbgate            |                 | `dbgate:3000`   | [db.localhost](http://db.localhost)               |
