FROM caddy:2.9-alpine
WORKDIR /app

COPY --from=sigoden/dufs:v0.43.0 /bin/dufs /bin/dufs
COPY ./Caddyfile ./Caddyfile

ENTRYPOINT caddy start && dufs ./data --allow-upload --allow-delete --compress=none --path-prefix="$ITAM_EDU_MEDIA_PREFIX"
