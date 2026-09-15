// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AccountPopover } from '../src/components/navigation/AccountPopover';
import type { CloudAccount } from '../src/cloud/useCloudAccount';

const account = (): CloudAccount => ({
  configured: true,
  user: null,
  ready: true,
  syncState: 'local',
  error: '',
  signUp: vi.fn().mockResolvedValue('Check your email to confirm your account.'),
  signIn: vi.fn().mockResolvedValue(undefined),
  signInWithProvider: vi.fn().mockRejectedValue(new Error('Provider sign-in failed.')),
  signOut: vi.fn().mockResolvedValue(undefined),
  syncNow: vi.fn().mockResolvedValue(undefined),
});

afterEach(() => cleanup());

describe('AccountPopover', () => {
  it('reports OAuth errors inside the dialog instead of producing an unhandled rejection', async () => {
    render(<AccountPopover account={account()} isOpen onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Google' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Provider sign-in failed.');
  });

  it('uses the prominent gate presentation while preserving registration and sign-in controls', async () => {
    const current = account();
    render(<AccountPopover account={current} isOpen onClose={vi.fn()} variant="gate" />);
    const dialog = screen.getByRole('dialog', { name: 'Sign in to sync progress' });
    expect(dialog).toHaveClass('account-popover-gate');
    fireEvent.click(screen.getByRole('tab', { name: 'Register' }));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'learner@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'strong-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(current.signUp).toHaveBeenCalledWith('learner@example.com', 'strong-password'));
    expect(await screen.findByRole('status')).toHaveTextContent(/check your email/i);
  });
});
