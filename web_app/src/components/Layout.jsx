import React from 'react';
import { useResponsive } from '../hooks/useMediaQuery';
import MobileLayout from './layouts/MobileLayout';
import TabletLayout from './layouts/TabletLayout';
import DesktopLayout from './layouts/DesktopLayout';
import './Layout.css';

export default function Layout() {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return <MobileLayout />;
  if (isTablet) return <TabletLayout />;
  return <DesktopLayout />;
}

