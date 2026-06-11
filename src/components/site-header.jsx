import { SidebarIcon } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useBreadcrumb } from "@/hooks/useBreadcrumb"; // ← tambah
import { Link } from "react-router-dom"; // ← tambah

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const crumbs = useBreadcrumb(); // ← tambah

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4 py-2">
        <Button
          className="h-8 w-8"
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-full" />

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {crumbs.map(({ href, label, isLast }, i) => (
              <>
                <BreadcrumbItem key={href}>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={href}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator key={`sep-${i}`} />}
              </>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* <SearchForm className="w-full sm:ml-auto sm:w-auto" /> */}
      </div>
    </header>
  );
}
