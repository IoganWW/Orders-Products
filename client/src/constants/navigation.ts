export const NAVIGATION_ITEMS = [
  {
    href: '/orders',
    labelKey: 'navigation:orders',
    icon: 'fas fa-arrow-down'
  },
  {
    href: '/groups', 
    labelKey: 'navigation:groups',
    icon: 'fas fa-layer-group'
  },
  {
    href: '/products',
    labelKey: 'navigation:products', 
    icon: 'fas fa-box'
  },
  {
    href: '/users',
    labelKey: 'navigation:users',
    icon: 'fas fa-users'
  },
  {
    href: '/settings',
    labelKey: 'navigation:settings',
    icon: 'fas fa-cog'
  }
] as const;

// Типы для безопасности
export type NavigationItem = typeof NAVIGATION_ITEMS[number];