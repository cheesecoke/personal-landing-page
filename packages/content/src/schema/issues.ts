import type { z } from 'zod';

/**
 * Where an issue is, as a dotted path (`log.0.lines.2`). An unknown key is reported at the key
 * itself, so the path names the offending field rather than its parent.
 */
export const issuePaths = (error: z.ZodError): string[] =>
  error.issues.flatMap((issue) => {
    const base = issue.path.map(String);
    if (issue.code === 'unrecognized_keys')
      return issue.keys.map((key) => [...base, key].join('.'));
    return [base.join('.')];
  });

/** One line per issue: `status.since: Date is in the future`. */
export const describeIssues = (error: z.ZodError): string[] =>
  error.issues.flatMap((issue) => {
    const base = issue.path.map(String);
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => `${[...base, key].join('.')}: Unrecognized key`);
    }
    return [`${base.join('.') || '(root)'}: ${issue.message}`];
  });
