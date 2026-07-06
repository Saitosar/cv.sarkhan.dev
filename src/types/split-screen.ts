// src/types/split-screen.ts

export type SplitOrientation = 'horizontal' | 'vertical';

export interface SplitScreenProps {
  /** Left/top panel content */
  left: React.ReactNode;
  /** Right/bottom panel content */
  right: React.ReactNode;
  /** Initial left panel ratio (0–1). Default 0.4 */
  defaultLeftRatio?: number;
  /** Minimum left ratio. Default 0.25 */
  minLeftRatio?: number;
  /** Maximum left ratio. Default 0.6 */
  maxLeftRatio?: number;
  /** Orientation. Default 'horizontal' on desktop, 'vertical' on mobile */
  orientation?: SplitOrientation;
  /** Called when ratio changes */
  onRatioChange?: (ratio: number) => void;
  /** CSS class override */
  className?: string;
}

export interface SplitScreenState {
  /** Current left panel ratio (0–1) */
  leftRatio: number;
  /** Whether user is currently dragging the splitter */
  isDragging: boolean;
  /** Orientation */
  orientation: SplitOrientation;
}

export type MobileTab = 'chat' | 'resume' | 'score' | 'jobs';

export interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}
