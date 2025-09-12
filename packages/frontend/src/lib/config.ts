import type { AppConfig } from "itam-edu-common/config";

export type PublicAppConfig = {
    origin: string;
    servers: {
        backend: {
            host: string;
            port: number;
        };
    };
    telegram: {
        username: string;
        supportUsername: string;
    };
    livekit: {
        url: string;
    };
};

export function getPublicAppConfig(appConfig: AppConfig) {
    return {
        origin: appConfig.origin,
        servers: {
            backend: {
                host: appConfig.servers.backend.host,
                port: appConfig.servers.backend.port
            }
        },
        telegram: {
            username: appConfig.telegram.username,
            supportUsername: appConfig.telegram.supportUsername
        },
        livekit: {
            url: appConfig.livekit.url
        }
    };
}
