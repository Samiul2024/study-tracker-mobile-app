import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AddTopic = ({ onTopicAdded }) => {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [refBook, setRefBook] = useState('');
  const [pageNo, setPageNo] = useState('');

  const handleSubmit = (e) => {
    // e.preventDefault();
    if (!topic || !date || !refBook || !pageNo) {
      return alert("Please fill in all fields.");
    }

    const newTopic = {
      id: uuidv4(),
      topic,
      date,
      refBook,
      pageNo,
      reviewStatus: [false, false, false, false, false],
    };

    const existing = JSON.parse(localStorage.getItem('studyData')) || [];
    const updated = [...existing, newTopic];
    localStorage.setItem('studyData', JSON.stringify(updated));

    // Clear inputs
    setTopic('');
    setDate('');
    setRefBook('');
    setPageNo('');

    if (onTopicAdded) {
      onTopicAdded();
      window.dispatchEvent(new Event('studyDataUpdated'));
      
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-blue-50 rounded border border-blue-200 shadow-2xl mt-6">
      <h2 className="text-lg font-semibold mb-4 text-center text-blue-700">➕ Add New Study Topic</h2>
      <form onSubmit={handleSubmit} className="space-y-">
        <div>
          <label className="block mb-1 font-medium">Topic Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Chapter 3: Animal Reproduction"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Reference Book</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
            value={refBook}
            onChange={(e) => setRefBook(e.target.value)}
            placeholder="e.g. Biology Book"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Page Number</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
            value={pageNo}
            onChange={(e) => setPageNo(e.target.value)}
            placeholder="e.g. 85"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Study Date</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded focus:outline-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          ✅ Add Topic
        </button>
      </form>
    </div>
  );
};

export default AddTopic;
