'use client';

import * as React from 'react';
import { SideNav } from '@/components/SideNav';

/**
 * SideNavShell isolates SideNav state (isOpen) from the rest of the app.
 * Rendered as a sibling to ClientLayoutWrapper in RootLayout, so toggling
 * the mobile SideNav does NOT trigger re-renders of page content.
 */
export function SideNavShell() {
  return <SideNav />;
}
