import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiBook } from 'react-icons/fi';

const TaskForm = ({ onSubmit, onCancel, initialData }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSubject(initialData.subject || '');
      
      if (initialData.dueDate) {
        const date = new Date(initialData.dueDate);
        setDueDate(date.toISOString().split('T')[0]);
      }
      
      setReminderTime(initialData.reminderTime || '');
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const taskData = {
      title,
      subject: subject || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      reminderTime: reminderTime || null
    };
    
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Task' : 'Add New Task'}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Task Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`input ${errors.title ? 'border-red-500' : ''}`}
          placeholder="What needs to be done?"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <FiBook className="mr-1" />
            Subject (Optional)
          </div>
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input"
          placeholder="e.g., Math, Science, English"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <FiCalendar className="mr-1" />
            Due Date (Optional)
          </div>
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <FiClock className="mr-1" />
            Reminder Time (Optional)
          </div>
        </label>
        <input
          type="time"
          id="reminderTime"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="input"
        />
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
          {initialData ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
