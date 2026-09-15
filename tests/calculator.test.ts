import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compare,
  estimate,
  validateWorkload,
  type Workload,
} from '../src/utils/calculator.ts';

const example: Workload = {
  inputRate: 2,
  outputRate: 8,
  systemTokens: 1_000,
  repositoryTokens: 20_000,
  targetedTokens: 2_000,
  taskInputTokens: 500,
  outputTokens: 1_000,
  callsPerTask: 3,
  tasksPerDay: 10,
};

function close(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) < 1e-10,
    `${actual} must equal ${expected}`,
  );
}

test('charges repeated context and output on every call, with a 30-day month', () => {
  const result = compare(example);
  assert.deepEqual(result.full.tokensPerTask, {
    input: 64_500,
    output: 3_000,
    total: 67_500,
  });
  assert.deepEqual(result.full.tokensPerDay, {
    input: 645_000,
    output: 30_000,
    total: 675_000,
  });
  assert.deepEqual(result.full.tokensPerMonth, {
    input: 19_350_000,
    output: 900_000,
    total: 20_250_000,
  });
  assert.deepEqual(result.targeted.tokensPerTask, {
    input: 10_500,
    output: 3_000,
    total: 13_500,
  });
  close(result.full.costPerTask, 0.153);
  close(result.full.costPerDay, 1.53);
  close(result.full.costPerMonth, 45.9);
  close(result.targeted.costPerTask, 0.045);
  close(result.targeted.costPerDay, 0.45);
  close(result.targeted.costPerMonth, 13.5);
  close(result.savings.costPerTask, 0.108);
  close(result.savings.costPerDay, 1.08);
  close(result.savings.costPerMonth, 32.4);
  close(result.savings.percent, (0.108 / 0.153) * 100);
});

test('accepts a zero workload without dividing by zero', () => {
  const result = compare({
    inputRate: 0,
    outputRate: 0,
    systemTokens: 0,
    repositoryTokens: 0,
    targetedTokens: 0,
    taskInputTokens: 0,
    outputTokens: 0,
    callsPerTask: 1,
    tasksPerDay: 0,
  });
  assert.equal(result.full.costPerMonth, 0);
  assert.deepEqual(result.full.tokensPerMonth, {
    input: 0,
    output: 0,
    total: 0,
  });
  assert.equal(result.savings.percent, 0);
});

test('zero daily tasks preserve the cost of one task', () => {
  const result = estimate(
    { ...example, tasksPerDay: 0 },
    example.repositoryTokens,
  );
  close(result.costPerTask, 0.153);
  assert.equal(result.costPerDay, 0);
  assert.equal(result.tokensPerMonth.total, 0);
});

test('equal repository and targeted context produce zero savings', () => {
  const result = compare({
    ...example,
    targetedTokens: example.repositoryTokens,
  });
  assert.deepEqual(result.full, result.targeted);
  assert.deepEqual(result.savings, {
    costPerTask: 0,
    costPerDay: 0,
    costPerMonth: 0,
    percent: 0,
  });
});

test('rejects invalid fields and missing fields at the input boundary', () => {
  for (const invalid of [
    { ...example, inputRate: -1 },
    { ...example, outputRate: Number.NaN },
    { ...example, systemTokens: Number.POSITIVE_INFINITY },
    { ...example, callsPerTask: 0 },
    { ...example, callsPerTask: 1.5 },
    { ...example, tasksPerDay: -1 },
    { ...example, tasksPerDay: 1.5 },
    { ...example, targetedTokens: 20_001 },
    {},
  ]) {
    const result = validateWorkload(invalid);
    assert.equal(result.kind, 'error');
    if (result.kind === 'error') assert.ok(result.errors.length > 0);
  }
  assert.equal(validateWorkload({ ...example }).kind, 'valid');
});

test('rejects token and cost overflow without displaying Infinity or NaN', () => {
  for (const workload of [
    { ...example, repositoryTokens: Number.MAX_VALUE },
    { ...example, tasksPerDay: 1e305 },
    { ...example, inputRate: Number.MAX_VALUE, repositoryTokens: 1e100 },
  ]) {
    assert.equal(validateWorkload(workload).kind, 'error');
    assert.throws(() => compare(workload), RangeError);
  }
});

test('rejects invalid explicit context', () => {
  for (const context of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => estimate(example, context), RangeError);
  }
});
