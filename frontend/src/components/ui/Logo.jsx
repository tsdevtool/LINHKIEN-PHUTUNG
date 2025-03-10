import { Link } from "react-router-dom";

const Logo = () => (
  <Link to="/" className="flex items-center max-w-2xl space-x-2">
    <img src="/logo-nobg.png" alt="Logo" className="w-12 md:w-16" />
    <span className="text-cyan-600 dark:text-cyan-200 font-bold hidden sm:block">
      MotorKing
    </span>
  </Link>
);

export default Logo;
