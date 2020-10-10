import util from 'util'

const TIMESTAMP_SYMBOL: unique symbol = Symbol('timestamp')
const MESSAGE_LEVEL_SYMBOL: unique symbol = Symbol('message-level')

export type MessageLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'
export type LoggingLevel = 'off' | MessageLevel
export type TimestampFormatFunction = (value: Date) => string
export type MessageFormatFunction = (
  level: MessageLevel,
  prefixes: any[],
  message?: any,
  ...optionalParams: any[]
) => string
export type LogFunction = (level: MessageLevel, message: string) => void
type MessageLevelLogFunction = (message?: any, ...optionalParams: any[]) => void

export interface LoggerOptions {
  level?: LoggingLevel
  levelText?: string
  prefixes?: any[]
  timestampFormatter?: TimestampFormatFunction
  messageFormatter?: MessageFormatFunction
  logger?: LogFunction
}

export const LogTags: Readonly<{
  TIMESTAMP: typeof TIMESTAMP_SYMBOL
  MESSAGE_LEVEL: typeof MESSAGE_LEVEL_SYMBOL
}> = {
  TIMESTAMP: TIMESTAMP_SYMBOL,
  MESSAGE_LEVEL: MESSAGE_LEVEL_SYMBOL
}

const LOGGING_LEVEL_TO_PRIORITY: Record<LoggingLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  off: 5
}
const LOGGING_LEVELS: LoggingLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'off']
const MESSAGE_LEVELS: MessageLevel[] = ['trace', 'debug', 'info', 'warn', 'error']

const DEFAULT_TIMESTAMP_FORMATTER: TimestampFormatFunction = value => {
  const year = value.getFullYear()
  const month = (value.getMonth() + 1).toString().padStart(2, '0')
  const day = value.getDate().toString().padStart(2, '0')
  const hour = value.getHours().toString().padStart(2, '0')
  const minute = value.getMinutes().toString().padStart(2, '0')
  const second = value.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

function noop (): void {}

export default class LevelLogger {
  #level: LoggingLevel
  #prefixes: any[]
  #timestampFormatter: TimestampFormatFunction
  #messageFormatter: MessageFormatFunction | null
  #logger: LogFunction | null
  #levelLogger: Record<MessageLevel, MessageLevelLogFunction>

  constructor (options?: LoggerOptions) {
    this.#level = 'info'
    this.#prefixes = []
    this.#timestampFormatter = DEFAULT_TIMESTAMP_FORMATTER
    this.#messageFormatter = null
    this.#logger = null
    this.#levelLogger = {
      trace: console.trace,
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error
    }
    if (options != null) {
      if (options.level != null) {
        this.#level = options.level
      } else if (options.levelText != null) {
        this.setLevel(options.levelText)
      }
      if (options.prefixes != null) {
        this.#prefixes = options.prefixes
      }
      if (options.timestampFormatter != null) {
        this.#timestampFormatter = options.timestampFormatter
      }
      this.#logger = options.logger ?? null
    }
    this.updateLevelLogger()
  }

  extend (options?: LoggerOptions): LevelLogger {
    return new LevelLogger({
      level: this.#level,
      prefixes: [...this.prefixes],
      timestampFormatter: this.#timestampFormatter,
      messageFormatter: this.#messageFormatter ?? undefined,
      logger: this.#logger ?? undefined,
      ...options
    })
  }

  set level (level: LoggingLevel) {
    this.#level = level
    this.updateLevelLogger()
  }

  get level (): LoggingLevel {
    return this.#level
  }

  setLevel (level: string): void {
    const lowerCaseLevel = level.toLowerCase()
    if ((LOGGING_LEVELS as string[]).includes(lowerCaseLevel)) {
      this.level = lowerCaseLevel as LoggingLevel
    }
  }

  set prefixes (prefixes: any[]) {
    this.#prefixes = prefixes
    this.updateLevelLogger()
  }

  get prefixes (): any[] {
    return [...this.#prefixes]
  }

  private updateLevelLogger (): void {
    const levelPriority = LOGGING_LEVEL_TO_PRIORITY[this.#level]
    MESSAGE_LEVELS.forEach(logLevel => {
      if (levelPriority <= LOGGING_LEVEL_TO_PRIORITY[logLevel]) {
        if (this.#messageFormatter == null && this.#logger == null) {
          this.#levelLogger[logLevel] = ((messageLevel, prefixes) => {
            return (message?: any, ...optionalParams: any[]) => {
              let newMessage: any
              if (prefixes.length > 0) {
                const [format, ...params] = this.resolveSymbols(prefixes, messageLevel)
                if (message !== undefined) {
                  newMessage = util.format(format, ...params, message)
                } else {
                  newMessage = util.format(format, ...params)
                }
              } else {
                newMessage = message
              }
              console[messageLevel](newMessage, ...optionalParams)
            }
          })(logLevel, this.#prefixes)
        } else if (this.#messageFormatter == null && this.#logger != null) {
          this.#levelLogger[logLevel] = ((messageLevel, prefixes, logger) => {
            return (message?: any, ...optionalParams: any[]) => {
              let newMessage: string
              if (prefixes.length > 0) {
                const [format, ...params] = this.resolveSymbols(prefixes, messageLevel)
                if (message !== undefined) {
                  newMessage = util.format(format, ...params, message)
                } else {
                  newMessage = util.format(format, ...params)
                }
              } else {
                newMessage = message
              }
              newMessage = util.format(newMessage, ...optionalParams)
              logger(messageLevel, newMessage)
            }
          })(logLevel, this.#prefixes, this.#logger)
        } else if (this.#messageFormatter != null && this.#logger == null) {
          this.#levelLogger[logLevel] = ((messageLevel, prefixes, messageFormatter) => {
            return (message?: any, ...optionalParams: any[]) => {
              const newMessage = messageFormatter(
                messageLevel,
                this.resolveSymbols(prefixes, messageLevel),
                message,
                ...optionalParams
              )
              console[messageLevel](newMessage)
            }
          })(logLevel, this.#prefixes, this.#messageFormatter)
        } else if (this.#messageFormatter != null && this.#logger != null) {
          this.#levelLogger[logLevel] = ((messageLevel, prefixes, messageFormatter, logger) => {
            return (message?: any, ...optionalParams: any[]) => {
              const newMessage = messageFormatter(
                messageLevel,
                this.resolveSymbols(prefixes, messageLevel),
                message,
                ...optionalParams
              )
              logger(messageLevel, newMessage)
            }
          })(logLevel, this.#prefixes, this.#messageFormatter, this.#logger)
        }
      } else {
        this.#levelLogger[logLevel] = noop
      }
    })
  }

  private resolveSymbols (data: any[], messageLevel: MessageLevel): any[] {
    return data.map(p => {
      if (p === TIMESTAMP_SYMBOL) {
        return this.#timestampFormatter(new Date())
      } else if (p === MESSAGE_LEVEL_SYMBOL) {
        return messageLevel.toUpperCase()
      } else {
        return p
      }
    })
  }

  trace (message?: any, ...optionalParams: any[]): void {
    this.#levelLogger.trace(message, ...optionalParams)
  }

  debug (message?: any, ...optionalParams: any[]): void {
    this.#levelLogger.debug(message, ...optionalParams)
  }

  info (message?: any, ...optionalParams: any[]): void {
    this.#levelLogger.info(message, ...optionalParams)
  }

  warn (message?: any, ...optionalParams: any[]): void {
    this.#levelLogger.warn(message, ...optionalParams)
  }

  error (message?: any, ...optionalParams: any[]): void {
    this.#levelLogger.error(message, ...optionalParams)
  }
}
