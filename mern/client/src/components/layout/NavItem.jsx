import { NavLink, useLocation } from "react-router-dom";

export default function NavItem({ name, to }) {
  const location = useLocation();
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        // Custom logic for Home route: make it active for both "/" and "/home" and "/Home"
        const isHomeActive = name === "Home" && (location.pathname === "/" || location.pathname === "/home" || location.pathname === "/Home");
        const finalActive = isActive || isHomeActive;
        
        return `text-sm md:text-base text-[color:var(--color-base)] hover:text-[color:var(--color-dark)] font-medium transition-colors ${
          finalActive ? "text-[color:var(--color-dark)] opacity-60 border-b-2 border-[color:var(--color-dark)] pb-1" : ""
        }`;
      }}
    >
      {name}
    </NavLink>
  );
}
