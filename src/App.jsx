import React from 'react';
import AddTopic from './components/AddTopic';
import ReviewSchedule from './components/ReviewSchedule';
import CalendarView from './components/CalenderView';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        <span className='text'>
          📚 Study Tracker
        </span>
      </h1>
      <AddTopic />
      <ReviewSchedule />
      <CalendarView />
      <Footer />
    </div>
  );
}

export default App;
