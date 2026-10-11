// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePWAInstall, type BeforeInstallPromptEvent } from '../src/usePWAInstall';

describe('usePWAInstall hook', () => {
  it('initializes with isInstallable false when not prompted', () => {
    const { result } = renderHook(() => usePWAInstall());
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('captures beforeinstallprompt event and triggers prompt on installApp', async () => {
    const { result } = renderHook(() => usePWAInstall());

    const promptMock = vi.fn().mockResolvedValue(undefined);
    const mockEvent = new Event('beforeinstallprompt') as unknown as BeforeInstallPromptEvent;
    Object.assign(mockEvent, {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      preventDefault: vi.fn(),
    });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.isInstallable).toBe(true);

    await act(async () => {
      await result.current.installApp();
    });

    expect(promptMock).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(false);
  });

  it('handles appinstalled event', () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });
});
