import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-100 shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between border-b border-gray-300">

      <h1 className="text-base sm:text-lg font-semibold text-gray-700 ms-9 md:ms-0">
        POS System
      </h1>

    
      <div className="flex items-center gap-2 sm:gap-4">
       
        <span className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 capitalize">
          {user?.role}
        </span>


        <span className="text-xs sm:text-sm text-gray-600 font-medium max-w-40 sm:max-w-none truncate">
          {user?.name}
        </span>


        <button
          onClick={logout}
          className="text-xs sm:text-sm bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 sm:px-4 py-1.5 rounded-lg transition whitespace-nowrap"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;