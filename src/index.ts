const LOG_LEVEL_TRACE_SYMBOL: unique symbol = Symbol('trace')
const LOG_LEVEL_DEBUG_SYMBOL: unique symbol = Symbol('debug')
const LOG_LEVEL_INFO_SYMBOL: unique symbol = Symbol('info')
const LOG_LEVEL_WARN_SYMBOL: unique symbol = Symbol('warn')
const LOG_LEVEL_ERROR_SYMBOL: unique symbol = Symbol('error')
const TIMESTAMP_SYMBOL: unique symbol = Symbol('timestamp')
const LOG_LEVEL_SYMBOL: unique symbol = Symbol('log-level')

type LogLevelText = 'trace' | 'debug' | 'info' | 'warn' | 'error'
type LogLevelSymbol =
  typeof LOG_LEVEL_TRACE_SYMBOL |
  typeof LOG_LEVEL_DEBUG_SYMBOL |
  typeof LOG_LEVEL_INFO_SYMBOL |
  typeof LOG_LEVEL_WARN_SYMBOL |
  typeof LOG_LEVEL_ERROR_SYMBOL
export type LogLevelConfigurable = 'disabled' | LogLevelText
export type TimestampFormatFunction = (value: Date) => string
export type LogFunction = (messageLevel: LogLevelText, prefix?: any, message?: any, ...optionalParams: any[]) => void
type LevelLogFunction = (message?: any, ...optionalParams: any[]) => void

export interface LoggerOptions {
  levelStrict?: LogLevelConfigurable
  level?: string
  prefix?: any[]
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

const LOG_LEVEL_TEXT_TO_SYMBOL_MAP: Record<LogLevelText, LogLevelSymbol> = {
  trace: LOG_LEVEL_TRACE_SYMBOL,
  debug: LOG_LEVEL_DEBUG_SYMBOL,
  info: LOG_LEVEL_INFO_SYMBOL,
  warn: LOG_LEVEL_WARN_SYMBOL,
  error: LOG_LEVEL_ERROR_SYMBOL
}

const DEFAULT_TIMESTAMP_FORMATTER: TimestampFormatFunction = value => {
  const year = value.getFullYear()
  const month = (value.getMonth() + 1).toString().padStart(2, '0')
  const day = value.getDate().toString().padStart(2, '0')
  const hour = value.getHours().toString().padStart(2, '0')
  const minute = value.getMinutes().toString().padStart(2, '0')
  const second = value.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const DEFAULT_LOGGERS: Record<LogLevelSymbol, LevelLogFunction> = {
  [LOG_LEVEL_TRACE_SYMBOL]: console.trace,
  [LOG_LEVEL_DEBUG_SYMBOL]: console.debug,
  [LOG_LEVEL_INFO_SYMBOL]: console.info,
  [LOG_LEVEL_WARN_SYMBOL]: console.warn,
  [LOG_LEVEL_ERROR_SYMBOL]: console.error
}

function noop (): void {}

export default class LevelLogger {
  #level: LogLevelConfigurable
  #logger: LogFunction | null

  constructor (options?: LoggerOptions) {
    this.#level = 'info'
    this.#logger = null
    if (options != null) {
      this.#logger = options.logger ?? null
      if (options.levelStrict != null) {
        this.setLevel(options.levelStrict, true)
      } else if (options.level != null) {
        this.setLevel(options.level, false)
      }
    }
  }

  setLevel (level: string, strict: Boolean): void {
    // TODO Implement
  }
}
