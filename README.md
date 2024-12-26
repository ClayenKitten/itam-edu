# ITAM educational platform

## Features

Planned features for the platform

- Telegram bot
    - Platfrom login
    - Notifications
- Course
    - Pages
        - Theory
        - Homeworks
        - Quizzes
        - Live lessons
            - Video streaming
            - Recording :question:
            - Scheduling
            - Student feedback
    - Course feedback
    - Teacher's blog
- Course design
    - Hierarchical course structure
    - Multiple page types:
        - Theory -
        - Lesson - information-only lesson
        - Live lesson - lesson that was live streamed
    - WYSIWYG editor

## Architecture

- web - frontend web application
- api - REST API backend
- tg - companion Telegram bot
- webrtc - webrtc server
- db - database migrations
- s3 - S3 proxy and Minio configuration

## Development

Taskfile is used to run custom commands. Write `task` in CLI to see a list of available commands.

Development environment is setup via docker compose.

|    Service    | Description            | Credentials     |             Port              |
| :-----------: | ---------------------- | --------------- | :---------------------------: |
|   Postgres    | Postgres database      | user / password |             5432              |
|    dbgate     | Postgres web interface |                 | [5500](http://localhost:5500) |
|     Minio     | Minio S3 storage       | user / password |             9000              |
| Minio Console | Minio web interface    | user / password | [9001](http://localhost:9001) |
