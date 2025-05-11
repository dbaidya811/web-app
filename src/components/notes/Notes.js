import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../../firebase/config';
import { FiPlus, FiSearch, FiFile, FiTrash2, FiEdit, FiDownload } from 'react-icons/fi';
import NoteForm from './NoteForm';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const notesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt) : new Date()
      }));
      
      // Sort notes by creation date (newest first)
      notesData.sort((a, b) => b.createdAt - a.createdAt);
      
      setNotes(notesData);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (noteData, file) => {
    try {
      const userId = auth.currentUser.uid;
      let fileUrl = '';
      let filePath = '';
      
      // If there's a file, upload it to Firebase Storage
      if (file) {
        const storageRef = ref(storage, `notes/${userId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // Progress monitoring if needed
            },
            (error) => {
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                fileUrl = downloadURL;
                filePath = storageRef.fullPath;
                resolve();
              });
            }
          );
        });
      }
      
      // Add note to Firestore
      const noteRef = await addDoc(collection(db, 'notes'), {
        ...noteData,
        userId,
        fileUrl,
        filePath,
        createdAt: new Date().toISOString()
      });
      
      // Update local state
      setNotes([
        {
          id: noteRef.id,
          ...noteData,
          userId,
          fileUrl,
          filePath,
          createdAt: new Date()
        },
        ...notes
      ]);
      
      setShowForm(false);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

  const handleEditNote = async (noteData, file) => {
    try {
      const userId = auth.currentUser.uid;
      let fileUrl = editNote.fileUrl || '';
      let filePath = editNote.filePath || '';
      
      // If there's a new file, upload it and delete the old one
      if (file) {
        // Delete old file if exists
        if (editNote.filePath) {
          const oldFileRef = ref(storage, editNote.filePath);
          await deleteObject(oldFileRef);
        }
        
        // Upload new file
        const storageRef = ref(storage, `notes/${userId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // Progress monitoring if needed
            },
            (error) => {
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                fileUrl = downloadURL;
                filePath = storageRef.fullPath;
                resolve();
              });
            }
          );
        });
      }
      
      // Update note in Firestore
      await updateDoc(doc(db, 'notes', editNote.id), {
        ...noteData,
        fileUrl,
        filePath,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setNotes(
        notes.map((note) =>
          note.id === editNote.id
            ? {
                ...note,
                ...noteData,
                fileUrl,
                filePath,
                updatedAt: new Date()
              }
            : note
        )
      );
      
      setEditNote(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId, filePath) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      // Delete note from Firestore
      await deleteDoc(doc(db, 'notes', noteId));
      
      // Delete file from Storage if exists
      if (filePath) {
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
      }
      
      // Update local state
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notes Manager</h1>
        <button
          onClick={() => {
            setEditNote(null);
            setShowForm(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Add Note
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
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes by title, subject or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <NoteForm
              onSubmit={editNote ? handleEditNote : handleAddNote}
              onCancel={() => {
                setShowForm(false);
                setEditNote(null);
              }}
              initialData={editNote}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No notes found. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{note.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditNote(note);
                      setShowForm(true);
                    }}
                    className="text-gray-500 hover:text-primary"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id, note.filePath)}
                    className="text-gray-500 hover:text-danger"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="bg-gray-100 rounded px-3 py-1 text-sm text-gray-600 inline-block mb-2">
                {note.subject}
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
              {note.fileUrl && (
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <FiFile className="mr-1" />
                  <span className="text-sm">View Attachment</span>
                  <FiDownload className="ml-1" />
                </a>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {note.createdAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
