import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  Banknote,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Command as CommandIcon,
  FileText,
  FolderKanban,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Search,
  Sun,
  Upload,
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
  CommandSeparator,
} from "@/components/ui/command";
import { MOBILE_NAV, NAV_GROUPS, NAV_ITEMS, NAV_PERMISSIONS } from "@/lib/nav";
import { useTheme } from "@/lib/theme";
import { useT } from "@/lib/i18n";
import { useRows, dateFR } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { fullNameOf, initialsOf, roleLabel, useMyPermissions, useMyProfile, useMyRole, useSessionUser } from "@/lib/rbac";
import { useProfileExt } from "@/lib/profile-ext";
import { ProfileSearch } from "@/components/profile/profile-search";
import { DownloadAppButton } from "@/components/download-app";
import { useResolvedFileUrl } from "@/lib/use-resolved-url";

function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  const { can } = useMyPermissions();
  const visibleItems = NAV_ITEMS.filter((item) => !NAV_PERMISSIONS[item.to] || can(NAV_PERMISSIONS[item.to]!));
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group}>
          {!collapsed ? (
            <p className="eyebrow px-2 pb-2">{t(group)}</p>
          ) : (
            <div className="mx-auto mb-2 h-px w-6 bg-sidebar-border" />
          )}
          <div className="space-y-0.5">
            {visibleItems.filter((i) => i.group === group).map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  title={collapsed ? t(item.label) : undefined}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_22%,transparent)]"
                      : "text-sidebar-foreground hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      !active && "group-hover:scale-110",
                    )}
                  />
                  {!collapsed && <span className="truncate">{t(item.label)}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        "border-b border-sidebar-border px-4 py-4",
        collapsed && "flex flex-col items-center px-0 py-4",
      )}
    >
      <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
        {collapsed ? <LogoMark className="h-7 w-7" /> : <Logo />}
      </div>
      {!collapsed && (
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" />
            Pre-Seed
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Brest · FR</span>
        </div>
      )}
    </div>
  );
}

function SidebarFounder({ email, collapsed }: { email: string; collapsed?: boolean }) {
  const { data: profile } = useMyProfile();
  const { data: role } = useMyRole();
  const name = fullNameOf(profile, email);
  const initials = initialsOf(name);
  if (collapsed) {
    return (
      <div className="flex justify-center border-t border-sidebar-border py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-primary/30 bg-primary/12 text-[11px] font-bold text-primary">
          {initials}
        </span>
      </div>
    );
  }
  return (
    <Link
      to="/profile"
      className="mx-3 mb-2 flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2 transition-colors hover:border-primary/35"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/12 text-xs font-bold text-primary">
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold">{name}</span>
        <span className="block truncate text-[10px] text-muted-foreground">{roleLabel(role)}</span>
      </span>
    </Link>
  );
}

