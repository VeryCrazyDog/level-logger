const LOG_LEVEL_TRACE_SYMBOL: unique symbol = Symbol('trace')
const LOG_LEVEL_DEBUG_SYMBOL: unique symbol = Symbol('debug')
const LOG_LEVEL_INFO_SYMBOL: unique symbol = Symbol('info')
const LOG_LEVEL_WARN_SYMBOL: unique symbol = Symbol('warn')
const LOG_LEVEL_ERROR_SYMBOL: unique symbol = Symbol('error')
const TIMESTAMP_SYMBOL: unique symbol = Symbol('timestamp')

type LogLevelConfigurable = 'disabled' | 'trace' | 'debug' | 'info' | 'warn' | 'error'
type LogLevelText = Exclude<LogLevelConfigurable, 'disabled'>
type LogLevelSymbol =
  typeof LOG_LEVEL_TRACE_SYMBOL |
  typeof LOG_LEVEL_DEBUG_SYMBOL |
  typeof LOG_LEVEL_INFO_SYMBOL |
  typeof LOG_LEVEL_WARN_SYMBOL |
  typeof LOG_LEVEL_ERROR_SYMBOL
type TimestampFormatFunction = (value: Date) => string
type LogFunction = (messageLevel: LogLevelText, prefix?: any, message?: any, ...optionalParams: any[]) => void
type LevelLogFunction = (message?: any, ...optionalParams: any[]) => void

interface LoggerOptions {
  levelStrict?: LogLevelConfigurable
  level?: string
  prefix?: any[]
  timestampFormatter?: TimestampFormatFunction
  logger?: LogFunction
}

export const LogLevel: Readonly<{
  trace: typeof LOG_LEVEL_TRACE_SYMBOL
  debug: typeof LOG_LEVEL_DEBUG_SYMBOL
  info: typeof LOG_LEVEL_INFO_SYMBOL
  warn: typeof LOG_LEVEL_WARN_SYMBOL
  error: typeof LOG_LEVEL_ERROR_SYMBOL
}> = {
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
