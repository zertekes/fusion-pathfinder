"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Briefcase, CheckSquare, Mail, Calendar, FileUp, Settings, KanbanSquare } from "lucide-react"

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
    },
    {
        label: "Clients",
        icon: Users,
        href: "/clients",
        color: "text-violet-500",
    },
    {
        label: "Cases",
        icon: Briefcase,
        href: "/cases",
        color: "text-pink-700",
    },
    {
        label: "Tasks",
        icon: CheckSquare,
        href: "/tasks",
        color: "text-orange-700",
    },
    {
        label: "Task Flow",
        icon: KanbanSquare,
        href: "/task-flow",
        color: "text-indigo-500",
    },
    {
        label: "Email",
        icon: Mail,
        href: "/email",
        color: "text-emerald-500",
    },
    {
        label: "Calendar",
        icon: Calendar,
        href: "/calendar",
        color: "text-green-700",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">
                        Advisor<span className="text-primary">Flow</span>
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
