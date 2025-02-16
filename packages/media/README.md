# itam-edu-media

File server for serving and uploading media files.

![Network schema](./network.excalidraw.png)

## Authorization

Each incoming request is authorized via forward auth to `itam-edu-api` with token from `itam-edu-token` cookie.

> [!WARNING]
> Media server should be hosted on the same domain as a frontend server for authorization cookie to be sent by a browser.
>
> **Example**
>
> - itam-edu-frontend: `https://example.com`
> - itam-edu-media: `https://example.com/media`

## Configuration

That package is configured via environment variables. See [.env.example](./.env.example) for details.
