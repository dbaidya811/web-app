import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { FiPlus, FiTrash2, FiEdit, FiFilter, FiDollarSign } from 'react-icons/fi';
import ExpenseForm from './ExpenseForm';
import ExpenseChart from './ExpenseChart';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [filter, setFilter] = useState('all'); // all, month, week
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date ? new Date(doc.data().date) : new Date()
      }));
      
      // Sort expenses by date (newest first)
      expensesData.sort((a, b) => b.date - a.date);
      
      setExpenses(expensesData);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      const userId = auth.currentUser.uid;
      
      // Add expense to Firestore
      const expenseRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        userId,
        createdAt: new Date().toISOString()
      });
      
      // Update local state
      const newExpense = {
        id: expenseRef.id,
        ...expenseData,
        userId,
        date: new Date(expenseData.date),
        createdAt: new Date()
      };
      
      setExpenses([newExpense, ...expenses]);
      setShowForm(false);
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense. Please try again.');
    }
  };

  const handleEditExpense = async (expenseData) => {
    try {
      // Update expense in Firestore
      await updateDoc(doc(db, 'expenses', editExpense.id), {
        ...expenseData,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      const updatedExpenses = expenses.map((expense) =>
        expense.id === editExpense.id
          ? {
              ...expense,
              ...expenseData,
              date: new Date(expenseData.date),
              updatedAt: new Date()
            }
          : expense
      );
      
      // Sort expenses again to maintain order
      updatedExpenses.sort((a, b) => b.date - a.date);
      
      setExpenses(updatedExpenses);
      setEditExpense(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      // Delete expense from Firestore
      await deleteDoc(doc(db, 'expenses', expenseId));
      
      // Update local state
      setExpenses(expenses.filter((expense) => expense.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  // Filter expenses based on time period
  const getFilteredExpenses = () => {
    let filtered = [...expenses];
    
    // Apply time filter
    if (filter !== 'all') {
      const today = new Date();
      const startDate = new Date();
      
      if (filter === 'week') {
        // Set to beginning of current week (Sunday)
        startDate.setDate(today.getDate() - today.getDay());
      } else if (filter === 'month') {
        // Set to beginning of current month
        startDate.setDate(1);
      }
      
      startDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(expense => expense.date >= startDate);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    return filtered;
  };

  const filteredExpenses = getFilteredExpenses();

  // Calculate total expenses
  const calculateTotal = (expenses) => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2);
  };

  // Get unique categories
  const categories = ['all', ...new Set(expenses.map(expense => expense.category))];

  // Calculate category totals for the chart
  const getCategoryTotals = () => {
    const categoryTotals = {};
    
    filteredExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += parseFloat(expense.amount);
    });
    
    return categoryTotals;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
        <button
          onClick={() => {
            setEditExpense(null);
            setShowForm(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Add Expense
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Expenses</h2>
          <div className="flex items-center">
            <FiDollarSign className="text-green-500 mr-1" />
            <span className="text-2xl font-bold">${calculateTotal(filteredExpenses)}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Time Period</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                filter === 'month'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-3 py-1 rounded-md text-xs font-medium ${
                filter === 'week'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  categoryFilter === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredExpenses.length > 0 && (
        <div className="mb-8">
          <ExpenseChart categoryTotals={getCategoryTotals()} />
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <ExpenseForm
              onSubmit={editExpense ? handleEditExpense : handleAddExpense}
              onCancel={() => {
                setShowForm(false);
                setEditExpense(null);
              }}
              initialData={editExpense}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No expenses found. Add your first expense to start tracking!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditExpense(expense);
                          setShowForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Expenses;
