import winston, { format } from "winston";

export class Logger {
    public constructor() {
        this.internal = winston.createLogger({
            levels: this.LEVELS,
            format: winston.format.json(),
            defaultMeta: { service: "itam-edu-files" },
            transports: [
                getConsoleTransport(process.env.NODE_ENV === "production")
            ]
        });
    }

    protected internal: winston.Logger;

    public log(level: keyof typeof this.LEVELS, message: string, meta?: Meta) {
        this.internal.log(level, message, { ...meta });
    }
    public fatal(message: string, meta?: Meta) {
        this.log("fatal", message, meta);
    }
    public error(message: string, meta?: Meta) {
        this.log("error", message, meta);
    }
    public warning(message: string, meta?: Meta) {
        this.log("warning", message, meta);
    }
    public info(message: string, meta?: Meta) {
        this.log("info", message, meta);
    }
    public debug(message: string, meta?: Meta) {
        this.log("debug", message, meta);
    }
    public trace(message: string, meta?: Meta) {
        this.log("trace", message, meta);
    }

    public readonly LEVELS = {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        debug: 4,
        trace: 5
    };
}
const logger = new Logger();
export { logger as default };

export type Meta = Record<keyof {}, unknown>;

function getConsoleTransport(production: boolean) {
    return new winston.transports.Console({
        format: !production
            ? format.combine(
                  format.timestamp(),
                  format.colorize({
                      colors: {
                          fatal: "bold red",
                          error: "red",
                          warning: "yellow",
                          info: "green",
                          debug: "blue",
                          trace: "gray"
                      }
                  }),
                  format.printf(({ timestamp, level, message, ...rest }) => {
                      if (Object.keys(rest).length === 0) {
                          return `[${timestamp}] ${level} ${message}`;
                      }
                      return `[${timestamp}] ${level} ${message} ${JSON.stringify(rest)}`;
                  })
              )
            : format.combine(format.timestamp(), format.json()),
        forceConsole: !production,
        level: "trace"
    });
}
