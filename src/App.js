import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Feature Components
import Dashboard from './components/Dashboard';
import Notes from './components/notes/Notes';
import Tasks from './components/tasks/Tasks';
import Attendance from './components/attendance/Attendance';
import Quotes from './components/quotes/Quotes';
import Expenses from './components/expenses/Expenses';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/notes" element={user ? <Notes /> : <Navigate to="/login" />} />
            <Route path="/tasks" element={user ? <Tasks /> : <Navigate to="/login" />} />
            <Route path="/attendance" element={user ? <Attendance /> : <Navigate to="/login" />} />
            <Route path="/quotes" element={user ? <Quotes /> : <Navigate to="/login" />} />
            <Route path="/expenses" element={user ? <Expenses /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
