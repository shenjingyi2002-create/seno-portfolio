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
  { label: '(04) Personal Brand', page: 'brand' },
  { label: '(05) Contact', page: 'contact' },
];

const IMAGE_PATH = '/images/IMG_7527.PNG';

/* ================================================================
   Needle cursor SVG
   ================================================================ */

function NeedleIcon() {
  return (
    <svg
      width="22"
      height="48"
      viewBox="0 0 22 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Thread */}
      <path
        d="M11 2 C4 -4 0 1 0 5 C0 7 2 8 4 7"
        stroke="#1c1a18"
        strokeWidth="0.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Eye */}
      <ellipse cx="11" cy="10" rx="1" ry="3" fill="#ffffff" stroke="#1c1a18" strokeWidth="0.6" />
      {/* Shaft */}
      <line x1="11" y1="14" x2="11" y2="42" stroke="#1c1a18" strokeWidth="1" strokeLinecap="round" />
      {/* Point */}
      <polygon points="11,42 7.5,36 14.5,36" fill="#1c1a18" />
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
      className="relative inline-block bg-transparent border-none p-0 text-[#1c1a18] text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.18em] uppercase py-1.5 px-1 select-none cursor-none"
      style={{
        fontFamily: COURIER,
        fontWeight: active ? 700 : 400,
        opacity: active ? 1 : 0.75,
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
            'repeating-linear-gradient(to right, #1c1a18 0px, #1c1a18 3px, transparent 3px, transparent 7px)',
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
            'repeating-linear-gradient(to right, #1c1a18 0px, #1c1a18 3px, transparent 3px, transparent 7px)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Embroidered dashed frame */}
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{
          border: '1px dashed #1c1a18',
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
          className="flex flex-col gap-5 text-[13px] sm:text-[14px] tracking-[0.1em] text-[#1c1a18]/70 leading-relaxed"
          style={{ fontFamily: COURIER }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p>Email — hello@senosheng.com</p>
          <p>Instagram — @seno.sheng</p>
          <p>WeChat — seno_sheng</p>
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
      <div className="flex w-full h-full overflow-y-auto" style={{ fontFamily: COURIER }}>
        {/* ======== Left column: 50% — title only ======== */}
        <div className="w-1/2 flex-shrink-0 relative">
          <motion.div
            className="absolute top-0 left-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2
              style={{
                fontFamily: COURIER,
                fontSize: 'clamp(2rem, 6vw, 5.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 0.9,
                color: '#1c1a18',
                margin: 0,
                padding: 0,
              }}
            >
              Seno Sheng.
              <br />
              Textile Designer
              <br />
              &amp; Fiber Artist
            </h2>
          </motion.div>
        </div>

        {/* ======== Right column: 50% — CV blocks ======== */}
        <div className="w-1/2 flex-shrink-0" style={{ paddingTop: '40vh', paddingBottom: '20vh' }}>
          <motion.div
            className="flex flex-col"
            style={{ maxWidth: '70%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* ——— 2026 ——— */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
              <div style={{ marginBottom: '5vh' }}>
                <p style={blockYear}>2026</p>
                <p style={blockP}>
                  Current — developing new woven series exploring translucency and shadow through open-weave structures. Studio based in Hangzhou.
                </p>
                <p style={blockP}>
                  Preparing solo presentation for Shanghai Textile Art Fair, 2026.
                </p>
              </div>
            </motion.div>

            {/* ——— 2025 ——— */}
            <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
            <div style={{ marginBottom: '5vh' }}>
              <p style={blockYear}>2025</p>
              <p style={{ ...blockP, color: '#909090', marginTop: '0.5rem' }}>Awards:</p>
              <p style={blockP}>Emerging Fiber Artist Grant — Zhejiang Arts Fund</p>
              <p style={blockP}>“New Voices in Fiber” — Group exhibition, Hangzhou</p>
              <p style={{ ...blockP, color: '#909090', marginTop: '0.5rem' }}>Design &amp; Development:</p>
              <p style={blockP}>Website &amp; brand identity for seno sheng studio — Designed &amp; developed by @jingyi</p>
            </div>

            {/* ——— 2024 ——— */}
            <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
            <div style={{ marginBottom: '5vh' }}>
              <p style={blockYear}>2024</p>
              <p style={blockP}>B.A. Textile Design — China Academy of Art</p>
              <p style={blockP}>Residency — Jingdezhen International Studio</p>
              <p style={blockP}>Best Material Innovation — CAA Degree Show</p>
              <p style={blockP}>“Material Dialogues” — Shanghai Textile Biennale (group)</p>
              <p style={blockP}>Graduation showcase — CAA Museum, Hangzhou</p>
            </div>

            {/* ——— 2023 ——— */}
            <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
            <div style={{ marginBottom: '5vh' }}>
              <p style={blockYear}>2023</p>
              <p style={blockP}>Workshop: Natural Dye &amp; Fiber Preparation — Sichuan</p>
              <p style={blockP}>Finalist — National Textile Design Competition</p>
              <p style={blockP}>“Woven Narratives” — Hangzhou Craft Week (group)</p>
              <p style={{ ...blockP, color: '#909090', marginTop: '0.5rem' }}>Techniques:</p>
              <p style={blockP}>Hand-weaving (floor loom, frame loom, tapestry)</p>
              <p style={blockP}>Free-motion machine embroidery &amp; hand-stitching</p>
              <p style={blockP}>Natural dyeing (indigo fermentation, tannin, cochineal)</p>
              <p style={blockP}>Digital embroidery &amp; jacquard design</p>
              <p style={blockP}>Soft sculpture &amp; three-dimensional textile construction</p>
            </div>

            {/* ——— Representation ——— */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div style={{ marginBottom: '1vh', borderBottom: '1px solid #1c1a18', paddingBottom: '3vh', opacity: 0.15 }} />
              <div style={{ marginBottom: '5vh' }}>
                <p style={{ ...blockP, color: '#909090' }}>Representation &amp; contact:</p>
                <p style={blockP}>For commissions, collaborations, or material inquiries —<br/>please get in touch via the Contact page.</p>
                <p style={blockP}>Portfolio &amp; CV available upon request.</p>
                <p style={blockP}>Instagram — @seno.sheng</p>
                <p style={blockP}>Email — hello@senosheng.com</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </OverlayPage>
  );
}

/* Inline styles for body text — mirroring reference 1.1vw / 1.45 line-height */
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
      title: 'Woven Light',
      subtitle: 'Hand-woven textile series, 2025',
      desc: 'An ongoing exploration of translucency and shadow through open-weave structures. Each piece is hand-woven on a floor loom using a combination of mercerized cotton, raw silk, and monofilament. The series investigates how light passes through layered warp and weft, creating shifting moire patterns that change with the viewer\'s position and the time of day. Early samples were developed during a residency in Jingdezhen, where the porcelain-making tradition informed a material-language of tension between opacity and transparency.',
      technique: 'Hand-weaving, open-weave, multi-selvedge',
      material: 'Mercerized cotton, raw silk, monofilament, paper yarn',
    },
    {
      num: '02',
      title: 'Soft Structures',
      subtitle: 'Three-dimensional textile forms, 2025',
      desc: 'Experimental works at the boundary of sculpture and functional textile. These pieces begin as flat woven panels that are then manipulated through strategic darting, gathering, and heat-setting to achieve three-dimensional volume without cutting or seam insertion. The resulting forms hold their shape through internal tension alone — a method inspired by the bias-cut techniques of Madeleine Vionnet, translated into a hand-weaving context. Each structure is self-supporting yet retains the inherent drape and tactility of cloth.',
      technique: 'Double-weave, differential shrinkage, heat-setting',
      material: 'Wool, elastic yarn, cotton-linen blend, thermoplastic fiber',
    },
    {
      num: '03',
      title: 'Thread Drawings',
      subtitle: 'Embroidered works on translucent ground, 2024–2025',
      desc: 'A series of free-motion embroidered sketches on translucent organza that map gesture and material memory. The thread becomes a drawing tool — each stitch a mark, each density shift a tonal value. Subjects are drawn from personal archives: fragments of handwriting, worn garment traces, the grain lines of a family photograph. The translucency of the ground allows layered pieces to be viewed in superposition, so that hung as an installation they create a composite, shifting image that no single piece holds alone.',
      technique: 'Free-motion machine embroidery, hand-stitching, layering',
      material: 'Silk organza, cotton thread, polyester thread, tracing paper',
    },
    {
      num: '04',
      title: 'Material Studies',
      subtitle: 'Ongoing fiber research and sample development',
      desc: 'A living library of woven samples, dye tests, and fiber experiments that underpin the studio\'s larger works. Current directions include: natural indigo fermentation and its effect on tensile strength of hemp yarn; bark-based tannin mordants for cellulose fibers; and the structural possibilities of weaving with deconstructed recycled garments as weft. These studies are both technical record and aesthetic compass — the site where intuition meets repeatable process.',
      technique: 'Natural dyeing, recycled-fiber weaving, sample documentation',
      material: 'Indigo, tannin, hemp, recycled cotton, linen, raw silk',
    },
  ];

function PlaceholderImage({ index, variant }) {
  const palette = PLACEHOLDER_PALETTES[index % PLACEHOLDER_PALETTES.length];
  const v = variant ?? 0;
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
      className="relative overflow-hidden bg-[#f5f3f0] cursor-none"
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

            {/* ---- Main image ---- */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`img-${project.num}`}
                className="relative overflow-hidden bg-[#f5f3f0] my-3 sm:my-4 border border-dashed border-[#1c1a18]/15 flex-shrink-0"
                style={{ aspectRatio: '16/9', maxHeight: '42vh' }}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={contentTransition}
              >
                <PlaceholderImage index={activeIndex} variant={activeVariant} />

                {/* Image counter badge */}
                <span
                  className="absolute bottom-3 right-3 text-[10px] tracking-[0.1em] px-2 py-1 bg-white/70"
                  style={{ color: '#1c1a18', opacity: 0.5, fontFamily: COURIER }}
                >
                  {String(activeVariant + 1).padStart(2, '0')} / 08
                </span>
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
            className="hidden md:flex flex-col gap-3 overflow-y-auto flex-shrink-0 hide-scrollbar pt-10 sm:pt-12"
            style={{ width: '120px' }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {Array.from({ length: 8 }, (_, i) => i).map((variant) => (
              <motion.div
                key={`${activeIndex}-${variant}`}
                className="relative flex-shrink-0 cursor-none overflow-hidden bg-[#f5f3f0] border border-dashed border-[#1c1a18]/15"
                style={{ aspectRatio: '3/4' }}
                onClick={() => setActiveVariant(variant)}
                whileHover={{ scale: 1.18, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.8 }}
              >
                <PlaceholderImage index={activeIndex} variant={variant} />

                {/* Active thumbnail indicator */}
                {activeVariant === variant && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    layoutId="thumbActive"
                    style={{ border: '2px solid #1c1a18' }}
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
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {Array.from({ length: 8 }, (_, i) => i).map((variant) => (
              <motion.div
                key={`${activeIndex}-${variant}`}
                className="relative flex-shrink-0 cursor-none overflow-hidden bg-[#f5f3f0] border border-dashed border-[#1c1a18]/15"
                style={{ width: '64px', aspectRatio: '3/4' }}
                onClick={() => setActiveVariant(variant)}
                whileHover={{ scale: 1.18, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.8 }}
              >
                <PlaceholderImage index={activeIndex} variant={variant} />

                {activeVariant === variant && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    layoutId="thumbActiveMobile"
                    style={{ border: '2px solid #1c1a18' }}
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
   Brand page
   ================================================================ */

/* ---- Brand shop data ---- */
  /*
   * aspect ratios chosen for fashion/clothing display:
   *   2/3  — tall portrait (full look / editorial)
   *   3/4  — portrait (outfit shot)
   *   1/1  — square (product detail)
   *   4/3  — landscape (texture close-up)
   *   3/2  — wide landscape (fabric / process)
   * height tiers: tall > medium > short  for visual rhythm
   */
  const BRAND_ITEMS = [
    { title: 'Woven Light — Scarf Edition',  price: 'Limited',      aspect: '2/3', height: 'tall',   material: 'Handwoven silk blend' },
    { title: 'Studio Apron Series',          price: 'Prototype',     aspect: '3/4', height: 'tall',   material: 'Linen + indigo dye' },
    { title: 'Material Sample Kit',          price: 'Available',     aspect: '1/1', height: 'short',  material: '12 mixed textiles' },
    { title: 'Thread Drawings — Print Set',  price: 'Limited',       aspect: '3/2', height: 'medium', material: 'Risograph, 5 prints' },
    { title: 'Indigo Dyed Bandana',          price: 'Sold out',      aspect: '3/4', height: 'medium', material: 'Organic cotton' },
    { title: 'Soft Structures — Zine',       price: 'Available',     aspect: '3/2', height: 'short',  material: '36 pages, staple bound' },
    { title: 'Handwoven Coasters (Set of 4)',price: 'Available',     aspect: '1/1', height: 'short',  material: 'Cotton + hemp' },
    { title: 'Studio Postcard Collection',   price: 'Available',     aspect: '4/3', height: 'medium', material: '6 cards, letterpress' },
    { title: 'Fiber & Form — Lookbook',      price: 'Coming soon',   aspect: '2/3', height: 'tall',   material: 'SS26 collection' },
  ];

function BrandPage({ onClose, onEnter, onLeave }) {
  return (
    <OverlayPage onClose={onClose} onEnter={onEnter} onLeave={onLeave}>
      <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto" style={{ fontFamily: COURIER }}>
        {/* ======== Left: brand introduction (fixed, no horizontal scroll) ======== */}
        <motion.div
          className="flex-shrink-0 w-full md:w-[28%] lg:w-[25%] flex flex-col gap-6 md:gap-8 pr-0 md:pr-8 lg:pr-10 pb-8 md:pb-0 pt-12 sm:pt-14 md:pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Title */}
          <div className="flex flex-col gap-2">
            <h2
              className="text-[clamp(1.3rem,3vw,2.2rem)] font-bold tracking-[0.04em] leading-[1.05] m-0"
              style={{ color: '#1c1a18' }}
            >
              Personal
              <br />
              Brand.
            </h2>
            {/* Stitch divider */}
            <span
              className="block w-full h-[1.5px] mt-2"
              style={{
                background: 'repeating-linear-gradient(to right, #1c1a18 0px, #1c1a18 3px, transparent 3px, transparent 8px)',
                opacity: 0.2,
              }}
            />
          </div>

          {/* Description */}
          <p
            className="text-[10px] sm:text-[11px] tracking-[0.04em] leading-[1.65] m-0"
            style={{ color: '#1c1a18', opacity: 0.6 }}
          >
            seno sheng is an independent textile design studio based in Hangzhou. The practice centers on handcrafted materials, sustainable fiber processes, and the poetics of cloth — where each piece is both functional object and tactile narrative.
          </p>

          <p
            className="text-[10px] sm:text-[11px] tracking-[0.04em] leading-[1.65] m-0"
            style={{ color: '#1c1a18', opacity: 0.45 }}
          >
            The studio produces limited-run wearable pieces, home goods, print editions, and material sample kits — each developed through hand-weaving, natural dyeing, and digital embroidery techniques.
          </p>

          {/* Footer note */}
          <div className="mt-auto pt-8">
            <p
              className="text-[9px] sm:text-[10px] tracking-[0.06em] leading-[1.6] m-0"
              style={{ color: '#1c1a18', opacity: 0.35 }}
            >
              For orders &amp; inquiries —<br />
              visit the Contact page or DM<br />
              @seno.sheng on Instagram.
            </p>
          </div>
        </motion.div>

        {/* ======== Right: scattered editorial layout ======== */}
        <motion.div
          className="flex-1 min-w-0 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {BRAND_ITEMS.map((item, i) => (
            <BrandItem key={i} item={item} index={i} onEnter={onEnter} onLeave={onLeave} />
          ))}
        </motion.div>
      </div>
    </OverlayPage>
  );
}

/* ---- Deterministic layout seed for scattered positioning ---- */
function seedRand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function brandLayout(index) {
  const r1 = seedRand(index * 1.7);
  const r2 = seedRand(index * 3.1);
  const r3 = seedRand(index * 5.3);

  /* Quasi-grid: 3 cols × 3 rows (9 items), with ±jitter in each cell */
  const col = index % 3;          // 0, 1, 2
  const row = Math.floor(index / 3); // 0, 1, 2

  const jitter = 7;               // ±7% within cell
  const colBase = [2, 35, 67][col];
  const rowBase = [2, 34, 66][row];
  const left = colBase + (r1 - 0.5) * jitter * 2;
  const top  = rowBase + (r2 - 0.5) * jitter * 2;

  /* Size: per-column variation for rhythm */
  const sizeMap = [
    ['md', 'sm', 'lg'],   // row 0
    ['lg', 'md', 'sm'],   // row 1
    ['sm', 'lg', 'md'],   // row 2
  ];
  const size = sizeMap[row][col];

  /* Width by tier — slightly smaller to reduce overlap */
  const w = size === 'lg' ? 220 : size === 'md' ? 170 : 125;

  return { left, top, size, width: w };
}

function BrandItem({ item, index, onEnter, onLeave }) {
  const [hovered, setHovered] = useState(false);
  const layout = brandLayout(index);

  /* Height from width ÷ aspect ratio */
  const aspectToDecimal = (a) => {
    const [w, h] = a.split('/').map(Number);
    return w / h;
  };
  const cardW = layout.width;
  const cardH = cardW / aspectToDecimal(item.aspect);

  return (
    <motion.div
      className="absolute cursor-none group"
      style={{
        left: `${layout.left}%`,
        top: `${layout.top}%`,
        width: cardW,
        zIndex: hovered ? 40 : 10,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.04 }}
      onMouseEnter={() => { setHovered(true); onEnter?.(); }}
      onMouseLeave={() => { setHovered(false); onLeave?.(); }}
    >
      {/* —— Image container —— */}
      <div
        className="relative overflow-hidden bg-[#f5f3f0]"
        style={{ height: cardH }}
      >
        {/* Inner zoom wrapper */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <PlaceholderImage index={index} variant={index % 4} />
        </motion.div>

        {/* —— Material info slide-up panel —— */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none
                     bg-[#1c1a18]/[0.88] backdrop-blur-[2px] px-2.5 py-1.5"
          initial={{ y: '100%' }}
          animate={{ y: hovered ? 0 : '100%' }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span
            className="text-white text-[8px] sm:text-[9px] tracking-[0.05em]"
            style={{ fontFamily: COURIER }}
          >
            {item.material}
          </span>
        </motion.div>

        {/* Hover stitch overlays */}
        <motion.span
          className="absolute top-0 left-0 h-[1.5px] w-full origin-left z-10 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(to right, #1c1a18 0px, #1c1a18 3px, transparent 3px, transparent 7px)',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
        />
        <motion.span
          className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left z-10 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(to right, #1c1a18 0px, #1c1a18 3px, transparent 3px, transparent 7px)',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        />
        <motion.span
          className="absolute inset-0 pointer-events-none z-10"
          style={{ border: '1px dashed #1c1a18', margin: '2px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 0.3 : 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* —— Label: title + price —— */}
      <div className="flex justify-between items-baseline gap-1.5 mt-1.5">
        <span
          className="text-[10px] sm:text-[11px] tracking-[0.04em] leading-tight truncate"
          style={{
            color: '#1c1a18',
            opacity: hovered ? 1 : 0.7,
            fontWeight: hovered ? 700 : 400,
            transition: 'opacity 0.3s, font-weight 0.3s',
          }}
        >
          {item.title}
        </span>
        <span
          className="text-[9px] sm:text-[10px] tracking-[0.08em] uppercase flex-shrink-0"
          style={{
            color: '#1c1a18',
            opacity: item.price === 'Sold out' ? 0.25 : hovered ? 0.6 : 0.45,
            transition: 'opacity 0.3s',
          }}
        >
          {item.price}
        </span>
      </div>
    </motion.div>
  );
}

/* ================================================================
   Main App
   ================================================================ */

export default function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  /* ---- mouse position ---- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 550, damping: 48 });
  const smoothY = useSpring(mouseY, { stiffness: 550, damping: 48 });

  /* ---- thread trail ---- */
  const trailRef = useRef([]);
  const polylineRef = useRef(null);
  const MAX_TRAIL = 40;

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

    if (polylineRef.current) {
      const pts = trailRef.current.map((p) => `${p.x},${p.y}`).join(' ');
      polylineRef.current.setAttribute('points', pts);
    }

    /* pseudo-3D tilt — only when on main page */
    if (currentPage === 'main' && imageContainerRef.current) {
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
  const needleX = useTransform(smoothX, (x) => x - 11);
  const needleY = useTransform(smoothY, (y) => y - 42);

  /* ---- page navigation ---- */
  const navigateTo = (page) => {
    if (page === 'main') {
      setCurrentPage('main');
    } else {
      setCurrentPage(page);
    }
  };

  const closePage = () => setCurrentPage('main');

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
          <polyline
            ref={polylineRef}
            fill="none"
            stroke="#1c1a18"
            strokeWidth="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.28"
          />
        </svg>
      )}

      {/* ============ Needle cursor (desktop only) ============ */}
      {!isTouchDevice && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none"
          style={{ zIndex: 9999, x: needleX, y: needleY, rotate: 36 }}
        >
          <NeedleIcon />
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
            className="text-[clamp(1.6rem,5.5vw,4.8rem)] font-bold tracking-[0.15em] uppercase m-0 leading-none select-none inline-block"
            style={{
              fontFamily: COURIER,
              backgroundImage: `url(${IMAGE_PATH})`,
              backgroundSize: '120% 120%',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: '0.6px #1c1a18',
              textShadow: 'none',
              padding: '0.08em 0.04em',
              WebkitBoxDecorationBreak: 'clone',
              boxDecorationBreak: 'clone',
            }}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span style={{ fontStyle: 'italic' }}>seno</span> SHENG
          </motion.h1>
          <motion.p
            className="text-[#1c1a18]/65 text-[clamp(0.7rem,1vw,0.85rem)] tracking-[0.22em] uppercase m-0 mt-1 select-none"
            style={{ fontFamily: COURIER, fontStyle: 'italic' }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Textile Designer
          </motion.p>
        </div>

        {/* ---- Central cutout image (background layer, behind nav) ---- */}
        <motion.div
          ref={imageContainerRef}
          className="absolute inset-0 flex items-center justify-center z-0"
          style={{
            margin: 'auto',
            perspective: '800px',
            rotateX: smoothTiltX,
            rotateY: smoothTiltY,
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'mirror',
          }}
          onMouseEnter={onInteractiveEnter}
          onMouseLeave={onInteractiveLeave}
        >
          <img
            src={IMAGE_PATH}
            alt="Seno Sheng textile art"
            className="object-contain select-none pointer-events-none"
            style={{
              maxWidth: '90vw',
              maxHeight: '75vh',
              opacity: 0.65,
            }}
            draggable={false}
          />
        </motion.div>

        {/* ---- Navigation: centered, horizontal row ---- */}
        <nav
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col lg:flex-row items-center justify-center gap-y-1.5 lg:gap-y-0 gap-x-0 sm:gap-x-0 md:gap-x-16 lg:gap-x-28 z-20"
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
        {currentPage === 'brand' && (
          <BrandPage
            key="brand"
            onClose={closePage}
            onEnter={onInteractiveEnter}
            onLeave={onInteractiveLeave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
