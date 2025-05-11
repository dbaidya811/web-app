import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiMinus, FiAlertTriangle } from 'react-icons/fi';

const AttendanceCard = ({ subject, onDelete, onEdit, onAttendanceUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const attendancePercentage = subject.total === 0 
    ? 0 
    : Math.round((subject.attended / subject.total) * 100);

  const isLowAttendance = attendancePercentage < subject.minAttendance;

  const handleAttendClass = () => {
    const newAttended = subject.attended + 1;
    const newTotal = subject.total + 1;
    onAttendanceUpdate(subject.id, newAttended, newTotal);
  };

  const handleMissClass = () => {
    const newTotal = subject.total + 1;
    onAttendanceUpdate(subject.id, subject.attended, newTotal);
  };

  const handleCustomUpdate = (e) => {
    e.preventDefault();
    const attended = parseInt(e.target.attended.value, 10);
    const total = parseInt(e.target.total.value, 10);
    
    if (isNaN(attended) || isNaN(total) || attended < 0 || total < 0 || attended > total) {
      alert('Please enter valid numbers. Attended classes cannot exceed total classes.');
      return;
    }
    
    onAttendanceUpdate(subject.id, attended, total);
    setIsUpdating(false);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-primary"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => onDelete(subject.id)}
            className="text-gray-500 hover:text-danger"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      
      {subject.instructor && (
        <p className="text-sm text-gray-600 mb-1">Instructor: {subject.instructor}</p>
      )}
      
      {subject.schedule && (
        <p className="text-sm text-gray-600 mb-3">Schedule: {subject.schedule}</p>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Attendance</span>
          <span 
            className={`text-sm font-semibold ${
              isLowAttendance ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {attendancePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              attendancePercentage >= 75
                ? 'bg-green-500'
                : attendancePercentage >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${attendancePercentage}%` }}
          ></div>
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {subject.attended} / {subject.total} classes attended
        </div>
      </div>
      
      {isLowAttendance && (
        <div className="mb-4 flex items-start text-yellow-600 text-xs">
          <FiAlertTriangle className="mt-0.5 mr-1 flex-shrink-0" />
          <p>
            Your attendance is below the minimum requirement of {subject.minAttendance}%.
          </p>
        </div>
      )}
      
      {isUpdating ? (
        <form onSubmit={handleCustomUpdate} className="mb-3">
          <div className="flex space-x-2 mb-2">
            <div>
              <label htmlFor="attended" className="block text-xs text-gray-500">
                Attended
              </label>
              <input
                type="number"
                id="attended"
                name="attended"
                defaultValue={subject.attended}
                min="0"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label htmlFor="total" className="block text-xs text-gray-500">
                Total
              </label>
              <input
                type="number"
                id="total"
                name="total"
                defaultValue={subject.total}
                min="0"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white text-sm py-1 rounded hover:bg-indigo-700"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setIsUpdating(false)}
              className="flex-1 bg-gray-200 text-gray-700 text-sm py-1 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={handleAttendClass}
            className="flex-1 bg-green-500 text-white py-1 rounded flex items-center justify-center hover:bg-green-600"
          >
            <FiPlus className="mr-1" /> Attend
          </button>
          <button
            onClick={handleMissClass}
            className="flex-1 bg-red-500 text-white py-1 rounded flex items-center justify-center hover:bg-red-600"
          >
            <FiMinus className="mr-1" /> Miss
          </button>
          <button
            onClick={() => setIsUpdating(true)}
            className="flex-1 bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
