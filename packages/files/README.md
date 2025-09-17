# itam-edu-files

A simple file server backed by S3, designed to offload file streaming from the primary backend
system.

## Architecture

Request handling contains the following steps:

1. Request from the user is received;
2. Request is resent to the api;
3. If authorization passes, the presigned URL is generated and returned;
4. Request is resent to the presigned URL, and response is streamed back to the client.

```mermaid
sequenceDiagram
    participant User
    participant itam-edu-files
    participant itam-edu-api
    participant S3 server

    User->>+itam-edu-files: GET /files/...
    itam-edu-files->>+itam-edu-api: GET /files/...
    Note over itam-edu-api: Generate presigned URL
    itam-edu-api-->>-itam-edu-files: 307 Temporary Redirect
    itam-edu-files->>+S3 server: Request file
    S3 server-->>-itam-edu-files: Stream file
    itam-edu-files-->>-User: Stream file
```

Proxying is used instead of direct S3 server access to support browser caching, as S3 presigned URLs
have unique query parameters each time they are generated. Moreover, it allows the S3 server to only
be accessible from the internal network.
