import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Command as CommandIcon,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Search,
  Sun,
  User,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MOBILE_NAV, NAV_GROUPS, NAV_ITEMS } from "@/lib/nav";
import { useTheme } from "@/lib/theme";
import { useRows, dateFR } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group}>
          {!collapsed && (
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group}
            </p>
          )}
          <div className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-primary/12 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function NotificationsButton() {
  const { data } = useRows("notifications", { order: "created_at", ascending: false, limit: 12 });
  const unread = (data ?? []).filter((n) => !n["read"]).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Notifications</div>
        <div className="max-h-80 divide-y divide-border overflow-y-auto">
          {(data ?? []).length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Aucune notification.</p>
          )}
          {(data ?? []).map((n) => (
            <div key={n["id"]} className="px-4 py-3">
              <p className="text-sm font-medium">{n["title"]}</p>
              {n["body"] && <p className="mt-0.5 text-xs text-muted-foreground">{n["body"]}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">{dateFR(n["created_at"])}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Palette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { toggle } = useTheme();
  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher un module ou une action…" />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        <CommandGroup heading="Actions rapides">
          <CommandItem onSelect={() => go("/tasks")}>Créer une tâche</CommandItem>
          <CommandItem onSelect={() => go("/meetings")}>Créer une réunion</CommandItem>
          <CommandItem onSelect={() => go("/crm")}>Ajouter un contact</CommandItem>
          <CommandItem onSelect={() => go("/funding")}>Ajouter une opportunité de financement</CommandItem>
          <CommandItem onSelect={() => go("/finance")}>Ajouter une dépense</CommandItem>
          <CommandItem onSelect={() => go("/documents")}>Ajouter un document</CommandItem>
          <CommandItem onSelect={() => go("/research")}>Ajouter une note de recherche</CommandItem>
          <CommandItem onSelect={() => go("/engineering")}>Rechercher dans l'ingénierie</CommandItem>
          <CommandItem
            onSelect={() => {
              toggle();
              setOpen(false);
            }}
          >
            Changer de thème
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Modules">
          {NAV_ITEMS.map((i) => (
            <CommandItem key={i.to} onSelect={() => go(i.to)}>
              <i.icon className="mr-2 h-4 w-4" />
              {i.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function AppShell({ email }: { email: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] lg:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
          {collapsed ? <LogoMark className="h-7 w-7" /> : <Logo />}
        </div>
        <SidebarNav collapsed={collapsed} />
        <div className="border-t border-sidebar-border p-2">
          <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="mr-2 h-4 w-4" />}
            {!collapsed && "Réduire"}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center border-b border-sidebar-border px-4">
                <Logo />
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <button
            onClick={() => setPaletteOpen(true)}
            className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 sm:max-w-md"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Rechercher dans PlastiFind OS…</span>
            <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold sm:flex">
              <CommandIcon className="h-3 w-3" />K
            </kbd>
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button size="sm" className="hidden sm:inline-flex" onClick={() => setPaletteOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Créer
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Thème</span>
            </Button>
            <NotificationsButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border">
                  <span className="text-xs font-bold">{email.slice(0, 2).toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                  <User className="mr-2 h-4 w-4" /> Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-3 pb-24 pt-5 sm:px-5 lg:px-7 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        {MOBILE_NAV.map((item) => {
          if (!item) return null;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate px-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Palette open={paletteOpen} setOpen={setPaletteOpen} />
    </div>
  );
}
