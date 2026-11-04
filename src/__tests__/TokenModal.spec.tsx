import React from 'react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { MaapProvider } from '../MaapContext';
import { TokenModal } from '../components/TokenModal/TokenModal';
import {
  actAsync,
  cleanup,
  createTestSettings,
  getButton,
  pressEnter,
  render,
  typeInto
} from './testUtils';

const SAVED_TOKEN = 'jwt:saved-token';

async function renderModal() {
  const testSettings = await createTestSettings({
    maapApiUrl: 'https://api.maap-project.org/',
    maapToken: SAVED_TOKEN
  });
  const onSubmit = jest.fn<() => void>();
  const onClose = jest.fn<() => void>();

  render(
    <MaapProvider settings={testSettings.settings}>
      <TokenModal open onClose={onClose} onSubmit={onSubmit} />
    </MaapProvider>
  );
  // Let the modal finish reading the settings when it opens
  await actAsync();

  const input = document.querySelector<HTMLInputElement>(
    'input[type="password"]'
  ) as HTMLInputElement;
  return { ...testSettings, onSubmit, onClose, input };
}

describe('TokenModal', () => {
  afterEach(cleanup);

  it('saves the entered token when Set Token is clicked', async () => {
    const { settings, saveCount, input, onSubmit, onClose } =
      await renderModal();
    let tokenWhenSubmitted: unknown;
    onSubmit.mockImplementation(() => {
      tokenWhenSubmitted = settings.user.maapToken;
    });

    typeInto(input, 'jwt:new-token');
    await actAsync(() => getButton('Set Token').click());

    expect(saveCount()).toBe(1);
    expect(settings.user.maapToken).toBe('jwt:new-token');
    // Saved before onSubmit runs, so a retried request uses the new token
    expect(tokenWhenSubmitted).toBe('jwt:new-token');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves the entered token when Enter is pressed', async () => {
    const { settings, saveCount, input, onSubmit } = await renderModal();

    typeInto(input, 'jwt:new-token');
    await actAsync(() => pressEnter(input));

    expect(saveCount()).toBe(1);
    expect(settings.user.maapToken).toBe('jwt:new-token');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not save anything while the token is being typed', async () => {
    const { settings, saveCount, input } = await renderModal();

    typeInto(input, 'jwt:part');
    typeInto(input, '');
    await actAsync();

    expect(saveCount()).toBe(0);
    expect(settings.user.maapToken).toBe(SAVED_TOKEN);
  });

  it('keeps the saved token when the dialog is cancelled', async () => {
    const { settings, saveCount, input, onSubmit, onClose } =
      await renderModal();

    typeInto(input, 'jwt:discarded');
    await actAsync(() => getButton('Cancel').click());

    expect(saveCount()).toBe(0);
    expect(settings.user.maapToken).toBe(SAVED_TOKEN);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not submit an empty token', async () => {
    const { settings, saveCount, input, onSubmit, onClose } =
      await renderModal();

    expect(getButton('Set Token').disabled).toBe(true);
    typeInto(input, '   ');
    expect(getButton('Set Token').disabled).toBe(true);

    await actAsync(() => pressEnter(input));

    expect(saveCount()).toBe(0);
    expect(settings.user.maapToken).toBe(SAVED_TOKEN);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
