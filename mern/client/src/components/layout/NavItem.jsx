import { NavLink } from "react-router-dom";

export default function NavItem({ name, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-base hover:text-dark font-medium transition-colors ${
          isActive ? "text-dark opacity-60 border-b-2 border-dark pb-1" : ""
        }`
      }
    >
      {name}
    </NavLink>
  );
}
