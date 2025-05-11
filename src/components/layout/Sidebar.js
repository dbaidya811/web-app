import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiBook, 
  FiCheckSquare, 
  FiCalendar, 
  FiMessageSquare, 
  FiDollarSign 
} from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <FiHome /> },
    { path: '/notes', name: 'Notes', icon: <FiBook /> },
    { path: '/tasks', name: 'Tasks', icon: <FiCheckSquare /> },
    { path: '/attendance', name: 'Attendance', icon: <FiCalendar /> },
    { path: '/quotes', name: 'Quotes', icon: <FiMessageSquare /> },
    { path: '/expenses', name: 'Expenses', icon: <FiDollarSign /> }
  ];

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r md:border-gray-200">
      <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-1 px-2 space-y-1 bg-white">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              end={item.path === '/'}
            >
              <span className="mr-3 h-5 w-5">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
