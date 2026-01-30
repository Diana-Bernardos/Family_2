import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Calendar from './components/Calendar';
import Members from './components/Members';
import MemberDetail from './components/MemberDetail';
import MemberForm from './components/MemberForm';
import EventDetail from './components/EventDetail';
import EventForm from './components/EventForm';
import ChatBot from './components/ChatBot';
import ShoppingList from './components/ShoppingList';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/new" element={<MemberForm />} />
            <Route path="/members/:id" element={<MemberDetail />} />
            <Route path="/members/:id/edit" element={<MemberForm />} />
            <Route path="/chat" element={<ChatBot />} />
            <Route path="/shopping" element={<ShoppingList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
