import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BRAND } from '../../config/brand';
import { FOOTER_LINKS, NAV_ITEMS } from '../../navigation';
import { useAppState } from '../../store/AppStateProvider';
import { Logo } from './Logo';
import './shell.css';

export function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { persisted } = useAppState();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className="sidebar">
        <div className="sidebar__top">
          <Link to="/" className="brand">
            <Logo />
            <span>{BRAND.name}</span>
          </Link>
          <button
            type="button"
            className="btn btn--sm nav-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
        <nav id="site-nav" className={`nav${open ? ' is-open' : ''}`} aria-label="Main">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="sidebar__note">Prototype. Data stays in this browser.</p>
      </header>

      <div className="main">
        <main id="main" className="content" tabIndex={-1}>
          {!persisted && (
            <div className="notice notice--warn" role="status">
              This browser blocked saving. Your changes will be lost when you close or reload the page.
            </div>
          )}
          <Outlet />
        </main>
        <footer className="footer">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </footer>
      </div>
    </div>
  );
}
