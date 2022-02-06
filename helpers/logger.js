const { createLogger, transports, format } = require('winston')

module.exports = createLogger({
    transports: new transports.File({
        filename: 'logs/server.log',
        format: format.combine(
            format.timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
            format.align(),
            format.printf(info => `${info.level}: ${[info.timestamp]}: \n ${info.message}`),
        )
    }),
})