# Development guide

Please refer to package-specific documentation for more information:

- [itam-edu-frontend](/packages/frontend/README.md)
- [itam-edu-api](/packages/api/README.md)
- [itam-edu-files](/packages/files/README.md)
- [itam-edu-telegram](/packages/telegram/README.md)
- [itam-edu-db](/packages/db/README.md)

## Development environment

Development happens inside a [devcontainer](https://code.visualstudio.com/docs/devcontainers/containers). VS Code is a recommended editor of choice.

1. Clone repository and open it in a devcontainer
1. Install dependencies via `npm ci`
1. Create `.env` file in project root and configure values that are omitted in [.devcontainer/.env.dev](.devcontainer/.env.dev)
1. Use VS Code `Run and Debug` sidebar tab to start packages
1. All URLs listed below should be accessible via your browser

Run `task` in the Terminal to see the list of available commands.

| Service               | URL                           |
| --------------------- | ----------------------------- |
| **Packages**          |                               |
| itam-edu-frontend     | http://www.localhost          |
| itam-edu-api          | http://www.localhost/api      |
| itam-edu-files        | http://www.localhost/files    |
| **Development tools** |                               |
| itam-edu-devtools     | http://www.localhost/devtools |
| Database UI           | http://db.localhost           |
| Minio UI              | http://s3.localhost           |
| BullMQ UI             | http://bullmq.localhost       |

### Run and Debug

Debug configuration is provided for VS Code. Use "Run and Debug" sidebar panel to choose configuration and start it.

## Release process

Please refer to the [release guide](/docs/RELEASE.md).
