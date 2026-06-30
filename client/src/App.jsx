import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import Ticker from './components/Ticker';
import About from './components/About';

const Education = lazy(() => import('./components/Education'));
const Camps     = lazy(() => import('./components/Camps'));
const News      = lazy(() => import('./components/News'));
const Contacts  = lazy(() => import('./components/Contacts'));
const Footer    = lazy(() => import('./components/Footer'));
const EnrollModal = lazy(() => import('./components/EnrollModal'));
const Admin     = lazy(() => import('./pages/Admin'));

const DEFAULT_FILTER = { country: 'all', budget: 'all', age: 'all' };

function Landing() {
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [enrollCamp, setEnrollCamp] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <FilterBar onFilter={setFilter} />
        <About />
        <Suspense fallback={null}>
          <Education />
          <Camps filter={filter} onEnroll={setEnrollCamp} />
          <News />
          <Contacts />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <EnrollModal camp={enrollCamp} onClose={() => setEnrollCamp(null)} />
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </LangProvider>
  );
}
