import { describe, expect, it } from 'vitest';
import tasksRunner from '../src/index';

describe('nx taskRunner', () => {
  it('is callable', () => {
    expect(tasksRunner).toBeInstanceOf(Function);
  });
});
