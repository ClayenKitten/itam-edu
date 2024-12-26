import winston, { format } from "winston";

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    format: winston.format.json(),
    defaultMeta: { service: "itam-edu-tg" },
    transports: [getConsoleTransport(process.env.NODE_ENV === "production")]
});

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

export default logger;
