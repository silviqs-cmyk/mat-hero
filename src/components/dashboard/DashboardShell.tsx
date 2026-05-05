import type { ReactNode } from "react";

interface DashboardShellProps {
  sidebar: ReactNode;
  mobileSidebar?: ReactNode;
  header: ReactNode;
  main: ReactNode;
  aside: ReactNode;
  footer: ReactNode;
}

export function DashboardShell({
  sidebar,
  mobileSidebar,
  header,
  main,
  aside,
  footer,
}: DashboardShellProps) {
  return (
    <div className="mh-shell-bg min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1560px] lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">{sidebar}</div>
        <main className="px-4 py-6 lg:px-8 lg:py-8 xl:px-10">
          {mobileSidebar ? <div className="mb-6 lg:hidden">{mobileSidebar}</div> : null}
          {header}
          <div className="mt-8 space-y-8">
            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
              {main}
              <div className="flex flex-col gap-6">{aside}</div>
            </div>
            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">{footer}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
