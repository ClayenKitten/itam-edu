FROM alpine:3.21

# Basic
RUN apk add --no-cache coreutils bash bash-completion curl git nano vim htop less tar grep
# LiveKit
RUN curl -sSL https://get.livekit.io | bash

ENTRYPOINT [ "livekit-server", "--dev" ]
