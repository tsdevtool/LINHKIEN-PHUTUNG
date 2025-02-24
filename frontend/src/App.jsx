import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound/NotFound";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
