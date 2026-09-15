export interface Workload {
  inputRate: number;
  outputRate: number;
  systemTokens: number;
  repositoryTokens: number;
  targetedTokens: number;
  taskInputTokens: number;
  outputTokens: number;
  callsPerTask: number;
  tasksPerDay: number;
}

export const exampleWorkload: Workload = {
  inputRate: 3,
  outputRate: 15,
  systemTokens: 2_000,
  repositoryTokens: 80_000,
  targetedTokens: 8_000,
  taskInputTokens: 3_000,
  outputTokens: 2_000,
  callsPerTask: 5,
  tasksPerDay: 20,
};

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface Estimate {
  costPerTask: number;
  costPerDay: number;
  costPerMonth: number;
  tokensPerTask: TokenUsage;
  tokensPerDay: TokenUsage;
  tokensPerMonth: TokenUsage;
}

export interface Comparison {
  full: Estimate;
  targeted: Estimate;
  savings: {
    costPerTask: number;
    costPerDay: number;
    costPerMonth: number;
    percent: number;
  };
}

export type WorkloadValidation =
  { kind: 'valid'; workload: Workload } | { kind: 'error'; errors: string[] };

const workloadFields = [
  'inputRate',
  'outputRate',
  'systemTokens',
  'repositoryTokens',
  'targetedTokens',
  'taskInputTokens',
  'outputTokens',
  'callsPerTask',
  'tasksPerDay',
] satisfies (keyof Workload)[];

function workloadErrors(workload: Workload): string[] {
  const errors: string[] = [];
  for (const field of workloadFields) {
    if (!Number.isFinite(workload[field]) || workload[field] < 0) {
      errors.push(`${field} must be a finite, nonnegative number.`);
    }
  }
  if (!Number.isInteger(workload.callsPerTask) || workload.callsPerTask <= 0) {
    errors.push('callsPerTask must be a positive integer.');
  }
  if (!Number.isInteger(workload.tasksPerDay)) {
    errors.push('tasksPerDay must be a nonnegative integer.');
  }
  if (workload.targetedTokens > workload.repositoryTokens) {
    errors.push('targetedTokens cannot exceed repositoryTokens.');
  }
  return errors;
}

function finite(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError('This workload exceeds the supported numeric range.');
  }
  return value;
}

function tokenUsage(input: number, output: number): TokenUsage {
  return {
    input: finite(input),
    output: finite(output),
    total: finite(input + output),
  };
}

export function estimate(workload: Workload, contextTokens: number): Estimate {
  const errors = workloadErrors(workload);
  if (errors.length > 0) throw new RangeError(errors.join(' '));
  if (!Number.isFinite(contextTokens) || contextTokens < 0) {
    throw new RangeError('contextTokens must be a finite, nonnegative number.');
  }
  const inputPerCall = finite(
    workload.systemTokens + contextTokens + workload.taskInputTokens,
  );
  const tokensPerTask = tokenUsage(
    finite(inputPerCall * workload.callsPerTask),
    finite(workload.outputTokens * workload.callsPerTask),
  );
  const tokensPerDay = tokenUsage(
    finite(tokensPerTask.input * workload.tasksPerDay),
    finite(tokensPerTask.output * workload.tasksPerDay),
  );
  const tokensPerMonth = tokenUsage(
    finite(tokensPerDay.input * 30),
    finite(tokensPerDay.output * 30),
  );
  const costPerTask = finite(
    (tokensPerTask.input / 1_000_000) * workload.inputRate +
      (tokensPerTask.output / 1_000_000) * workload.outputRate,
  );
  const costPerDay = finite(costPerTask * workload.tasksPerDay);
  return {
    costPerTask,
    costPerDay,
    costPerMonth: finite(costPerDay * 30),
    tokensPerTask,
    tokensPerDay,
    tokensPerMonth,
  };
}

export function compare(workload: Workload): Comparison {
  const full = estimate(workload, workload.repositoryTokens);
  const targeted = estimate(workload, workload.targetedTokens);
  const costPerTask = full.costPerTask - targeted.costPerTask;
  return {
    full,
    targeted,
    savings: {
      costPerTask,
      costPerDay: full.costPerDay - targeted.costPerDay,
      costPerMonth: full.costPerMonth - targeted.costPerMonth,
      percent:
        full.costPerTask === 0 ? 0 : (costPerTask / full.costPerTask) * 100,
    },
  };
}

export function validateWorkload(
  raw: Record<string, number>,
): WorkloadValidation {
  const workload: Workload = {
    inputRate: raw.inputRate ?? Number.NaN,
    outputRate: raw.outputRate ?? Number.NaN,
    systemTokens: raw.systemTokens ?? Number.NaN,
    repositoryTokens: raw.repositoryTokens ?? Number.NaN,
    targetedTokens: raw.targetedTokens ?? Number.NaN,
    taskInputTokens: raw.taskInputTokens ?? Number.NaN,
    outputTokens: raw.outputTokens ?? Number.NaN,
    callsPerTask: raw.callsPerTask ?? Number.NaN,
    tasksPerDay: raw.tasksPerDay ?? Number.NaN,
  };
  const errors = workloadErrors(workload);
  if (errors.length > 0) return { kind: 'error', errors };
  try {
    compare(workload);
    return { kind: 'valid', workload };
  } catch (error) {
    if (error instanceof RangeError)
      return { kind: 'error', errors: [error.message] };
    throw error;
  }
}
