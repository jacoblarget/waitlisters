import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pageRegister";
import Homepage from "./pageHome";
import StudentView from "./pageStudent";
import Dashboard from "./pageDashboard";
import InstructorView from "./pageInstructor";
import Login from "./pageLogin";
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
