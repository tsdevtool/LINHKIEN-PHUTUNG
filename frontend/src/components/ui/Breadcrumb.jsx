import { Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter((path) => path);

  return (
    <nav className="flex items-center space-x-2 text-gray-500 text-sm">
      <Link to="/" className="text-gray-700 hover:text-black">
        <Home size={16} />
      </Link>
      {paths.map((path, index) => {
        const routeTo = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;

        return (
          <div key={index} className="flex items-center space-x-2">
            <span>{">"}</span>
            {isLast ? (
              <span className="text-black font-medium">{path}</span>
            ) : (
              <Link to={routeTo} className="hover:text-black">
                {path}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
