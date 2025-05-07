# ITAM Education

An open-source Learning Management System for student-to-student courses. Built by and for the [ITAM](https://itatmisis.ru) community.

## ✨ Features

### 📚 Courses

ITAM Education enables any authorized community member to create a fully customizable course. Within a course, teachers organize content into lessons that may include theoretical materials, video content or an associated video call room. Homework assignments can be added to any lesson, and the built-in review system lets teachers provide personalized feedback to the student submissions.

### ☎️ Video Calls

The platform features video calls with recording and screen sharing capabilities. Calls that are related to a specific lesson automatically report student attendance, and video recording is shown on the lesson page after the call ends.

### <img height="16" width="16" src="https://cdn.simpleicons.org/telegram/white" />&nbsp;&nbsp;Telegram Bot

The integrated Telegram bot allows users to log in to the web platform, and receive real-time notifications about upcoming lessons, homework deadlines, calls, and other important updates directly through Telegram.

## 📦 Packages

ITAM Education platform consists of multiple packages that communicate over HTTP.

| Package                                  | Implementation                               | Description                                 |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| [itam-edu-api](./packages/api)           | [Bun](https://bun.sh)                        | REST API server                             |
| [itam-edu-frontend](./packages/frontend) | [NodeJS](https://nodejs.org)                 | Frontend server                             |
| [itam-edu-common](./packages/common)     | TypeScript library                           | Common classes between frontend and backend |
| [itam-edu-db](./packages/db)             | [dbmate](https://github.com/amacneil/dbmate) | Database migrations                         |

All deployable packages are built into the OCI images and uploaded to the [GitHub Container Registry](https://github.com/ClayenKitten?tab=packages&repo_name=itam-edu).

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

1. **Create containers**

    `docker compose up --detach`

### ☸️ Helm

_WIP_

### 💻 Baremetal

While a non-containerized setup on Linux is theoretically possible, it is not officially supported. Refer to Docker Compose configuration for guidance.

## 🛠️ Development

Development happens inside a [devcontainer](https://code.visualstudio.com/docs/devcontainers/containers). VS Code is a recommended editor of choice.

- Clone repository and open it in a devcontainer
- Install dependencies via `npm ci`
- Configure environment
    - Create a Telegram bot to use during local development
    - Copy `.env.example` as `.env` and fill all variables related to Telegram. Other variables may be skipped.
- Start services in development mode via `Run and Debug` menu (F5 in VS Code)
- Run `task` in the Terminal to see the list of available commands.

| Service                            | URL                  |
| ---------------------------------- | -------------------- |
| **Packages**                       |                      |
| itam-edu-api                       | http://api.localhost |
| itam-edu-frontend                  | http://www.localhost |
| **Development tools**              |                      |
| Navigation                         | http://localhost     |
| dbgate (PostgreSQL & Redis Web UI) | http://db.localhost  |
| Minio Web UI                       | http://s3.localhost  |
| **Infrastructure**                 |                      |
| PostgreSQL                         | `postgres:5432`      |
| Redis                              | `redis:6379`         |
| Minio                              | `minio:9000`         |
