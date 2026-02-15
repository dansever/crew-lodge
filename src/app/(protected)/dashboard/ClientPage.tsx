'use client';

import { AppHeader } from '@/app/(protected)/_components/AppHeader';
import { useDashboardContext } from '@/app/(protected)/dashboard/ContextProvider';
import { PageLayout } from '@/stories';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  PartyPopper,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};
const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

function formatTimeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function DashboardClientPage() {
  const router = useRouter();
  const { disruptions, stats, markets, recentActivity } = useDashboardContext();

  const statCards = [
    {
      label: 'Active Bookings',
      value: String(stats.activeBookings),
      icon: CalendarCheck,
      sub: 'Confirmed and checked in',
    },
    {
      label: 'Pending',
      value: String(stats.pendingBookings),
      icon: Clock,
      sub: stats.pendingBookings > 0 ? 'Needs attention' : 'All clear',
    },
    {
      label: "Today's Spend",
      value: `$${stats.todaySpend.toLocaleString()}`,
      icon: DollarSign,
      sub: 'Across all markets',
    },
    {
      label: 'Avg Rate',
      value: stats.avgRatePerNight > 0 ? `$${stats.avgRatePerNight}` : '-',
      icon: TrendingUp,
      sub: 'Per night',
    },
  ];

  return (
    <PageLayout header={<AppHeader />}>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary/80" />
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Emergencies
          </h2>
          {disruptions.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {disruptions.map(d => (
                <motion.div
                  key={d._id}
                  variants={item}
                  className="group rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 transition-colors hover:border-amber-500/30 cursor-pointer"
                  onClick={() => router.push('/disruptions')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                        <span className="font-medium text-foreground truncate">
                          {d.eventType.replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {d.status ?? 'open'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {d.crewSize} crew - {d.location}
                        {typeof d.nights === 'number'
                          ? ` - ${d.nights} night${d.nights === 1 ? '' : 's'}`
                          : ''}
                      </p>
                      {d.eventReason && (
                        <p className="text-xs text-muted-foreground/80 truncate">
                          {d.eventReason}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/disruptions"
                      className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      Resolve
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-6 text-center">
              <PartyPopper className="mx-auto h-8 w-8 text-emerald-500/80" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No active disruptions
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Operations running smoothly
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Overview
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {statCards.map(s => (
              <motion.div
                key={s.label}
                variants={item}
                className="rounded-lg border border-border/60 bg-card/50 p-4 transition-colors hover:border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className="h-4 w-4 text-muted-foreground/70" />
                </div>
                <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Markets
            </h2>
            {markets.length > 0 ? (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-3 sm:grid-cols-2"
              >
                {markets.map(m => (
                  <motion.div
                    key={m._id}
                    variants={item}
                    className="group rounded-lg border border-border/60 bg-card/50 p-4 transition-colors hover:border-border cursor-pointer"
                    onClick={() => router.push('/bookings')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{m.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.country}</p>
                    <div className="mt-3 flex items-baseline justify-between text-xs">
                      <span className="text-muted-foreground">{m.activeBookings} active</span>
                      <span className="font-medium text-foreground">
                        ${m.todaySpend.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-6 text-center">
                <p className="text-sm text-muted-foreground">No markets configured</p>
              </div>
            )}
          </section>

          <section className="lg:col-span-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Recent Activity
            </h2>
            <div className="rounded-lg border border-border/60 bg-card/50 divide-y divide-border/40">
              {recentActivity.length > 0 ? (
                recentActivity.map(a => (
                  <div
                    key={a._id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground/70 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{formatAction(a.action)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTimeAgo(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}