// Litora motion, the one animation file of the site: the same file and the same constants run in HubSpot (theme JS),
// Webflow (Code Embed) and Framer (code component); Figma shows the end state. Every hook is a data attribute. Each
// interaction has a number, which the comments below use:
//   1  header: hidden over the hero, shown when the hero ends (no library, runs at once)
//   2  hero: the photo opens from the right 51% to the whole width while the runway passes, 992 px and up
//   3  statement: each word goes from 0.16 to 1 with the scroll
//   4  project photo: opens through a circle, from 5rem of radius to the whole band, until the band sticks; a ring of
//      1 px grows with the circle and fades in the last 15% of the opening
//   5  project word: its letters slide in while the band is stuck, and end where the unsplit word puts them
//   6  topic thumbnails: straighten from 25 degrees to 0 while their row comes up to the middle of the window
//   7  lines of 1 px draw themselves, once
//   8  entries: opacity and 1rem of rise, once, one item after the other
//   9  stacked photos: the covered photo grows to 1.12
//   11 final call: the photo behind moves 5% up and down, heavily damped
//   14 header theme: dark over a dark section or a photo, measured at the bottom edge of the header (no library, runs
//      at once)
//   15 ruler: the line of the numbers draws itself with the scroll, and so does the solid trace of the timeline of the
//      questions; its dashed traces only fade in
//   23 header button: unseen while the final call is under the header, so two equal buttons never stack (no library)
//   24 questions: the first opens with the page and one is open at a time (details name="faq"; fallback here)
//   25 questions: open and close with their height animated, 0.5 s on the house curve (no library)
// Interactions 10 (question opens, its chevron turns up) and 12 (button label swap) are CSS and native HTML.
// GSAP and ScrollTrigger (3.15.0, cdnjs, with integrity) load only after the window load event, and under 992 px only
// at the first scroll, touch or key, because nothing on the first screen moves. Nothing here hides content on its
// own: the states to animate from live under the class js-motion, which the inline script of the head sets only when
// the visitor accepts motion and the page is not open in the HubSpot editor. If the library does not arrive, the
// class is taken away and every piece of content shows.
(function () {
  'use strict';

  var CDN = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/';
  var LIBRARIES = [
    {
      src: CDN + 'gsap.min.js',
      integrity: 'sha512-oJ8QbaQThQoJZ7oEv+29jfPM6CcP+zUxh3PKJs1vyOhx0UraUrE7PQgeItu3dOuCJyrzWpoYMsVjkkPEBzbUqw==',
    },
    {
      src: CDN + 'ScrollTrigger.min.js',
      integrity: 'sha512-OaIE7ud4P04EhnBuhEcm0wQSceIxbi2pV03oBLS/+F6ampfxsnxcIxOp7H2eF9G7N0kEht0VAzOLG+dTLSo17Q==',
    },
  ];
  // the constants every tool reads
  var MOTION = {
    curve: [0.375, 0, 0.625, 1], // the house curve, cubic-bezier
    scrub: 0.8,
    scrubSlow: 9,
    entry: { y: 16, duration: 0.8, stagger: 0.06, start: 'top 88%' },
    line: { duration: 1.2 },
    hero: { clipFrom: 49, shiftFrom: 0.245, grow: 0.7, scaleTo: 0.95 },
    statement: { from: 0.16, band: 16, start: 'top 85%', end: 'bottom 45%' },
    circle: { from: 80, to: 0.75, word: 0.15, ring: 0.15 }, // radius: 5rem, then 75% of the reference of clip-path
    word: { x: 0.24, stagger: 0.08 }, // of the size of the word: 50 px at 13rem, 11 px at 2.75rem
    thumbnail: { from: 25 },
    draw: { start: 'top 85%', end: 'bottom 60%', solid: 0.6 }, // the ruler and the timeline; the solid trace takes 60%
    zoom: 1.12,
    parallax: 5,
  };
  var DESKTOP = '(min-width: 992px)';
  var MOTION_OK = '(prefers-reduced-motion: no-preference)';

  var root = document.documentElement;
  var inEditor = !!window.hsInEditor || root.classList.contains('hs-inline-edit');
  var bar = document.querySelector('[data-site-header]');

  // ---------- 1, 14 and 23. header: no library, works with reduced motion too ----------
  (function header() {
    var hero = document.querySelector('[data-hero]');
    if (!bar) return;
    if (!('IntersectionObserver' in window)) {
      bar.classList.remove('is-hidden');
      return;
    }
    var topLine = { rootMargin: '0px 0px -100% 0px' }; // what crosses the top line of the window
    if (hero)
      new IntersectionObserver(function (entries) {
        bar.classList.toggle('is-hidden', entries[0].isIntersecting);
      }, topLine).observe(hero);
    else bar.classList.remove('is-hidden');
    // 14 and 23 measure at the header itself, whose height is the nav height token (80 px, 72 px from 991 px down).
    // rootMargin takes no calc(), so the two observers are built again when the window or the bar changes size.
    var dark = new Set(),
      calls = new Set(),
      watchers = [],
      builtFor = '';
    var darkSections = document.querySelectorAll('[data-nav-theme="inverse"]');
    var callSections = document.querySelectorAll('[data-cta]');
    function watch(sections, held, className, rootMargin) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) held.add(entry.target);
            else held.delete(entry.target);
          });
          bar.classList.toggle(className, held.size > 0);
        },
        { rootMargin: rootMargin }
      );
      sections.forEach(function (section) {
        observer.observe(section);
      });
      watchers.push(observer);
    }
    function build() {
      var nav = bar.offsetHeight,
        below = window.innerHeight - nav;
      if (builtFor === nav + ' ' + below) return;
      builtFor = nav + ' ' + below;
      watchers.forEach(function (observer) {
        observer.disconnect();
      });
      watchers = [];
      dark.clear();
      calls.clear();
      // 14. theme: what crosses the bottom edge of the header
      watch(darkSections, dark, 'theme-inverse', '-' + nav + 'px 0px -' + below + 'px 0px');
      // 23. button: while the final call is under the header, its own button is the one to press
      watch(callSections, calls, 'is-over-cta', '0px 0px -' + below + 'px 0px');
    }
    build();
    window.addEventListener('resize', build, { passive: true });
  })();

  // 24. questions: one open at a time, and the first opens with the page. The details of a FAQ share name="faq",
  // which browsers with exclusive details already honour; this is the fallback for the others.
  if (!('name' in HTMLDetailsElement.prototype)) {
    document.querySelectorAll('details[name]').forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        document.querySelectorAll('details[name="' + item.getAttribute('name') + '"]').forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  if (inEditor || !root.classList.contains('js-motion')) return;

  // 25. questions open and close with their height animated, with the Web Animations API, so it works before the library arrives. The browser closes an
  // exclusive details at once, which would cut the closing animation of the other, so the name leaves the details here
  // and this code keeps one open at a time; without motion the native behaviour above stays.
  (function questions() {
    var items = [].slice.call(document.querySelectorAll('details[name]'));
    if (!items.length || !Element.prototype.animate) return;
    var timing = { duration: 500, easing: 'cubic-bezier(' + MOTION.curve.join(', ') + ')' };
    var groups = {};
    items.forEach(function (item) {
      var group = item.getAttribute('name');
      (groups[group] = groups[group] || []).push(item);
      item.removeAttribute('name');
    });
    // the height on screen now (a click in the middle of an animation starts from where it is), then the animation stops
    // so the end height is measured without it
    function current(item) {
      var from = item.offsetHeight;
      if (item._run) {
        item._run.onfinish = null;
        item._run.cancel();
        item._run = null;
      }
      return from;
    }
    function run(item, from, to, done) {
      item.style.overflow = 'hidden';
      item._run = item.animate([{ height: from + 'px' }, { height: to + 'px' }], timing);
      item._run.onfinish = function () {
        item._run = null;
        item.style.overflow = '';
        if (done) done();
      };
    }
    function open(item) {
      var from = current(item);
      item.classList.remove('is-closing');
      item.open = true;
      run(item, from, item.offsetHeight);
    }
    function close(item) {
      var from = current(item);
      item.open = false;
      var to = item.offsetHeight;
      item.open = true;
      item.classList.add('is-closing');
      run(item, from, to, function () {
        item.open = false;
        item.classList.remove('is-closing');
      });
    }
    Object.keys(groups).forEach(function (group) {
      groups[group].forEach(function (item) {
        item.querySelector('summary').addEventListener('click', function (event) {
          event.preventDefault();
          if (item.open && !item.classList.contains('is-closing')) {
            close(item);
            return;
          }
          groups[group].forEach(function (other) {
            if (other !== item && other.open && !other.classList.contains('is-closing')) close(other);
          });
          open(item);
        });
      });
    });
  })();

  // what is already on the first screen never waits hidden for the library
  document.querySelectorAll('[data-reveal], [data-line]').forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight)
      el.setAttribute(el.hasAttribute('data-reveal') ? 'data-reveal' : 'data-line', 'seen');
  });

  // the house curve as a function GSAP takes as an ease (the same cubic-bezier the CSS transitions use)
  function bezier(x1, y1, x2, y2) {
    function at(t, a, b) {
      var u = 1 - t;
      return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
    }
    return function (x) {
      var lo = 0,
        hi = 1,
        t = x,
        i;
      for (i = 0; i < 24; i++) {
        var v = at(t, x1, x2);
        if (Math.abs(v - x) < 0.0005) break;
        if (v < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
      return at(t, y1, y2);
    };
  }

  // each word, or each letter, of a text in a span of its own; the text stays the same for a screen reader. Letters
  // in boxes of their own lose the kerning of the font (in TAVESSA the pairs T A and A V), so each letter is measured
  // in the whole word first and gets, as a margin in em, what brings it back to that place.
  function split(el, byLetter) {
    var parts = byLetter ? Array.from(el.textContent) : el.textContent.split(/(\s+)/);
    if (byLetter) el.textContent = parts.join(''); // one text node again, if the word was split before a resize
    var node = el.firstChild,
      range = document.createRange(),
      at = 0;
    var natural =
      byLetter && node && node.nodeType === 3
        ? parts.map(function (part) {
            range.setStart(node, at);
            range.setEnd(node, (at += part.length));
            return range.getBoundingClientRect().left;
          })
        : null;
    el.textContent = '';
    var spans = parts
      .map(function (part) {
        if (!byLetter && !part.trim()) {
          el.appendChild(document.createTextNode(part));
          return null;
        }
        var span = document.createElement('span');
        span.textContent = part;
        span.style.display = 'inline-block';
        el.appendChild(span);
        return span;
      })
      .filter(Boolean);
    if (natural) {
      var size = parseFloat(getComputedStyle(el).fontSize);
      var boxed = spans.map(function (span) {
        return span.getBoundingClientRect().left;
      });
      spans.forEach(function (span, i) {
        if (i)
          span.style.marginLeft = ((natural[i] - natural[i - 1] - (boxed[i] - boxed[i - 1])) / size).toFixed(4) + 'em';
      });
    }
    return spans;
  }

  function load(library) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = library.src;
      script.integrity = library.integrity;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setup(gsap, ScrollTrigger) {
    var ease = bezier.apply(null, MOTION.curve);
    var mm = gsap.matchMedia();

    mm.add({ motion: MOTION_OK, desktop: DESKTOP }, function (context) {
      if (!context.conditions.motion) {
        root.classList.remove('js-motion');
        return;
      }
      root.classList.add('js-motion');

      // 2. hero, 992 px and up: clip-path and shift while the runway passes, then the photo eases back to 0.95
      var runway = document.querySelector('[data-hero-runway]');
      var heroImage = document.querySelector('[data-hero-image]');
      if (context.conditions.desktop && runway && heroImage) {
        var media = heroImage.closest('div');
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: runway,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: MOTION.scrub,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            media,
            { clipPath: 'inset(0% 0% 0% ' + MOTION.hero.clipFrom + '%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: MOTION.hero.grow },
            0
          )
          .fromTo(
            heroImage,
            {
              x: function () {
                return window.innerWidth * MOTION.hero.shiftFrom;
              },
            },
            { x: 0, duration: MOTION.hero.grow },
            0
          )
          .fromTo(
            heroImage,
            { scale: 1 },
            { scale: MOTION.hero.scaleTo, duration: 1 - MOTION.hero.grow, immediateRender: false },
            MOTION.hero.grow
          );
      }

      // 3. statement: split in words only when the sentence gets near the window, so it never sits dimmed out of view
      gsap.utils.toArray('[data-statement]').forEach(function (sentence) {
        ScrollTrigger.create({
          trigger: sentence,
          start: 'top 150%',
          once: true,
          onEnter: function () {
            gsap.fromTo(
              split(sentence, false),
              { opacity: MOTION.statement.from },
              {
                opacity: 1,
                ease: 'none',
                duration: MOTION.statement.band,
                stagger: 1,
                scrollTrigger: {
                  trigger: sentence,
                  start: MOTION.statement.start,
                  end: MOTION.statement.end,
                  scrub: MOTION.scrub,
                },
              }
            );
          },
        });
      });

      // 4 and 5. project photo: the circle opens until the band sticks, then the letters of the word slide in
      gsap.utils.toArray('[data-project-track]').forEach(function (track) {
        var figure = track.querySelector('[data-project-figure]');
        var photo = track.querySelector('[data-project-media]');
        var word = track.querySelector('[data-project-word]');
        var ring = track.querySelector('[data-project-ring]');
        var opening = 1 - MOTION.circle.word;
        var stuckAt = function () {
          return parseFloat(getComputedStyle(figure).top) || 0;
        };
        // clip-path circle(75%): the percentage is taken from the diagonal of the box divided by the square root of 2
        var radius = function () {
          return (
            (MOTION.circle.to *
              Math.sqrt(photo.offsetWidth * photo.offsetWidth + photo.offsetHeight * photo.offsetHeight)) /
            Math.SQRT2
          );
        };
        var letters = split(word, true);
        // the letters wait unseen and to the right, by a share of their size, so the word never looks pulled apart on
        // a phone; the word itself shows, so each letter carries its own opacity
        gsap.set(letters, { x: Math.round(parseFloat(getComputedStyle(word).fontSize) * MOTION.word.x), opacity: 0 });
        gsap.set(word, { opacity: 1 });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: track,
              start: 'top bottom',
              end: function () {
                return 'top ' + stuckAt() + 'px';
              },
              scrub: MOTION.scrub,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            photo,
            { clipPath: 'circle(' + MOTION.circle.from + 'px at 50% 50%)' },
            {
              clipPath: function () {
                return 'circle(' + Math.ceil(radius()) + 'px at 50% 50%)';
              },
              ease: 'power1.in',
              duration: opening,
            },
            0
          )
          // the ring is a disc 1 px larger behind the photo
          .fromTo(
            ring,
            { clipPath: 'circle(' + (MOTION.circle.from + 1) + 'px at 50% 50%)' },
            {
              clipPath: function () {
                return 'circle(' + (Math.ceil(radius()) + 1) + 'px at 50% 50%)';
              },
              ease: 'power1.in',
              duration: opening,
            },
            0
          )
          .to(
            ring,
            { opacity: 0, ease: 'none', duration: opening * MOTION.circle.ring },
            opening * (1 - MOTION.circle.ring)
          )
          .to(letters, { opacity: 1, ease: 'none', duration: MOTION.circle.word }, opening); // the word shows only over the open photo
        gsap.to(letters, {
          x: 0,
          ease: 'none',
          stagger: MOTION.word.stagger,
          scrollTrigger: {
            trigger: track,
            start: function () {
              return 'top ' + stuckAt() + 'px';
            },
            end: function () {
              return 'bottom ' + (stuckAt() + figure.offsetHeight) + 'px';
            },
            scrub: MOTION.scrub,
            invalidateOnRefresh: true,
          },
        });
      });

      // 6. topic thumbnails: from the row entering at the foot of the window to its middle at the middle of the window
      gsap.utils.toArray('[data-topic-image]').forEach(function (image) {
        gsap.fromTo(
          image,
          { rotation: MOTION.thumbnail.from },
          {
            rotation: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: image.closest('li'),
              start: 'top bottom',
              end: 'center center',
              scrub: MOTION.scrub,
            },
          }
        );
      });

      // 15. ruler: the line draws itself from the top while the list crosses the window, and its small marks are
      // uncovered at the same pace; the timeline of the questions uses the same function for its solid trace, and its
      // dashed traces only fade in (a scaled dash would stretch)
      var draw = function (trigger) {
        return gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: trigger, start: MOTION.draw.start, end: MOTION.draw.end, scrub: MOTION.scrub },
        });
      };
      gsap.utils.toArray('[data-ruler]').forEach(function (ruler) {
        draw(ruler)
          .fromTo(ruler.querySelector('[data-ruler-line]'), { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)
          .fromTo(
            ruler.querySelector('[data-ruler-ticks]'),
            { clipPath: 'inset(0% 0% 100% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 },
            0
          );
      });
      gsap.utils.toArray('[data-timeline]').forEach(function (list) {
        draw(list)
          .fromTo(
            list.querySelectorAll('[data-timeline-trace="solid"]'),
            { scaleY: 0 },
            { scaleY: 1, duration: MOTION.draw.solid },
            0
          )
          .fromTo(
            list.querySelectorAll('[data-timeline-trace="dashed"]'),
            { opacity: 0 },
            { opacity: 1, duration: 1 - MOTION.draw.solid },
            MOTION.draw.solid
          );
      });

      // 9. stacked photos: while the next panel covers this one, its photo grows
      var panels = gsap.utils.toArray('[data-stack-panel]');
      panels.forEach(function (panel, i) {
        if (i === panels.length - 1) return;
        gsap.fromTo(
          panel.querySelector('[data-stack-image]'),
          { scale: 1 },
          {
            scale: MOTION.zoom,
            ease: 'none',
            scrollTrigger: { trigger: panels[i + 1], start: 'top bottom', end: 'top top', scrub: MOTION.scrub },
          }
        );
      });

      // 11. final call: the photo behind, taller than the section, moves with the scroll
      gsap.utils.toArray('[data-cta]').forEach(function (section) {
        gsap.fromTo(
          section.querySelector('[data-cta-image]'),
          { yPercent: -MOTION.parallax },
          {
            yPercent: MOTION.parallax,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: MOTION.scrubSlow },
          }
        );
      });

      // 7. lines draw themselves, once
      gsap.utils.toArray('[data-line]:not([data-line="seen"])').forEach(function (line) {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: MOTION.line.duration,
            ease: ease,
            scrollTrigger: { trigger: line, start: MOTION.entry.start, once: true },
            onComplete: function () {
              line.setAttribute('data-line', 'seen');
              gsap.set(line, { clearProps: 'transform' });
            },
          }
        );
      });

      // 8. entries: what enters the window together comes one item after the other
      gsap.set('[data-reveal]:not([data-reveal="seen"])', { opacity: 0, y: MOTION.entry.y });
      ScrollTrigger.batch('[data-reveal]:not([data-reveal="seen"])', {
        start: MOTION.entry.start,
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: MOTION.entry.duration,
            ease: ease,
            stagger: MOTION.entry.stagger,
            overwrite: true,
            onComplete: function () {
              batch.forEach(function (el) {
                el.setAttribute('data-reveal', 'seen');
              });
              gsap.set(batch, { clearProps: 'opacity,transform' });
            },
          });
        },
      });

      return function () {
        root.classList.remove('js-motion');
      };
    });

    // the lazy photos get their height from width and height, but the fonts can still move a line
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
  }

  function start() {
    load(LIBRARIES[0])
      .then(function () {
        return load(LIBRARIES[1]);
      })
      .then(function () {
        window.gsap.registerPlugin(window.ScrollTrigger);
        setup(window.gsap, window.ScrollTrigger);
      })
      .catch(function () {
        root.classList.remove('js-motion'); // no library: every state to animate from goes away and the page shows whole
      });
  }

  // the library loads only when something on the screen needs it: from
  // 992 px up the hero moves with the first scroll, so right after the load event; under 992 px nothing on the first
  // screen moves, so it waits for the first scroll, touch or key
  function onFirstUse(callback) {
    var events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
    var done = false;
    function go() {
      if (done) return;
      done = true;
      events.forEach(function (type) {
        window.removeEventListener(type, go);
      });
      callback();
    }
    events.forEach(function (type) {
      window.addEventListener(type, go, { passive: true });
    });
    if (window.scrollY > 0) go(); // the page opened at an anchor
  }
  function begin() {
    if (window.matchMedia(DESKTOP).matches) start();
    else onFirstUse(start);
  }

  if (document.readyState === 'complete') begin();
  else window.addEventListener('load', begin, { once: true });
})();
