import * as discussions from './discussions';
import * as upsell from './upsell';

export const SIDEBARS = {
  [discussions.ID]: {
    ID: discussions.ID,
    panelId: 'DISCUSSIONS',
    Sidebar: discussions.Sidebar,
    Trigger: discussions.Trigger,
  },
  [upsell.ID]: {
    ID: upsell.ID,
    panelId: 'UPSELL',
    Sidebar: upsell.Sidebar,
    Trigger: upsell.Trigger,
  },
} as const;

export const SIDEBAR_ORDER = [
  discussions.ID,
  upsell.ID,
] as const;
