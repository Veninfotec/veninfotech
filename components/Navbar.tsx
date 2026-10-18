'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  id: string;
}

const CATEGORY_ITEMS: NavItem[] = [
  { id: 'culture', label: 'Culture', href: '/category/culture' },
  { id: 'economy', label: 'Economy', href: '/category/economy' },
  { id: 'politics', label: 'Politics', href: '/category/politics' },
  { id: 'science', label: 'Science', href: '/category/science' },
  { id: 'technology', label: 'Technology', href: '/category/technology' },
  { id: 'travel', label: 'Travel', href: '/category/travel' },
  { id: 'world', label: 'World', href: '/category/world' },
];

const SECONDARY_ITEMS: NavItem[] = [
  { id: 'about', label: 'About', href: '/about' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Dropdowns & menu states
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  const categoriesDropdownRef = useRef<HTMLLIElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Sync active category with URL pathname and search params on mount & navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let cat: string | null = null;
      if (pathname.startsWith('/category/')) {
        cat = pathname.replace('/category/', '').split('/')[0];
      } else {
        const params = new URLSearchParams(window.location.search);
        cat = params.get('category');
      }
      queueMicrotask(() => {
        setActiveCategory(cat ? cat.toLowerCase() : null);
      });
    }
  }, [pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(target)
      ) {
        setIsCategoriesOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target)
      ) {
        setIsSearchOpen(false);
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(target)
      ) {
        setIsLangOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsCategoriesOpen(false);
        setIsSearchOpen(false);
        setIsLangOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isHomeActive = pathname === '/' && !activeCategory;
  const isAnyCategoryActive = Boolean(activeCategory);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black">
      <nav
        aria-label="Main Navigation"
        className="mx-auto flex h-14 sm:h-16 w-full max-w-[1170px] items-center justify-between px-4"
      >
        {/* Left Side: Brand Name VIT */}
        <div className="flex shrink-0 items-center">
          <Link
            href="/"
            onClick={() => setActiveCategory(null)}
            aria-label="Veninfotech Home"
            title="Veninfotech Home"
            className="text-xl sm:text-2xl font-black tracking-widest text-white transition-colors hover:text-brand select-none"
          >
            VIT
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden h-full items-center md:flex">
          <ul className="flex h-full items-center gap-1 lg:gap-2 xl:gap-3">
            {/* HOME Link */}
            <li className="h-full">
              <Link
                href="/"
                onClick={() => setActiveCategory(null)}
                className={`relative flex h-full items-center px-2.5 xl:px-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isHomeActive
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Home
                {isHomeActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand shadow-[0_0_8px_rgba(19,101,164,0.6)]" />
                )}
              </Link>
            </li>

            {/* Expanded Categories (Visible on xl screens and above) */}
            {CATEGORY_ITEMS.map((item) => {
              const active = activeCategory === item.id;
              return (
                <li key={item.id} className="hidden h-full xl:flex">
                  <Link
                    href={item.href}
                    onClick={() => setActiveCategory(item.id)}
                    className={`relative flex h-full items-center px-2.5 xl:px-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand shadow-[0_0_8px_rgba(19,101,164,0.6)]" />
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Collapsed Categories Dropdown (Visible when responsive: below xl, down to md) */}
            <li
              className="relative hidden h-full items-center md:flex xl:hidden"
              ref={categoriesDropdownRef}
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                aria-expanded={isCategoriesOpen}
                aria-haspopup="true"
                className={`relative flex h-full items-center gap-1 px-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isAnyCategoryActive
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <span>Categories</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`size-3.5 transition-transform duration-200 ${
                    isCategoriesOpen ? 'rotate-180 text-brand' : 'text-neutral-400'
                  }`}
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
                {isAnyCategoryActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand shadow-[0_0_8px_rgba(19,101,164,0.6)]" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isCategoriesOpen && (
                <div className="absolute left-0 top-full z-50 min-w-44 rounded-md border border-neutral-800 bg-[#0e0e11]/95 py-2 shadow-2xl backdrop-blur-md">
                  {CATEGORY_ITEMS.map((item) => {
                    const active = activeCategory === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          setActiveCategory(item.id);
                          setIsCategoriesOpen(false);
                        }}
                        className={`flex items-center justify-between px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                          active
                            ? 'bg-brand/10 text-brand font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800/70 hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        {active && (
                          <span className="size-1.5 rounded-full bg-brand" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>

            {/* About & Contact */}
            {SECONDARY_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.id} className="h-full">
                  <Link
                    href={item.href}
                    onClick={() => setActiveCategory(null)}
                    className={`relative flex h-full items-center px-2.5 xl:px-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand shadow-[0_0_8px_rgba(19,101,164,0.6)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Side: Search Icon + Language Selector + Mobile Toggle */}
        <div className="flex items-center gap-3">

          {/* Search Icon & Expandable Search Input */}
          <div className="relative flex items-center" ref={searchContainerRef}>
            {isSearchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-36 sm:w-52 rounded-full border border-neutral-700 bg-neutral-900 py-1 pl-8 pr-7 text-xs text-white placeholder-neutral-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute left-2.5 text-neutral-400 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  aria-label="Close search"
                  className="absolute right-2 text-neutral-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="p-1.5 text-neutral-300 hover:text-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Language Selector (EN ▾) */}
          <div className="relative hidden sm:block" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen((prev) => !prev)}
              aria-expanded={isLangOpen}
              aria-label="Select language"
              className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold uppercase text-neutral-300 hover:text-white transition-colors"
            >
              <span>{currentLang}</span>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`size-3 text-neutral-400 transition-transform ${
                  isLangOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 top-full mt-1 min-w-16 rounded-md border border-neutral-800 bg-[#0e0e11] py-1 shadow-xl z-50">
                {['EN', 'ES', 'FR', 'DE'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setCurrentLang(lang);
                      setIsLangOpen(false);
                    }}
                    className={`block w-full px-3 py-1 text-left text-xs uppercase transition-colors ${
                      currentLang === lang
                        ? 'bg-neutral-800 text-brand font-bold'
                        : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMobileMenuOpen}
            className="p-1.5 text-neutral-300 hover:text-white md:hidden"
          >
            {isMobileMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Visible on screens < md when toggled) */}
      {isMobileMenuOpen && (
        <div className="border-t border-neutral-800 bg-[#0a0a0c] px-4 py-4 md:hidden">
          <ul className="space-y-1">
            {/* Home */}
            <li>
              <Link
                href="/"
                onClick={() => {
                  setActiveCategory(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`block py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isHomeActive ? 'text-brand font-bold' : 'text-neutral-300 hover:text-white'
                }`}
              >
                Home
              </Link>
            </li>

            {/* Categories Accordion */}
            <li>
              <button
                type="button"
                onClick={() => setIsMobileCategoriesOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isAnyCategoryActive ? 'text-brand font-bold' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <span>Categories</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`size-4 text-neutral-400 transition-transform ${
                    isMobileCategoriesOpen ? 'rotate-180 text-brand' : ''
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isMobileCategoriesOpen && (
                <ul className="ml-3 space-y-1 border-l border-neutral-800 py-1 pl-3">
                  {CATEGORY_ITEMS.map((item) => {
                    const active = activeCategory === item.id;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={() => {
                            setActiveCategory(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block py-1.5 text-xs uppercase tracking-wider transition-colors ${
                            active
                              ? 'text-brand font-bold'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>

            {/* About & Contact */}
            {SECONDARY_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => {
                    setActiveCategory(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Language Selector */}
          <div className="mt-4 flex items-center gap-2 border-t border-neutral-800 pt-3 text-xs text-neutral-400">
            <span>Language:</span>
            {['EN'].map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={`rounded px-1.5 py-0.5 text-[11px] uppercase ${
                  currentLang === lang
                    ? 'bg-neutral-800 text-brand font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
