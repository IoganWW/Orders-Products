export const NAVIGATION_ITEMS = [
  {
    href: '/orders',
    labelKey: 'orders',
    icon: 'fas fa-arrow-down'
  },
  {
    href: '/groups', 
    labelKey: 'groups',
    icon: 'fas fa-layer-group'
  },
  {
    href: '/products',
    labelKey: 'products', 
    icon: 'fas fa-box'
  },
  {
    href: '/users',
    labelKey: 'users',
    icon: 'fas fa-users'
  },
  {
    href: '/settings',
    labelKey: 'settings',
    icon: 'fas fa-cog'
  }
] as const;

// Типы для безопасности
export type NavigationItem = typeof NAVIGATION_ITEMS[number];