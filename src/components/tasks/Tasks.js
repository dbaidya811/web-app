import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { FiPlus, FiCheck, FiTrash2, FiEdit, FiClock, FiCalendar, FiBook } from 'react-icons/fi';
import TaskForm from './TaskForm';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate ? new Date(doc.data().dueDate) : null
      }));
      
      // Sort tasks by due date (closest first) and then by completed status
      tasksData.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      });
      
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const userId = auth.currentUser.uid;
      
      // Add task to Firestore
      const taskRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        userId,
        completed: false,
        createdAt: new Date().toISOString()
      });
      
      // Update local state
      const newTask = {
        id: taskRef.id,
        ...taskData,
        userId,
        completed: false,
        createdAt: new Date()
      };
      
      // Insert the new task in the correct position
      const updatedTasks = [...tasks];
      
      // Find the correct position based on due date
      let insertIndex = 0;
      while (
        insertIndex < updatedTasks.length &&
        !updatedTasks[insertIndex].completed &&
        updatedTasks[insertIndex].dueDate &&
        newTask.dueDate &&
        updatedTasks[insertIndex].dueDate <= newTask.dueDate
      ) {
        insertIndex++;
      }
      
      updatedTasks.splice(insertIndex, 0, newTask);
      setTasks(updatedTasks);
      
      setShowForm(false);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      // Update task in Firestore
      await updateDoc(doc(db, 'tasks', editTask.id), {
        ...taskData,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      const updatedTasks = tasks.map((task) =>
        task.id === editTask.id
          ? {
              ...task,
              ...taskData,
              updatedAt: new Date()
            }
          : task
      );
      
      // Sort tasks again to maintain order
      updatedTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      });
      
      setTasks(updatedTasks);
      setEditTask(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      // Delete task from Firestore
      await deleteDoc(doc(db, 'tasks', taskId));
      
      // Update local state
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      // Update task status in Firestore
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !currentStatus,
        completedAt: !currentStatus ? new Date().toISOString() : null
      });
      
      // Update local state
      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !currentStatus,
              completedAt: !currentStatus ? new Date() : null
            }
          : task
      );
      
      // Sort tasks again to maintain order
      updatedTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      });
      
      setTasks(updatedTasks);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const isOverdue = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDueDate = (date) => {
    if (!date) return 'No due date';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task List</h1>
        <button
          onClick={() => {
            setEditTask(null);
            setShowForm(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Add Task
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

      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'completed'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <TaskForm
              onSubmit={editTask ? handleEditTask : handleAddTask}
              onCancel={() => {
                setShowForm(false);
                setEditTask(null);
              }}
              initialData={editTask}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filter === 'all'
              ? 'No tasks found. Add your first task!'
              : filter === 'pending'
              ? 'No pending tasks. Great job!'
              : 'No completed tasks yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                  task.completed ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggleComplete(task.id, task.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border ${
                      task.completed
                        ? 'bg-green-500 border-green-500 flex items-center justify-center'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {task.completed && <FiCheck className="text-white" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    
                    <div className="mt-1 flex flex-wrap gap-2">
                      {task.subject && (
                        <div className="flex items-center text-xs text-gray-500">
                          <FiBook className="mr-1" />
                          {task.subject}
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div
                          className={`flex items-center text-xs ${
                            isOverdue(task.dueDate) && !task.completed
                              ? 'text-red-500'
                              : 'text-gray-500'
                          }`}
                        >
                          <FiCalendar className="mr-1" />
                          {formatDueDate(task.dueDate)}
                        </div>
                      )}
                      
                      {task.reminderTime && (
                        <div className="flex items-center text-xs text-gray-500">
                          <FiClock className="mr-1" />
                          {task.reminderTime}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditTask(task);
                        setShowForm(true);
                      }}
                      className="text-gray-500 hover:text-primary"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-500 hover:text-danger"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Tasks;
