# Development Guide

Devcontainer is used to create isolated and reproducible development environment, which is crucial
given comparatively high number of services required by itam-edu.

VS Code is the recommended IDE, though other devcontainer-compatible solutions may work.

## Quick Start

1. Clone repository and open it in a devcontainer
1. Install dependencies with `npm ci`
1. Create `.env` file in project root and configure the values listed below
1. Use VS Code `Run and Debug` sidebar tab to start packages

Run `task` in the terminal to see all available commands.

## Environment variables

Most variables are pre-configured for the development environment. You only need to set the ones
that the devcontainer cannot manage:

| Variable                             | Description                                              | Example               |
| ------------------------------------ | -------------------------------------------------------- | --------------------- |
| ITAMEDU_PUBLIC_TELEGRAM_BOT_USERNAME | Telegram bot username                                    | mycoolboot            |
| ITAMEDU_TELEGRAM_TOKEN               | Telegram bot token                                       | 1234567890:abcdefabcd |
| ITAMEDU_TELEGRAM_SUPPORT_USERNAME    | Telegram support username                                | ItamEduSupport        |
| LIVEKIT_NODE_IP                      | IP that LiveKit should advertise, usually your local ip. | 192.168.0.1           |

Values should be provided at the top-level `.env` file.

## Services

The devcontainer exposes development tools and started packages at these well-known paths:

| Service               | URL                           |
| --------------------- | ----------------------------- |
| **Packages**          |                               |
| itam-edu-frontend     | http://www.localhost          |
| itam-edu-api          | http://www.localhost/api      |
| itam-edu-files        | http://www.localhost/files    |
| itam-edu-devtools     | http://www.localhost/devtools |
| **Development tools** |                               |
| Database UI           | http://db.localhost           |
| Minio UI              | http://s3.localhost           |
| BullMQ UI             | http://bullmq.localhost       |

## Database

Postgres database should be migrated manually in devcontainer via `task db:up` command. Seed scripts
are currently not provided.

New migration may be created via `task db:new -- yourmigrationname`.

## Run and Debug

Two profiles are provided in VS Code configuration: **Development** and **Staging**.

- **Development** starts [itam-edu-devtools](/packages/devtools) which wraps `itam-edu-api` Telegram
  bot and provides a web tool to manage users and bot conversations.
- **Staging** is intended for final testing, especially for changes involving the Telegram bot.

It is recommended to work in **Development** and switch to **Staging** before publishing your
changes.

## Troubleshooting

### LiveKit is not connecting

Make sure "LIVEKIT_NODE_IP" is up to date. There is a high chance it has changed if you have
connected to another network.

### Inversify complains about metadata/decorators

Make sure you use `import` and not `import type` or `import { type ... }`, as these imports are
stripped out by TypeScript and not accessible by Inversify. Also, make sure all constructor
dependencies have `@injectable()` decorator applied.
