/**
 * Interactive Birthday Website - Calla 💖
 * Merged Version: Content from 'ultah lama' + Modern Neapolitan UI from 'ultah baru'
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // CONFIGURATION & DATA (FROM ULTAH LAMA)
  // ==========================================
  const CONFIG = {
    PIN: "211025",
    NAME: "Calla"
  };

  // 6 Foto Polaroid
  const PHOTOS = [
    { src: "rumah.jpeg", cap: "Pertama ke Rumah" },
    { src: "jadian.jpeg", cap: "Mau jadian wkwk" },
    { src: "photobox.jpeg", cap: "Photobox pertama kita" },
    { src: "tahun.jpeg", cap: "Happy New Year" },
    { src: "bukber.jpeg", cap: "First time kita bukber" },
    { src: "sma.jpeg", cap: "Back to School" }
  ];

  // Timeline Perjalanan Cinta
  const MOMENTS = [
    { d: "31 Januari 2025", t: "Pertama Kenalan", x: "Hari saat semuanya dimulai." },
    { d: "31 Maret 2025", t: "Pertama Kita Ketemu", x: "Hari paling canggung." },
    { d: "29 April 2025", t: "Kita Sempet Asing", x: "Aku gamau ngulangin hari ini." },
    { d: "23 Agustus 2025", t: "Kita Ketemu Lagi", x: "Kita dekat lagi dengan versi yang berbeda." },
    { d: "21 Oktober 2025", t: "Jadian dan Ulang Tahun Kamu", x: "Hari dimana aku paling happy." },
    { d: "Hari Ini", t: "Ulang Tahun Kamu sekaligus Anniversary", x: "Dan aku masih jatuh cinta." }
  ];

  // Daftar Lagu
  const SONGS = [
    { t: "So High School", a: "Taylor Swift", src: "taylor.mp3" },
    { t: "Aku Milikmu", a: "Dewa 19", src: "dewa.mp3" },
    { t: "Count On Me", a: "Bruno Mars", src: "bruno.mp3" }
  ];

  // Pesan Rahasia di Toples
  const JAR = [
    "Kamu adalah doa yang dikabulkan 🤍",
    "Semoga semua impianmu tercapai yaa ✨",
    "Jangan lupa makan dan istirahat ya sayang 🍚",
    "Kamu lebih hebat dari yang kamu kira 🌸",
    "Aku selalu ada buat kamu 💞",
    "Makasih udah bertahan sama aku ✨",
    "Hari ini, kamu yang paling istimewa 🎂"
  ];

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  let currentPin = "";
  let currentPhotoIndex = 0;
  let currentSongIndex = 0;
  let isPlaying = false;
  let particleInterval = null;
  let lastJarIndex = -1;

  // ==========================================
  // WEB AUDIO API (SINTESIS SFX)
  // ==========================================
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const unlockAudio = () => { getAudioCtx(); };
  ["click", "touchstart", "touchend", "keydown"].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { once: true, passive: true });
  });

  function sfxTap() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.045);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  function sfxError() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.12].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, t + delay);
      osc.frequency.linearRampToValueAtTime(100, t + delay + 0.1);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, t + delay);
      gain.gain.setValueAtTime(0.15, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.11);
    });
  }

  function sfxPolaroid() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.045].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? "triangle" : "sine";
      const startFreq = idx === 0 ? 1200 : 1800;
      osc.frequency.setValueAtTime(startFreq, t + delay);
      osc.frequency.exponentialRampToValueAtTime(300, t + delay + 0.03);
      const vol = idx === 0 ? 0.12 : 0.16;
      gain.gain.setValueAtTime(vol, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.04);
    });
  }

  function sfxShake() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const times = [0, 0.11, 0.22, 0.33];
    times.forEach((offset, idx) => {
      const clickTime = t + offset;
      const dur = 0.06;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2200 + (idx % 2) * 500, clickTime);
      filter.Q.setValueAtTime(3.0, clickTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(clickTime);
      noise.stop(clickTime + dur);
    });
  }

  // ==========================================
  // DOM ELEMENTS
  // ==========================================
  // Screen 1: PIN
  const pinIndicator = document.getElementById("pin-indicator");
  const dots = pinIndicator.querySelectorAll(".dot");
  const keypadButtons = document.querySelectorAll(".key-btn[data-key]");
  const deleteBtn = document.getElementById("btn-delete");

  // Screen 2
  const btnScreen2 = document.getElementById("btn-screen-2");

  // Screen 3
  const readyQuestionState = document.getElementById("ready-question-state");
  const angryState = document.getElementById("angry-state");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const btnBackReady = document.getElementById("btn-back-ready");

  // Screens 4, 5, 6
  const btnScreen4 = document.getElementById("btn-screen-4");
  const btnScreen5 = document.getElementById("btn-screen-5");
  const btnScreen6 = document.getElementById("btn-screen-6");

  // Screen 7: Polaroid
  const polaroidImg = document.getElementById("polaroid-img");
  const polaroidCaption = document.getElementById("polaroid-caption");
  const memoryIndicator = document.getElementById("memory-indicator");
  const btnPrevMemory = document.getElementById("btn-prev-memory");
  const btnNextMemory = document.getElementById("btn-next-memory");

  // Screen 8: Timeline
  const timelineContainer = document.getElementById("timeline-container");
  const btnScreen8 = document.getElementById("btn-screen-8");

  // Screen 9: Music Player
  const mainAudio = document.getElementById("main-audio");
  const vinylDisc = document.getElementById("vinyl-disc");
  const nowPlayingTitle = document.getElementById("now-playing-title");
  const nowPlayingArtist = document.getElementById("now-playing-artist");
  const progressBar = document.getElementById("progress-bar");
  const progressWrap = document.getElementById("progress-wrap");
  const btnPlaySong = document.getElementById("btn-play-song");
  const btnPrevSong = document.getElementById("btn-prev-song");
  const btnNextSong = document.getElementById("btn-next-song");
  const playlistContainer = document.getElementById("playlist-container");
  const btnToLetter = document.getElementById("btn-to-letter");

  // Global & Card Floating Particles
  const particlesContainer = document.getElementById("particles-container");
  const bgParticlesContainer = document.getElementById("bg-particles-container");
  const jarBox = document.getElementById("jar-box");
  const btnShakeJar = document.getElementById("btn-shake-jar");
  const jarMessageBubble = document.getElementById("jar-message-bubble");
  const jarMessageText = document.getElementById("jar-message-text");
  const btnReset = document.getElementById("btn-reset");

  // ==========================================
  // SCREEN TRANSITIONS
  // ==========================================
  function switchScreen(fromId, toId) {
    // Sembunyikan SEMUA screen untuk mencegah tumpang tindih
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));

    const toEl = document.getElementById(toId);
    if (toEl) {
      toEl.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (toId === "screen-7") {
      updatePolaroidDisplay();
    } else if (toId === "screen-8") {
      renderTimeline();
    }
  }

  // ==========================================
  // SCREEN 1: PIN LOCK
  // ==========================================
  function updatePinIndicator() {
    dots.forEach((dot, index) => {
      dot.classList.toggle("filled", index < currentPin.length);
    });
  }

  function handleKeyPress(num) {
    if (currentPin.length < 6) {
      sfxTap();
      currentPin += num;
      updatePinIndicator();
      if (currentPin.length === 6) {
        verifyPin();
      }
    }
  }

  function handleDelete() {
    if (currentPin.length > 0) {
      sfxTap();
      currentPin = currentPin.slice(0, -1);
      updatePinIndicator();
    }
  }

  function verifyPin() {
    if (currentPin === CONFIG.PIN) {
      setTimeout(() => {
        switchScreen("screen-1", "screen-2");
      }, 250);
    } else {
      sfxError();
      pinIndicator.classList.add("shake");
      setTimeout(() => {
        pinIndicator.classList.remove("shake");
        currentPin = "";
        updatePinIndicator();
      }, 550);
    }
  }

  keypadButtons.forEach(btn => {
    btn.addEventListener("click", () => handleKeyPress(btn.getAttribute("data-key")));
  });

  deleteBtn.addEventListener("click", handleDelete);

  window.addEventListener("keydown", e => {
    const screen1 = document.getElementById("screen-1");
    if (!screen1.classList.contains("hidden")) {
      if (/^[0-9]$/.test(e.key)) handleKeyPress(e.key);
      else if (e.key === "Backspace") handleDelete();
    }
  });

  // ==========================================
  // SCREEN 2: SAPAAN
  // ==========================================
  btnScreen2.addEventListener("click", () => {
    sfxTap();
    switchScreen("screen-2", "screen-3");
  });

  // ==========================================
  // SCREEN 3: INTERACTIVE QUESTION
  // ==========================================
  btnYes.addEventListener("click", () => {
    sfxTap();
    switchScreen("screen-3", "screen-4");
  });

  btnNo.addEventListener("click", () => {
    sfxError();
    readyQuestionState.classList.add("hidden");
    angryState.classList.remove("hidden");
  });

  btnBackReady.addEventListener("click", () => {
    sfxTap();
    angryState.classList.add("hidden");
    readyQuestionState.classList.remove("hidden");
  });

  // ==========================================
  // SCREENS 4, 5, 6: STEP-BY-STEP WISHES
  // ==========================================
  btnScreen4.addEventListener("click", () => {
    sfxTap();
    switchScreen("screen-4", "screen-5");
  });

  btnScreen5.addEventListener("click", () => {
    sfxTap();
    switchScreen("screen-5", "screen-6");
  });

  btnScreen6.addEventListener("click", () => {
    sfxTap();
    currentPhotoIndex = 0;
    switchScreen("screen-6", "screen-7");
  });

  // ==========================================
  // SCREEN 7: POLAROID GALLERY (6 FOTO)
  // ==========================================
  function updatePolaroidDisplay() {
    const item = PHOTOS[currentPhotoIndex];
    polaroidImg.style.opacity = "0.2";
    polaroidCaption.style.opacity = "0.2";

    setTimeout(() => {
      polaroidImg.src = item.src;
      polaroidCaption.textContent = item.cap;
      memoryIndicator.textContent = `${currentPhotoIndex + 1} / ${PHOTOS.length}`;
      polaroidImg.style.opacity = "1";
      polaroidCaption.style.opacity = "1";

      btnPrevMemory.disabled = (currentPhotoIndex === 0);
      btnPrevMemory.style.opacity = (currentPhotoIndex === 0) ? "0.45" : "1";

      if (currentPhotoIndex === PHOTOS.length - 1) {
        btnNextMemory.textContent = "Kisah Kita 💞";
      } else {
        btnNextMemory.textContent = "Next Foto ♡";
      }
    }, 150);
  }

  btnNextMemory.addEventListener("click", () => {
    sfxPolaroid();
    if (currentPhotoIndex < PHOTOS.length - 1) {
      currentPhotoIndex++;
      updatePolaroidDisplay();
    } else {
      switchScreen("screen-7", "screen-8");
    }
  });

  btnPrevMemory.addEventListener("click", () => {
    if (currentPhotoIndex > 0) {
      sfxPolaroid();
      currentPhotoIndex--;
      updatePolaroidDisplay();
    }
  });

  polaroidImg.parentElement.addEventListener("click", () => {
    sfxPolaroid();
    currentPhotoIndex = (currentPhotoIndex + 1) % PHOTOS.length;
    updatePolaroidDisplay();
  });

  // ==========================================
  // SCREEN 8: TIMELINE (PERJALANAN KITA)
  // ==========================================
  function renderTimeline() {
    timelineContainer.innerHTML = "";
    MOMENTS.forEach(m => {
      const card = document.createElement("div");
      card.className = "timeline-card";
      card.innerHTML = `
        <span class="timeline-date-badge">${m.d}</span>
        <h4 class="timeline-card-title">${m.t}</h4>
        <p class="timeline-card-desc">${m.x}</p>
      `;
      timelineContainer.appendChild(card);
    });
  }

  btnScreen8.addEventListener("click", () => {
    sfxTap();
    switchScreen("screen-8", "screen-9");
  });

  // ==========================================
  // SCREEN 9: MUSIC PLAYER (LAGU UNTUKMU)
  // ==========================================
  function initPlaylist() {
    playlistContainer.innerHTML = "";
    SONGS.forEach((song, idx) => {
      const btn = document.createElement("div");
      btn.className = `playlist-item ${idx === currentSongIndex ? "active" : ""}`;
      btn.innerHTML = `
        <span>${song.t}</span>
        <small>${song.a}</small>
      `;
      btn.addEventListener("click", () => {
        loadSong(idx, true);
      });
      playlistContainer.appendChild(btn);
    });
  }

  function loadSong(index, playImmediately = false) {
    currentSongIndex = index;
    const song = SONGS[currentSongIndex];
    mainAudio.src = song.src;
    nowPlayingTitle.textContent = song.t;
    nowPlayingArtist.textContent = song.a;

    // Update playlist UI
    const items = playlistContainer.querySelectorAll(".playlist-item");
    items.forEach((item, idx) => {
      item.classList.toggle("active", idx === currentSongIndex);
    });

    if (playImmediately) {
      playSong();
    }
  }

  function playSong() {
    mainAudio.play().then(() => {
      isPlaying = true;
      btnPlaySong.textContent = "⏸";
      vinylDisc.classList.add("spin");
    }).catch(() => {
      isPlaying = false;
      btnPlaySong.textContent = "▶";
      vinylDisc.classList.remove("spin");
    });
  }

  function pauseSong() {
    mainAudio.pause();
    isPlaying = false;
    btnPlaySong.textContent = "▶";
    vinylDisc.classList.remove("spin");
  }

  btnPlaySong.addEventListener("click", () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  });

  btnPrevSong.addEventListener("click", () => {
    sfxTap();
    const prevIdx = (currentSongIndex - 1 + SONGS.length) % SONGS.length;
    loadSong(prevIdx, isPlaying);
  });

  btnNextSong.addEventListener("click", () => {
    sfxTap();
    const nextIdx = (currentSongIndex + 1) % SONGS.length;
    loadSong(nextIdx, isPlaying);
  });

  // Progress Bar
  mainAudio.addEventListener("timeupdate", () => {
    if (mainAudio.duration) {
      const pct = (mainAudio.currentTime / mainAudio.duration) * 100;
      progressBar.style.width = `${pct}%`;
    }
  });

  mainAudio.addEventListener("ended", () => {
    const nextIdx = (currentSongIndex + 1) % SONGS.length;
    loadSong(nextIdx, true);
  });

  progressWrap.addEventListener("click", e => {
    const rect = progressWrap.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (mainAudio.duration) {
      mainAudio.currentTime = (clickX / width) * mainAudio.duration;
    }
  });

  // Init music player
  initPlaylist();
  loadSong(0, false);

  btnToLetter.addEventListener("click", () => {
    sfxTap();
    switchScreen("screen-9", "screen-10");
  });

  // ==========================================
  // SCREEN 10: TOPLES & FLOATING PARTICLES
  // ==========================================
  function shakeJar() {
    sfxShake();
    jarBox.classList.add("shake");
    setTimeout(() => {
      jarBox.classList.remove("shake");
      let randIdx;
      do {
        randIdx = Math.floor(Math.random() * JAR.length);
      } while (randIdx === lastJarIndex && JAR.length > 1);

      lastJarIndex = randIdx;
      jarMessageText.textContent = JAR[randIdx];
      jarMessageBubble.classList.remove("hidden");
    }, 600);
  }

  btnShakeJar.addEventListener("click", shakeJar);
  jarBox.addEventListener("click", shakeJar);

  // ==========================================
  // CONTINUOUS FLOATING PARTICLES (ALL SCREENS & BACKGROUND)
  // ==========================================
  const particleSymbols = ["🤍", "🍓", "✨", "🍫", "🍦", "💖", "🌸", "🍨"];

  function createParticle(container, isBg = false) {
    if (!container) return;

    const particle = document.createElement("div");
    particle.className = "particle";
    const randomSymbol = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];
    particle.textContent = randomSymbol;

    const randomLeft = Math.random() * 92 + 4; // 4% to 96%
    const randomDuration = isBg ? (Math.random() * 3 + 5.5) : (Math.random() * 2.5 + 3.8);
    const randomSize = Math.random() * 0.7 + 0.85;

    particle.style.left = `${randomLeft}%`;
    particle.style.animationDuration = `${randomDuration}s`;
    particle.style.fontSize = `${randomSize}rem`;

    container.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, randomDuration * 1000);
  }

  function spawnTick() {
    createParticle(particlesContainer, false);
    if (bgParticlesContainer && Math.random() > 0.35) {
      createParticle(bgParticlesContainer, true);
    }
  }

  function startFloatingParticles() {
    if (particleInterval) return;
    // Spawn initial batch
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        createParticle(particlesContainer, false);
        if (bgParticlesContainer) createParticle(bgParticlesContainer, true);
      }, i * 160);
    }
    particleInterval = setInterval(spawnTick, 400);
  }

  // Mulai animasi partikel mengambang langsung di semua layar!
  startFloatingParticles();

  // Reset to Screen 1
  btnReset.addEventListener("click", () => {
    sfxTap();
    currentPin = "";
    updatePinIndicator();
    currentPhotoIndex = 0;

    // Reset music & vinyl
    pauseSong();
    mainAudio.currentTime = 0;
    progressBar.style.width = "0%";

    // Reset states
    angryState.classList.add("hidden");
    readyQuestionState.classList.remove("hidden");
    jarMessageBubble.classList.add("hidden");

    switchScreen("screen-10", "screen-1");
  });
});
