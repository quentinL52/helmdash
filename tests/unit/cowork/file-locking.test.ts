import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { withFileLock } from '../../../packages/cowork/src/core/csv-engine';

describe('CSV File Locking Mechanism', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cowork-lock-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('acquires lock, performs action, and releases lock cleanly', () => {
    const targetFile = path.join(tempDir, 'data.csv');
    const lockFile = `${targetFile}.lock`;

    let actionExecuted = false;
    const result = withFileLock(targetFile, () => {
      actionExecuted = true;
      expect(fs.existsSync(lockFile)).toBe(true);
      return 'success';
    });

    expect(actionExecuted).toBe(true);
    expect(result).toBe('success');
    expect(fs.existsSync(lockFile)).toBe(false);
  });

  it('recovers from stale lock older than 5 seconds', () => {
    const targetFile = path.join(tempDir, 'data.csv');
    const lockFile = `${targetFile}.lock`;

    // Create a fake stale lock file with mtime in the past (10 seconds ago)
    fs.writeFileSync(lockFile, 'stale', 'utf8');
    const pastTime = (Date.now() - 10000) / 1000;
    fs.utimesSync(lockFile, pastTime, pastTime);

    let executed = false;
    withFileLock(targetFile, () => {
      executed = true;
    });

    expect(executed).toBe(true);
    expect(fs.existsSync(lockFile)).toBe(false);
  });

  it('throws timeout error if lock is held and cannot be acquired', () => {
    const targetFile = path.join(tempDir, 'data.csv');
    const lockFile = `${targetFile}.lock`;

    // Create fresh lock
    fs.writeFileSync(lockFile, 'active', 'utf8');

    expect(() => {
      withFileLock(
        targetFile,
        () => {
          // Should not reach here
        },
        100 // 100ms timeout for test
      );
    }).toThrowError(/Timeout waiting for lock/);

    // Clean up
    fs.unlinkSync(lockFile);
  });
});
