import { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useAnimationFrame,
  useTransform,
} from 'framer-motion';

/* ================================================================
   Data
   ================================================================ */

const NAV_ITEMS = [
  { label: '(01) First Stitch', page: 'main' },
  { label: '(02) About me', page: 'about' },
  { label: '(03) Projects', page: 'projects' },
  { label: '(04) Contact', page: 'contact' },
];

const IMAGE_PATH = '/images/IMG_7547.PNG';

/* Fabric images for sequential reveal on main page (8 previews) */
const NEW_FABRIC_IMAGES = [
  '/images/IMG_7550.PNG',
  '/images/IMG_7551.PNG',
  '/images/IMG_7552.PNG',
  '/images/IMG_7553.PNG',
  '/images/IMG_7554.PNG',
  '/images/IMG_7555.PNG',
  '/images/IMG_7556.PNG',
  '/images/IMG_7557.PNG',
];

/* Rolling reel: randomize 8 images × 3 cycles = 24 frames, then original */
function buildReelSequence() {
  const pool = [0, 1, 2, 3, 4, 5, 6, 7];
  const seq = [];
  for (let cycle = 0; cycle < 3; cycle++) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    seq.push(...shuffled);
  }
  return seq; // 20 indices into NEW_FABRIC_IMAGES
}

/* ================================================================
   Needle cursor SVG
   ================================================================ */

function NeedleIcon() {
  return (
    <svg
      width="24"
      height="56"
      viewBox="0 0 24 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Thread loop — flowing out of eye */}
      <path
        d="M12 1 C6 -5 0 -2 1 3 C1.5 6 3 7 5 6.5"
        stroke="#1c1a18"
        strokeWidth="0.55"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Thread tail — longer wisp */}
      <path
        d="M12 1 C18 -4 24 -1 23 5 C22.5 9 20 11 18 10"
        stroke="#1c1a18"
        strokeWidth="0.45"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Thread wrap around shaft */}
      <ellipse cx="12" cy="8" rx="1.5" ry="2" fill="none" stroke="#1c1a18" strokeWidth="0.4" opacity="0.5" />
      {/* Eye */}
      <ellipse cx="12" cy="12" rx="1.2" ry="3.5" fill="#ffffff" stroke="#1c1a18" strokeWidth="0.7" />
      {/* Shaft — slightly tapered */}
      <line x1="12" y1="16.5" x2="12" y2="48" stroke="#1c1a18" strokeWidth="1.1" strokeLinecap="round" />
      {/* Shaft highlight */}
      <line x1="11.2" y1="17" x2="11.2" y2="46" stroke="#ffffff" strokeWidth="0.3" strokeLinecap="round" opacity="0.5" />
      {/* Point */}
      <polygon points="12,48 8,41 16,41" fill="#1c1a18" />
      {/* Point tip */}
      <polygon points="12,48 10.5,44 13.5,44" fill="#1c1a18" opacity="0.6" />
    </svg>
  );
}

/* ================================================================
   Navigation link with stitch hover
   ================================================================ */

const COURIER = "'MomsTypewriter', 'American Typewriter', 'Courier New', monospace";

function NavLink({ children, active, onClick, onEnter, onLeave }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      className="relative inline-block bg-transparent border-none p-0 text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.18em] uppercase py-1.5 px-1 select-none cursor-none whitespace-nowrap"
      style={{
        fontFamily: COURIER,
        fontWeight: active ? 700 : 400,
        color: active ? '#c62828' : '#000000',
        opacity: active ? 1 : 1,
      }}
      onMouseEnter={() => {
        setHovered(true);
        onEnter?.();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave?.();
      }}
      whileHover={{ scale: 1.04 }}
      animate={hovered ? { y: [0, -0.5, 0, -0.5, 0] } : { y: 0 }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 25 },
        y: { duration: 0.5, ease: 'easeInOut' },
      }}
    >
      {children}

      {/* Top stitch */}
      <motion.span
        className="absolute top-0 left-0 h-[1.5px] w-full origin-left"
        style={{
          background:
            `repeating-linear-gradient(to right, ${active ? '#c62828' : '#000000'} 0px, ${active ? '#c62828' : '#000000'} 3px, transparent 3px, transparent 7px)`,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Bottom stitch */}
      <motion.span
        className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left"
        style={{
          background:
            `repeating-linear-gradient(to right, ${active ? '#c62828' : '#000000'} 0px, ${active ? '#c62828' : '#000000'} 3px, transparent 3px, transparent 7px)`,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Embroidered dashed frame */}
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{
          border: `1px dashed ${active ? '#c62828' : '#000000'}`,
          margin: '-3px -6px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 0.45 : 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </motion.button>
  );
}

/* ================================================================
   Overlay page wrapper
   ================================================================ */

function OverlayPage({ onClose, onEnter, onLeave, children }) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center bg-white m-5 sm:m-9"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 sm:top-8 sm:right-8 md:top-10 md:right-10 z-50 bg-transparent border-none text-[#1c1a18]/50 text-[13px] tracking-[0.2em] uppercase cursor-none hover:text-[#1c1a18] transition-colors duration-300"
        style={{ fontFamily: COURIER }}
      >
        Close ✕
      </button>

      {children}
    </motion.div>
  );
}

/* ================================================================
   Contact page overlay
   ================================================================ */

