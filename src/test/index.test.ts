import anyTest, { TestInterface } from 'ava'
import sinon from 'sinon'

import LevelLogger, { LogTags } from '../index'

const test = anyTest as TestInterface<{
  consoleInfoStub: sinon.SinonStub<[message?: any, ...optionalParams: any[]], void>
}>

test.beforeEach(t => {
  t.context.consoleInfoStub = sinon.stub(console, 'info')
})

test.afterEach.always(() => {
  sinon.restore()
})

test.serial('should log correctly with single message', async (t) => {
  const logger = new LevelLogger()
  logger.info('Hello world!')
  t.true(t.context.consoleInfoStub.calledOnceWithExactly('Hello world!'))
})

test.serial('should log correctly with message and parameters', async (t) => {
  const logger = new LevelLogger()
  logger.info('Hello', 'again,', 'world!')
  t.true(t.context.consoleInfoStub.calledOnceWithExactly('Hello again, world!'))
})

test.serial('should resolve timestamp prefix', async (t) => {
  const timestampRegex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/
  const logger = new LevelLogger({
    prefixes: [LogTags.TIMESTAMP]
  })
  logger.info()
  const args = t.context.consoleInfoStub.args
  t.deepEqual(args.length, 1)
  t.deepEqual(args[0].length, 1)
  t.true(timestampRegex.test(args[0][0]))
})

test.serial('should resolve ISO timestamp prefix', async (t) => {
  const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
  const logger = new LevelLogger({
    prefixes: [LogTags.ISO_TIMESTAMP]
  })
  logger.info()
  const args = t.context.consoleInfoStub.args
  t.deepEqual(args.length, 1)
  t.deepEqual(args[0].length, 1)
  t.true(timestampRegex.test(args[0][0]))
})

test.serial('should resolve log level prefix', async (t) => {
  const logger = new LevelLogger({
    prefixes: [LogTags.MESSAGE_LEVEL]
  })
  logger.info()
  t.true(t.context.consoleInfoStub.calledOnceWithExactly('INFO'))
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
  let logger = new LevelLogger({
    prefixes: ['A']
  })
  logger.info()
  logger = logger.extend({
    prefixes: ['B']
  })
  logger.info()
  t.true(t.context.consoleInfoStub.calledTwice)
  t.true(t.context.consoleInfoStub.firstCall.calledWithExactly('A'))
  t.true(t.context.consoleInfoStub.secondCall.calledWithExactly('B'))
})
