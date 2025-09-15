import { Container } from "inversify";
import type { AppConfig } from "itam-edu-common/config";
import { Redis } from "./infra/redis";

export async function createContainer(config: AppConfig): Promise<Container> {
    const container = new Container({
        autobind: true,
        defaultScope: "Singleton"
    });

    container.bind<AppConfig>("AppConfig").toConstantValue(config);
    container
        .bind(Redis)
        .toConstantValue(await Redis.connect(config.redis.connectionString));

    return container;
}
