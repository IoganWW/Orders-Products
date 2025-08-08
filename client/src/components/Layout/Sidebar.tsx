'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Layout.module.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/orders',
      label: 'ПРИХОД',
      icon: 'fas fa-arrow-down',
      isActive: pathname === '/orders'
    },
    {
      href: '/groups',
      label: 'ГРУППЫ',
      icon: 'fas fa-layer-group',
      isActive: pathname === '/groups'
    },
    {
      href: '/products',
      label: 'ПРОДУКТЫ',
      icon: 'fas fa-box',
      isActive: pathname === '/products'
    },
    {
      href: '/users',
      label: 'ПОЛЬЗОВАТЕЛИ',
      icon: 'fas fa-users',
      isActive: pathname === '/users'
    },
    {
      href: '/settings',
      label: 'НАСТРОЙКИ',
      icon: 'fas fa-cog',
      isActive: pathname === '/settings'
    }
  ];

  return (
    <aside className={`${styles.sidebar} sidebar`}>
      <nav className={`${styles.sidebarNav} sidebar-nav`}>
        <ul className={`${styles.navList} nav-list`}>
          {menuItems.map((item) => (
            <li key={item.href} className={`${styles.navItem} nav-item`}>
              <Link
                href={item.href}
                className={`
                  ${styles.navLink} 
                  nav-link
                  ${item.isActive ? styles.active : ''}
                `}
              >
                <i className={`${item.icon} ${styles.navIcon}`}></i>
                <span className={`${styles.navLabel} nav-label`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;