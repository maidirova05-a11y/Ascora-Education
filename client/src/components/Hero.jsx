import { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

const HERO_BG = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=90&fit=crop&auto=format';

const SLIDES = [
  {
    id: 'antalya',
    href: '#camp-11',
    img: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=1400&q=85&fit=crop&auto=format',
    bullets: ['b1', 'b2', 'b3'],
    hot: true,
  },
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

// target value + suffix for counter animation
const STATS = [
  { target: 300, suffix: '+', key: 'stat.students' },
  { target: 20,  suffix: '+', key: 'stat.countries' },
  { target: 95,  suffix: '%', key: 'stat.success' },
  { target: 10,  suffix: '',  key: 'stat.programs' },
];

export default function Hero() {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const phaseRef = useRef('intro');

  const heroRef     = useRef(null);
  const swiperRef   = useRef(null);
  const introBgRef  = useRef(null);
  const swiperElRef = useRef(null);
  const introRef    = useRef(null);
  const hotRef      = useRef(null);
  const h1Ref       = useRef(null);
  const watchRef    = useRef(null);
  const statsRef    = useRef(null);
  const programsRef = useRef(null);
  const contentRef  = useRef(null);

  const { contextSafe } = useGSAP({ scope: heroRef });

  // ── Counter animation (CountUp-style: expo.out, fast start → slow end) ──
  const runCounters = contextSafe(() => {
    const numEls = statsRef.current?.querySelectorAll('.hero-stat-num');
    if (!numEls) return;
    numEls.forEach((el, i) => {
      const { target, suffix } = STATS[i];
      const obj = { val: 0 };
      el.textContent = '0' + suffix;

      // Scale-in the number element itself
      gsap.fromTo(el,
        { autoAlpha: 0, scale: 0.7, y: 10 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)', delay: i * 0.14 }
      );

      // Count up with expo.out — same feel as CountUp.js
      gsap.to(obj, {
        val: target,
        duration: 2.2,
        ease: 'expo.out',
        delay: i * 0.14,
        onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
      });
    });
  });

  // ── Moment 1+2: static bg + h1 + button + stats counter ──────────────
  const playIntro = contextSafe(() => {
    phaseRef.current = 'intro';

    // Reset programs phase
    gsap.set(programsRef.current, { autoAlpha: 0, display: 'none' });
    gsap.set(swiperElRef.current, { autoAlpha: 0 });
    // Stop autoplay + rewind to the first slide while hidden — Swiper's
    // transition-end events misfire on a visibility:hidden element, which
    // makes autoplay race through slides invisibly if left running.
    swiperRef.current?.autoplay?.stop();
    swiperRef.current?.slideTo(0, 0);

    // Prepare intro elements
    gsap.set(introBgRef.current, { autoAlpha: 1 });
    gsap.set(introRef.current, { display: 'flex' });
    gsap.set(statsRef.current, { autoAlpha: 0, y: 28 });
    gsap.set(hotRef.current, { autoAlpha: 0, y: -16 });

    const tl = gsap.timeline();

    // hot offer badge pops in first
    tl.fromTo(hotRef.current,
      { autoAlpha: 0, y: -16, scale: 0.9 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }
    )
    // h1 flies in
    .fromTo(h1Ref.current,
      { autoAlpha: 0, y: 60 },
      { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power3.out' }
    )
    // button bounces in
    .fromTo(watchRef.current,
      { autoAlpha: 0, y: 36, scale: 0.92 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.6)' },
      '+=0.15'
    )
    // stats bar slides up
    .to(statsRef.current,
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
    // counters start after stats appear
    .call(runCounters);
  });

  // ── Moment 3: "Посмотреть программы" → programs phase ────────────────
  const showPrograms = contextSafe(() => {
    phaseRef.current = 'programs';
    swiperRef.current?.slideTo(0, 0);
    setActiveIdx(0);

    gsap.timeline()
      // hot badge slides up first
      .to(hotRef.current, { autoAlpha: 0, y: -16, duration: 0.24, ease: 'power2.in' })
      // slide button out first
      .to(watchRef.current, { autoAlpha: 0, y: -24, duration: 0.28, ease: 'power2.in' }, '<')
      // h1 follows
      .to(h1Ref.current, { autoAlpha: 0, y: -36, duration: 0.32, ease: 'power2.in' }, '<+=0.05')
      // stats slide down
      .to(statsRef.current, { autoAlpha: 0, y: 32, duration: 0.32, ease: 'power2.in' }, '<+=0.04')
      .call(() => {
        gsap.set(introRef.current, { display: 'none' });
        gsap.set(programsRef.current, { display: 'flex' });
      })
      // static bg fades out, Swiper fades in simultaneously
      .to(introBgRef.current,  { autoAlpha: 0, duration: 0.65, ease: 'power2.inOut' }, '+=0.04')
      .to(swiperElRef.current, { autoAlpha: 1, duration: 0.65, ease: 'power2.inOut' }, '<')
      // programs content rises up
      .fromTo(programsRef.current,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out' },
        '<+=0.18'
      )
      .call(() => swiperRef.current?.autoplay?.start());
  });

  // ── Moment 4: re-enter viewport → replay intro ───────────────────────
  const resetToIntro = contextSafe(() => {
    if (phaseRef.current === 'intro') { playIntro(); return; }
    gsap.to(programsRef.current, {
      autoAlpha: 0, y: -24, duration: 0.35, ease: 'power2.in',
      onComplete: playIntro,
    });
  });

  useEffect(() => {
    const hero = heroRef.current;
    let wasGone = false;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) wasGone = true;
      else if (wasGone) { wasGone = false; resetToIntro(); }
    }, { threshold: 0.35 });
    if (hero) obs.observe(hero);
    return () => obs.disconnect();
  }, []); // eslint-disable-line

  // First mount setup
  useGSAP(() => {
    gsap.set(swiperElRef.current, { autoAlpha: 0 });
    gsap.set(programsRef.current, { autoAlpha: 0, display: 'none' });
    playIntro();
  }, { scope: heroRef });

  // Slide content cross-fade on auto-advance
  const handleSlideChange = contextSafe((sw) => {
    const newIdx = sw.activeIndex;
    if (phaseRef.current !== 'programs' || !contentRef.current) {
      setActiveIdx(newIdx); return;
    }
    gsap.to(contentRef.current, {
      autoAlpha: 0, y: -10, duration: 0.20,
      onComplete: () => {
        setActiveIdx(newIdx);
        gsap.fromTo(contentRef.current,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.28 }
        );
      },
    });
  });

  const slide = SLIDES[activeIdx];

  return (
    <section id="hero" ref={heroRef}>

      {/* Static intro bg */}
      <div ref={introBgRef} className="hero-static-bg"
        style={{ backgroundImage: `url('${HERO_BG}')` }} />
      <div className="hero-static-bg-overlay" />

      {/* Swiper — programs phase only */}
      <div ref={swiperElRef} className="hero-swiper-wrap">
        <Swiper
          className="hero-swiper-full"
          modules={[Autoplay]}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          rewind speed={850}
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
      </div>

      {/* ── Intro layer: h1 + watch button ── */}
      <div className="hero-intro-layer" ref={introRef}>
        <a
          href="#camp-11"
          ref={hotRef}
          className="hero-hot-badge"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('camp-11')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        >
          <span className="hero-hot-badge-fire">🔥</span>
          <span className="hero-hot-badge-text">
            <strong>{t('hero.hot.label')}</strong> — {t('hero.hot.title')} · {t('hero.hot.until')}
          </span>
          <span className="hero-hot-badge-arrow">{t('hero.hot.cta')}</span>
        </a>
        <h1 ref={h1Ref} dangerouslySetInnerHTML={{ __html: t('hero.h1') }} />
        <button ref={watchRef} className="hero-watch-btn" onClick={showPrograms}>
          {t('hero.watch')}
          <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </button>
      </div>

      {/* ── Stats counter (intro only) ── */}
      <div className="hero-static-stats" ref={statsRef}>
        {STATS.map((s) => (
          <div key={s.key} className="hero-stat">
            <div className="hero-stat-num">0{s.suffix}</div>
            <div className="hero-stat-label">{t(s.key)}</div>
          </div>
        ))}
      </div>

      {/* ── Programs layer ── */}
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
          {slide.hot ? (
            <a
              href={slide.href}
              className="hsc-hot-cta"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(slide.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span className="hsc-hot-cta-top">🔥 {t('hero.hot.dontmiss')}!</span>
              <span className="hsc-hot-cta-main">
                {t('hero.hot.leadcta')}
                <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </span>
            </a>
          ) : (
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
          )}
        </div>

        <div className="hero-slide-nav">
          <button className="hsn-arrow" onClick={() => swiperRef.current?.slidePrev()} aria-label="Назад">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 4l-4 4 4 4"/></svg>
          </button>
          <div className="hsn-dots">
            {SLIDES.map((_, idx) => (
              <button key={idx}
                className={`hsn-dot ${idx === activeIdx ? 'hsn-dot--active' : ''}`}
                onClick={() => swiperRef.current?.slideTo(idx)}
                aria-label={`Слайд ${idx + 1}`}
              />
            ))}
          </div>
          <button className="hsn-arrow" onClick={() => swiperRef.current?.slideNext()} aria-label="Вперёд">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4l4 4-4 4"/></svg>
          </button>
        </div>
      </div>

    </section>
  );
}
