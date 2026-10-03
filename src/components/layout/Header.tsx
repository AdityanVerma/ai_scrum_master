'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PROFILE_UPDATED_EVENT } from '@/components/team/shared';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Plan Sprint', href: '/sprint-proposal', scrumMasterOnly: true },
  { name: 'Sprints', href: '/sprints' },
  { name: 'Team', href: '/team-members' },
  { name: 'Tasklist', href: '/tasklist' },
  { name: 'Sprint Diary', href: '/sprint-diary', scrumMasterOnly: true },
  { name: 'Documentation', href: '/documentation' },
];

type CurrentMember = {
  id: string;
  name: string;
  accessRole: 'SCRUM_MASTER' | 'MEMBER';
  mustChangePassword: boolean;
};

const roleLabels = {
  SCRUM_MASTER: 'Scrum Master',
  MEMBER: 'Member',
};

function isActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [member, setMember] = useState<CurrentMember | null>(null);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    let cancelled = false;

    async function loadMember() {
      const response = await fetch('/api/auth/me');

      if (cancelled) {
        return;
      }

      if (response.status === 401) {
        setMember(null);
        router.replace('/login');
        return;
      }

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      const currentMember: CurrentMember = result.data.member;

      setMember(currentMember);

      // A member with a temporary password must choose their own first.
      if (
        currentMember.mustChangePassword &&
        pathname !== '/change-password'
      ) {
        router.replace('/change-password');
      }
    }

    function reloadMember() {
      loadMember().catch((error) => {
        console.error('Failed to load the signed-in member:', error);
      });
    }

    reloadMember();
    window.addEventListener(PROFILE_UPDATED_EVENT, reloadMember);

    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_UPDATED_EVENT, reloadMember);
    };
  }, [isLoginPage, pathname, router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Full page load so nothing from the signed-in session stays cached.
    window.location.replace('/login');
  }

  const visibleNavigation = navigation.filter(
    (item) => !item.scrumMasterOnly || member?.accessRole === 'SCRUM_MASTER',
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          AI Scrum Master
        </Link>

        {!isLoginPage && (
          <nav className="flex items-center gap-1 overflow-x-auto">
            {visibleNavigation.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-brand text-ink'
                      : 'text-muted hover:bg-brand-soft hover:text-ink'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}

        {!isLoginPage && member && (
          <div className="flex items-center gap-3">
            <Link
              href={`/team-members/${member.id}`}
              className="text-sm font-medium text-ink hover:underline"
            >
              {member.name}
            </Link>
            <span className="badge badge-brand">
              {roleLabels[member.accessRole]}
            </span>
            <Link
              href="/change-password"
              className="text-sm text-muted hover:text-ink"
            >
              Password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
