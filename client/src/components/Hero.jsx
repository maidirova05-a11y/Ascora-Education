import { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

const SLIDES = [
  {
    id: 'edu',
    href: '#education',
    img: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1400&q=85&fit=crop&auto=format',
    bullets: ['b1', 'b2', 'b3'],
  },
  {
    id: 'camps',
    href: '#camps',
    img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=85&fit=crop&auto=format',
    bullets: ['b1', 'b2', 'b3'],
  },
];

const STATS = [
  { num: '300+', key: 'stat.students' },
  { num: '20+',  key: 'stat.countries' },
  { num: '95%',  key: 'stat.success' },
  { num: '10',   key: 'stat.programs' },
];

export default function Hero() {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const phaseRef = useRef('intro'); // 'intro' | 'programs'

  const heroRef    = useRef(null);
  const swiperRef  = useRef(null);
  const introRef   = useRef(null);
  const h1Ref      = useRef(null);
  const watchRef   = useRef(null);
  const programsRef = useRef(null);
  const contentRef  = useRef(null);

  // ── GSAP context (for contextSafe wrapping) ──────────────────────────
  const { contextSafe } = useGSAP({ scope: heroRef });

  // ── Play intro animation ─────────────────────────────────────────────
  const playIntro = contextSafe(() => {
    phaseRef.current = 'intro';

    // Reset programs layer
    gsap.set(programsRef.current, { autoAlpha: 0, y: 50, display: 'none' });

    // Show intro layer
    gsap.set(introRef.current, { display: 'flex' });
    gsap.set([h1Ref.current, watchRef.current], { clearProps: 'all' });

    // Стagger: h1 → button
    gsap.timeline()
      .fromTo(h1Ref.current,
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power3.out' }
      )
      .fromTo(watchRef.current,
        { autoAlpha: 0, y: 36, scale: 0.92 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.6)' },
        '+=0.2'
      );
  });

  // ── Moment 3: intro → programs ───────────────────────────────────────
  const showPrograms = contextSafe(() => {
    phaseRef.current = 'programs';

    gsap.timeline()
      // Fade out intro
      .to(watchRef.current, { autoAlpha: 0, y: -24, duration: 0.35, ease: 'power2.in' })
      .to(h1Ref.current,    { autoAlpha: 0, y: -36, duration: 0.40, ease: 'power2.in' }, '<+=0.06')
      .call(() => {
        gsap.set(introRef.current, { display: 'none' });
        gsap.set(programsRef.current, { display: 'flex' });
      })
      // Fade in programs
      .fromTo(programsRef.current,
        { autoAlpha: 0, y: 52 },
        { autoAlpha: 1, y: 0, duration: 0.70, ease: 'power3.out' }
      );
  });

  // ── Moment 4: navigate away then come back → replay intro ────────────
  const resetToIntro = contextSafe(() => {
    if (phaseRef.current === 'intro') {
      // Already in intro — just replay animation
      playIntro();
      return;
    }
    gsap.to(programsRef.current, {
      autoAlpha: 0, y: -32, duration: 0.40, ease: 'power2.in',
      onComplete: playIntro,
    });
  });

  // IntersectionObserver: when hero leaves and re-enters viewport
  useEffect(() => {
    const hero = heroRef.current;
    let wasGone = false;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        wasGone = true;
      } else if (wasGone) {
        wasGone = false;
        resetToIntro();
      }
    }, { threshold: 0.35 });

    if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // First mount → play intro
  useGSAP(() => {
    gsap.set(programsRef.current, { autoAlpha: 0, display: 'none' });
    playIntro();
  }, { scope: heroRef });

  // Slide change: cross-fade content text
  const handleSlideChange = contextSafe((sw) => {
    const newIdx = sw.realIndex;
    if (phaseRef.current !== 'programs' || !contentRef.current) {
      setActiveIdx(newIdx);
      return;
    }
    gsap.to(contentRef.current, {
      autoAlpha: 0, y: -10, duration: 0.22,
      onComplete: () => {
        setActiveIdx(newIdx);
        gsap.fromTo(contentRef.current,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.30 }
        );
      },
    });
  });

  const slide = SLIDES[activeIdx];

  return (
    <section id="hero" ref={heroRef}>

      {/* ── Background Swiper (images only) ── */}
      <Swiper
        className="hero-swiper-full"
        modules={[Autoplay]}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
        speed={850}
        onSwiper={(sw) => { swiperRef.current = sw; }}
        onSlideChange={handleSlideChange}
      >
        {SLIDES.map((s) => (
          <SwiperSlide key={s.id}>
            <div className="hero-slide-bg" style={{ backgroundImage: `url('${s.img}')` }} />
            <div className="hero-slide-overlay" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ── МОМЕНТ 1 + 2: Intro layer ── */}
      <div className="hero-intro-layer" ref={introRef}>
        <h1 ref={h1Ref} dangerouslySetInnerHTML={{ __html: t('hero.h1') }} />
        <button ref={watchRef} className="hero-watch-btn" onClick={showPrograms}>
          {t('hero.watch')}
          <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </button>
      </div>

      {/* ── МОМЕНТ 3: Programs layer ── */}
      <div className="hero-programs-layer" ref={programsRef}>
        <div className="hero-programs-content" ref={contentRef}>
          <div className="hsc-tag">{t(`card.${slide.id}.sub`)}</div>
          <h2 className="hsc-title">{t(`card.${slide.id}.title`)}</h2>
          <p className="hsc-desc">{t(`card.${slide.id}.desc`)}</p>
          <ul className="hsc-bullets">
            {slide.bullets.map((b) => (
              <li key={b}>{t(`card.${slide.id}.${b}`)}</li>
            ))}
          </ul>
          <a
            href={slide.href}
            className="hsc-btn"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector(slide.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {t('go')}
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </a>
        </div>

        <div className="hero-slide-nav">
          <button className="hsn-arrow" onClick={() => swiperRef.current?.slidePrev()} aria-label="Назад">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 4l-4 4 4 4"/></svg>
          </button>
          <div className="hsn-dots">
            {SLIDES.map((_, idx) => (
              <button key={idx}
                className={`hsn-dot ${idx === activeIdx ? 'hsn-dot--active' : ''}`}
                onClick={() => swiperRef.current?.slideToLoop(idx)}
                aria-label={`Слайд ${idx + 1}`}
              />
            ))}
          </div>
          <button className="hsn-arrow" onClick={() => swiperRef.current?.slideNext()} aria-label="Вперёд">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4l4 4-4 4"/></svg>
          </button>
        </div>
      </div>

      {/* ── Static stats (always visible) ── */}
      <div className="hero-static-stats">
        {STATS.map((s) => (
          <div key={s.key} className="hero-stat">
            <div className="hero-stat-num">{s.num}</div>
            <div className="hero-stat-label">{t(s.key)}</div>
          </div>
        ))}
      </div>

    </section>
  );
}
