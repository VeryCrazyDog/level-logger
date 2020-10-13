import anyTest, { TestInterface, ExecutionContext } from 'ava'
import sinon from 'sinon'

import LevelLogger, { LogTags } from '../index'

const test = anyTest as TestInterface<{
  consoleTraceStub: sinon.SinonStub<Parameters<typeof console.trace>, void>
  consoleDebugStub: sinon.SinonStub<Parameters<typeof console.debug>, void>
  consoleInfoStub: sinon.SinonStub<Parameters<typeof console.info>, void>
  consoleWarnStub: sinon.SinonStub<Parameters<typeof console.warn>, void>
  consoleErrorStub: sinon.SinonStub<Parameters<typeof console.error>, void>
}>

function calledOnceWithExactly<T, S extends any[]> (
  t: ExecutionContext<T>, stub: sinon.SinonStub<S, void>, ...args: any[]
): void {
  t.true(stub.calledOnce)
  t.deepEqual(stub.firstCall.args, args)
}

test.beforeEach(t => {
  t.context.consoleTraceStub = sinon.stub(console, 'trace')
  t.context.consoleDebugStub = sinon.stub(console, 'debug')
  t.context.consoleInfoStub = sinon.stub(console, 'info')
  t.context.consoleWarnStub = sinon.stub(console, 'warn')
  t.context.consoleErrorStub = sinon.stub(console, 'error')
})

test.afterEach.always(() => {
  sinon.restore()
})

test.serial('should log correctly with no message parameter', async (t) => {
  const logger = new LevelLogger()
  logger.info()
  calledOnceWithExactly(t, t.context.consoleInfoStub, '')
})

test.serial('should log correctly with a single message parameter', async (t) => {
  const logger = new LevelLogger()
  logger.info('Hello world!')
  calledOnceWithExactly(t, t.context.consoleInfoStub, 'Hello world!')
})

test.serial('should log correctly with multiple message parameters', async (t) => {
  const logger = new LevelLogger()
  logger.info('Hello', 'again,', 'world!')
  calledOnceWithExactly(t, t.context.consoleInfoStub, 'Hello again, world!')
})

test.serial('should log nothing when no message parameter with some prefixes', async (t) => {
  const logger = new LevelLogger({
    prefixes: ['A', 'B']
  })
  logger.info()
  calledOnceWithExactly(t, t.context.consoleInfoStub, '')
})

test.serial('should log correctly some prefixes and multiple message parameters', async (t) => {
  const logger = new LevelLogger({
    prefixes: ['A', 'B']
  })
  logger.info('MessageC', 'MessageD')
  calledOnceWithExactly(t, t.context.consoleInfoStub, 'A B MessageC MessageD')
})

test.serial.todo('should log with logging level as specified in options')

test.serial.todo('should have all logging level working properly')

test.serial('should resolve timestamp prefix', async (t) => {
  const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} message$/
  const logger = new LevelLogger({
    prefixes: [LogTags.TIMESTAMP]
  })
  logger.info('message')
  const args = t.context.consoleInfoStub.args
  t.deepEqual(args.length, 1)
  t.deepEqual(args[0].length, 1)
  t.true(timestampRegex.test(args[0][0]))
})

test.serial('should resolve ISO timestamp prefix', async (t) => {
  const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z message$/
  const logger = new LevelLogger({
    prefixes: [LogTags.ISO_TIMESTAMP]
  })
  logger.info('message')
  const args = t.context.consoleInfoStub.args
  t.deepEqual(args.length, 1)
  t.deepEqual(args[0].length, 1)
  t.true(timestampRegex.test(args[0][0]))
})

test.serial('should resolve log level prefix', async (t) => {
  const logger = new LevelLogger({
    prefixes: [LogTags.MESSAGE_LEVEL]
  })
  logger.info('message')
  calledOnceWithExactly(t, t.context.consoleInfoStub, 'INFO message')
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
  const loggerA = new LevelLogger({
    prefixes: ['A']
  })
  const loggerB = loggerA.extend({
    prefixes: ['B']
  })
  t.deepEqual(loggerA.prefixes, ['A'])
  t.deepEqual(loggerB.prefixes, ['B'])
})
