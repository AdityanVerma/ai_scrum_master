"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Plan Sprint", href: "/sprint-planning" },
    { name: "Sprints", href: "/sprints" },
    { name: "Team", href: "/team-members" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="border-b border-[#DDE8E1] bg-[#F8F7F2]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <Link
                    href="/"
                    className="text-xl font-semibold text-[#1F2924]"
                >
                    AI Scrum Master
                </Link>

                <nav className="flex items-center gap-1 overflow-x-auto">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${pathname === item.href
                                    ? "bg-[#8CC9A8] text-[#1F2924]"
                                    : "text-[#5F6B64] hover:bg-[#E8F6EF] hover:text-[#1F2924]"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}