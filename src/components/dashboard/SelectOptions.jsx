import { NavLink } from "react-router-dom";
import { Archive, CalendarDays, PenTool } from "lucide-react";

const menuItems = [
  {
    label: "Pacientes y Expedientes",
    icon: Archive,
    path: "/patients",
  },
  {
    label: "Agenda de Citas (Google Calendar)",
    icon: CalendarDays,
    path: "/calendar",
  },
  {
    label: "Carta de Consentimiento",
    icon: PenTool,
    path: "/consents",
  },
];

const SelectOptions = () => {
  return (
    <nav className="flex items-center gap-8 border-b border-slate-200">
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-2 py-4 text-sm font-semibold transition-all border-b-2 ${
                isActive
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default SelectOptions;