function ContactPage({ onClose, onEnter, onLeave }) {
  return (
    <OverlayPage onClose={onClose} onEnter={onEnter} onLeave={onLeave}>
      <div className="flex flex-col items-center gap-10 text-center">
        <motion.h2
          className="text-[#1c1a18] text-[clamp(1.2rem,2.6vw,2rem)] font-bold tracking-[0.15em] uppercase m-0"
          style={{ fontFamily: COURIER }}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          Contact
        </motion.h2>

        <motion.div
          className="flex flex-col gap-6 text-[13px] sm:text-[14px] tracking-[0.1em] text-[#1c1a18]/70 leading-relaxed"
          style={{ fontFamily: COURIER }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Email */}
          <div className="flex items-center justify-center gap-4">
            <svg width="28" height="22" viewBox="0 0 20 16" fill="none" className="flex-shrink-0 opacity-60">
              <rect x="1.5" y="2.5" width="17" height="11" rx="0.5" stroke="#1c1a18" strokeWidth="0.8" strokeDasharray="0.5 0.3" />
              <path d="M2 3l6.8 5.8c.7.6 1.7.6 2.4 0L18 3" stroke="#1c1a18" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <a href="mailto:senosheng615@gmail.com" className="hover:opacity-50 transition-opacity" style={{ color: 'inherit', textDecoration: 'none' }}>Email: senosheng615@gmail.com</a>
          </div>

          {/* Instagram */}
          <div className="flex items-center justify-center gap-4">
            <svg width="26" height="26" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 opacity-60">
              <rect x="3" y="3" width="12" height="12" rx="3" stroke="#1c1a18" strokeWidth="0.8" strokeDasharray="0.4 0.3" />
              <circle cx="9" cy="9" r="3.2" stroke="#1c1a18" strokeWidth="0.8" />
              <circle cx="13.2" cy="4.8" r="0.7" fill="#1c1a18" opacity="0.7" />
            </svg>
            <a href="https://instagram.com/senosheng" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity" style={{ color: 'inherit', textDecoration: 'none' }}>Instagram: senosheng</a>
          </div>

          {/* WeChat */}
          <div className="flex items-center justify-center gap-4">
            <svg width="24" height="26" viewBox="0 0 16 18" fill="none" className="flex-shrink-0 opacity-60">
              <path d="M11 7.5c2.2 0 4 1.5 4 3.5s-1.8 3.5-4 3.5c-.3 0-.7 0-1-.1L8 15.5l-.8-1.2c-1.6.2-3-.8-3.7-2C2.5 11.5 2 10.6 2 9.5c0-2 1.8-3.5 4-3.5.3 0 .7 0 1 .1" stroke="#1c1a18" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="5.2" cy="9.5" r="0.6" fill="#1c1a18" opacity="0.7" />
              <circle cx="8" cy="9.5" r="0.6" fill="#1c1a18" opacity="0.7" />
              <circle cx="10.8" cy="9.5" r="0.6" fill="#1c1a18" opacity="0.7" />
            </svg>
            <span>WeChat: Seno_Sheng</span>
          </div>
        </motion.div>
      </div>
    </OverlayPage>
  );
}

/* ================================================================
   About page — faithful to ekaterinabusygina.com/info layout
   Two-column flex: left 50% = title (absolutely positioned, massive),
   right 50% = CV content starting 40vh down, max-width 70%
   ================================================================ */

