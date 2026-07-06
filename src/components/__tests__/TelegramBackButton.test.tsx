// src/components/__tests__/TelegramBackButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import TelegramBackButton from '@/components/Telegram/TelegramBackButton';
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
    BackButton: {
      isVisible: false,
      show: vi.fn(),
      hide: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    },
    MainButton: {} as TelegramWebApp['MainButton'],
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

describe('TelegramBackButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing (returns null)', () => {
    mockContext(createMockWebApp());
    const { container } = render(<TelegramBackButton visible={true} onClick={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('should show back button when visible is true', () => {
    const webApp = createMockWebApp();
    mockContext(webApp);
    render(<TelegramBackButton visible={true} onClick={vi.fn()} />);
    expect(webApp.BackButton.show).toHaveBeenCalledTimes(1);
    expect(webApp.BackButton.hide).not.toHaveBeenCalled();
  });

  it('should hide back button when visible is false', () => {
    const webApp = createMockWebApp();
    mockContext(webApp);
    render(<TelegramBackButton visible={false} onClick={vi.fn()} />);
    expect(webApp.BackButton.hide).toHaveBeenCalledTimes(1);
    expect(webApp.BackButton.show).not.toHaveBeenCalled();
  });

  it('should register onClick handler when visible', () => {
    const webApp = createMockWebApp();
    const onClick = vi.fn();
    mockContext(webApp);
    render(<TelegramBackButton visible={true} onClick={onClick} />);
    expect(webApp.BackButton.onClick).toHaveBeenCalledWith(onClick);
  });

  it('should use onBack alias when provided', () => {
    const webApp = createMockWebApp();
    const onBack = vi.fn();
    mockContext(webApp);
    render(<TelegramBackButton visible={true} onBack={onBack} />);
    expect(webApp.BackButton.onClick).toHaveBeenCalledWith(onBack);
  });

  it('should clean up on unmount', () => {
    const webApp = createMockWebApp();
    const onClick = vi.fn();
    mockContext(webApp);
    const { unmount } = render(<TelegramBackButton visible={true} onClick={onClick} />);
    unmount();
    expect(webApp.BackButton.offClick).toHaveBeenCalledWith(onClick);
    expect(webApp.BackButton.hide).toHaveBeenCalledTimes(1); // cleanup only
  });

  it('should do nothing when webApp is null', () => {
    mockContext(null);
    expect(() => render(<TelegramBackButton visible={true} onClick={vi.fn()} />)).not.toThrow();
  });
});
