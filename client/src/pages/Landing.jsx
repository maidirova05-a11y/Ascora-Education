import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FilterBar from '../components/FilterBar';
import Ticker from '../components/Ticker';
import About from '../components/About';
import Camps from '../components/Camps';
import Contacts from '../components/Contacts';
import Footer from '../components/Footer';
import EnrollModal from '../components/EnrollModal';

const DEFAULT_FILTER = { country: 'all', budget: 'all', age: 'all' };

export default function Landing() {
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

  // Scroll to #anchor when arriving from another page (e.g. /leto-lager-v-turcii → /#camps):
  // the section doesn't exist until React renders, so the browser's native jump misses.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const timer = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <FilterBar onFilter={setFilter} />
        <About />
        <Camps filter={filter} onEnroll={setEnrollCamp} />
        <Contacts />
      </main>
      <Footer />
      <EnrollModal camp={enrollCamp} onClose={() => setEnrollCamp(null)} />
    </>
  );
}
