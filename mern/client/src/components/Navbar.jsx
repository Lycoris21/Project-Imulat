import { Link, NavLink } from "react-router-dom";

export default function Navbar({ isLoggedIn = false }) {
  const navItems = [
    { name: "Home", to: "/" },
    { name: "Reports", to: "/reports" },
    { name: "Claims", to: "/claims" },
    { name: "About", to: "/about" },
  ];

  return (
    <nav className="bg-white border-b shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-blue-600">Project Imulat</h1>

        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `text-gray-700 hover:text-blue-600 font-medium ${
                isActive ? "border-b-2 border-blue-500 pb-1" : ""
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      <div>
        {isLoggedIn ? (
          <Link
            to="/profile"
            className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
          >
            Profile
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:underline mr-4"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
