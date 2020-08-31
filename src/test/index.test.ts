import test from 'ava'

import LevelLogger, { LogTags } from '../index'

const originalConsoleInfo = console.info

test.afterEach(() => {
  console.info = originalConsoleInfo
})

test.after.always(() => {
  console.info = originalConsoleInfo
})

test.serial('should log correctly with single message', async (t) => {
  console.info = message => {
    t.deepEqual(message, 'Hello world!')
  }
  const logger = new LevelLogger()
  logger.info('Hello world!')
})

test.serial('should log correctly with message and parameters', async (t) => {
  console.info = (message, param1, param2) => {
    t.deepEqual(message, 'Hello')
    t.deepEqual(param1, 'again,')
    t.deepEqual(param2, 'world!')
  }
  const logger = new LevelLogger()
  logger.info('Hello', 'again,', 'world!')
})

test.serial('should resolve timestamp prefix', async (t) => {
  const timestampRegex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/
  console.info = message => {
    t.true(timestampRegex.test(message))
  }
  const logger = new LevelLogger({
    prefixes: [LogTags.TIMESTAMP]
  })
  logger.info()
})

test.serial('should resolve log level prefix', async (t) => {
  console.info = message => {
    t.deepEqual(message, 'INFO')
  }
  const logger = new LevelLogger({
    prefixes: [LogTags.LOG_LEVEL]
  })
  logger.info()
})

test.serial('extend should retain previous logger options', async (t) => {
  let logger = new LevelLogger({
    level: 'warn',
    prefixes: ['A']
  })
  logger = logger.extend()
  t.deepEqual(logger.level, 'warn')
  t.deepEqual(logger.prefixes, ['A'])
})

test.serial('extend should allow change of prefixes', async (t) => {
  console.info = message => {
    t.deepEqual(message, 'A')
  }
  let logger = new LevelLogger({
    prefixes: ['A']
  })
  logger.info()
  console.info = message => {
    t.deepEqual(message, 'B')
  }
  logger = logger.extend({
    prefixes: ['B']
  })
  logger.info()
})