function NotificationsButton() {
  const t = useT();
  const { data } = useRows("notifications", { order: "created_at", ascending: false, limit: 12 });
  const rows = data ?? [];
  const unread = rows.filter((n) => !n["read"]).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
              {unread}
            </span>
          )}
          <span className="sr-only">{t("Notifications")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-88 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">{t("Notifications")}</span>
          <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary">
            {unread} / {rows.length}
          </span>
        </div>
        <div className="max-h-96 divide-y divide-border overflow-y-auto">
          {rows.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t("Aucune notification.")}</p>
          )}
          {rows.map((n) => {
            const priority = String(n["priority"] ?? "").toLowerCase();
            const color = /critique|critical|haute|high/.test(priority)
              ? "bg-destructive"
              : /moyenne|medium/.test(priority)
                ? "bg-warning"
                : "bg-primary";
            return (
              <div key={n["id"]} className="flex gap-3 px-4 py-3 transition-colors hover:bg-accent/40">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", color, !n["read"] && "pulse-dot")} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n["title"]}</p>
                  {n["body"] && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{n["body"]}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">{dateFR(n["created_at"])}</p>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const QUICK_ACTIONS: { label: string; to: string; icon: typeof Plus }[] = [
  { label: "Créer une tâche", to: "/tasks", icon: CheckSquare },
  { label: "Créer un projet", to: "/projects", icon: FolderKanban },
  { label: "Créer une réunion", to: "/meetings", icon: CalendarDays },
  { label: "Ouvrir le financement", to: "/funding", icon: Banknote },
  { label: "Ouvrir Labi-Bot", to: "/products", icon: Bot },
  { label: "Téléverser un fichier", to: "/documents", icon: Upload },
  { label: "Ouvrir les documents", to: "/documents", icon: FileText },
];

function Palette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const navigate = useNavigate();
  const t = useT();
  const { toggle } = useTheme();
  const { can } = useMyPermissions();
  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t("Rechercher un module ou une action…")} />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>{t("Aucun résultat.")}</CommandEmpty>
        <CommandGroup heading={t("Actions rapides")}>
          {QUICK_ACTIONS.map((a) => (
            <CommandItem key={a.label} onSelect={() => go(a.to)}>
              <a.icon className="mr-2 h-4 w-4 text-primary" />
              {t(a.label)}
            </CommandItem>
          ))}
          <CommandItem
            onSelect={() => {
              toggle();
              setOpen(false);
            }}
          >
            <Moon className="mr-2 h-4 w-4 text-primary" />
            {t("Changer de thème")}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t("Modules")}>
          {NAV_ITEMS.filter((i) => !NAV_PERMISSIONS[i.to] || can(NAV_PERMISSIONS[i.to]!)).map((i) => (
            <CommandItem key={i.to} onSelect={() => go(i.to)}>
              <i.icon className="mr-2 h-4 w-4" />
              {t(i.label)}
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{t(i.group)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  const item = NAV_ITEMS.find((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
  if (!item) return null;
  return (
    <div className="hidden min-w-0 items-center gap-1.5 text-xs text-muted-foreground xl:flex">
      <span className="font-semibold uppercase tracking-wider">PlastiFind OS</span>
      <ChevronRight className="h-3 w-3" />
      <span>{t(item.group)}</span>
      <ChevronRight className="h-3 w-3" />
      <span className="truncate font-semibold text-foreground">{t(item.label)}</span>
    </div>
  );
}

export function AppShell({ email }: { email: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const t = useT();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const { can } = useMyPermissions();
  const { data: user } = useSessionUser();
  const { data: myProfile } = useMyProfile();
  const { data: extProfile } = useProfileExt(user?.id);

  const rawAvatar = myProfile?.["avatar_url"] || extProfile?.avatarUrl;
  const avatarUrl = useResolvedFileUrl(rawAvatar);

  const mobileItems = MOBILE_NAV.filter((item) => !NAV_PERMISSIONS[item.to] || can(NAV_PERMISSIONS[item.to]!));

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
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const today = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());

  return (
    <div className="atmosphere flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <SidebarBrand collapsed={collapsed} />
        {!collapsed && <ProfileSearch className="border-b border-sidebar-border px-3 py-2" />}
        <SidebarNav collapsed={collapsed} />
        <SidebarFounder email={email} collapsed={collapsed} />
        <div className="border-t border-sidebar-border p-2">
          <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="mr-2 h-4 w-4" />}
            {!collapsed && t("Réduire")}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/70 px-3 backdrop-blur-xl sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">{t("Menu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">{t("Navigation")}</SheetTitle>
              <SidebarBrand />
              <ProfileSearch className="border-b border-sidebar-border px-3 py-2" />
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
              <SidebarFounder email={email} />
            </SheetContent>
          </Sheet>

          <Breadcrumbs />

          <button
            onClick={() => setPaletteOpen(true)}
            className="group ml-0 flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface xl:ml-4 xl:max-w-sm"
          >
            <Search className="h-4 w-4 shrink-0 transition-colors group-hover:text-primary" />
            <span className="truncate">{t("Rechercher dans PlastiFind OS…")}</span>
            <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold sm:flex">
              <CommandIcon className="h-3 w-3" />K
            </kbd>
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <span className="mr-1 hidden text-xs font-medium text-muted-foreground 2xl:block">{today}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="hidden shadow-[0_8px_24px_-12px_var(--color-primary)] sm:inline-flex">
                  <Plus className="mr-1.5 h-4 w-4" /> {t("Créer")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="eyebrow">{t("Actions rapides")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {QUICK_ACTIONS.map((a) => (
                  <DropdownMenuItem key={a.label} onClick={() => navigate({ to: a.to })}>
                    <a.icon className="mr-2 h-4 w-4 text-primary" /> {t(a.label)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">{t("Thème")}</span>
            </Button>
            <NotificationsButton />
            <DownloadAppButton compact />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 overflow-hidden rounded-full border border-border p-0 transition-colors hover:border-primary/40"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold">{email.slice(0, 2).toUpperCase()}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <User className="mr-2 h-4 w-4" /> {t("Profil")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                  <User className="mr-2 h-4 w-4" /> {t("Paramètres")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> {t("Se déconnecter")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-6 lg:px-9 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden">
        {mobileItems.map((item) => {
          if (!item) return null;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" />}
              <item.icon className="h-5 w-5" />
              <span className="truncate px-1">{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>

      <Palette open={paletteOpen} setOpen={setPaletteOpen} />
    </div>
  );
}
