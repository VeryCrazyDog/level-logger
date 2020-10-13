import util from 'util'

const TIMESTAMP_SYMBOL: unique symbol = Symbol('timestamp')
const ISO_TIMESTAMP_SYMBOL: unique symbol = Symbol('iso-timestamp')
const MESSAGE_LEVEL_SYMBOL: unique symbol = Symbol('message-level')

export type MessageLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'
export type LoggingLevel = 'off' | MessageLevel
export type TimestampFormatFunction = (value: Date) => string
export type MessageFormatFunction = (
  level: MessageLevel,
  resolvedPrefixes: any[],
  ...messageParams: any[]
) => string
export type LogFunction = (level: MessageLevel, message: string) => void
type MessageLevelLogFunction = (...messageParams: any[]) => void

export interface LoggerOptions {
  level?: LoggingLevel
  prefixes?: any[]
  timestampFormatter?: TimestampFormatFunction
  messageFormatter?: MessageFormatFunction
  logger?: LogFunction
}

export const LogTags: Readonly<{
  TIMESTAMP: typeof TIMESTAMP_SYMBOL
  ISO_TIMESTAMP: typeof ISO_TIMESTAMP_SYMBOL
  MESSAGE_LEVEL: typeof MESSAGE_LEVEL_SYMBOL
}> = {
  TIMESTAMP: TIMESTAMP_SYMBOL,
  ISO_TIMESTAMP: ISO_TIMESTAMP_SYMBOL,
  MESSAGE_LEVEL: MESSAGE_LEVEL_SYMBOL
}

const LOGGING_LEVEL_TO_PRIORITY: Readonly<Record<LoggingLevel, number>> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  off: 5
}
const LOGGING_LEVELS: Readonly<Set<LoggingLevel>> = new Set(['trace', 'debug', 'info', 'warn', 'error', 'off'])
const MESSAGE_LEVELS: Readonly<Set<MessageLevel>> = new Set(['trace', 'debug', 'info', 'warn', 'error'])

function isLoggingLevel (value: string): value is LoggingLevel {
  return (LOGGING_LEVELS as Set<string>).has(value)
}

export function defaultTimestampFormatter (value: Date): string {
  const year = value.getFullYear()
  const month = (value.getMonth() + 1).toString().padStart(2, '0')
  const day = value.getDate().toString().padStart(2, '0')
  const hour = value.getHours().toString().padStart(2, '0')
  const minute = value.getMinutes().toString().padStart(2, '0')
  const second = value.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export function defaultMessageFormatter (
  level: MessageLevel,
  resolvedPrefixes: any[],
  ...messageParams: any[]
): string {
  if (messageParams.length === 0) { return '' }
  // @ts-expect-error, `util.format()` works with zero argument
  const formattedMessage = util.format(...messageParams)
  let result: string
  if (resolvedPrefixes.length > 0) {
    // @ts-expect-error, `util.format()` works with zero argument
    const prefix = util.format(...resolvedPrefixes)
    result = `${prefix} ${formattedMessage}`
  } else {
    result = formattedMessage
  }
  return result
}

function defaultLogger (level: MessageLevel, message: string): void {
  console[level](message)
}

function noop (): void {}

export class LevelLogger {
  #level: LoggingLevel
  #prefixes: any[]
  #timestampFormatter: TimestampFormatFunction
  #messageFormatter: MessageFormatFunction
  #logger: LogFunction
  #levelLogger: Record<MessageLevel, MessageLevelLogFunction>

  constructor (options?: LoggerOptions) {
    this.#level = 'info'
    this.#prefixes = []
    this.#timestampFormatter = defaultTimestampFormatter
    this.#messageFormatter = defaultMessageFormatter
    this.#logger = defaultLogger
    // @ts-expect-error, we will initialize later
    this.#levelLogger = {}
    if (options != null) {
      if (options.level != null) {
        const lowerCaseLevel = options.level.toLowerCase()
        if (isLoggingLevel(lowerCaseLevel)) {
          this.#level = lowerCaseLevel
        }
      }
      if (options.prefixes != null) {
        this.#prefixes = [...options.prefixes]
      }
      if (options.timestampFormatter != null) {
        this.#timestampFormatter = options.timestampFormatter
      }
      if (options.messageFormatter != null) {
        this.#messageFormatter = options.messageFormatter
      }
      if (options.logger != null) {
        this.#logger = options.logger
      }
    }
    const levelPriority = LOGGING_LEVEL_TO_PRIORITY[this.#level]
    MESSAGE_LEVELS.forEach(logLevel => {
      if (levelPriority > LOGGING_LEVEL_TO_PRIORITY[logLevel]) {
        this.#levelLogger[logLevel] = noop
      } else {
        this.#levelLogger[logLevel] = ((messageLevel, prefixes, messageFormatter, logger) => {
          const messageLevelUpperCase = messageLevel.toUpperCase()
          return (...messagePaarams: any[]) => {
            const formattedMessage = messageFormatter(
              messageLevel,
              this.resolveSymbols(prefixes, messageLevelUpperCase),
              ...messagePaarams
            )
            logger(messageLevel, formattedMessage)
          }
        })(logLevel, this.#prefixes, this.#messageFormatter, this.#logger)
      }
    })
  }

  extend (options?: LoggerOptions): LevelLogger {
    return new LevelLogger({
      level: this.#level,
      prefixes: this.prefixes,
      timestampFormatter: this.#timestampFormatter,
      messageFormatter: this.#messageFormatter,
      logger: this.#logger,
      ...options
    })
  }

  get level (): LoggingLevel {
    return this.#level
  }

  get prefixes (): any[] {
    return [...this.#prefixes]
  }

  private resolveSymbols (data: any[], messageLevel: string): any[] {
    return data.map(p => {
      switch (p) {
        case TIMESTAMP_SYMBOL:
          return this.#timestampFormatter(new Date())
        case ISO_TIMESTAMP_SYMBOL:
          return (new Date()).toISOString()
        case MESSAGE_LEVEL_SYMBOL:
          return messageLevel
        default:
          return p
      }
    })
  }

  trace (message?: any, ...optionalParams: any[]): void
  trace (...messageParams: any[]): void {
    this.#levelLogger.trace(...messageParams)
  }

  debug (message?: any, ...optionalParams: any[]): void
  debug (...messageParams: any[]): void {
    this.#levelLogger.debug(...messageParams)
  }

  info (message?: any, ...optionalParams: any[]): void
  info (...messageParams: any[]): void {
    this.#levelLogger.info(...messageParams)
  }

  warn (message?: any, ...optionalParams: any[]): void
  warn (...messageParams: any[]): void {
    this.#levelLogger.warn(...messageParams)
  }

  error (message?: any, ...optionalParams: any[]): void
  error (...messageParams: any[]): void {
    this.#levelLogger.error(...messageParams)
  }
}
export default LevelLogger