function AboutPage({ onClose, onEnter, onLeave }) {
  return (
    <OverlayPage onClose={onClose} onEnter={onEnter} onLeave={onLeave}>
      <div className="flex w-full h-full" style={{ fontFamily: COURIER }}>
        {/* ======== Left column: 50% — title only (fixed) ======== */}
        <div className="w-1/2 flex-shrink-0 relative h-full">
          <motion.div
            className="sticky top-0 left-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2
              style={{
                fontFamily: COURIER,
                fontSize: 'clamp(2rem, 6vw, 5.5rem)',
                fontWeight: 400,
                letterSpacing: '-0.03em',
                lineHeight: 0.9,
                color: '#1c1a18',
                margin: 0,
                padding: 0,
              }}
            >
              Seno Sheng.
              <br />
              TEXTILE ARTIST
              <br />
              &amp; FASHION DESIGNER
            </h2>
          </motion.div>
        </div>

        {/* ======== Right column: 50% — Bio + CV blocks (scrollable) ======== */}
        <div className="w-1/2 flex-shrink-0 h-full overflow-y-auto" style={{ paddingTop: '40vh', paddingBottom: '20vh' }}>
          <motion.div
            className="flex flex-col"
            style={{ maxWidth: '70%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* ——— Intro / Bio ——— */}
            <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
            <div style={{ marginBottom: '6vh' }}>
              <p style={blockP}>
                Seno Sheng focuses on the intersection of human vulnerability, emotional psychology, and wearable technology. The work explores how garments can act as protective interfaces, translating psychological observations and biological data into tangible textile art. By bridging behavioral research with advanced material engineering, the focus returns to the profound connection between the body, its traumas, and the surrounding environment — turning empathy into functional, kinetic structures.
              </p>
            </div>

            {/* ——— EDUCATION ——— */}
            <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
            <div style={{ marginBottom: '5vh' }}>
              <p style={blockSection}>Education</p>
              <p style={blockYear}>2025 – 2026</p>
              <p style={blockP}>Chelsea College of Arts, University of the Arts London (UAL)</p>
              <p style={{ ...blockP, color: '#909090' }}>MA Textile Design</p>

              <p style={{ ...blockYear, marginTop: '2.5vh' }}>2022 – 2024</p>
              <p style={blockP}>Chelsea College of Arts, University of the Arts London (UAL)</p>
              <p style={{ ...blockP, color: '#909090' }}>Graduate Diploma (GD) in Textile Design</p>

              <p style={{ ...blockYear, marginTop: '2.5vh' }}>2018 – 2022</p>
              <p style={blockP}>Beijing Union University</p>
              <p style={{ ...blockP, color: '#909090' }}>BA Fashion Design</p>
            </div>

            {/* ——— THE LABEL (BRAND CONCEPT) ——— */}
            <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
            <div style={{ marginBottom: '5vh' }}>
              <p style={blockSection}>The Label</p>
              <p style={blockP}>
                Positioned at the intersection of fashion design and textile art, the practice transcends the traditional atelier, functioning as a sensitive space for material poetry and human-centric exploration. Rather than mere apparel, every garment and spatial installation is sculpted as a physiological shield — an intimate architecture of care.
              </p>
              <p style={{ ...blockP, marginTop: '1vh' }}>
                The work translates invisible emotional traumas and physical vulnerabilities into a tactile avant-garde, orchestrating a dialogue between the organic body and its surrounding environment. By weaving unconventional sensory narratives and structural tension into the very anatomy of the cloth, the textiles become kinetic extensions of the human experience. Grounded in a profound reverence for memory and biological traces, the creations challenge the boundaries of interactive art, transforming empathy, healing, and protection into wearable sanctuaries.
              </p>
            </div>

            {/* ——— RECOGNITIONS & SELECTED WORKS ——— */}
            <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
            <div style={{ marginBottom: '5vh' }}>
              <p style={blockSection}>Recognitions &amp; Selected Works</p>

              {/* 2026 */}
              <p style={blockYear}>2026</p>
              <p style={blockP}>MA Graduate Showcase — Exhibiting Designer</p>
              <p style={{ ...blockP, color: '#909090' }}>Exhibited at Chelsea College of Arts, UAL</p>
              <p style={{ ...blockP, color: '#909090' }}>
                Project: <em>Relics of Existence: Breathing Archives of Care</em>
              </p>
              <p style={{ ...blockP, color: '#909090', fontSize: 'clamp(8px, 0.85vw, 12px)', marginTop: '0.15em' }}>
                An interactive double-weave textile utilizing upcycled stray animal hair, featuring pneumatic devices driven by the EEG data of animal shelter workers.
              </p>

              {/* 2024 */}
              <p style={{ ...blockYear, marginTop: '2.5vh' }}>2024</p>
              <p style={blockP}>UAL Justice Awards — Winner</p>
              <p style={{ ...blockP, color: '#909090' }}>Awarded by University of the Arts London (UAL)</p>
              <p style={{ ...blockP, color: '#909090' }}>
                Project: <em>Relics of Existence</em> (Early Stage Material Research)
              </p>
              <p style={blockP}>GD Textile Design Graduate Showcase — Exhibiting Designer</p>
              <p style={{ ...blockP, color: '#909090' }}>Exhibited at Chelsea College of Arts, UAL</p>
              <p style={{ ...blockP, color: '#909090' }}>
                Project: Stray Animal Hair Textile Project
              </p>

              {/* 2022 */}
              <p style={{ ...blockYear, marginTop: '2.5vh' }}>2022</p>
              <p style={blockP}>BA Fashion Design Graduate Exhibition — Exhibiting Designer</p>
              <p style={{ ...blockP, color: '#909090' }}>Exhibited at Beijing Union University</p>
              <p style={{ ...blockP, color: '#909090' }}>
                Project: Maternity Fashion
              </p>
              <p style={{ ...blockP, color: '#909090', fontSize: 'clamp(8px, 0.85vw, 12px)', marginTop: '0.15em' }}>
                Functional maternity wear engineered with varying elasticity coefficients to relieve abdominal and internal organ pressure.
              </p>

              {/* 2021 */}
              <p style={{ ...blockYear, marginTop: '2.5vh' }}>2021</p>
              <p style={blockP}>Selected Academic Work — Lead Designer</p>
              <p style={{ ...blockP, color: '#909090' }}>Beijing Union University</p>
              <p style={{ ...blockP, color: '#909090' }}>
                Project: Alzheimer disease project
              </p>
              <p style={{ ...blockP, color: '#909090', fontSize: 'clamp(8px, 0.85vw, 12px)', marginTop: '0.15em' }}>
                Winter garments integrating graphene technology for joint warmth and embedded GPS tracking for the safety of seniors with Alzheimer's.
              </p>

              {/* 2020 */}
              <p style={{ ...blockYear, marginTop: '2.5vh' }}>2020</p>
              <p style={blockP}>Selected Academic Work — Lead Artist</p>
              <p style={{ ...blockP, color: '#909090' }}>Beijing Union University</p>
              <p style={{ ...blockP, color: '#909090' }}>
                Project: <em>Twisted</em>
              </p>
              <p style={{ ...blockP, color: '#909090', fontSize: 'clamp(8px, 0.85vw, 12px)', marginTop: '0.15em' }}>
                A wearable art and behavioral installation translating the psychological impact of fragmented families into sculptural forms.
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </OverlayPage>
  );
}

/* Inline styles for body text — mirroring reference 1.1vw / 1.45 line-height */
const blockSection = {
  fontFamily: COURIER,
  fontSize: 'clamp(11px, 1.05vw, 15px)',
  fontWeight: 700,
  lineHeight: 1.45,
  color: '#1c1a18',
  margin: 0,
  marginBottom: '1.2vh',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const blockYear = {
  fontFamily: COURIER,
  fontSize: 'clamp(12px, 1.1vw, 16px)',
  fontWeight: 700,
  lineHeight: 1.45,
  color: '#1c1a18',
  margin: 0,
  marginBottom: '0.25em',
};

const blockP = {
  fontFamily: COURIER,
  fontSize: 'clamp(9px, 1vw, 14px)',
  fontWeight: 400,
  lineHeight: 1.45,
  color: '#1c1a18',
  margin: 0,
  marginTop: '0.35em',
  marginBottom: '0.35em',
};

/* ================================================================
   Projects page
   ================================================================ */

const PLACEHOLDER_PALETTES = [
  ['#e8e0d8', '#f2eee9', '#e0d7cc'],
  ['#f0ebe4', '#eae3db', '#f5f1ec'],
  ['#e5ddd5', '#f0ebe4', '#eae3db'],
  ['#ede6df', '#e8e0d8', '#f2eee9'],
];
  const PROJECTS = [
    {
      num: '01',
      title: 'TWISTED',
      subtitle: 'Wearable art and behavioral installation, 2020',
      desc: 'An exploration of childhood trauma and psychological metamorphosis resulting from fragmented family dynamics. Initiated by deeply personal observations of my sister\'s behavioral shifts following our parents\' divorce and intense conflicts, this project translates psychological distress into tangible sculptural forms. Grounded in preliminary behavioral experiments, the resulting garments function as wearable art installations that physically manifest the emotional tension, distortion, and vulnerability experienced by children in broken homes.',
      technique: 'Sculptural draping, behavioral data translation, wearable installation',
      material: 'Mixed media, structural textiles, experimental yarn',
      images: ['/images/p1-001.png', '/images/p1-01.png', '/images/p1-03.png', '/images/p1-05.png'],
    },
    {
      num: '02',
      title: 'MATERNITY FASHION',
      subtitle: 'Functional ergonomic collection, 2021',
      desc: 'A functional and empathetic approach to maternity wear, addressing the severe physiological strain pregnancy places on the waist and internal organs. The design actively redistributes and relieves abdominal pressure by engineering garments with strategically mapped varying elasticity coefficients. This project merges ergonomic research with fashion design to create a protective, supportive interface that prioritizes the physical well-being and daily comfort of expectant mothers without sacrificing aesthetic integrity.',
      technique: 'Ergonomic pattern cutting, tension mapping, strategic compression',
      material: 'Variable-elasticity textiles, high-recovery stretch fabrics',
      images: ['/images/p2-1.png', '/images/p2-2.png', '/images/p2-3.png', '/images/p2-4.png', '/images/p2-5.png'],
      youtubeId: 'PZ8a0BnimVI',
    },
    {
      num: '03',
      title: 'ALZHEIMER DISEASE PROJECT',
      subtitle: 'Adaptive winter wear and safety interface, 2021',
      desc: 'Driven by the personal anxiety surrounding my grandmother\'s battle with Alzheimer’s, this project redefines winter clothing as a protective caregiving tool. The garments are engineered with graphene-integrated fabrics strategically placed at the joints for advanced, lightweight thermal regulation. To ensure patient safety and provide peace of mind for families, the inner lining discreetly houses an embedded GPS tracking chip that automatically alerts caregivers if the wearer wanders beyond a designated safe radius.',
      technique: 'Smart textile integration, adaptive garment construction, thermal engineering',
      material: 'Graphene-infused fabrics, winter textiles, GPS microchips',
      images: ['/images/p3-1.png', '/images/p3-2.png', '/images/p3-3.png', '/images/p3-4.png', '/images/p3-5.png'],
      youtubeId: 'kAOLBD1FQvY',
    },
    {
      num: '04',
      title: 'RELICS OF EXISTENCE: BREATHING ARCHIVES OF CARE',
      subtitle: 'Interactive bio-feedback textile series, 2023–2026',
      desc: 'A rigorous, ongoing investigation into the profound relationship between humans, stray animals, and domestic pets, deeply inspired by my father\'s animal rescue shelter. Shed hair from both strays and domestic pets is collected, spun, and woven using a complex double-weave technique—positioning stray hair on the upper layer and pet hair on the lower. Embedded within the fabric\'s interlayers are custom pneumatic devices driven by the translated EEG (brainwave) data of shelter workers caring for the animals. The resulting textile operates as a “breathing” archive, physically manifesting the invisible emotional labor and empathy exchanged within the shelter ecosystem.',
      technique: 'Double-weave, hand-spinning, bio-data translation (EEG), pneumatic engineering',
      material: 'Upcycled stray and domestic animal hair yarn, pneumatic actuators, micro-controllers',
      images: ['/images/p4-1.png', '/images/p4-2.png', '/images/p4-3.png', '/images/p4-4.png', '/images/p4-5.png'],
      youtubeId: 'L1rM3SrUuJ4',
    },
  ];

function PlaceholderImage({ index, variant, src }) {
  const palette = PLACEHOLDER_PALETTES[index % PLACEHOLDER_PALETTES.length];
  const v = variant ?? 0;

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
      />
    );
  }

  return (
    <>
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          background: `
            linear-gradient(${135 + v * 25}deg,
              ${palette[0]} 0%,
              ${palette[1]} 40%,
              ${palette[2]} 100%)
          `,
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 400 300" preserveAspectRatio="none">
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={i}
            x1={Math.sin(i * 7 + v) * 50 + 10}
            y1={i * 28 + v * 5}
            x2={Math.cos(i * 11 + v) * 60 + 390}
            y2={i * 30 + 3}
            stroke="#8b7e6a"
            strokeWidth="0.5"
          />
        ))}
      </svg>
    </>
  );
}

