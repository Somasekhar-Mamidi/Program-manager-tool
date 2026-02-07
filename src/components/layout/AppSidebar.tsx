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
  History
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

// Modules: The core functional areas
const modules = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Strategy", url: "/strategy", icon: BrainCircuit },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "TaskFlow", url: "/task-flow", icon: Workflow },
  { title: "Meeting Prep", url: "/meeting-prep", icon: Calendar },
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
    <Sidebar className="border-r-0" collapsible="icon">
      <SidebarHeader className="bg-[#0f172a] text-sidebar-primary-foreground pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 transition-all group-data-[collapsible=icon]:justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-base tracking-tight text-white">MSC</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider">PROGRAM MANAGER</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-[#0f172a] text-slate-300">

        {/* Modules Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs font-bold tracking-wider uppercase mt-4 mb-2 group-data-[collapsible=icon]:hidden">
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
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
                          ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-900/20 hover:bg-indigo-600 hover:text-white"
                          : "hover:bg-slate-800 hover:text-white"
                        }
                      `}
                    >
                      <a href={item.url} className="font-medium">
                        <item.icon className={isActive ? "text-indigo-200" : "text-slate-400"} />
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
          <SidebarGroupLabel className="text-slate-500 text-xs font-bold tracking-wider uppercase mt-6 mb-2 group-data-[collapsible=icon]:hidden">
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
                          ? "bg-slate-800 text-indigo-300 border-l-2 border-indigo-500 rounded-l-none"
                          : "hover:bg-slate-800/50 hover:text-slate-100 text-slate-400"
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#0f172a] border-t border-slate-800 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-slate-800 text-slate-300 hover:text-white">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Alex Chen</span>
                <span className="truncate text-xs text-slate-500">Workspace Owner</span>
              </div>
              <Settings className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="hover:bg-indigo-500/10" />
    </Sidebar>
  )
}
