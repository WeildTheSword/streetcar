import { ChevronsUpDown, LogOut, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function NavItem({ icon: Icon, label, count, active }) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-[7px] text-left",
        "text-[13.5px] font-normal text-ink-2 transition-colors duration-150",
        "hover:bg-[#efedea] focus-visible:ring-[3px] focus-visible:ring-burgundy/25 focus-visible:outline-none",
        active && "bg-[#ebe9e5] font-medium",
      )}
    >
      <Icon
        className={cn("size-[17px] shrink-0", active ? "text-ink" : "text-muted-ink")}
        strokeWidth={1.6}
      />
      {label}
      {count != null && (
        <span className="ml-auto rounded-full border border-hairline bg-white px-1.5 py-px text-[11px] text-muted-ink-2 tnum">
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * The two-pane chrome shared by both products: a 240px sidebar and the page
 * body. Grid and sidebar values follow ui_kits/ exactly.
 */
export function AppShell({ sections, user, onSignOut, onRestart, children }) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-canvas">
      {/* Sticky so the account menu — and sign out — stay reachable on long pages. */}
      <aside className="sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-hairline bg-sidebar-bg px-3 py-4">
        <div className="flex items-center gap-2.5 px-2.5 pt-2 pb-[18px] text-[15px] font-semibold tracking-[-0.01em] text-ink">
          <span className="flex size-[26px] items-center justify-center rounded-[7px] bg-ink text-[13px] font-bold text-white">
            S
          </span>
          Streetcar
        </div>

        {sections.map((section) => (
          <div key={section.label ?? "root"}>
            {section.label && (
              <div className="px-2.5 pt-3.5 pb-1.5 text-[11px] font-medium text-muted-ink-2">
                {section.label}
              </div>
            )}
            <nav className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavItem key={item.label} {...item} />
              ))}
            </nav>
          </div>
        ))}

        {user.badge && (
          <img
            src={user.badge}
            alt=""
            className="mt-auto w-[132px] self-center opacity-95"
          />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            data-tour="account"
            className={cn(
              "mt-auto flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left",
              "transition-colors hover:bg-[#efedea] focus-visible:ring-[3px]",
              "focus-visible:ring-burgundy/25 focus-visible:outline-none",
              user.badge && "mt-3",
            )}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-[#d7d2c8] text-[11px] font-semibold text-[#3d3a35]">
              {user.initials}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[12.5px] font-semibold text-ink">
                {user.name}
              </span>
              <span className="block truncate text-[11.5px] text-muted-ink">
                {user.subtitle}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-ink-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-[212px]">
            <DropdownMenuLabel className="text-[11.5px] font-normal text-muted-ink">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onRestart}>
              <RotateCcw className="size-4" />
              Restart demo
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onSignOut}>
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      <main className="min-w-0 px-9 py-7">{children}</main>
    </div>
  );
}
