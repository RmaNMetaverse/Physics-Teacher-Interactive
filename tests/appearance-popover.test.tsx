// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AppearancePopover } from '../src/components/navigation/AppearancePopover';
import type { LearnerProgressV2 } from '../src/progress/types';

const defaultSettings: LearnerProgressV2['settings'] = {
  theme: 'dark',
  sound: true,
  reducedMotion: false,
  celebrations: true,
  liquidGlass: true,
  primaryColor: '#a78bfa',
  secondaryColor: '#34d399',
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AppearancePopover', () => {
  it('does not render dialog when isOpen is false', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    render(
      <AppearancePopover
        isOpen={false}
        onClose={onClose}
        settings={defaultSettings}
        onUpdateSettings={onUpdateSettings}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with Apple HIG floating glass styling, title, and close button when isOpen is true', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    render(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={defaultSettings}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Appearance settings' });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('appearance-popover');
    expect(dialog).toHaveClass('liquid-glass-surface');

    expect(screen.getByText('Appearance & Display')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close appearance settings' });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders all 5 theme options and updates theme on selection', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    const { rerender } = render(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={defaultSettings}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const themes: Array<{ id: LearnerProgressV2['settings']['theme']; label: RegExp }> = [
      { id: 'dark', label: /dark/i },
      { id: 'light', label: /light/i },
      { id: 'eye-comfort', label: /eye comfort/i },
      { id: 'ocean', label: /ocean/i },
      { id: 'high-contrast', label: /high contrast/i },
    ];

    for (const { label } of themes) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }

    // Default settings has theme: 'dark'
    const darkBtn = screen.getByRole('button', { name: /dark/i });
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');

    // Click 'light'
    const lightBtn = screen.getByRole('button', { name: /light/i });
    fireEvent.click(lightBtn);
    expect(onUpdateSettings).toHaveBeenCalledWith({ theme: 'light' });

    // Click 'ocean'
    const oceanBtn = screen.getByRole('button', { name: /ocean/i });
    fireEvent.click(oceanBtn);
    expect(onUpdateSettings).toHaveBeenCalledWith({ theme: 'ocean' });

    // Click 'eye-comfort'
    const eyeComfortBtn = screen.getByRole('button', { name: /eye comfort/i });
    fireEvent.click(eyeComfortBtn);
    expect(onUpdateSettings).toHaveBeenCalledWith({ theme: 'eye-comfort' });

    // Click 'high-contrast'
    const highContrastBtn = screen.getByRole('button', { name: /high contrast/i });
    fireEvent.click(highContrastBtn);
    expect(onUpdateSettings).toHaveBeenCalledWith({ theme: 'high-contrast' });

    // Rerender with 'ocean' active and verify active state moves
    rerender(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={{ ...defaultSettings, theme: 'ocean' }}
        onUpdateSettings={onUpdateSettings}
      />
    );
    expect(screen.getByRole('button', { name: /ocean/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /dark/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles Liquid Glass setting', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    const { rerender } = render(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={{ ...defaultSettings, liquidGlass: true }}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const glassSwitch = screen.getByRole('switch', { name: /liquid glass/i });
    expect(glassSwitch).toBeInTheDocument();
    expect(glassSwitch).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(glassSwitch);
    expect(onUpdateSettings).toHaveBeenCalledWith({ liquidGlass: false });

    // When disabled
    rerender(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={{ ...defaultSettings, liquidGlass: false }}
        onUpdateSettings={onUpdateSettings}
      />
    );

    expect(glassSwitch).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(glassSwitch);
    expect(onUpdateSettings).toHaveBeenCalledWith({ liquidGlass: true });
  });

  it('defaults Liquid Glass to true when undefined in settings', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    render(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={{ ...defaultSettings, liquidGlass: undefined }}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const glassSwitch = screen.getByRole('switch', { name: /liquid glass/i });
    expect(glassSwitch).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(glassSwitch);
    expect(onUpdateSettings).toHaveBeenCalledWith({ liquidGlass: false });
  });

  it('toggles Reduced Motion setting', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    const { rerender } = render(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={{ ...defaultSettings, reducedMotion: false }}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const motionSwitch = screen.getByRole('switch', { name: /reduced motion/i });
    expect(motionSwitch).toBeInTheDocument();
    expect(motionSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(motionSwitch);
    expect(onUpdateSettings).toHaveBeenCalledWith({ reducedMotion: true });

    // When enabled
    rerender(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={{ ...defaultSettings, reducedMotion: true }}
        onUpdateSettings={onUpdateSettings}
      />
    );

    expect(motionSwitch).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(motionSwitch);
    expect(onUpdateSettings).toHaveBeenCalledWith({ reducedMotion: false });
  });

  it('renders link to full settings on Progress page (#/progress)', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    render(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={defaultSettings}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const fullSettingsLink = screen.getByRole('link', { name: /more settings/i });
    expect(fullSettingsLink).toBeInTheDocument();
    expect(fullSettingsLink).toHaveAttribute('href', '#/progress');

    fireEvent.click(fullSettingsLink);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when Escape key is pressed', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    render(
      <AppearancePopover
        isOpen={true}
        onClose={onClose}
        settings={defaultSettings}
        onUpdateSettings={onUpdateSettings}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking outside the popover dialog', () => {
    const onClose = vi.fn();
    const onUpdateSettings = vi.fn();

    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <AppearancePopover
          isOpen={true}
          onClose={onClose}
          settings={defaultSettings}
          onUpdateSettings={onUpdateSettings}
        />
      </div>
    );

    // Clicking inside the popover dialog does NOT call onClose
    const dialog = screen.getByRole('dialog', { name: 'Appearance settings' });
    fireEvent.mouseDown(dialog);
    expect(onClose).not.toHaveBeenCalled();

    // Clicking outside the popover dialog calls onClose
    const outsideArea = screen.getByTestId('outside-area');
    fireEvent.mouseDown(outsideArea);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
