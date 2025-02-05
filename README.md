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

| Package                            | Implementation                                          | Description         |
| ---------------------------------- | ------------------------------------------------------- | ------------------- |
| [itam-edu-web](./packages/web)     | [NodeJS](https://nodejs.org)                            | Frontend            |
| [itam-edu-api](./packages/api)     | [Bun](https://bun.sh)                                   | REST API            |
| [itam-edu-media](./packages/media) | Caddy proxy and [dufs](https://github.com/sigoden/dufs) | File server         |
| [itam-edu-db](./packages/db)       | [dbmate](https://github.com/amacneil/dbmate)            | Database migrations |

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

| Service    | Internal URL    | Reverse-proxy URL                                 |
| ---------- | --------------- | ------------------------------------------------- |
| web        | `web:3000`      | [www.localhost](http://www.localhost)             |
| api        | `api:3000`      | [api.localhost](http://api.localhost)             |
| media      | `media:3000`    | [www.localhost/media](http://www.localhost/media) |
| dbgate     | `dbgate:3000`   | [db.localhost](http://db.localhost)               |
| PostgreSQL | `postgres:5432` | localhost:5432                                    |
