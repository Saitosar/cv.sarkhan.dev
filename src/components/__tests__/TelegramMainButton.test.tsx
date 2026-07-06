// src/components/__tests__/TelegramMainButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import TelegramMainButton from '@/components/Telegram/TelegramMainButton';
import * as TelegramProvider from '@/components/Telegram/TelegramProvider';
import type { TelegramContextValue, TelegramWebApp } from '@/types/telegram';

function createMockWebApp(): TelegramWebApp {
  return {
    initData: 'test',
    initDataUnsafe: {},
    version: '7.0',
    platform: 'tdesktop',
    colorScheme: 'dark',
    themeParams: {} as TelegramWebApp['themeParams'],
    isExpanded: true,
    viewportHeight: 800,
    viewportStableHeight: 780,
    isClosingConfirmationEnabled: false,
    isVerticalSwipesEnabled: true,
    headerColor: '',
    backgroundColor: '',
    bottomBarColor: '',
    ready: vi.fn(),
    expand: vi.fn(),
    close: vi.fn(),
    enableClosingConfirmation: vi.fn(),
    disableClosingConfirmation: vi.fn(),
    enableVerticalSwipes: vi.fn(),
    disableVerticalSwipes: vi.fn(),
    setHeaderColor: vi.fn(),
    setBackgroundColor: vi.fn(),
    setBottomBarColor: vi.fn(),
    BackButton: {} as TelegramWebApp['BackButton'],
    MainButton: {
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      text: '',
      color: '#6001d1',
      textColor: '#ffffff',
      show: vi.fn(),
      hide: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      showProgress: vi.fn(),
      hideProgress: vi.fn(),
      setText: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
      setParams: vi.fn(),
    },
    onEvent: vi.fn(),
    offEvent: vi.fn(),
    sendData: vi.fn(),
    switchInlineQuery: vi.fn(),
    openLink: vi.fn(),
    openTelegramLink: vi.fn(),
    openInvoice: vi.fn(),
    showPopup: vi.fn(),
    showAlert: vi.fn(),
    showConfirm: vi.fn(),
    showScanQrPopup: vi.fn(),
    closeScanQrPopup: vi.fn(),
    readTextFromClipboard: vi.fn(),
    requestWriteAccess: vi.fn(),
    requestContact: vi.fn(),
  } as unknown as TelegramWebApp;
}

function mockContext(webApp: TelegramWebApp | null): void {
  vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue({
    isInTelegram: !!webApp,
    webApp,
    user: null,
    theme: null,
    colorScheme: 'dark',
    isExpanded: false,
  } as TelegramContextValue);
}

describe('TelegramMainButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing (returns null)', () => {
    mockContext(createMockWebApp());
    const { container } = render(<TelegramMainButton onClick={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('should call setParams with default values', () => {
    const webApp = createMockWebApp();
    mockContext(webApp);
    const onClick = vi.fn();
    render(<TelegramMainButton onClick={onClick} />);

    expect(webApp.MainButton.setParams).toHaveBeenCalledWith({
      text: 'Open Full Workspace',
      color: undefined,
      textColor: undefined,
      isActive: true,
      isVisible: true,
    });
  });

  it('should call setParams with custom values', () => {
    const webApp = createMockWebApp();
    mockContext(webApp);
    const onClick = vi.fn();
    render(
      <TelegramMainButton
        text="Custom Button"
        color="#ff0000"
        textColor="#ffffff"
        visible={true}
        active={true}
        onClick={onClick}
      />
    );

    expect(webApp.MainButton.setParams).toHaveBeenCalledWith({
      text: 'Custom Button',
      color: '#ff0000',
      textColor: '#ffffff',
      isActive: true,
      isVisible: true,
    });
  });

  it('should register onClick handler', () => {
    const webApp = createMockWebApp();
    mockContext(webApp);
    const onClick = vi.fn();
    render(<TelegramMainButton onClick={onClick} />);
    expect(webApp.MainButton.onClick).toHaveBeenCalledWith(onClick);
  });

  it('should clean up on unmount', () => {
    const webApp = createMockWebApp();
    mockContext(webApp);
    const onClick = vi.fn();
    const { unmount } = render(<TelegramMainButton onClick={onClick} />);
    unmount();
    expect(webApp.MainButton.offClick).toHaveBeenCalledWith(onClick);
    expect(webApp.MainButton.hide).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when webApp is null', () => {
    mockContext(null);
    expect(() => render(<TelegramMainButton onClick={vi.fn()} />)).not.toThrow();
  });
});
