import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

const REVIEW_DAYS = [7,21, 41, 81,119];

const getReviewDates = (studyDate) => {
  const base = new Date(studyDate);
  return REVIEW_DAYS.map(days => {
    const rDate = new Date(base);
    rDate.setDate(base.getDate() + days);
    return rDate.toISOString().split('T')[0];
  });
};

const todayStr = new Date().toISOString().split('T')[0];

const ReviewSchedule = () => {
  const [topics, setTopics] = useState([]);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editValues, setEditValues] = useState({ topic: '', date: '', refBook: '', pageNo: '' });

 useEffect(() => {
  const loadData = () => {
    const data = JSON.parse(localStorage.getItem('studyData')) || [];
    const enriched = data.map(topic => {
      if (!topic.reviewStatus || topic.reviewStatus.length !== REVIEW_DAYS.length) {
        topic.reviewStatus = Array(REVIEW_DAYS.length).fill(false);
      }
      return topic;
    });
    setTopics(enriched.reverse()); // ← latest topics on top
    notifyTodayReviews(enriched);
  };

  loadData();
  window.addEventListener('studyDataUpdated', loadData);
  window.addEventListener('storage', loadData);

  return () => {
    window.removeEventListener('studyDataUpdated', loadData);
    window.removeEventListener('storage', loadData);
  };
}, []);

  const updateStatus = (topicId, reviewIndex) => {
    const updated = topics.map(t => {
      if (t.id === topicId) {
        t.reviewStatus[reviewIndex] = !t.reviewStatus[reviewIndex];
      }
      return t;
    });
    setTopics(updated);
    localStorage.setItem('studyData', JSON.stringify(updated));
  };

  const deleteTopic = (id) => {
    const filtered = topics.filter(t => t.id !== id);
    setTopics(filtered);
    localStorage.setItem('studyData', JSON.stringify(filtered));
  };

  const startEdit = (t) => {
    setEditingTopicId(t.id);
    setEditValues({
      topic: t.topic,
      date: t.date,
      refBook: t.refBook || '',
      pageNo: t.pageNo || '',
    });
  };

  const saveEdit = (id) => {
    const updated = topics.map(t => {
      if (t.id === id) {
        t.topic = editValues.topic;
        t.date = editValues.date;
        t.refBook = editValues.refBook;
        t.pageNo = editValues.pageNo;
        t.reviewStatus = Array(REVIEW_DAYS.length).fill(false);
      }
      return t;
    });
    setTopics(updated);
    localStorage.setItem('studyData', JSON.stringify(updated));
    setEditingTopicId(null);
  };

  const notifyTodayReviews = (topicList) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      topicList.forEach(t => {
        const reviewDates = getReviewDates(t.date);
        reviewDates.forEach((rDate, i) => {
          if (rDate === todayStr && !t.reviewStatus[i]) {
            new Notification(`Review Due: ${t.topic}`, {
              body: `Review ${i + 1} scheduled for today!`,
            });
          }
        });
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  };

  const exportCSV = () => {
    const headers = ['Topic', 'Ref Book', 'Page No', 'Study Date', ...REVIEW_DAYS.map((d, i) => `Review ${i + 1} (+${d})`)];
    const rows = topics.map(t => {
      const reviewDates = getReviewDates(t.date);
      const status = t.reviewStatus?.map((s, i) =>
        `${reviewDates[i]} (${s ? 'Done' : 'Pending'})`
      );
      return [t.topic, t.refBook || '', t.pageNo || '', t.date, ...status];
    });

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(blob, 'study-review-tracker.csv');
  };

  const filteredTopics = showTodayOnly
    ? topics.filter(t => getReviewDates(t.date).includes(todayStr))
    : topics;

  return (
    <div className="max-w-7xl mx-auto mt-4 p-6 bg-white border border-gray-300 rounded-lg shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 Review Schedule</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center text-sm text-gray-600 space-x-2">
            <input
              type="checkbox"
              checked={showTodayOnly}
              onChange={() => setShowTodayOnly(!showTodayOnly)}
              className="accent-blue-600"
            />
            <span>Show only today's reviews</span>
          </label>
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <p className="text-center text-gray-500 italic">No review data to show.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm md:text-base">
            <thead className="bg-blue-100 text-gray-700 font-semibold">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2 text-left">Topic</th>
                <th className="border p-2 text-left">Ref Book</th>
                <th className="border p-2">Page No</th>
                <th className="border p-2">Study Date</th>
                {REVIEW_DAYS.map((day, i) => (
                  <th key={i} className="border p-2">
                    Review {i + 1}<br />+{day}d
                  </th>
                ))}
                <th className="border p-2">Progress</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((t, index) => {
                const reviewDates = getReviewDates(t.date);
                const completed = t.reviewStatus.filter(Boolean).length;
                const progressPercent = Math.round((completed / REVIEW_DAYS.length) * 100);

                return (
                  <tr key={t.id} className="text-center border-t">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2 text-left">
                      {editingTopicId === t.id ? (
                        <input
                          type="text"
                          className="w-full border px-2 py-1 rounded"
                          value={editValues.topic}
                          onChange={(e) =>
                            setEditValues({ ...editValues, topic: e.target.value })
                          }
                        />
                      ) : (
                        <span className="font-medium">{t.topic}</span>
                      )}
                    </td>
                    <td className="border p-2 text-left">
                      {editingTopicId === t.id ? (
                        <input
                          type="text"
                          className="w-full border px-2 py-1 rounded"
                          value={editValues.refBook}
                          onChange={(e) =>
                            setEditValues({ ...editValues, refBook: e.target.value })
                          }
                        />
                      ) : (
                        t.refBook || '-'
                      )}
                    </td>
                    <td className="border p-2">
                      {editingTopicId === t.id ? (
                        <input
                          type="text"
                          className="w-full border px-2 py-1 rounded"
                          value={editValues.pageNo}
                          onChange={(e) =>
                            setEditValues({ ...editValues, pageNo: e.target.value })
                          }
                        />
                      ) : (
                        t.pageNo || '-'
                      )}
                    </td>
                    <td className="border p-2">
                      {editingTopicId === t.id ? (
                        <input
                          type="date"
                          className="border px-2 py-1 rounded"
                          value={editValues.date}
                          onChange={(e) =>
                            setEditValues({ ...editValues, date: e.target.value })
                          }
                        />
                      ) : (
                        t.date
                      )}
                    </td>
                    {reviewDates.map((rDate, i) => {
                      const isToday = rDate === todayStr;
                      const isPast = new Date(rDate) < new Date(todayStr) && !t.reviewStatus[i];
                      const color = isToday
                        ? 'text-yellow-600'
                        : isPast
                        ? 'text-red-600'
                        : 'text-gray-700';

                      return (
                        <td key={i} className="border p-2">
                          <div className={`flex flex-col items-center gap-1 ${color}`}>
                            <span className="font-mono">{rDate}</span>
                            <input
                              type="checkbox"
                              checked={t.reviewStatus[i]}
                              onChange={() => updateStatus(t.id, i)}
                            />
                            <span className="text-xs">
                              {t.reviewStatus[i]
                                ? '✅ Done'
                                : isToday
                                ? '🟡 Today'
                                : isPast
                                ? '🔴 Missed'
                                : '⏳'}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="border p-2">
                      <div className="text-sm font-semibold">{progressPercent}%</div>
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div
                          className="h-2 bg-green-500 rounded"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="border p-2 space-y-1">
                      {editingTopicId === t.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(t.id)}
                            className="text-green-600 hover:underline text-sm"
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={() => setEditingTopicId(null)}
                            className="text-gray-500 hover:underline text-sm"
                          >
                            ✖ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(t)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteTopic(t.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewSchedule;
