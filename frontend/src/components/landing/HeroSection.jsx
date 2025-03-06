import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getIcon } from "./Icons";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <div className="hero-container relative min-h-screen bg-space-gradient overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="planet-large"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="floating-grid"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Additional space elements */}
        <div className="stars"></div>
        <motion.div
          className="meteor"
          initial={{ x: "200%", y: "-100%" }}
          animate={{ x: "-200%", y: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 4,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Create Stunning Websites
            <br />
            <span className="text-cyan-400">with Drag & Drop</span>
          </motion.h1>

          {/* Preview Windows */}
          <motion.div
            className="preview-windows flex justify-center gap-8 my-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Code Editor Preview */}
            <div className="preview-window bg-dark-blue rounded-lg p-4 shadow-glow">
              <div className="window-header flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="window-content text-left">
                <pre className="text-cyan-400 text-sm">
                  <code>{`function createWebsite() {
  const site = new DragDrop();
  site.addComponent('header');
  site.addComponent('hero');
  site.customize();
  return site.deploy();
}`}</code>
                </pre>
              </div>
            </div>

            {/* Website Preview */}
            <div className="preview-window bg-dark-blue rounded-lg p-4 shadow-glow">
              <div className="window-header flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="window-content">
                <div className="bg-gradient-to-b from-cyan-500/20 to-purple-500/20 rounded p-4">
                  <div className="h-4 w-3/4 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Icons */}
          <motion.div
            className="nav-icons flex justify-center gap-16 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {["home", "drag", "projects", "support", "signup"].map((icon) => (
              <NavIcon
                key={icon}
                icon={icon}
                label={
                  icon.charAt(0).toUpperCase() + icon.slice(1).replace("_", " ")
                }
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const NavIcon = ({ icon, label }) => {
  const Icon = getIcon(icon);

  return (
    <Link to={`/${icon}`} className="nav-icon-wrapper text-center">
      <motion.div
        className="icon-circle w-16 h-16 rounded-full bg-dark-blue/50 
                   backdrop-blur-sm flex items-center justify-center mb-2
                   border border-cyan-400/30 shadow-glow-sm"
        whileHover={{ scale: 1.1, borderColor: "rgba(34, 211, 238, 0.6)" }}
        transition={{ duration: 0.2 }}
      >
        <Icon />
      </motion.div>
      <span className="text-sm text-white/80">{label}</span>
    </Link>
  );
};

export default HeroSection;
