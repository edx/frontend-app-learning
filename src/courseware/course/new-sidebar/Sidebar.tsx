import React, { useContext } from 'react';
import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const Sidebar = () => {
  const { currentSidebar, enabledPanels } = useContext(SidebarContext);
  if (currentSidebar === null || !SIDEBARS[currentSidebar]) { return null; }
  const sidebarEntry = SIDEBARS[currentSidebar];
  if (!enabledPanels.includes(sidebarEntry.panelId)) { return null; }
  const SidebarToRender = sidebarEntry.Sidebar;
  return <SidebarToRender />;
};

export default Sidebar;
