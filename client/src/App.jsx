import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LangProvider } from './context/LangContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import Ticker from './components/Ticker';
import About from './components/About';
import Education from './components/Education';
import Camps from './components/Camps';
import News from './components/News';
import Contacts from './components/Contacts';
import Footer from './components/Footer';
import EnrollModal from './components/EnrollModal';
import LagerAntalya from './pages/LagerAntalya';
import LagerZaRubezhom from './pages/LagerZaRubezhom';
import ObuchenieZaRubezhom from './pages/ObuchenieZaRubezhom';

const Admin = lazy(() => import('./pages/Admin'));

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
        <Education />
        <Camps filter={filter} onEnroll={setEnrollCamp} />
        <News />
        <Contacts />
      </main>
      <Footer />
      <EnrollModal camp={enrollCamp} onClose={() => setEnrollCamp(null)} />
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/leto-lager-v-turcii" element={<LagerAntalya />} />
        <Route path="/letnie-lagerya-za-rubezhom" element={<LagerZaRubezhom />} />
        <Route path="/obuchenie-za-rubezhom" element={<ObuchenieZaRubezhom />} />
        <Route path="/admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
      </Routes>
    </LangProvider>
  );
}
