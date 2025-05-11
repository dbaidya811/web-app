import React, { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiTag } from 'react-icons/fi';

const ExpenseForm = ({ onSubmit, onCancel, initialData }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  // Predefined categories
  const categories = ['Food', 'Transport', 'Books', 'Entertainment', 'Utilities', 'Others'];

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setCategory(initialData.category || 'Food');
      
      if (initialData.date) {
        const date = new Date(initialData.date);
        setDate(date.toISOString().split('T')[0]);
      }
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!amount) newErrors.amount = 'Amount is required';
    else if (isNaN(amount) || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be a positive number';
    if (!category) newErrors.category = 'Category is required';
    if (!date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      date
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`input ${errors.description ? 'border-red-500' : ''}`}
          placeholder="e.g., Lunch, Bus fare"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <FiDollarSign className="mr-1" />
            Amount
          </div>
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`input ${errors.amount ? 'border-red-500' : ''}`}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <FiTag className="mr-1" />
            Category
          </div>
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`input ${errors.category ? 'border-red-500' : ''}`}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>
      
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <FiCalendar className="mr-1" />
            Date
          </div>
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`input ${errors.date ? 'border-red-500' : ''}`}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {initialData ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
