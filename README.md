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

| Package                                  | Implementation                               | Description                                 |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| [itam-edu-api](./packages/api)           | [Bun](https://bun.sh)                        | REST API server                             |
| [itam-edu-frontend](./packages/frontend) | [NodeJS](https://nodejs.org)                 | Frontend server                             |
| [itam-edu-common](./packages/common)     | TypeScript library                           | Common classes between frontend and backend |
| [itam-edu-db](./packages/db)             | [dbmate](https://github.com/amacneil/dbmate) | Database migrations                         |

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

Local development environment can be easily setup via VS Code's devcontainer.
VS Code's devcontainer is used for development.

Taskfile is used to execute commands. Run `task` to see a full list.

### Setup

- Clone repository and open it in devcontainer
- Install dependencies via `npm ci`
- Setup environment
    - Create a Telegram bot to use during local development
    - Clone `.env.example` as `.env` and fill all variables related to Telegram. Other variables may be skipped.
- Start development servers via `Run and Debug` menu or CLI

### Services

| Service               | URL                       |
| --------------------- | ------------------------- |
| **Packages**          |                           |
| itam-edu-api          | http://api.localhost      |
| itam-edu-frontend     | http://www.localhost      |
| **Development tools** |                           |
| Navigation            | http://localhost          |
| dbgate                | http://db.localhost       |
| **Infrastructure**    |                           |
| PostgreSQL            | `postgres:localhost:5432` |
| Redis                 | `redis:localhost:6379`    |
