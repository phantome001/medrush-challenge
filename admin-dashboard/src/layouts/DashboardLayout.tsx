import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CreditCard,
  FileQuestion,
  GraduationCap,
  Layers,
  LogOut,
  Medal,
  Settings,
  Stethoscope,
  Users
} from "lucide-react";
import { getUser, logout } from "../utils/auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/institutions", label: "Institutions", icon: Building2 },
  { to: "/users", label: "Users", icon: Users },
  { to: "/teachers", label: "Teachers", icon: GraduationCap },
  { to: "/students", label: "Students", icon: Users },
  { to: "/quizzes", label: "Quizzes", icon: BookOpen },
  { to: "/questions", label: "Questions", icon: FileQuestion },
  { to: "/clinical-cases", label: "Clinical Cases", icon: Stethoscope },
  { to: "/categories", label: "Categories", icon: Layers },
  { to: "/leaderboard", label: "Leaderboard", icon: Medal },
  { to: "/plans", label: "Plans", icon: CreditCard },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/notifications", label: "Notifications", icon: Bell }
];

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-slate-100 bg-white lg:flex">
        <div className="border-b border-slate-100 p-6">
          <div className="text-2xl font-black text-medblue">MedRush</div>
          <div className="text-sm font-medium text-medgreen">Challenge Admin</div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${isActive ? "bg-blue-50 text-medblue" : "text-slate-600 hover:bg-slate-50"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-sm text-slate-500">Educational SaaS platform</p>
            <p className="font-semibold">{user?.fullName ?? "Admin"}</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
