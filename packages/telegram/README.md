# itam-edu-telegram

A basic Telegram bot that forwards all incoming messages to BullMQ queue and reads from another queue for messages to send.

Queue names and message types are defined in [itam-edu-common](../common/src/queues/telegram.ts) package.

## Motivation

Although integrating Telegram bot into the `itam-edu-api` package would
simplify things, the current decision allows us to easily mock a Telegram
client. Check [devtools](../../.devcontainer/devtools) for more information.
