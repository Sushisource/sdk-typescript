import { TestWorkflowEnvironment } from '@temporalio/testing';
import { bundleWorkflowCode, Worker, WorkflowBundle } from '@temporalio/worker';
import anyTest, { ExecutionContext, TestInterface } from 'ava';
import { v4 as uuid4 } from 'uuid';

interface Context {
  bundle: WorkflowBundle;
}

const test = anyTest as TestInterface<Context>;

test.before(async (t) => {
  t.context.bundle = await bundleWorkflowCode({ workflowsPath: require.resolve('./workflows') });
});

async function runSimpleWorkflow(t: ExecutionContext<Context>, testEnv: TestWorkflowEnvironment) {
  try {
    const taskQueue = 'test';
    const { client, nativeConnection, namespace } = testEnv;
    const worker = await Worker.create({
      connection: nativeConnection,
      namespace,
      taskQueue,
      workflowBundle: t.context.bundle,
    });
    await worker.runUntil(
      client.workflow.execute('successString', {
        workflowId: uuid4(),
        taskQueue,
      })
    );
  } finally {
    await testEnv.teardown();
  }
  t.pass();
}

test('TestEnvironment sets up test server and is able to run a single workflow', async (t) => {
  const testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  await runSimpleWorkflow(t, testEnv);
});

test('TestEnvironment sets up temporalite and is able to run a single workflow', async (t) => {
  const testEnv = await TestWorkflowEnvironment.createLocal();
  await runSimpleWorkflow(t, testEnv);
});

test.todo('TestEnvironment sets up test server with extra args');
test.todo('TestEnvironment sets up test server with specified port');
test.todo('TestEnvironment sets up test server with latest version');
test.todo('TestEnvironment sets up test server from executable path');

test.todo('TestEnvironment sets up temporalite with extra args');
test.todo('TestEnvironment sets up temporalite with latest version');
test.todo('TestEnvironment sets up temporalite from executable path');
test.todo('TestEnvironment sets up temporalite with custom log level');
test.todo('TestEnvironment sets up temporalite with custom namespace, IP, db filename, and UI');
