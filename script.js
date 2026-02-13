const question = document.getElementById('question');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const message = document.getElementById('message');

const hoverQuestion = 'Threesome?';
const RICKROLL_SRC = 'rickroll.mp4';
const RICKROLL_PREVIEW_MS = 5000;
const CHAOS_DURATION_MS = 4200;
const TERMINAL_BOOT_MS = 1700;
const CUSTOM_VIDEO_SRC = 'custom-video.mp4';
const CUSTOM_VIDEO_PAUSE_BEFORE_END_SEC = 0.7;
const isMobile =
  window.matchMedia('(max-width: 768px)').matches ||
  window.matchMedia('(pointer: coarse)').matches;

if (isMobile) {
  question.textContent = 'Desktop required';
  message.textContent = 'Please open this page on a desktop or laptop.';
  yesBtn.style.display = 'none';
  noBtn.style.display = 'none';
} else {
  let noTriggered = false;
  let rickrollShown = false;
  let questionLocked = false;
  let heartsStarted = false;
  let forceUnmuted = false;
  let chaosAudioCtx = null;

  const setQuestion = (text, lock = false) => {
    question.textContent = text;
    if (lock) questionLocked = true;
  };

  const launchHearts = () => {
    if (heartsStarted) return;
    heartsStarted = true;

    const layer = document.createElement('div');
    layer.className = 'heart-rain';
    document.body.appendChild(layer);

    let created = 0;
    const total = 70;
    const timer = setInterval(() => {
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.textContent = '❤';
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.color = Math.random() > 0.5 ? '#d81b60' : '#ff4f88';
      heart.style.animationDuration = `${2.8 + Math.random() * 2.2}s`;
      heart.style.setProperty('--drift', `${-50 + Math.random() * 100}px`);
      layer.appendChild(heart);

      setTimeout(() => heart.remove(), 5600);
      created += 1;
      if (created >= total) {
        clearInterval(timer);
        setTimeout(() => layer.remove(), 6200);
      }
    }, 90);
  };

  const launchConfetti = () => {
    const existing = document.querySelector('.confetti-layer');
    if (existing) existing.remove();

    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    document.body.appendChild(layer);

    const colors = ['#ff4f88', '#ffd166', '#7cff7c', '#6ecbff', '#ffffff', '#ba255f'];
    const total = 150;
    for (let i = 0; i < total; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${2.1 + Math.random() * 1.8}s`;
      piece.style.animationDelay = `${Math.random() * 0.22}s`;
      piece.style.setProperty('--drift', `${-180 + Math.random() * 360}px`);
      piece.style.setProperty('--spin', `${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 520)}deg`);
      layer.appendChild(piece);
    }

    setTimeout(() => layer.remove(), 4500);
  };

  const spawnCursorYesButton = () => {
    const existing = document.querySelector('.cursor-yes-btn');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cursor-yes-btn';
    btn.textContent = 'Yes';
    document.body.appendChild(btn);

    let active = true;
    const moveWithCursor = (event) => {
      if (!active) return;
      btn.style.left = `${event.clientX + 16}px`;
      btn.style.top = `${event.clientY + 16}px`;
    };

    window.addEventListener('pointermove', moveWithCursor);

    const settleCenter = () => {
      btn.style.left = `${window.innerWidth / 2 + 16}px`;
      btn.style.top = `${window.innerHeight / 2 + 16}px`;
    };
    settleCenter();

    btn.addEventListener('click', () => {
      active = false;
      window.removeEventListener('pointermove', moveWithCursor);
      btn.remove();
      message.textContent = 'Final answer received.';
      launchConfetti();
      spawnResetButton();
    });
  };

  const spawnResetButton = () => {
    const existing = document.querySelector('.reset-btn');
    if (existing) return;

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'reset-btn';
    resetBtn.textContent = 'Reset / Replay';
    resetBtn.addEventListener('click', () => {
      window.location.reload();
    });
    document.body.appendChild(resetBtn);
  };

  const finishTerminalSequence = (allowSound) => {
    question.style.display = 'none';
    message.textContent = '';
    const resetExisting = document.querySelector('.reset-btn');
    if (resetExisting) resetExisting.remove();
    const existing = document.querySelector('.final-video-popup');
    if (existing) existing.remove();

    const finalPopup = document.createElement('div');
    finalPopup.className = 'final-video-popup';
    finalPopup.innerHTML = `
      <div class="final-video-title">
        <span class="mac-controls" aria-hidden="true">
          <span class="mac-dot mac-close"></span>
          <span class="mac-dot mac-min"></span>
          <span class="mac-dot mac-max"></span>
        </span>
        <span class="mac-title-text">custom_memory.mp4</span>
      </div>
    `;

    const videoWrap = document.createElement('div');
    videoWrap.className = 'video-wrap final-video-wrap';

    const customVideo = document.createElement('video');
    customVideo.src = CUSTOM_VIDEO_SRC;
    customVideo.autoplay = true;
    customVideo.controls = true;
    customVideo.playsInline = true;
    customVideo.muted = !allowSound;
    customVideo.style.width = '100%';
    customVideo.style.height = '100%';
    customVideo.style.objectFit = 'cover';
    let pausedNearEnd = false;
    customVideo.addEventListener('timeupdate', () => {
      if (pausedNearEnd) return;
      if (!Number.isFinite(customVideo.duration) || customVideo.duration <= 0) return;
      if (customVideo.currentTime >= customVideo.duration - CUSTOM_VIDEO_PAUSE_BEFORE_END_SEC) {
        pausedNearEnd = true;
        customVideo.pause();
        spawnCursorYesButton();
      }
    });

    videoWrap.appendChild(customVideo);
    finalPopup.appendChild(videoWrap);

    if (!allowSound) {
      const note = document.createElement('div');
      note.className = 'final-video-note';
      note.textContent = 'Click unmute on the video for sound.';
      finalPopup.appendChild(note);
    }

    const closeBtn = finalPopup.querySelector('.mac-close');
    const minBtn = finalPopup.querySelector('.mac-min');
    const maxBtn = finalPopup.querySelector('.mac-max');
    const titleEl = finalPopup.querySelector('.final-video-title');

    let dodgeLock = false;
    const dodgeClose = () => {
      if (dodgeLock) return;
      dodgeLock = true;

      const x = (Math.random() * 2 - 1) * 48;
      const y = (Math.random() * 2 - 1) * 16;
      closeBtn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      closeBtn.classList.add('is-dodging');
      finalPopup.classList.add('mac-close-escaped');
      setTimeout(() => {
        finalPopup.classList.remove('mac-close-escaped');
        closeBtn.classList.remove('is-dodging');
        dodgeLock = false;
      }, 240);
    };

    const hideClose = () => {
      closeBtn.classList.add('is-hidden');
      setTimeout(() => {
        closeBtn.classList.remove('is-hidden');
      }, 900);
    };

    const dodgeIfNear = (event) => {
      const rect = closeBtn.getBoundingClientRect();
      const nearX = event.clientX > rect.left - 18 && event.clientX < rect.right + 18;
      const nearY = event.clientY > rect.top - 14 && event.clientY < rect.bottom + 14;
      if (nearX && nearY) dodgeClose();
    };

    finalPopup.querySelector('.final-video-title').addEventListener('pointermove', dodgeIfNear);
    closeBtn.addEventListener('pointerenter', () => {
      hideClose();
      dodgeClose();
    });
    closeBtn.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      dodgeClose();
    });
    closeBtn.addEventListener('click', (event) => {
      event.preventDefault();
      dodgeClose();
    });

    const funnyMessages = [
      'Nice try. No minimizing romance.',
      'Yellow button disabled by love.exe',
      'Minimize denied: date-night priority',
      'Boing! Stay focused on the moment.'
    ];

    minBtn.addEventListener('click', () => {
      finalPopup.classList.remove('mac-minimized');
      finalPopup.classList.remove('mac-zoomed');
      finalPopup.classList.add('mac-funny');
      setTimeout(() => finalPopup.classList.remove('mac-funny'), 420);

      const toast = document.createElement('div');
      toast.className = 'mac-funny-toast';
      toast.textContent = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
      titleEl.appendChild(toast);
      setTimeout(() => toast.remove(), 1150);
    });

    maxBtn.addEventListener('click', () => {
      finalPopup.classList.remove('mac-minimized');
      finalPopup.classList.toggle('mac-zoomed');
    });

    document.body.appendChild(finalPopup);
  };

  const playChaosBeep = () => {
    try {
      if (!chaosAudioCtx) {
        chaosAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (chaosAudioCtx.state === 'suspended') {
        chaosAudioCtx.resume();
      }

      const now = chaosAudioCtx.currentTime;
      const hitDuration = 0.24;

      const core = chaosAudioCtx.createOscillator();
      core.type = 'sine';
      core.frequency.setValueAtTime(190 + Math.random() * 30, now);
      core.frequency.exponentialRampToValueAtTime(95, now + hitDuration);

      const overtone = chaosAudioCtx.createOscillator();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(640 + Math.random() * 60, now);
      overtone.frequency.exponentialRampToValueAtTime(260, now + hitDuration);

      const band = chaosAudioCtx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.setValueAtTime(420, now);
      band.Q.value = 7;

      const drive = chaosAudioCtx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i += 1) {
        const x = (i / 255) * 2 - 1;
        curve[i] = Math.tanh(14 * x);
      }
      drive.curve = curve;
      drive.oversample = '4x';

      const gain = chaosAudioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.36, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + hitDuration);

      core.connect(band);
      overtone.connect(band);
      band.connect(drive);
      drive.connect(gain);
      gain.connect(chaosAudioCtx.destination);

      core.start(now);
      overtone.start(now);
      core.stop(now + hitDuration);
      overtone.stop(now + hitDuration);
    } catch (_) {
      // Ignore: sound effects are optional.
    }
  };

  const runChaosSequence = (allowSound) => {
    const layer = document.createElement('div');
    layer.className = 'chaos-layer';
    layer.innerHTML = '<div class="chaos-banner">SYSTEM ALERT: 37 VIRUSES DETECTED</div>';
    document.body.appendChild(layer);
    document.body.classList.add('chaos-mode');

    const spawnPopup = () => {
      const popup = document.createElement('div');
      popup.className = 'virus-popup';
      popup.style.left = `${Math.random() * 72 + 6}vw`;
      popup.style.top = `${Math.random() * 70 + 8}vh`;
      popup.style.transform = `rotate(${(Math.random() - 0.5) * 8}deg)`;
      popup.innerHTML =
        '<div class="virus-title">Warning!</div><div class="virus-body">Suspicious activity detected.<br>Data may be at risk.</div><div class="virus-actions"><button type="button">Scan</button><button type="button">Ignore</button></div>';
      layer.appendChild(popup);
      setTimeout(() => popup.remove(), 1800);
    };

    const popupTimer = setInterval(spawnPopup, 130);
    spawnPopup();

    const audioTimer = allowSound ? setInterval(playChaosBeep, 170) : null;

    setTimeout(() => {
      clearInterval(popupTimer);
      if (audioTimer) clearInterval(audioTimer);
      document.body.classList.remove('chaos-mode');
      layer.remove();
      runTerminalBoot(allowSound);
    }, CHAOS_DURATION_MS);
  };

  const runTerminalBoot = (allowSound) => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const typeIntoLine = async (lineEl, text, minDelay = 12, maxDelay = 34) => {
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      cursor.textContent = '█';
      lineEl.appendChild(cursor);

      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        lineEl.insertBefore(document.createTextNode(ch), cursor);
        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        await sleep(delay);
      }

      cursor.remove();
    };

    const addLine = (bodyEl, className = 'terminal-line') => {
      const line = document.createElement('div');
      line.className = className;
      bodyEl.appendChild(line);
      bodyEl.scrollTop = bodyEl.scrollHeight;
      return line;
    };

    const buildProgress = (bodyEl, label) => {
      const row = addLine(bodyEl, 'terminal-progress');
      const text = document.createElement('span');
      text.className = 'terminal-dim';
      text.textContent = `${label} `;
      const bar = document.createElement('span');
      bar.className = 'terminal-progress-bar';
      const fill = document.createElement('span');
      fill.className = 'terminal-progress-fill';
      bar.appendChild(fill);
      row.appendChild(text);
      row.appendChild(bar);
      return { fill, row };
    };

    const overlay = document.createElement('div');
    overlay.className = 'terminal-overlay';
    overlay.innerHTML = `
      <div class="terminal-window">
        <div class="terminal-head">
          <span class="dot dot-close"></span><span class="dot dot-min"></span><span class="dot dot-max"></span>
          <span class="terminal-title">love-recovery.sh</span>
        </div>
        <div class="terminal-body" id="terminalBody"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const bodyEl = overlay.querySelector('#terminalBody');
    const closeDot = overlay.querySelector('.dot-close');
    const minDot = overlay.querySelector('.dot-min');
    const maxDot = overlay.querySelector('.dot-max');

    const appendUiLine = (text, className = 'terminal-dim') => {
      const line = document.createElement('div');
      line.className = `terminal-line ${className}`;
      line.textContent = text;
      bodyEl.appendChild(line);
      bodyEl.scrollTop = bodyEl.scrollHeight;
    };

    closeDot.addEventListener('click', () => {
      overlay.classList.add('terminal-deny');
      appendUiLine('[denied] close blocked while recovery is active', 'terminal-warn');
      setTimeout(() => overlay.classList.remove('terminal-deny'), 360);
    });

    minDot.addEventListener('click', () => {
      overlay.classList.toggle('terminal-compact');
      const msg = overlay.classList.contains('terminal-compact')
        ? '[ui] compact mode enabled'
        : '[ui] compact mode disabled';
      appendUiLine(msg, 'terminal-dim');
    });

    maxDot.addEventListener('click', () => {
      overlay.classList.toggle('terminal-zoomed');
      const msg = overlay.classList.contains('terminal-zoomed')
        ? '[ui] focus mode enabled'
        : '[ui] focus mode disabled';
      appendUiLine(msg, 'terminal-ok');
    });

    const runSequence = async () => {
      const command1 = addLine(bodyEl);
      command1.innerHTML = '<span class="terminal-prompt">valentine@host</span>:<span class="terminal-path">~/love</span>$ ';
      await typeIntoLine(command1, 'sudo scan --all --romance --deep');
      await sleep(180);

      const l1 = addLine(bodyEl, 'terminal-line terminal-dim');
      await typeIntoLine(l1, '[sys] mounting /dev/heart-drive ... ok', 8, 20);
      const l2 = addLine(bodyEl, 'terminal-line terminal-warn');
      await typeIntoLine(l2, '[warn] heart-drive infected: butterflies_overflow.exe', 8, 18);
      const l3 = addLine(bodyEl, 'terminal-line terminal-warn');
      await typeIntoLine(l3, '[warn] cuddle-cache corrupted: too_much_cuteness.dll', 8, 18);

      const p1 = buildProgress(bodyEl, '[fix] patching kiss-kernel');
      for (let i = 0; i <= 100; i += 4) {
        p1.fill.style.width = `${i}%`;
        await sleep(18 + Math.random() * 18);
      }
      const ok1 = addLine(bodyEl, 'terminal-line terminal-ok');
      await typeIntoLine(ok1, '[ok] kiss-kernel patched', 8, 20);

      const p2 = buildProgress(bodyEl, '[fix] restoring cuddle-protocol');
      for (let i = 0; i <= 100; i += 5) {
        p2.fill.style.width = `${i}%`;
        await sleep(16 + Math.random() * 16);
      }
      const ok2 = addLine(bodyEl, 'terminal-line terminal-ok');
      await typeIntoLine(ok2, '[ok] cuddle-protocol restored', 8, 20);

      const cute = addLine(bodyEl, 'terminal-line');
      await typeIntoLine(cute, '[note] love.exe found stable and absolutely adorable', 10, 22);

      const command2 = addLine(bodyEl);
      command2.innerHTML = '<span class="terminal-prompt">valentine@host</span>:<span class="terminal-path">~/love</span>$ ';
      await typeIntoLine(command2, 'boot --target custom_memory.mp4 --with-feelings');

      await sleep(TERMINAL_BOOT_MS);
      overlay.classList.add('terminal-out');
      await sleep(240);
      overlay.remove();
      finishTerminalSequence(allowSound);
    };

    runSequence();
  };

  yesBtn.addEventListener('mouseenter', () => {
    if (questionLocked || rickrollShown) {
      setQuestion('Just kidding...');
      return;
    }
    setQuestion(hoverQuestion);
  });

  yesBtn.addEventListener('click', (event) => {
    if (rickrollShown) return;
    rickrollShown = true;
    setQuestion('Just kidding...', true);
    const allowSound = event.isTrusted || forceUnmuted;
    forceUnmuted = false;
    yesBtn.style.visibility = 'hidden';
    yesBtn.style.pointerEvents = 'none';
    noBtn.style.visibility = 'hidden';
    noBtn.style.pointerEvents = 'none';
    launchHearts();

    message.textContent = '';

    const videoWrap = document.createElement('div');
    videoWrap.className = 'video-wrap';
    const rickrollVideo = document.createElement('video');
    rickrollVideo.src = RICKROLL_SRC;
    rickrollVideo.autoplay = true;
    rickrollVideo.playsInline = true;
    rickrollVideo.muted = !allowSound;
    rickrollVideo.preload = 'auto';
    rickrollVideo.style.width = '100%';
    rickrollVideo.style.height = '100%';
    rickrollVideo.style.objectFit = 'cover';
    videoWrap.appendChild(rickrollVideo);
    message.appendChild(videoWrap);

    setTimeout(() => {
      runChaosSequence(allowSound);
    }, RICKROLL_PREVIEW_MS);
  });

  noBtn.addEventListener('click', () => {
    if (noTriggered) return;
    noTriggered = true;
    if (!questionLocked) setQuestion(hoverQuestion);

    const noRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    noBtn.style.visibility = 'hidden';
    noBtn.style.pointerEvents = 'none';

    const cursor = document.createElement('div');
    cursor.className = 'real-cursor';
    cursor.innerHTML =
      '<svg viewBox="0 0 20 28" aria-hidden="true"><path d="M1 1 L1 21 L6.6 16.5 L10.5 25.5 L13.5 24.2 L9.6 15.4 L17.5 15.4 Z" fill="white" stroke="black" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    cursor.style.left = `${noRect.left + noRect.width / 2}px`;
    cursor.style.top = `${noRect.top + noRect.height / 2}px`;
    document.body.appendChild(cursor);

    requestAnimationFrame(() => {
      cursor.style.left = `${yesRect.left + yesRect.width / 2 - 6}px`;
      cursor.style.top = `${yesRect.top + yesRect.height / 2 - 10}px`;
    });

    cursor.addEventListener(
      'transitionend',
      () => {
        yesBtn.dispatchEvent(new Event('mouseenter'));

        yesBtn.style.background = 'var(--yes-hover)';
        yesBtn.style.transform = 'translateY(-2px) scale(1.04)';

        setTimeout(() => {
          yesBtn.style.background = '#a70f47';
          yesBtn.style.transform = 'translateY(1px) scale(0.96)';
          cursor.classList.add('pressing');
        }, 220);

        setTimeout(() => {
          yesBtn.style.background = 'var(--yes-hover)';
          yesBtn.style.transform = 'translateY(-1px) scale(1.01)';
          cursor.classList.remove('pressing');
        }, 360);

        setTimeout(() => {
          yesBtn.style.background = '';
          yesBtn.style.transform = '';
          forceUnmuted = true;
          yesBtn.click();
          cursor.remove();
        }, 520);
      },
      { once: true }
    );
  });
}
