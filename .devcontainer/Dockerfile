FROM alpine:3.21

# Basic
RUN apk add --no-cache coreutils bash bash-completion curl git nano vim htop less

# NodeJS
RUN apk add --no-cache nodejs npm

# Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Taskfile and database migrations
RUN npm install -g @go-task/cli dbmate@^2.26.0 kysely-codegen@^0.18.3 kysely@^0.27.5 pg@^8.13.1

ENTRYPOINT [ "sleep", "infinity" ]
