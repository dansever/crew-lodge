'use client';

import { BrandLogo } from '@/components/BrandLogo';
import { AnimatedGridPattern } from '@/components/magic-ui/animated-grid-pattern';
import { AuroraText } from '@/components/magic-ui/aurora-text';
import { InteractiveHoverButton } from '@/components/magic-ui/interactive-hover-button';
import { LightRays } from '@/components/magic-ui/light-rays';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/stories';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { motion, type Variants } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useState } from 'react';
import * as content from './content';

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

function AnimatedGroup({
  children,
  className,
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
}) {
  const containerVariants = variants?.container || defaultContainerVariants;
  const itemVariants = variants?.item || defaultItemVariants;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

const LandingPageNavBar = () => {
  const [menuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLoading = !mounted || !isLoaded;

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className="fixed z-20 w-full px-2 group"
      >
        <div
          className={cn(
            'mx-auto mt-1 max-w-4xl px-4 transition-all duration-300 lg:px-8 py-2 rounded-2xl',
            isScrolled &&
              'bg-background/20 max-w-3xl rounded-2xl border backdrop-blur-sm lg:px-4 py-1'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-0">
            <div className="flex w-full justify-between">
              <BrandLogo />

              <div className="flex items-center gap-2 w-full justify-end">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20 rounded-full" />
                    <Skeleton className="h-9 w-16 rounded-full" />
                  </div>
                ) : !isSignedIn ? (
                  <>
                    <SignInButton>
                      <Button variant="primary" text="Sign in" />
                    </SignInButton>
                    <SignUpButton>
                      <Button variant="ghost" text="Sign up" disabled />
                    </SignUpButton>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button size="lg" text="Dashboard" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <LightRays
        color="rgba(160, 210, 255, 0.2)"
        blur={36}
        speed={14}
        length="70vh"
      />
    </header>
  );
};

const ComingSoonDialog = ({
  comingSoonDialogOpen,
  setComingSoonDialogOpen,
}: {
  comingSoonDialogOpen: boolean;
  setComingSoonDialogOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={comingSoonDialogOpen} onOpenChange={setComingSoonDialogOpen}>
      <DialogContent className="max-w-sm rounded-xl border bg-background/80 backdrop-blur-md p-8 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <DialogTitle className="text-3xl font-bold bg-linear-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
            Coming Soon
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            This feature is under development. Stay tuned for updates.
          </DialogDescription>

          <Button
            text="Got it"
            size="lg"
            onClick={() => setComingSoonDialogOpen(false)}
            className="bg-linear-to-r from-orange-500 to-rose-500 text-white font-medium hover:opacity-90 transition
            hover:from-orange-600 hover:to-rose-600
            rounded-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Footer = () => {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-5xl p-8">
        <div className="flex flex-col gap-8">
          {/* Company Info */}
          <div className="space-y-2">
            <BrandLogo />
            <p className="text-sm text-muted-foreground max-w-full">
              Automate airline crew accommodation and optimize layover costs
              with AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-orange-500 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-orange-500 transition-colors"
                  >
                    Our Team
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Mail className="size-4" />
                  <span className="break-all">contact@crewlodge.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="size-4" />
                  <span className="break-all">+1 (555) 000-0000</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-orange-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              {content.footer.copyright}
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-orange-500 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPageClient() {
  const [comingSoonDialogOpen, setComingSoonDialogOpen] = React.useState(false);

  return (
    <>
      <main>
        <LandingPageNavBar />
        <div
          aria-hidden
          className="z-2 absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
        >
          <div className="w-35rem h-80rem -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(25,100%,50%,.08)_0,hsla(25,100%,45%,.02)_50%,hsla(25,100%,40%,0)_80%)]" />
          <div className="h-80rem absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(25,100%,50%,.06)_0,hsla(25,100%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        </div>

        <section id="hero">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.1}
            duration={3}
            repeatDelay={1}
            className={cn(
              'mask-[radial-gradient(500px_circle_at_center,white,transparent)]',
              'inset-x-0 inset-y-[-20%]  skew-y-12'
            )}
          />

          <div className="relative pt-32 pb-16">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                        },
                      },
                    },
                  }}
                >
                  <h1 className="leading-snug mt-8 text-5xl font-semibold text-balance px-24 mx-auto">
                    {content.hero.titlePlain}{' '}
                    <AuroraText className="inline-block text-orange-500 font-bold">
                      {content.hero.titleHighlight}
                    </AuroraText>
                  </h1>
                  <h4 className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                    {content.hero.subtitle}
                  </h4>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={defaultContainerVariants}
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                >
                  <InteractiveHoverButton
                    className="px-5 text-base"
                    onClick={() => setComingSoonDialogOpen(true)}
                  >
                    {content.hero.ctaPrimary}
                  </InteractiveHoverButton>
                </AnimatedGroup>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <ComingSoonDialog
        comingSoonDialogOpen={comingSoonDialogOpen}
        setComingSoonDialogOpen={setComingSoonDialogOpen}
      />
    </>
  );
}
