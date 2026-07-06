// src/types/telegram.ts
// Telegram WebApp SDK types for the CV Builder Telegram Mini App.

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramThemeParams {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramBackButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

export interface TelegramMainButton {
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  text: string;
  color: string;
  textColor: string;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive: boolean) => void;
  hideProgress: () => void;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  setParams: (params: {
    text?: string;
    color?: string;
    textColor?: string;
    isActive?: boolean;
    isVisible?: boolean;
  }) => void;
}

export interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: {
      id: number;
      type: string;
      title?: string;
      username?: string;
      photo_url?: string;
    };
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  bottomBarColor: string;

  // Lifecycle methods
  ready(): void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  enableVerticalSwipes: () => void;
  disableVerticalSwipes: () => void;

  // UI controls
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setBottomBarColor: (color: string) => void;

  // Buttons
  BackButton: TelegramBackButton;
  MainButton: TelegramMainButton;
  HapticFeedback?: TelegramHapticFeedback;

  // Events
  onEvent: (eventType: TelegramEventType, callback: () => void) => void;
  offEvent: (eventType: TelegramEventType, callback: () => void) => void;

  // Data
  sendData: (data: string) => void;
  switchInlineQuery: (query: string, chooseChatTypes?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (
    params: {
      title?: string;
      message: string;
      buttons?: { id?: string; type?: string; text: string }[];
    },
    callback?: (buttonId: string) => void
  ) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (
    params: { text?: string },
    callback?: (data: string) => boolean | void
  ) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (allowed: boolean) => void) => void;
  requestContact: (callback?: (shared: boolean, contact?: TelegramUser) => void) => void;
}

export type TelegramEventType =
  | 'themeChanged'
  | 'viewportChanged'
  | 'mainButtonClicked'
  | 'backButtonClicked'
  | 'settingsButtonClicked'
  | 'invoiceClosed'
  | 'popupClosed'
  | 'qrTextReceived'
  | 'clipboardTextReceived'
  | 'writeAccessRequested'
  | 'contactRequested'
  | 'biometricManagerUpdated'
  | 'biometricTokenUpdated';

// ── Telegram Context ──

export interface TelegramContextValue {
  /** Whether the app is running inside Telegram WebView */
  isInTelegram: boolean;
  /** Telegram WebApp SDK instance (null if not in Telegram) */
  webApp: TelegramWebApp | null;
  /** Current user info (null if not available) */
  user: TelegramUser | null;
  /** Current theme parameters */
  theme: TelegramThemeParams | null;
  /** Color scheme: 'light' | 'dark' */
  colorScheme: 'light' | 'dark';
  /** Whether the app is expanded to full height */
  isExpanded: boolean;
}

// ── Hook return type helpers ──

export interface TelegramHapticHelpers {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}
