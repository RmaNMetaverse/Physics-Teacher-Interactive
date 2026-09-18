import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('LiquidGlass theme-background patch', () => {
  it('removes the dependency compositor hard-coded white scene fill', () => {
    const patch = readFileSync('patches/@ybouane+liquidglass+1.0.3.patch', 'utf8');
    expect(patch).toContain('getComputedStyle(this.root).backgroundColor');
    expect(patch).toContain("-\t\tthis._sceneCtx.fillStyle = '#ffffff';");
  });

  it('is reapplied after every dependency install', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts.postinstall).toBe('patch-package');
  });
});
