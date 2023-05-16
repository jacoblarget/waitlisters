import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import StudentView from "./pages/StudentView";
import Dashboard from "./pages/Dashboard";
import InstructorView from "./pages/InstructorView";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";

function App() {
  const [token, setToken] = useState(0);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? (<Navigate to={`/dashboard/${token}`} />) : (<Homepage />)} />
        <Route path="/register" element={<Register />} />
        <Route path="/studentview/:user_id/:course_id" element={token ? (<StudentView />) : (<Navigate to="/" />)} />
        <Route path="/instructorview/:user_id/:course_id" element={token ? (<InstructorView />) : (<Navigate to="/" />)} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/dashboard/:user_id" element={token ? (<Dashboard setToken={setToken} />) : (<Navigate to="/" />)} />
      </Routes>
    <Toaster position="bottom-center" />
    </BrowserRouter>
    
  );
}

export default App;

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
