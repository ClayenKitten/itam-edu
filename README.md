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

ITAM Education platform consists of multiple packages that communicate over HTTP and BullMQ message queues.

| Package                                  | Technology | Description                              | Deployable? |
| ---------------------------------------- | :--------: | ---------------------------------------- | :---------: |
| [itam-edu-frontend](./packages/frontend) |   NodeJS   | SvelteKit server                         |     ✅      |
| [itam-edu-api](./packages/api)           |    Bun     | REST API server                          |     ✅      |
| [itam-edu-telegram](./packages/telegram) |    Bun     | Telegram bot                             |     ✅      |
| [itam-edu-files](./packages/files)       |    Bun     | File server with proxy to S3 bucket      |     ✅      |
| [itam-edu-db](./packages/db)             |   dbmate   | Database migrations                      |     ✅      |
| [itam-edu-common](./packages/common)     | TS library | Library for common code between packages |     ⛔️     |
| [itam-edu-devtools](./packages/devtools) |    Bun     | Webpage with some tools                  |     ⛔️     |

All deployable packages are built into the OCI images and uploaded to the [GitHub Container Registry](https://github.com/ClayenKitten?tab=packages&repo_name=itam-edu).
