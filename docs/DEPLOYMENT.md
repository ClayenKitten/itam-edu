# Deployment

The following document explains how to deploy a platform and lists requirements.

## I. Architecture

ITAM Education is composed of a few deployable units:

### Backing services

ITAM Education employes the following backing services:

- PostgreSQL for primary storage;
- Redis for transient data;
- S3 server for file storage;
- LiveKit server for voice communication.

## II. Requirements

### Hardware

ITAM Education is relatively lightweight, and may run on a single machine with as low as 1 CPU and 2GB RAM.

### Internal network

All containers and backing services are expected to be on the same network.

| Service           | Hostname             | Port |
| ----------------- | -------------------- | ---- |
| itam-edu-frontend | frontend.itamedu     | 3000 |
| itam-edu-api      | api.itamedu          | 3000 |
| itam-edu-files    | files.itamedu        | 3000 |
| PostgreSQL        | postgres.itamedu     | 5432 |
| Redis             | redis.itamedu        | 6379 |
| S3                | s3.itamedu           | 443  |
| LiveKit           | livekit.itamedu      | 443  |
| LiveKit Turn      | turn.livekit.itamedu | 443  |

Hostnames must be resolvable to their respective services.

### External network

Platform is expected to only be accessible from the outside via reverse-proxy, which handles TLS and path-based routing.

| Service           | Path prefix |
| ----------------- | ----------- |
| itam-edu-frontend | /           |
| itam-edu-api      | /api        |
| itam-edu-files    | /files      |

Path prefix must be stripped by reverse proxy.

Refer to example [Caddyfile](/Caddyfile) provided at root.

## III. Initial deployment

### 🐋 Docker Compose

1. **Clone repository**

    `git clone https://github.com/ClayenKitten/itam-edu.git`

1. **Configure application**

    Copy `.env.example` as `.env` and modify values as needed.

1. **Configure databases**

    If you want to deploy Postgres and Redis via docker, copy `.env.db.example` as `.env.db` and modify values as needed.

1. **Configure reverse proxy**

    Copy `Caddyfile.example` as `Caddyfile` and adjust its content as needed.

1. **Create containers**

    `docker compose up --detach`

### ☸️ Helm

_WIP_

### 💻 Baremetal

While a non-containerized setup on Linux is theoretically possible, it is not officially supported. Refer to Docker Compose configuration for guidance.

## IV. Version upgrade

_WIP_

### Database migrations

_WIP_

### Rollback

_WIP_

## V. Running

### Monitoring

_WIP_

### Backups

_WIP_

### Load balancing

_WIP_

### Troubleshooting

_WIP_
