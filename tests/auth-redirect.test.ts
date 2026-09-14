import { describe, expect, it } from 'vitest';
import { authRedirectUrl } from '../src/cloud/redirect';

describe('authentication redirect URL', () => {
  it('keeps the full GitHub Pages repository path', () => {
    expect(authRedirectUrl({
      origin: 'https://rmanmetaverse.github.io',
      pathname: '/Physics-Teacher-Interactive/',
    })).toBe('https://rmanmetaverse.github.io/Physics-Teacher-Interactive/');
  });

  it('does not include an in-app hash route in an OAuth or email redirect URL', () => {
    expect(authRedirectUrl({
      origin: 'https://rmanmetaverse.github.io',
      pathname: '/Physics-Teacher-Interactive/',
    })).not.toContain('#');
  });
});
