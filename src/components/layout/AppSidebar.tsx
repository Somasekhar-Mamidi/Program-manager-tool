"use client"

import {
  Calendar,
  Home,
  LayoutDashboard,
  BrainCircuit,
  Workflow,
  PenTool,
  ListTodo,
  Settings,
  BookMarked,
  BarChart,
  User,
  History,
  Layers,
  Globe,
  HelpCircle
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useCalendarStore } from "@/lib/store/calendar-store"

// Modules: The core functional areas
const modules = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Strategy", url: "/strategy", icon: BrainCircuit },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "TaskFlow", url: "/task-flow", icon: Workflow },
  { title: "Meeting Prep", url: "/meeting-prep", icon: Calendar },
  { title: "Task < > Resources", url: "/task-resources", icon: Layers },
]

// Quick Access: Personal or secondary items
const quickAccess = [
  { title: "My Tasks", url: "/tasks", icon: ListTodo },
  { title: "Writing", url: "/writing", icon: PenTool },
  { title: "Charters", url: "/charters", icon: BookMarked },
  { title: "Analytics", url: "/analytics", icon: BarChart },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar" collapsible="icon">
      <SidebarHeader className="bg-sidebar text-sidebar-foreground pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 transition-all group-data-[collapsible=icon]:justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-base tracking-tight text-sidebar-foreground">DeepWork</span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wider">PROGRAM MANAGER</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar text-sidebar-foreground">

        {/* Modules Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-bold tracking-wider uppercase mb-2 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 tour-sidebar-nav">
              {modules.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`
                        h-10 transition-all duration-200 ease-in-out
                        ${isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                        }
                      `}
                    >
                      <a href={item.url} className="font-medium">
                        <item.icon className={isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground"} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Access Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-bold tracking-wider uppercase mt-6 mb-2 group-data-[collapsible=icon]:hidden">
            Quick Access
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {quickAccess.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`
                        h-9 mb-0.5 text-sm transition-colors
                        ${isActive
                          ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary rounded-l-none"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                        }
                      `}
                    >
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

              {/* Tutorial Button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => useCalendarStore.getState().setIsTourRunning(true)}
                  className="h-9 mb-0.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground cursor-pointer"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Tutorial</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Somasekhar</span>
                <span className="truncate text-xs text-muted-foreground">Workspace Owner</span>
              </div>
              <Settings className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="hover:bg-sidebar-primary/10" />
    </Sidebar>
  )
}
