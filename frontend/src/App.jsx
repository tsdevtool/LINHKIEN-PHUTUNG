import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Signup from "./pages/auth/Signup";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
