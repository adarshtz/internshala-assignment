import "./App.css";

import Login from "./page/login";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import User from "./page/user";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<User />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
