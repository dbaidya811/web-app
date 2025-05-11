import React, { useState, useEffect } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

const NoteForm = ({ onSubmit, onCancel, initialData }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSubject(initialData.subject || '');
      setContent(initialData.content || '');
      if (initialData.fileUrl) {
        // Extract filename from URL or path
        const pathParts = initialData.filePath?.split('/') || [];
        setFileName(pathParts[pathParts.length - 1] || 'Attached File');
      }
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(
      {
        title,
        subject,
        content
      },
      file
    );
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Note' : 'Add New Note'}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`input ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`input ${errors.subject ? 'border-red-500' : ''}`}
        />
        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="6"
          className={`input ${errors.content ? 'border-red-500' : ''}`}
        ></textarea>
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attachment (PDF)
        </label>
        {fileName ? (
          <div className="flex items-center bg-gray-100 p-2 rounded">
            <span className="text-sm text-gray-700 flex-1 truncate">{fileName}</span>
            <button
              type="button"
              onClick={clearFile}
              className="ml-2 text-gray-500 hover:text-red-500"
            >
              <FiX />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-md shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-50">
              <FiUpload className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Click to upload PDF</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
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
          {initialData ? 'Update Note' : 'Save Note'}
        </button>
      </div>
    </form>
  );
};

export default NoteForm;
