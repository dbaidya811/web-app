import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { FiBook, FiCheckSquare, FiCalendar, FiMessageSquare, FiDollarSign } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    notes: 0,
    tasks: 0,
    pendingTasks: 0,
    attendance: 0,
    expenses: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const userId = auth.currentUser.uid;
      
      try {
        // Count notes
        const notesQuery = query(
          collection(db, 'notes'),
          where('userId', '==', userId)
        );
        const notesSnapshot = await getDocs(notesQuery);
        
        // Count tasks and pending tasks
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', userId)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const pendingTasks = tasksSnapshot.docs.filter(doc => !doc.data().completed).length;
        
        // Count subjects with attendance
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', userId)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        
        // Get recent expenses
        const expensesQuery = query(
          collection(db, 'expenses'),
          where('userId', '==', userId),
          limit(5)
        );
        const expensesSnapshot = await getDocs(expensesQuery);
        
        setStats({
          notes: notesSnapshot.docs.length,
          tasks: tasksSnapshot.docs.length,
          pendingTasks,
          attendance: attendanceSnapshot.docs.length,
          expenses: expensesSnapshot.docs.length
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (auth.currentUser) {
      fetchStats();
    }
  }, []);

  const features = [
    {
      id: 1,
      title: 'Notes Manager',
      description: 'Save and organize your study notes by subject',
      icon: <FiBook className="w-8 h-8 text-primary" />,
      link: '/notes',
      stat: `${stats.notes} Notes`
    },
    {
      id: 2,
      title: 'Task List',
      description: 'Keep track of your assignments and deadlines',
      icon: <FiCheckSquare className="w-8 h-8 text-secondary" />,
      link: '/tasks',
      stat: `${stats.pendingTasks} Pending Tasks`
    },
    {
      id: 3,
      title: 'Attendance Tracker',
      description: 'Monitor your class attendance for each subject',
      icon: <FiCalendar className="w-8 h-8 text-accent" />,
      link: '/attendance',
      stat: `${stats.attendance} Subjects`
    },
    {
      id: 4,
      title: 'Motivational Quotes',
      description: 'Get inspired with daily motivational quotes',
      icon: <FiMessageSquare className="w-8 h-8 text-indigo-500" />,
      link: '/quotes',
      stat: 'Daily Quote'
    },
    {
      id: 5,
      title: 'Expense Tracker',
      description: 'Track and categorize your daily expenses',
      icon: <FiDollarSign className="w-8 h-8 text-green-600" />,
      link: '/expenses',
      stat: `${stats.expenses} Expenses`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Companion</h1>
      <p className="text-gray-600 mb-8">Your all-in-one productivity tool for academic success</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link to={feature.link} key={feature.id} className="card hover:border-primary hover:border-2">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-gray-100">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 mt-1">{feature.description}</p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                  {feature.stat}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
