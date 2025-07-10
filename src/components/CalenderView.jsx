// CalendarView.jsx
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const REVIEW_DAYS = [7, 14, 21, 41, 81];

const getReviewDates = (studyDate) => {
  const base = new Date(studyDate);
  return REVIEW_DAYS.map(days => {
    const rDate = new Date(base);
    rDate.setDate(base.getDate() + days);
    return rDate.toISOString().split('T')[0];
  });
};

const CalendarView = () => {
  const [studyData, setStudyData] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const data = JSON.parse(localStorage.getItem('studyData')) || [];
      setStudyData(data);
    };

    loadData();
    window.addEventListener('studyDataUpdated', loadData);
    window.addEventListener('storage', loadData);

    return () => {
      window.removeEventListener('studyDataUpdated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const allDates = Array.isArray(studyData)
    ? studyData.flatMap(topic => {
      if (!topic || !topic.date || !topic.topic) return [];
      const studyEntry = { date: topic.date, label: `${topic.topic} (Study)` };
      const reviewEntries = getReviewDates(topic.date).map((date, i) => ({
        date,
        label: `${topic.topic} (Review ${i + 1})`,
      }));
      return [studyEntry, ...reviewEntries];
    })
    : [];

  const tileContent = ({ date }) => {
    const d = date.toISOString().split('T')[0];
    const found = allDates.find(item => item.date === d);
    return found ? <span className="text-xs text-red-600">🔖</span> : null;
  };

  return (
    <div className="max-w-xl mx-auto mt-4 mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-2xl">
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">
        🗓️ Study Calendar
      </h2>
      <div className="rounded overflow-hidden">
        <Calendar
          tileContent={tileContent}
          className="w-full calendar-tw bg-white"
        />
      </div>
    </div>
  );
};

export default CalendarView;
