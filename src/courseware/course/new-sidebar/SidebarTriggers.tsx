import React, { useContext } from 'react';
import SidebarContext from './SidebarContext';
import { SIDEBAR_ORDER, SIDEBARS } from './sidebars';

const SidebarTriggers = () => {
  const { toggleSidebar, enabledPanels } = useContext(SidebarContext);
  return (
    <div className="d-flex ml-auto">
      {SIDEBAR_ORDER
        .filter(id => SIDEBARS[id] && enabledPanels.includes(SIDEBARS[id].panelId))
        .map(sidebarId => {
          const { Trigger } = SIDEBARS[sidebarId];
          return <Trigger onClick={() => toggleSidebar(sidebarId)} key={sidebarId} />;
        })}
    </div>
  );
};

export default SidebarTriggers;
