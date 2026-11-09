// FinAudio Website Interactive Script
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileToggle.innerHTML = '☰';
      });
    });
  }

  // Experience Showcase Tabs
  const tabButtons = document.querySelectorAll('.exp-tab-btn');
  const tabContents = document.querySelectorAll('.exp-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close others
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('open');
        });
        item.classList.toggle('open', !isOpen);
      });
    }
  });

  // Interactive Mockup Mini-Player Controls
  const playBtn = document.getElementById('mockupPlayBtn');
  const vizBars = document.querySelectorAll('.viz-bar');
  const scrubberFill = document.querySelector('.scrubber-fill');
  const scrubberTime = document.getElementById('scrubberCurrentTime');
  let isPlaying = true;
  let trackSeconds = 72; // 1:12
  const totalSeconds = 160; // 2:40

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playBtn.innerHTML = isPlaying 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
      
      vizBars.forEach(bar => {
        bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
      });

      showToast(isPlaying ? "FinAudio Demo: Playback Resumed ▶️" : "FinAudio Demo: Playback Paused ⏸️");
    });
  }

  // Simulated Progress Scrubber & Lyric Rotation
  const lyricsLines = [
    { text: "Locked eyes, yeah we knew from the start", activeText: "You're my missing piece" },
    { text: "Every beat reverberates inside our soul", activeText: "Zero ads, all the beats tonight" },
    { text: "FinAudio playing lossless right through the night", activeText: "Turn the bass up to the sky" },
    { text: "Syncing karaoke in real time with the crew", activeText: "Missing piece found right here" }
  ];
  let lyricIndex = 0;
  const activeLyricEl = document.getElementById('mockupActiveLyric');
  const nextLyricEl = document.getElementById('mockupNextLyric');

  setInterval(() => {
    if (!isPlaying) return;
    trackSeconds = (trackSeconds + 1) % totalSeconds;
    const mins = Math.floor(trackSeconds / 60);
    const secs = String(trackSeconds % 60).padStart(2, '0');
    if (scrubberTime) scrubberTime.textContent = `${mins}:${secs}`;
    if (scrubberFill) scrubberFill.style.width = `${(trackSeconds / totalSeconds) * 100}%`;

    // Rotate lyrics every 6 seconds
    if (trackSeconds % 6 === 0) {
      lyricIndex = (lyricIndex + 1) % lyricsLines.length;
      if (activeLyricEl && nextLyricEl) {
        activeLyricEl.textContent = lyricsLines[lyricIndex].activeText;
        nextLyricEl.textContent = lyricsLines[lyricIndex].text;
      }
    }
  }, 1000);

  // Easter Egg: Tap logo or version tag 5 times!
  const easterTargets = document.querySelectorAll('.easter-trigger');
  let clickCount = 0;
  let clickTimeout = null;

  easterTargets.forEach(el => {
    el.addEventListener('click', (e) => {
      clickCount++;
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => { clickCount = 0; }, 2000);

      if (clickCount >= 5) {
        clickCount = 0;
        triggerEasterEgg();
      }
    });
  });

  function triggerEasterEgg() {
    showToast("🎉 SECRET EASTER EGG UNLOCKED! SharkyBurger & Friends Vibe Zone Activated 🍕🔥");
    // Pulse screen with rainbow glow
    document.body.style.transition = 'box-shadow 0.5s ease';
    document.body.style.boxShadow = 'inset 0 0 100px #ff2a5f, inset 0 0 50px #00f2fe';
    setTimeout(() => {
      document.body.style.boxShadow = '';
    }, 2500);
  }

  // Toast Functionality
  function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  window.showToast = showToast;
});
