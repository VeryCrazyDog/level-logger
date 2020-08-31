import util from 'util'

const TIMESTAMP_SYMBOL: unique symbol = Symbol('timestamp')
const LOG_LEVEL_SYMBOL: unique symbol = Symbol('log-level')

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'
export type LogLevelConfigurable = 'disabled' | LogLevel
export type TimestampFormatFunction = (value: Date) => string
export type LogFunction = (messageLevel: LogLevel, prefix?: any[], message?: any, ...optionalParams: any[]) => void
type LevelLogFunction = (message?: any, ...optionalParams: any[]) => void

export interface LoggerOptions {
  levelStrict?: LogLevelConfigurable
  level?: string
  prefixes?: any[]
  timestampFormatter?: TimestampFormatFunction
  logger?: LogFunction
}

export const LogTags: Readonly<{
  TIMESTAMP: typeof TIMESTAMP_SYMBOL
  LOG_LEVEL: typeof LOG_LEVEL_SYMBOL
}> = {
  TIMESTAMP: TIMESTAMP_SYMBOL,
  LOG_LEVEL: LOG_LEVEL_SYMBOL
}

const LOG_LEVEL_CONFIGURABLE_TO_PRIORITY: Record<LogLevelConfigurable, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  disabled: 5
}
const CONFIGURABLE_LOG_LEVELS: LogLevelConfigurable[] = ['trace', 'debug', 'info', 'warn', 'error', 'disabled']
const LOG_LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error']

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
  #level: LogLevelConfigurable
  #prefixes: any[]
  #timestampFormatter: TimestampFormatFunction
  #logger: LogFunction | null
  #levelLogger: Record<LogLevel, LevelLogFunction>

  constructor (options?: LoggerOptions) {
    this.#level = 'info'
    this.#prefixes = []
    this.#timestampFormatter = DEFAULT_TIMESTAMP_FORMATTER
    this.#logger = null
    this.#levelLogger = {
      trace: console.trace,
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error
    }
    if (options != null) {
      if (options.levelStrict != null) {
        this.setLevelStrict(options.levelStrict)
      } else if (options.level != null) {
        this.setLevel(options.level)
      }
      if (options.prefixes != null) {
        this.setPrefixes(options.prefixes)
      }
      if (options.timestampFormatter != null) {
        this.#timestampFormatter = options.timestampFormatter
      }
      this.#logger = options.logger ?? null
    }
    this.updateLevelLogger()
  }

  setLevel (level: string): void {
    const lowerCaseLevel = level.toLowerCase()
    if ((CONFIGURABLE_LOG_LEVELS as string[]).includes(lowerCaseLevel)) {
      this.setLevel(lowerCaseLevel as LogLevelConfigurable)
    }
  }

  setLevelStrict (level: LogLevelConfigurable): void {
    this.#level = level
    this.updateLevelLogger()
  }

  getLevel (): LogLevelConfigurable {
    return this.#level
  }

  setPrefixes (prefixes: any[]): void {
    this.#prefixes = prefixes
    this.updateLevelLogger()
  }

  getPrefixes (): any[] {
    return [...this.#prefixes]
  }

  private updateLevelLogger (): void {
    const levelPriority = LOG_LEVEL_CONFIGURABLE_TO_PRIORITY[this.#level]
    LOG_LEVELS.forEach(logLevel => {
      if (levelPriority <= LOG_LEVEL_CONFIGURABLE_TO_PRIORITY[logLevel]) {
        if (this.#logger == null) {
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
        } else {
          this.#levelLogger[logLevel] = ((messageLevel, prefixes, logger) => {
            return (message?: any, ...optionalParams: any[]) => {
              logger(messageLevel, this.resolveSymbols(prefixes, messageLevel), message, ...optionalParams)
            }
          })(logLevel, this.#prefixes, this.#logger)
        }
      } else {
        this.#levelLogger[logLevel] = noop
      }
    })
  }

  private resolveSymbols (data: any[], messageLevel: LogLevel): any[] {
    return data.map(p => {
      if (p === TIMESTAMP_SYMBOL) {
        return this.#timestampFormatter(new Date())
      } else if (p === LOG_LEVEL_SYMBOL) {
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
