import winston, { format } from "winston";

export default class Logger {
    public constructor(internal?: winston.Logger) {
        if (internal) this.internal = internal;
        else {
            this.internal = winston.createLogger({
                levels: this.LEVELS,
                format: winston.format.json(),
                defaultMeta: { service: "itam-edu-api" },
                transports: [
                    getConsoleTransport(process.env.NODE_ENV === "production")
                ]
            });
        }
    }
    protected internal: winston.Logger;

    public child(options: Object): Logger {
        return new Logger(this.internal.child(options));
    }

    public log(
        level: keyof typeof this.LEVELS,
        message: string,
        meta?: unknown
    ) {
        this.internal.log(level, message, meta);
    }
    public fatal(message: string, meta?: unknown) {
        this.log("fatal", message, meta);
    }
    public error(message: string, meta?: unknown) {
        this.log("error", message, meta);
    }
    public warning(message: string, meta?: unknown) {
        this.log("warning", message, meta);
    }
    public info(message: string, meta?: unknown) {
        this.log("info", message, meta);
    }
    public debug(message: string, meta?: unknown) {
        this.log("debug", message, meta);
    }
    public trace(message: string, meta?: unknown) {
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

function getConsoleTransport(production: boolean) {
    return new winston.transports.Console({
        format: !production
            ? format.combine(
                  format.timestamp(),
                  format.colorize(),
                  format.printf(({ timestamp, level, message, ...rest }) => {
                      if (Object.keys(rest).length === 0) {
                          return `[${timestamp}] ${level} ${message}`;
                      }
                      return `[${timestamp}] ${level} ${message} ${JSON.stringify(rest)}`;
                  })
              )
            : format.combine(format.timestamp(), format.json()),
        forceConsole: !production,
        level: "debug"
    });
}