function GalleryImage({ children, gridColumn, gridRow, aspectRatio, onEnter, onLeave }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden bg-white cursor-none"
      style={{ gridColumn, gridRow, aspectRatio }}
      whileHover={{ scale: 1.03 }}
      animate={hovered ? { y: [0, -1, 0, -1, 0] } : { y: 0 }}
      transition={{
        scale: { type: 'spring', stiffness: 350, damping: 22 },
        y: { duration: 0.45, ease: 'easeInOut' },
      }}
      onMouseEnter={() => { setHovered(true); onEnter?.(); }}
      onMouseLeave={() => { setHovered(false); onLeave?.(); }}
    >
      {children}

      {/* Top stitch line */}
      <motion.span
        className="absolute top-0 left-0 h-[1.5px] w-full origin-left z-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(to right, #1c1a18 0px, #1c1a18 3px, transparent 3px, transparent 7px)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Bottom stitch line */}
      <motion.span
        className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left z-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(to right, #1c1a18 0px, #1c1a18 3px, transparent 3px, transparent 7px)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Embroidered dashed frame */}
      <motion.span
        className="absolute inset-0 pointer-events-none z-10"
        style={{ border: '1px dashed #1c1a18', margin: '2px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 0.35 : 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Corner stitch marks */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
        <motion.span
          key={corner}
          className="absolute z-10 pointer-events-none"
          style={{
            width: 10, height: 10,
            [corner.includes('top') ? 'top' : 'bottom']: 4,
            [corner.includes('left') ? 'left' : 'right']: 4,
            borderTop: corner.includes('top') ? '1px solid #1c1a18' : 'none',
            borderBottom: corner.includes('bottom') ? '1px solid #1c1a18' : 'none',
            borderLeft: corner.includes('left') ? '1px solid #1c1a18' : 'none',
            borderRight: corner.includes('right') ? '1px solid #1c1a18' : 'none',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0 }}
          transition={{ duration: 0.3, delay: hovered ? 0.2 : 0, ease: [0.25, 0.1, 0.25, 1] }}
        />
      ))}
    </motion.div>
  );
}


