"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  BarChart3,
  Users,
  Link2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roleConfig = {
  student: { label: "Student", icon: GraduationCap },
  instructor: { label: "Instructor", icon: BookOpen },
  admin: { label: "Administrator", icon: Settings },
  analyst: { label: "Data Analyst", icon: BarChart3 },
};

function navigateToSection(sectionId) {
  window.dispatchEvent(
    new CustomEvent("quadbase:navigate", { detail: { section: sectionId } })
  );
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function AppSidebar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const config = roleConfig[user.role];
  const RoleIcon = config.icon;
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleNav = useCallback((sectionId) => {
    setActiveSection(sectionId);
    navigateToSection(sectionId);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-primary-foreground font-serif">
          QuadBase
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Navigation
        </div>
        <SidebarLink
          icon={LayoutDashboard}
          label="Dashboard"
          active={pathname === "/dashboard"}
          onClick={() => {
            // Always navigate to dashboard route
            if (pathname !== "/dashboard") {
              router.push("/dashboard");
            }
          }}
        />
        {(user.role === "student" || user.role === "instructor") && (
          <SidebarLink
            icon={Users}
            label="Profile"
            active={pathname?.startsWith("/profile")}
            onClick={() => router.push('/profile')}
          />
        )}
        {user.role === "student" && (
          <SidebarLink
            icon={BookOpen}
            label="Browse Courses"
            active={pathname === "/dashboard" && activeSection === "browse-courses"}
            onClick={() => {
              // If on dashboard, scroll to section; otherwise navigate to dashboard first
              if (pathname === "/dashboard") {
                handleNav("browse-courses");
              } else {
                router.push("/dashboard");
                // After navigation, scroll to browse courses
                setTimeout(() => {
                  const el = document.getElementById("browse-courses");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }
            }}
          />
        )}
        {user.role === "instructor" && (
          <SidebarLink
            icon={BookOpen}
            label="My Courses"
            active={pathname === "/dashboard" && activeSection === "my-courses"}
            onClick={() => {
              if (pathname === "/dashboard") {
                handleNav("my-courses");
              } else {
                router.push("/dashboard");
              }
            }}
          />
        )}
        {user.role === "admin" && (
          <>
            <SidebarLink
              icon={BookOpen}
              label="Courses"
              active={pathname === "/dashboard" && activeSection === "admin-courses"}
              onClick={() => {
                if (pathname === "/dashboard") {
                  handleNav("admin-courses");
                } else {
                  router.push("/dashboard");
                }
              }}
            />
            <SidebarLink
              icon={Link2}
              label="Instructors"
              active={activeSection === "admin-assignments"}
              onClick={() => handleNav("admin-assignments")}
            />
            <SidebarLink
              icon={Users}
              label="Students"
              active={pathname === "/dashboard" && activeSection === "admin-students"}
              onClick={() => {
                if (pathname === "/dashboard") {
                  handleNav("admin-students");
                } else {
                  router.push("/dashboard");
                }
              }}
            />
            <SidebarLink
              icon={Building2}
              label="Universities"
              active={activeSection === "admin-universities"}
              onClick={() => handleNav("admin-universities")}
            />
          </>
        )}
        {user.role === "analyst" && (
          <SidebarLink
            icon={BarChart3}
            label="Analytics"
            active={pathname === "/dashboard" && activeSection === "analytics"}
            onClick={() => {
              if (pathname === "/dashboard") {
                handleNav("analytics");
              } else {
                router.push("/dashboard");
              }
            }}
          />
        )}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20">
            <RoleIcon className="h-4 w-4 text-sidebar-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
              {user.username}
            </p>
            <p className="text-xs text-sidebar-foreground/60">{config.label}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
