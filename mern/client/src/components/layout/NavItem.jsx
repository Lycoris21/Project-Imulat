import { NavLink } from "react-router-dom";

export default function NavItem({ name, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-[color:var(--color-base)] hover:text-[color:var(--color-dark)] font-medium transition-colors ${
          isActive ? "text-[color:var(--color-dark)] opacity-60 border-b-2 border-[color:var(--color-dark)] pb-1" : ""
        }`
      }
    >
      {name}
    </NavLink>
  );
}
