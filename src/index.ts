type LogLevelConfigurable = 'disabled' | 'trace' | 'debug' | 'info' | 'warn' | 'error'
type LogLevel = Exclude<LogLevelConfigurable, 'disabled'>
type LogLevelSymbol =
  typeof LOG_LEVEL_TRACE |
  typeof LOG_LEVEL_DEBUG |
  typeof LOG_LEVEL_INFO |
  typeof LOG_LEVEL_WARN |
  typeof LOG_LEVEL_ERROR
type LogFunction = (msgLogLevel: LogLevel, message?: any, ...optionalParams: any[]) => void
type LevelLogFunction = (message?: any, ...optionalParams: any[]) => void

interface LoggerOptions {
  // TODO Consider spliting to 2 options?
  level?: LogLevelConfigurable | string
  logFunction?: LogFunction
}

const LOG_LEVEL_TRACE: unique symbol = Symbol('trace')
const LOG_LEVEL_DEBUG: unique symbol = Symbol('debug')
const LOG_LEVEL_INFO: unique symbol = Symbol('info')
const LOG_LEVEL_WARN: unique symbol = Symbol('warn')
const LOG_LEVEL_ERROR: unique symbol = Symbol('error')

const DEFAULT_LOG_FUNCTIONS: Record<LogLevelSymbol, LevelLogFunction> = {
  [LOG_LEVEL_TRACE]: console.trace,
  [LOG_LEVEL_DEBUG]: console.debug,
  [LOG_LEVEL_INFO]: console.info,
  [LOG_LEVEL_WARN]: console.warn,
  [LOG_LEVEL_ERROR]: console.error
}

function noop (): void {}
