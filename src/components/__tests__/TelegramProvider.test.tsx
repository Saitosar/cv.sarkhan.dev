// src/components/__tests__/TelegramProvider.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TelegramProvider, useTelegramContext } from '@/components/Telegram/TelegramProvider';
import type { TelegramWebApp } from '@/types/telegram';

// Helper component to test context
function ContextConsumer() {
  const ctx = useTelegramContext();
  return (
    <div>
      <span data-testid="is-in-telegram">{String(ctx.isInTelegram)}</span>
      <span data-testid="color-scheme">{ctx.colorScheme}</span>
      <span data-testid="is-expanded">{String(ctx.isExpanded)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.first_name : 'null'}</span>
      <span data-testid="theme">{ctx.theme ? ctx.theme.bg_color : 'null'}</span>
    </div>
  );
}

function createMockWebApp(overrides?: Partial<TelegramWebApp>): TelegramWebApp {
  return {
    initData: 'test-init-data',
    initDataUnsafe: {
      user: { id: 123, first_name: 'Test', last_name: 'User', username: 'testuser' },
    },
    version: '7.0',
    platform: 'tdesktop',
    colorScheme: 'dark',
    themeParams: {
      bg_color: '#0b0f19',
      text_color: '#e5e2e1',
      hint_color: '#c4c7c7',
      link_color: '#d2bbff',
      button_color: '#6001d1',
      button_text_color: '#ffffff',
      secondary_bg_color: '#141313',
    },
    isExpanded: true,
    viewportHeight: 800,
    viewportStableHeight: 780,
    isClosingConfirmationEnabled: false,
    isVerticalSwipesEnabled: true,
    headerColor: '#0b0f19',
    backgroundColor: '#0b0f19',
    bottomBarColor: '#141313',
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
    HapticFeedback: {
      impactOccurred: vi.fn(),
      notificationOccurred: vi.fn(),
      selectionChanged: vi.fn(),
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
    ...overrides,
  } as unknown as TelegramWebApp;
}

describe('TelegramProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.Telegram
    (window as typeof globalThis & { Telegram?: unknown }).Telegram = undefined;
  });

  it('should render children', () => {
    render(
      <TelegramProvider>
        <div data-testid="child">Hello</div>
      </TelegramProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should provide fallback context when not in Telegram', () => {
    render(
      <TelegramProvider>
        <ContextConsumer />
      </TelegramProvider>
    );
    expect(screen.getByTestId('is-in-telegram').textContent).toBe('false');
    expect(screen.getByTestId('color-scheme').textContent).toBe('dark');
    expect(screen.getByTestId('is-expanded').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('theme').textContent).toBe('null');
  });

  it('should provide Telegram context when window.Telegram.WebApp exists', () => {
    const mockWebApp = createMockWebApp();
    (window as unknown as Record<string, unknown>).Telegram = { WebApp: mockWebApp };

    render(
      <TelegramProvider>
        <ContextConsumer />
      </TelegramProvider>
    );

    expect(screen.getByTestId('is-in-telegram').textContent).toBe('true');
    expect(screen.getByTestId('color-scheme').textContent).toBe('dark');
    expect(screen.getByTestId('is-expanded').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Test');
    expect(screen.getByTestId('theme').textContent).toBe('#0b0f19');
  });

  it('should call ready and expand on mount when in Telegram', () => {
    const mockWebApp = createMockWebApp();
    (window as unknown as Record<string, unknown>).Telegram = { WebApp: mockWebApp };

    render(
      <TelegramProvider>
        <ContextConsumer />
      </TelegramProvider>
    );

    expect(mockWebApp.ready).toHaveBeenCalledTimes(1);
    expect(mockWebApp.expand).toHaveBeenCalledTimes(1);
  });

  it('should register event listeners on mount', () => {
    const mockWebApp = createMockWebApp();
    (window as unknown as Record<string, unknown>).Telegram = { WebApp: mockWebApp };

    render(
      <TelegramProvider>
        <ContextConsumer />
      </TelegramProvider>
    );

    expect(mockWebApp.onEvent).toHaveBeenCalledWith('themeChanged', expect.any(Function));
    expect(mockWebApp.onEvent).toHaveBeenCalledWith('viewportChanged', expect.any(Function));
  });

  it('should clean up event listeners on unmount', () => {
    const mockWebApp = createMockWebApp();
    (window as unknown as Record<string, unknown>).Telegram = { WebApp: mockWebApp };

    const { unmount } = render(
      <TelegramProvider>
        <ContextConsumer />
      </TelegramProvider>
    );

    unmount();

    expect(mockWebApp.offEvent).toHaveBeenCalledWith('themeChanged', expect.any(Function));
    expect(mockWebApp.offEvent).toHaveBeenCalledWith('viewportChanged', expect.any(Function));
  });

  it('should not crash when Telegram.WebApp has no initData', () => {
    const mockWebApp = createMockWebApp({ initData: '' });
    (window as unknown as Record<string, unknown>).Telegram = { WebApp: mockWebApp };

    render(
      <TelegramProvider>
        <ContextConsumer />
      </TelegramProvider>
    );

    // Should use fallback state
    expect(screen.getByTestId('is-in-telegram').textContent).toBe('false');
    // ready/expand should NOT be called
    expect(mockWebApp.ready).not.toHaveBeenCalled();
  });
});
