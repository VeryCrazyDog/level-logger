# @verycrazydog/level-logger
A flexible logger supports log level. Inpired by [console-log-level], [got] and [loglevel].

[![Version on npm]][level-logger]
[![Supported Node.js version]][Node.js download]


## Install
```
npm install @verycrazydog/level-logger
```


## Usage
Console logging
```js
const { LevelLogger } = require('@verycrazydog/level-logger')
const logger = new LevelLogger({
	level: 'INFO'
})
// Print 'Hello World!'
logger.info('Hello World!')
```

Console logging with timestamp prefix
```js
const { LevelLogger, LogTags } = require('@verycrazydog/level-logger')
const logger = new LevelLogger({
	level: 'INFO',
	prefixes: [ LogTags.TIMESTAMP ]
})
// Print '2020-10-13 20:02:11 Hello World!'
logger.info('Hello World!')
```

Custom timestamp format
```js
const { LevelLogger, LogTags } = require('@verycrazydog/level-logger')
const logger = new LevelLogger({
	level: 'INFO',
	prefixes: [ LogTags.TIMESTAMP ],
	timestampFormatter: value => {
		const hour = value.getHours().toString().padStart(2, '0')
		const minute = value.getMinutes().toString().padStart(2, '0')
		const second = value.getSeconds().toString().padStart(2, '0')
		return `${hour}:${minute}:${second}`
	}
})
// Print '20:54:26 Hello World!'
logger.info('Hello World!')

```

Use `.extend()` to create per-request logger
```js
const { LevelLogger, LogTags } = require('@verycrazydog/level-logger')
const express = require('express')

const logger = new LevelLogger({
	level: 'INFO',
	prefixes: [ LogTags.TIMESTAMP, 'SERVER' ]
})
const reqLoggerBase = logger.extend({
	prefixes: [ LogTags.TIMESTAMP, 'REQUEST' ]
})

const app = express()
const port = 3000

app.get('/', (req, res) => {
	const reqId = Math.round(Math.random() * 99999999).toString().padStart(8, '0')
	const reqLogger = reqLoggerBase.extend({
		prefixes: [
			...reqLoggerBase.prefixes,
			reqId
		]
	})
	// Print '2020-10-13 20:22:29 REQUEST 80419951 GET /'
	reqLogger.info(req.method, req.path)
	res.send('Hello World!')
})

app.listen(port, () => {
	// Print '2020-10-13 20:22:28 SERVER Server running at port 3000'
	logger.info('Server running at port', port)
})
```

Process message for AWS CloudWatch to display as single log entry with formatted JSON display
```js
const { LevelLogger, LogTags, defaultMessageFormatter } = require('@verycrazydog/level-logger')
const logger = new LevelLogger({
	level: 'INFO',
	prefixes: [ LogTags.TIMESTAMP ],
	messageFormatter: (level, resolvedPrefixes, ...messageParams) => {
		messageParams = messageParams.map(p => {
			if (typeof p === 'object' && !(p instanceof Error)) {
				return JSON.stringify(p)
			} else {
				return p
			}
		})
		let message = defaultMessageFormatter(level, resolvedPrefixes, ...messageParams)
		// Reference https://stackoverflow.com/a/44272913/1131246
		message = message.replace(/\r?\n/g, '\r')
		return message
	}
})
logger.info({ message: 'Hello World!' })
logger.error(new Error('Test Error'))
```

Combine with other logger to log to file
```js
const { LevelLogger, LogTags } = require('@verycrazydog/level-logger')
const winston = require('winston')

const winstonLogger = winston.createLogger({
	level: 'debug',
	format: winston.format.printf(({ message }) => {
		return message
	}),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'app.log' })
	]
})
const logger = new LevelLogger({
	level: 'DEBUG',
	prefixes: [ LogTags.TIMESTAMP, LogTags.MESSAGE_LEVEL ],
	logger: (level, message) => {
		winstonLogger.log(level, message)
	}
})

// Print '2020-10-13 20:51:07 INFO Hello World!' to both console and log file
logger.info('Hello World!')
```


## License
This module is licensed under the [MIT License](./LICENSE).



[console-log-level]: https://www.npmjs.com/package/console-log-level
[got]: https://www.npmjs.com/package/got
[level-logger]: https://www.npmjs.com/package/@verycrazydog/level-logger
[loglevel]: https://www.npmjs.com/package/loglevel
[Node.js download]: https://nodejs.org/en/download
[Supported Node.js version]: https://badgen.net/npm/node/@verycrazydog/level-logger
[Version on npm]: https://badgen.net/npm/v/@verycrazydog/level-logger
