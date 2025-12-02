'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    courseId: string;
}

export function SidebarNav({ className, courseId, ...props }: SidebarNavProps) {
    const pathname = usePathname();

    const items: { title: string; items: { title: string; href: string; disabled?: boolean }[] }[] = [
        {
            title: 'Plan your course',
            items: [
                {
                    title: 'Intended learners',
                    href: `/admin/courses/${courseId}/intended-learners`,
                    disabled: true,
                },
            ],
        },
        {
            title: 'Create your content',
            items: [
                {
                    title: 'Curriculum',
                    href: `/admin/courses/${courseId}/curriculum`,
                },
            ],
        },
        {
            title: 'Publish your course',
            items: [
                {
                    title: 'Course landing page',
                    href: `/admin/courses/${courseId}/landing-page`,
                },
                {
                    title: 'Pricing',
                    href: `/admin/courses/${courseId}/pricing`,
                },
                {
                    title: 'Settings',
                    href: `/admin/courses/${courseId}/settings`,
                },
            ],
        },
    ];

    return (
        <nav
            className={cn(
                'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
                className
            )}
            {...props}
        >
            {items.map((group, i) => (
                <div key={i} className="mb-6">
                    <h4 className="mb-2 px-4 text-sm font-semibold tracking-tight">
                        {group.title}
                    </h4>
                    <div className="space-y-1">
                        {group.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    buttonVariants({ variant: 'ghost' }),
                                    pathname === item.href
                                        ? 'bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)] hover:text-white'
                                        : 'hover:bg-transparent hover:underline text-slate-600',
                                    'w-full justify-start',
                                    item.disabled && 'opacity-50 pointer-events-none'
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    );
}
