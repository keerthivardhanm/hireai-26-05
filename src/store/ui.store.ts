import { create } from 'zustand';
interface UIState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}
export const useUIStore = create<UIState>(set => ({
  collapsed: false, mobileOpen: false,
  toggle:       () => set(s => ({ collapsed: !s.collapsed })),
  toggleMobile: () => set(s => ({ mobileOpen: !s.mobileOpen })),
  closeMobile:  () => set({ mobileOpen: false }),
}));