function ProjectsPage({ onClose, onEnter, onLeave }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [infoStep, setInfoStep] = useState(0);
  const [showBody, setShowBody] = useState(false);

  const project = PROJECTS[activeIndex];
  const imageCount = project.images?.length || 8;

  // ---- Reveal animation: reset on project change ----
  useEffect(() => {
    setInfoStep(0);
    setShowBody(false);

    // Stagger info items: faster (60ms each)
    const infoTimer = setInterval(() => {
      setInfoStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 60);

    // Reveal body after info items
    const bodyDelay = setTimeout(() => {
      setShowBody(true);
    }, 300);

    return () => {
      clearInterval(infoTimer);
      clearTimeout(bodyDelay);
    };
  }, [activeIndex]);

  const contentVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };
  const contentTransition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] };

  const navigateTo = useCallback((index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setActiveVariant(0);
  }, [activeIndex]);

  return (
    <OverlayPage onClose={onClose} onEnter={onEnter} onLeave={onLeave}>
      <motion.div
        className="flex flex-col w-full h-full"
        style={{ fontFamily: COURIER }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* ======== Main content row ======== */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 min-h-0 pt-6 sm:pt-8 md:pt-10 px-4 sm:px-6 md:px-10">

          {/* ===== Left column: text + image + desc ===== */}
          <div
            className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {/* ---- Project info ---- */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`info-${project.num}`}
                className="flex flex-col gap-1 flex-shrink-0 pb-3 sm:pb-4"
              >
                <motion.span
                  className="text-[11px] sm:text-[12px] tracking-[0.18em]"
                  style={{ color: '#1c1a18', opacity: 0.4 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: infoStep >= 1 ? 0.4 : 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {project.num} /
                </motion.span>
                <motion.h3
                  className="text-[clamp(1.2rem,2.8vw,2.4rem)] font-bold tracking-[0.06em] uppercase m-0 leading-tight"
                  style={{ color: '#1c1a18' }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: infoStep >= 2 ? 1 : 0, y: infoStep >= 2 ? 0 : 4 }}
                  transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {project.title}
                </motion.h3>
                <motion.span
                  className="text-[11px] sm:text-[12px] tracking-[0.08em] italic mt-0.5"
                  style={{ color: '#1c1a18', opacity: 0.5 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: infoStep >= 3 ? 0.5 : 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {project.subtitle}
                </motion.span>
              </motion.div>
            </AnimatePresence>

            {/* ---- Main image + Video row ---- */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`img-${project.num}`}
                className="flex flex-col md:flex-row md:items-start gap-4 my-3 sm:my-4 flex-shrink-0"
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={contentTransition}
              >
                {/* ---- Main image ---- */}
                <div
                  className="relative overflow-hidden bg-white border border-dashed border-[#1c1a18]/15"
                  style={{ flex: '2 1 0%', aspectRatio: '16/9', maxHeight: '42vh' }}
                >
                  <PlaceholderImage index={activeIndex} variant={activeVariant} src={project.images?.[activeVariant]} />

                  {/* Image counter badge */}
                  <span
                    className="absolute bottom-3 right-3 text-[10px] tracking-[0.1em] px-2 py-1 bg-white/70"
                    style={{ color: '#1c1a18', opacity: 0.5, fontFamily: COURIER }}
                  >
                    {String(activeVariant + 1).padStart(2, '0')} / {String(imageCount).padStart(2, '0')}
                  </span>
                </div>

                {/* ---- YouTube promo video ---- */}
                {project.youtubeId && (
                  <div
                    className="relative overflow-hidden bg-[#f5f5f5] border border-dashed border-[#1c1a18]/15 group w-full md:w-auto"
                    style={{ flex: '1 1 0%', minWidth: '160px', maxWidth: '550px', aspectRatio: '16/9' }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${project.youtubeId}?controls=1&modestbranding=1&rel=0&showinfo=0`}
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${project.title} — promotional video`}
                    />
                    {/* Subtle label */}
                    <span
                      className="absolute top-2 left-2 text-[9px] tracking-[0.1em] px-1.5 py-0.5 bg-white/60 pointer-events-none"
                      style={{ color: '#1c1a18', opacity: 0.45, fontFamily: COURIER }}
                    >
                      Promo
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ---- Description + metadata ---- */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`desc-${project.num}`}
                className="flex flex-col gap-3 flex-shrink-0 pt-3 border-t border-[#1c1a18]/[0.08] md:max-w-[60%]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <motion.p
                    className="text-[11px] sm:text-[12px] tracking-[0.04em] leading-[1.8] m-0"
                    style={{ color: '#1c1a18' }}
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ clipPath: showBody ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
                    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {project.desc}
                  </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <motion.div
                    className="flex gap-2 text-[10px] sm:text-[11px] tracking-[0.05em]"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: infoStep >= 4 ? 1 : 0, x: infoStep >= 4 ? 0 : -6 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <span style={{ color: '#1c1a18', opacity: 0.35, flexShrink: 0 }}>Technique</span>
                    <span style={{ color: '#1c1a18', opacity: 0.65 }}>{project.technique}</span>
                  </motion.div>
                  <motion.div
                    className="flex gap-2 text-[10px] sm:text-[11px] tracking-[0.05em]"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: infoStep >= 5 ? 1 : 0, x: infoStep >= 5 ? 0 : -6 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <span style={{ color: '#1c1a18', opacity: 0.35, flexShrink: 0 }}>Material</span>
                    <span style={{ color: '#1c1a18', opacity: 0.65 }}>{project.material}</span>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ===== Right column: desktop thumbnails ===== */}
          <div
            className="hidden md:flex flex-col gap-3 flex-shrink-0 pt-10 sm:pt-12 hide-scrollbar"
            style={{ width: '150px', overflowY: 'auto', overflowX: 'hidden', paddingLeft: '15px', paddingRight: '15px' }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {Array.from({ length: imageCount }, (_, i) => i).map((variant) => (
              <motion.div
                key={`${activeIndex}-${variant}`}
                className="relative flex-shrink-0 cursor-none overflow-hidden bg-white"
                style={{ aspectRatio: '3/4', border: '1px dashed rgba(28,26,24,0.15)' }}
                onClick={() => setActiveVariant(variant)}
                whileHover={{ scale: 1.18, zIndex: 50, boxShadow: '0 12px 18px -10px rgba(28,26,24,0.18)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.8 }}
              >
                <PlaceholderImage index={activeIndex} variant={variant} src={project.images?.[variant]} />

                {/* Active thumbnail indicator */}
                {activeVariant === variant && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    layoutId="thumbActive"
                    style={{ border: '1px solid #1c1a18' }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}

                {/* Variant number */}
                <span
                  className="absolute top-1.5 left-1.5 text-[9px] tracking-[0.08em] px-1 py-0.5 bg-white/60"
                  style={{ color: '#1c1a18', opacity: 0.5, fontFamily: COURIER }}
                >
                  {String(variant + 1).padStart(2, '0')}
                </span>
              </motion.div>
            ))}
          </div>

          {/* ===== Mobile: horizontal thumbnail row ===== */}
          <div
            className="flex md:hidden gap-3 overflow-x-auto pb-2 flex-shrink-0 hide-scrollbar"
            style={{ overflowY: 'visible' }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {Array.from({ length: imageCount }, (_, i) => i).map((variant) => (
              <motion.div
                key={`${activeIndex}-${variant}`}
                className="relative flex-shrink-0 cursor-none overflow-hidden bg-white"
                style={{ width: '64px', aspectRatio: '3/4', border: '1px dashed rgba(28,26,24,0.15)' }}
                onClick={() => setActiveVariant(variant)}
                whileHover={{ scale: 1.18, zIndex: 50, boxShadow: '0 12px 18px -10px rgba(28,26,24,0.18)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.8 }}
              >
                <PlaceholderImage index={activeIndex} variant={variant} src={project.images?.[variant]} />

                {activeVariant === variant && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    layoutId="thumbActiveMobile"
                    style={{ border: '1px solid #1c1a18' }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ======== Bottom: floating project navigation ======== */}
        <div className="flex-shrink-0 flex items-center justify-center gap-7 sm:gap-10 md:gap-14 pb-3 sm:pb-5 pt-1 sm:pt-2">
          {PROJECTS.map((p, i) => (
            <motion.button
              key={p.num}
              onClick={() => navigateTo(i)}
              className="relative bg-transparent border-none p-1.5 cursor-none text-[12px] sm:text-[13px] tracking-[0.18em] uppercase"
              style={{
                fontFamily: COURIER,
                color: '#1c1a18',
                fontWeight: i === activeIndex ? 700 : 400,
                opacity: i === activeIndex ? 1 : 0.35,
              }}
              whileHover={{ scale: 1.06, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {p.num}

              {/* Active indicator line */}
              {i === activeIndex && (
                <motion.span
                  layoutId="navIndicator"
                  className="absolute -bottom-0.5 left-0 h-[2px] w-full"
                  style={{
                    background:
                      'repeating-linear-gradient(to right, #1c1a18 0px, #1c1a18 3px, transparent 3px, transparent 7px)',
                  }}
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </OverlayPage>
  );
}

/* ================================================================
   Main App
   ================================================================ */

export default function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [popStep, setPopStep] = useState(1); // 1-24=reel, 25=original, 26=slow enlarge (start at 1 so first images are already in place)
  const reelSeq = useRef(buildReelSequence());
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  /* ---- mouse position ---- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 550, damping: 48 });
  const smoothY = useSpring(mouseY, { stiffness: 550, damping: 48 });

  /* ---- thread trail ---- */
  const trailRef = useRef([]);
  const polylineRef = useRef(null);
  const polyline2Ref = useRef(null);
  const stitchesRef = useRef(null);
  const stitchMarks = useRef([]);
  const frameCount = useRef(0);
  const MAX_TRAIL = 50;
  const STITCH_LIFETIME = 2200; // ms before a stitch mark fades out

  /* ---- weave overlay ---- */
  const [weaveVisible, setWeaveVisible] = useState(false);
  const weaveFadeTimer = useRef(null);
  const overInteractive = useRef(false);

  /* ---- animation frame: thread trail + 3D tilt ---- */
  useAnimationFrame(() => {
    const x = mouseX.get();
    const y = mouseY.get();
    if (x === 0 && y === 0) return;

    /* thread trail */
    trailRef.current.push({ x, y });
    if (trailRef.current.length > MAX_TRAIL) trailRef.current.shift();

    if (polylineRef.current && polyline2Ref.current) {
      const pts = trailRef.current.map((p) => `${p.x},${p.y}`).join(' ');
      polylineRef.current.setAttribute('points', pts);
      // Second thread: slight offset, shorter tail
      const trail2 = trailRef.current.slice(-Math.floor(MAX_TRAIL * 0.7));
      const pts2 = trail2.map((p) => `${p.x - 2},${p.y - 1.5}`).join(' ');
      polyline2Ref.current.setAttribute('points', pts2);
    }

    // Stitch marks: persistent cross-stitches that fade over time
    frameCount.current++;
    const now = performance.now();

    // Add new stitch mark every 3 frames (denser)
    if (frameCount.current % 3 === 0 && trailRef.current.length > 1) {
      const pts = trailRef.current;
      const last = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      const angle = Math.atan2(last.y - prev.y, last.x - prev.x) * (180 / Math.PI);
      const rad = angle * (Math.PI / 180);
      // Main stitch
      stitchMarks.current.push({ x: last.x, y: last.y, angle, time: now });
      // Parallel offset stitch (like double-needle sewing)
      const ox = Math.cos(rad) * 3.5;
      const oy = Math.sin(rad) * 3.5;
      stitchMarks.current.push({ x: last.x + ox, y: last.y + oy, angle, time: now });
      // Limit total marks
      if (stitchMarks.current.length > 500) stitchMarks.current.splice(0, 100);
    }

    // Remove expired marks
    stitchMarks.current = stitchMarks.current.filter(m => now - m.time < STITCH_LIFETIME);

    // Render stitch marks
    if (stitchesRef.current && stitchMarks.current.length > 0) {
      const size = 3; // half-size of cross arm
      const svg = stitchMarks.current.map(m => {
        const age = now - m.time;
        const life = Math.max(0, 1 - age / STITCH_LIFETIME);
        const alpha = 0.06 + life * 0.34; // 0.06 → 0.40
        const rad = m.angle * (Math.PI / 180);
        // Perpendicular dash
        const px = -Math.sin(rad) * size;
        const py = Math.cos(rad) * size;
        // Entry/exit holes (tiny dots at ends)
        const dots = `<circle cx="${m.x - px}" cy="${m.y - py}" r="0.5" fill="#1c1a18" opacity="${(alpha * 0.8).toFixed(3)}" />
          <circle cx="${m.x + px}" cy="${m.y + py}" r="0.5" fill="#1c1a18" opacity="${(alpha * 0.8).toFixed(3)}" />`;
        return `${dots}<line x1="${m.x - px}" y1="${m.y - py}" x2="${m.x + px}" y2="${m.y + py}" stroke="#1c1a18" stroke-width="0.65" stroke-linecap="round" opacity="${alpha.toFixed(3)}" />`;
      }).join('');
      stitchesRef.current.innerHTML = svg;
    }

    /* pseudo-3D tilt — only when on main page and reel complete */
    if (currentPage === 'main' && popStep >= 25 && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const relX = (x - cx) / (rect.width / 2);   // -1 … 1
      const relY = (y - cy) / (rect.height / 2);   // -1 … 1
      tiltX.set(-relY * 28);  // pitch: up/down → rotateX
      tiltY.set(relX * 28);   // yaw: left/right → rotateY
    } else {
      tiltX.set(0);
      tiltY.set(0);
    }
  });

  /* ---- touch detection ---- */
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  /* ---- mouse move ---- */
  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!overInteractive.current) {
        setWeaveVisible(true);
        clearTimeout(weaveFadeTimer.current);
        weaveFadeTimer.current = setTimeout(() => setWeaveVisible(false), 1800);
      }
    };

    const handleLeave = () => {
      trailRef.current = [];
      if (polylineRef.current) polylineRef.current.setAttribute('points', '');
      if (polyline2Ref.current) polyline2Ref.current.setAttribute('points', '');
      if (stitchesRef.current) stitchesRef.current.innerHTML = '';
      stitchMarks.current = [];
      setWeaveVisible(false);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      clearTimeout(weaveFadeTimer.current);
    };
  }, [mouseX, mouseY]);

  /* ---- interactive area callbacks ---- */
  const onInteractiveEnter = useCallback(() => {
    overInteractive.current = true;
    setWeaveVisible(false);
    clearTimeout(weaveFadeTimer.current);
  }, []);

  const onInteractiveLeave = useCallback(() => {
    overInteractive.current = false;
  }, []);

  /* ---- pseudo-3D tilt on central image ---- */
  const imageContainerRef = useRef(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const smoothTiltX = useSpring(tiltX, { stiffness: 80, damping: 20 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 80, damping: 20 });

  /* ---- needle offset (point at ≈ (11, 42)) ---- */
  const needleX = useTransform(smoothX, (x) => x - 14);
  const needleY = useTransform(smoothY, (y) => y - 28);

  /* ---- auto-scroll rolling-reel reveal for main page fabric images ---- */
  useEffect(() => {
    if (currentPage !== 'main') {
      setPopStep(1);
      return;
    }
    reelSeq.current = buildReelSequence();
    setPopStep(1);
    const TOTAL = 24;
    const INTERVAL = 220;
    const timers = [];
    for (let i = 2; i <= TOTAL; i++) {
      timers.push(setTimeout(() => setPopStep(i), (i - 1) * INTERVAL));
    }
    timers.push(setTimeout(() => setPopStep(25), TOTAL * INTERVAL));
    timers.push(setTimeout(() => setPopStep(26), TOTAL * INTERVAL + 500));
    return () => timers.forEach(clearTimeout);
  }, [currentPage]);

  /* ---- page navigation ---- */
  const navigateTo = (page) => {
    if (page !== 'main') setPopStep(0);
    setCurrentPage(page);
  };

  const closePage = () => { setPopStep(1); setCurrentPage('main'); };

  /* ---- Render ---- */
  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
      {/* ============ Weave overlay ============ */}
      <div
        className="weave-layer"
        style={{ opacity: weaveVisible ? 1 : 0 }}
      />

      {/* ============ Thread trail (desktop only) ============ */}
      {!isTouchDevice && (
        <svg
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 9998, width: '100vw', height: '100vh' }}
        >
          {/* Main thread — thicker */}
          <polyline
            ref={polylineRef}
            fill="none"
            stroke="#1c1a18"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.32"
          />
          {/* Shadow thread — offset, thinner, shorter */}
          <polyline
            ref={polyline2Ref}
            fill="none"
            stroke="#1c1a18"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.18"
          />
          {/* Stitch marks */}
          <g ref={stitchesRef} />
        </svg>
      )}

      {/* ============ Needle cursor (desktop only) ============ */}
      {!isTouchDevice && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none text-3xl leading-none select-none"
          style={{ zIndex: 9999, x: needleX, y: needleY }}
        >
          🪡
        </motion.div>
      )}

      {/* ============ Main layout ============ */}
      {currentPage === 'main' && (
      <div className="absolute inset-5 sm:inset-9">
        {/* ---- Title + subtitle: upper area, horizontally centered ---- */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
          style={{ top: '10%' }}
        >
          <motion.h1
            className="text-[clamp(2.1rem,5.8vw,5rem)] font-bold tracking-[0.15em] uppercase m-0 leading-none select-none inline-block"
            style={{
              fontFamily: COURIER,
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
              WebkitTextStroke: '2px #000000',
              paintOrder: 'stroke fill',
              textShadow: 'none',
              padding: '0.08em 0.04em',
            }}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span style={{ fontStyle: 'italic' }}>seno</span> SHENG
          </motion.h1>
          <motion.p
            className="text-[#000000] text-[clamp(0.7rem,1vw,0.85rem)] tracking-[0.22em] uppercase m-0 mt-1 select-none"
            style={{ fontFamily: COURIER, fontStyle: 'italic' }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            TEXTILE ARTIST &amp; FASHION DESIGNER
          </motion.p>
        </div>

        {/* ---- Central fabric images (background layer, behind nav) ---- */}
        <motion.div
          ref={imageContainerRef}
          className="absolute inset-0 flex items-center justify-center z-0"
          style={{
            margin: 'auto',
            perspective: '800px',
            rotateX: smoothTiltX,
            rotateY: smoothTiltY,
          }}
          animate={popStep >= 25 ? { y: [0, -6, 0] } : {}}
          key={popStep >= 25 ? 'floating' : 'still'}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'mirror',
          }}
          onMouseEnter={onInteractiveEnter}
          onMouseLeave={onInteractiveLeave}
        >
          {/* Rolling reel: all images visible from the start, pure scroll movement */}
          {reelSeq.current.map((imgIdx, frameIdx) => {
            const step = frameIdx + 1; // 1-24
            const src = NEW_FABRIC_IMAGES[imgIdx];
            const dist = popStep - step;
            const isDone = popStep >= 25;
            const slotY = dist * 62;
            // All visible images have consistent opacity — no entrance fade
            const inView = dist >= -4 && dist <= 5;
            return (
              <motion.img
                key={`${frameIdx}-${imgIdx}`}
                src={src}
                alt={`Textile ${imgIdx + 1}`}
                className="absolute object-contain select-none pointer-events-none"
                style={{
                  maxWidth: '35vw',
                  maxHeight: '40vh',
                }}
                initial={{ y: slotY, scale: 0.9, opacity: inView ? 1 : 0 }}
                animate={
                  isDone
                    ? { y: slotY - 120, opacity: 0 }
                    : {
                        y: slotY,
                        scale: dist === 0 ? 1 : 1 - Math.abs(dist) * 0.04,
                        opacity: inView ? (dist === 0 ? 0.88 : 0.7) : 0,
                      }
                }
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 28,
                  mass: 0.45,
                }}
                draggable={false}
              />
            );
          })}

          {/* Ghost layer — offset duplicate behind main artwork for thickness */}
          <motion.img
            src={IMAGE_PATH}
            alt=""
            className="absolute object-contain select-none pointer-events-none"
            style={{
              maxWidth: '52vw',
              maxHeight: '76vh',
              filter: 'brightness(0)',
              transform: 'translate(4px, 6px)',
            }}
            initial={{ opacity: 0 }}
            animate={popStep >= 25 ? { opacity: 0.12 } : { opacity: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 20, mass: 0.6 }}
            draggable={false}
          />
          {/* Main artwork — lands after the reel, slowly enlarges */}
          <motion.img
            src={IMAGE_PATH}
            alt="Seno Sheng textile art"
            className="absolute object-contain select-none pointer-events-none"
            style={{
              maxWidth: '52vw',
              maxHeight: '76vh',
            }}
            initial={{ y: 260, scale: 0.4, opacity: 0 }}
            animate={
              popStep >= 26
                ? { y: 0, scale: 1.12, opacity: 0.7 }
                : popStep >= 25
                ? { y: 0, scale: [0.5, 1], opacity: [0, 0.7] }
                : { y: 260, scale: 0.4, opacity: 0 }
            }
            transition={
              popStep >= 26
                ? { type: 'spring', stiffness: 15, damping: 28, mass: 2.5 }
                : popStep >= 25
                ? { type: 'spring', stiffness: 140, damping: 20, mass: 0.6 }
                : {}
            }
            draggable={false}
          />
        </motion.div>

        {/* ---- Navigation: centered horizontal row with white highlight ---- */}
        <nav
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row items-center justify-center gap-x-4 sm:gap-x-8 md:gap-x-24 lg:gap-x-44 z-20"
          onMouseEnter={onInteractiveEnter}
          onMouseLeave={onInteractiveLeave}
        >
          {NAV_ITEMS.map((item, i) => (
            <motion.span
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.3 + i * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <NavLink
                active={currentPage === item.page}
                onClick={() => navigateTo(item.page)}
                onEnter={onInteractiveEnter}
                onLeave={onInteractiveLeave}
              >
                {item.label}
              </NavLink>
            </motion.span>
          ))}
        </nav>

        {/* ---- Footer: bottom-left corner info + bottom-right @2026 ---- */}
        <div
          className="absolute bottom-10 sm:bottom-16 left-4 sm:left-8 flex flex-col gap-0.5 text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-[#1c1a18]/55 select-none z-20"
          style={{ fontFamily: COURIER }}
        >
          <span>Design by @jingyi</span>
          <span>Materials by @SenoSheng</span>
        </div>
        <span
          className="absolute bottom-10 sm:bottom-16 right-4 sm:right-8 text-[11px] sm:text-[12px] tracking-[0.14em] text-[#1c1a18]/55 select-none z-20"
          style={{ fontFamily: COURIER }}
        >
          @2026
        </span>
      </div>
      )}

      {/* ============ Page overlays ============ */}
      <AnimatePresence>
        {currentPage === 'contact' && (
          <ContactPage
            key="contact"
            onClose={closePage}
            onEnter={onInteractiveEnter}
            onLeave={onInteractiveLeave}
          />
        )}
        {currentPage === 'about' && (
          <AboutPage
            key="about"
            onClose={closePage}
            onEnter={onInteractiveEnter}
            onLeave={onInteractiveLeave}
          />
        )}
        {currentPage === 'projects' && (
          <ProjectsPage
            key="projects"
            onClose={closePage}
            onEnter={onInteractiveEnter}
            onLeave={onInteractiveLeave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
