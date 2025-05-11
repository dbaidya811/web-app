import React, { useState, useEffect } from 'react';

const SubjectForm = ({ onSubmit, onCancel, initialData }) => {
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [schedule, setSchedule] = useState('');
  const [minAttendance, setMinAttendance] = useState(75);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setInstructor(initialData.instructor || '');
      setSchedule(initialData.schedule || '');
      setMinAttendance(initialData.minAttendance || 75);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Subject name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit({
      name,
      instructor,
      schedule,
      minAttendance: parseInt(minAttendance, 10)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Subject' : 'Add New Subject'}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Subject Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`input ${errors.name ? 'border-red-500' : ''}`}
          placeholder="e.g., Mathematics, Physics"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">
          Instructor (Optional)
        </label>
        <input
          type="text"
          id="instructor"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          className="input"
          placeholder="e.g., Prof. Smith"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-1">
          Schedule (Optional)
        </label>
        <input
          type="text"
          id="schedule"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          className="input"
          placeholder="e.g., Mon, Wed, Fri 10:00 AM"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="minAttendance" className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Required Attendance (%)
        </label>
        <input
          type="number"
          id="minAttendance"
          value={minAttendance}
          onChange={(e) => setMinAttendance(e.target.value)}
          className="input"
          min="0"
          max="100"
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
          {initialData ? 'Update Subject' : 'Add Subject'}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
