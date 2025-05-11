import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { FiPlus, FiTrash2, FiEdit, FiAlertTriangle } from 'react-icons/fi';
import SubjectForm from './SubjectForm';
import AttendanceCard from './AttendanceCard';

const Attendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editSubject, setEditSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'attendance'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const subjectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort subjects alphabetically
      subjectsData.sort((a, b) => a.name.localeCompare(b.name));
      
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (subjectData) => {
    try {
      const userId = auth.currentUser.uid;
      
      // Add subject to Firestore
      const subjectRef = await addDoc(collection(db, 'attendance'), {
        ...subjectData,
        userId,
        createdAt: new Date().toISOString(),
        attended: 0,
        total: 0
      });
      
      // Update local state
      const newSubject = {
        id: subjectRef.id,
        ...subjectData,
        userId,
        createdAt: new Date(),
        attended: 0,
        total: 0
      };
      
      setSubjects([...subjects, newSubject].sort((a, b) => a.name.localeCompare(b.name)));
      setShowForm(false);
    } catch (err) {
      console.error('Error adding subject:', err);
      setError('Failed to add subject. Please try again.');
    }
  };

  const handleEditSubject = async (subjectData) => {
    try {
      // Update subject in Firestore
      await updateDoc(doc(db, 'attendance', editSubject.id), {
        ...subjectData,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      const updatedSubjects = subjects.map((subject) =>
        subject.id === editSubject.id
          ? {
              ...subject,
              ...subjectData,
              updatedAt: new Date()
            }
          : subject
      );
      
      setSubjects(updatedSubjects.sort((a, b) => a.name.localeCompare(b.name)));
      setEditSubject(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating subject:', err);
      setError('Failed to update subject. Please try again.');
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject? All attendance data will be lost.')) {
      return;
    }
    
    try {
      // Delete subject from Firestore
      await deleteDoc(doc(db, 'attendance', subjectId));
      
      // Update local state
      setSubjects(subjects.filter((subject) => subject.id !== subjectId));
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError('Failed to delete subject. Please try again.');
    }
  };

  const handleAttendanceUpdate = async (subjectId, attended, total) => {
    try {
      // Update attendance in Firestore
      await updateDoc(doc(db, 'attendance', subjectId), {
        attended,
        total,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setSubjects(
        subjects.map((subject) =>
          subject.id === subjectId
            ? {
                ...subject,
                attended,
                total,
                updatedAt: new Date()
              }
            : subject
        )
      );
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance. Please try again.');
    }
  };

  // Calculate overall attendance percentage
  const calculateOverallAttendance = () => {
    if (subjects.length === 0) return 0;
    
    const totalAttended = subjects.reduce((sum, subject) => sum + subject.attended, 0);
    const totalClasses = subjects.reduce((sum, subject) => sum + subject.total, 0);
    
    if (totalClasses === 0) return 0;
    return Math.round((totalAttended / totalClasses) * 100);
  };

  const overallAttendance = calculateOverallAttendance();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Tracker</h1>
        <button
          onClick={() => {
            setEditSubject(null);
            setShowForm(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Add Subject
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

      {subjects.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Overall Attendance</h2>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                <div
                  className={`h-4 rounded-full ${
                    overallAttendance >= 75
                      ? 'bg-green-500'
                      : overallAttendance >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${overallAttendance}%` }}
                ></div>
              </div>
              <span className="text-lg font-semibold">{overallAttendance}%</span>
            </div>
            
            {overallAttendance < 75 && (
              <div className="mt-4 flex items-start text-yellow-600">
                <FiAlertTriangle className="mt-0.5 mr-2" />
                <p className="text-sm">
                  Your overall attendance is below 75%. Try to attend more classes to improve it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <SubjectForm
              onSubmit={editSubject ? handleEditSubject : handleAddSubject}
              onCancel={() => {
                setShowForm(false);
                setEditSubject(null);
              }}
              initialData={editSubject}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No subjects found. Add your first subject to start tracking attendance!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <AttendanceCard
              key={subject.id}
              subject={subject}
              onDelete={handleDeleteSubject}
              onEdit={() => {
                setEditSubject(subject);
                setShowForm(true);
              }}
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Attendance;
