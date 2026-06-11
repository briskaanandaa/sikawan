import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  LifeBuoyIcon,
  SendIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  TerminalIcon,
  Package,
  ChartColumnBig,
  ListCheck,
  File,
  CircleDollarSignIcon,
} from "lucide-react";

const data = {
  user: {
    name: "Admin Sikawan",
    email: "Selamat Datang,  ",
    avatar: "/sikawan-admin.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <ChartColumnBig />,
      isActive: true,
    },
    {
      title: "Katalog",
      url: "/katalog",
      icon: <Package />,
    },
    {
      title: "Order",
      url: "/order",
      icon: <ListCheck />,
    },
    {
      title: "Keuangan",
      url: "/cashflow",
      icon: <CircleDollarSignIcon />,
    },
    {
      title: "Blog",
      url: "/blog",
      icon: <File />,
    },
  ],
  navSecondary: [
    // {
    //   title: "Pengaturan",
    //   url: "#",
    //   icon: <Settings2Icon />,
    // },
    {
      title: "Feedback",
      url: "#",
      icon: <SendIcon />,
    },
  ],
  projects: [
    // {
    //   name: "Pengaturan",
    //   url: "#",
    //   icon: <Settings2Icon />,
    // },
  ],
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center  text-sidebar-primary-foreground">
                  <img src="/sikawan.png" alt="" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sikawan</span>
                  <span className="truncate text-xs">sikawan-pagersari.id</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
