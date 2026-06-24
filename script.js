(() => {
  const config = window.THESIS_CONFIG;
  const start = new Date(config.event.startIso);
  const end = new Date(config.event.endIso);
  const form = document.querySelector('#rsvp-form');
  const message = document.querySelector('#form-message');
  const submitButton = document.querySelector('#submit-button');
  const submitLabel = document.querySelector('#submit-label');
  const declineButton = document.querySelector('#decline-button');
  const languageButtons = document.querySelectorAll('[data-language]');
  const overlay = document.querySelector('#confirmation-overlay');
  const overlayKicker = document.querySelector('#confirmation-kicker');
  const overlayTitle = document.querySelector('#confirmation-title');
  const overlayDescription = document.querySelector('#confirmation-description');
  const overlayActions = document.querySelector('#confirmation-actions');
  const overlayClose = document.querySelector('#confirmation-close');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let language = 'es';
  let overlayState = 'idle';
  let previousFocus = null;
  let confirmationAnimation = null;

  const translations = {
    es: {
      brandSubtitle: 'OBSERVATORIO DEL SECTOR OSCURO',
      eyebrow: 'DARK-SECTOR TRANSMISSION // 03 JUL 2026',
      eventType: 'DEFENSA DE TESIS DOCTORAL', heroSubtitle: 'PhD Thesis Defence',
      thesisTitle: config.thesisTitleEs,
      researchLine: 'Dark Matter · Axions · Compact Objects · Numerical Relativity',
      clockHeader: 'MISSION CLOCK · THESIS DEFENCE INITIALIZATION',
      clockTag: 'T−Δt // EVENT HORIZON APPROACHING',
      days: 'DÍAS', hours: 'HORAS', minutes: 'MINUTOS', seconds: 'SEGUNDOS',
      heroRsvpProtocol: 'INITIATE RSVP PROTOCOL', heroRsvp: 'Confirmar asistencia', heroDetails: 'Ver detalles del evento',
      dateLabel: 'FECHA', timeLabel: 'HORA', venueLabel: 'LUGAR',
      googleCalendar: 'Añadir a Google Calendar', otherCalendar: 'Añadir a otro calendario',
      consoleTitle: 'ESTADO DEL EVENTO', signalLabel: 'SEÑAL', signalValue: 'ESTABLE', systemLabel: 'SISTEMA', systemValue: 'LISTO', fieldLabel: 'CAMPO',
      consoleFooter: 'Una sala de espera en el borde del sector oscuro.',
      invitationKicker: 'INVITACIÓN', invitationHeading: 'Me gustaría contar contigo',
      invitationText: 'Después de varios años persiguiendo materia oscura, discutiendo con ecuaciones y tratando de convencer a ordenadores de que colaboren, ha llegado el momento de defender la tesis. Me gustaria que vinieras a comprobar que, contra toda predicción, la señal finalmente ha sido detectada hahaha... Si te aventuras a cruzar este pequeño horizonte de sucesos, confirma tu asistencia a continuación.',
      openMaps: 'Abrir en Google Maps', streamLabel: 'TRANSMISIÓN EN LÍNEA EN T- 00:01:00:00', joinStream: 'Unirse a la transmisión',
      rsvpKicker: 'CONFIRMACIÓN', rsvpHeading: '¿Nos acompañarás?',
      rsvpIntro: 'Solo necesito tu nombre. El correo es opcional, por si hubiera un cambio de última hora.',
      nameLabel: 'Nombre y apellidos <span aria-hidden="true">*</span>', namePlaceholder: 'Escribe tu nombre',
      emailLabel: 'Correo electrónico <span class="optional">(opcional)</span>', emailPlaceholder: 'nombre@ejemplo.com',
      guestsLabel: 'Número de asistentes', oneGuest: 'Solo yo', twoGuests: '2 personas', threeGuests: '3 personas', fourPlusGuests: '4 o más personas',
      confirmAttendance: 'Sí, confirmar asistencia', transmittingButton: 'Transmitiendo…', declineAttendance: 'No podré asistir',
      privacyNote: 'Tus datos se utilizarán únicamente para organizar esta defensa de tesis.',
      footerText: 'De los campos teóricos a un momento compartido.',
      nameRequired: 'Por favor, escribe tu nombre para confirmar la asistencia.', invalidEmail: 'Comprueba el correo electrónico o déjalo vacío.',
      endpointMissing: 'Falta conectar la página con Google Sheets. Revisa config.js.', sending: 'Registrando tu asistencia…',
      success: '¡Gracias! Tu asistencia ha quedado registrada. Nos vemos el 3 de julio.', declined: 'Gracias por avisar. Será una pena no verte en la defensa.',
      sendError: 'No se pudo enviar la confirmación. Por favor, inténtalo de nuevo.', eventStarted: 'La defensa ya ha comenzado.',
      overlaySendingKicker: 'RSVP SIGNAL ACQUIRING', overlaySendingTitle: 'Transmitiendo confirmación…', overlaySendingDescription: 'Estableciendo un enlace con el evento.',
      overlaySuccessKicker: 'SIGNAL LOCKED', overlaySuccessTitle: '¡Asistencia confirmada!', overlaySuccessDescription: 'Tu asistencia ha quedado registrada. Nos vemos el 3 de julio.',
      overlayErrorKicker: 'TRANSMISSION INTERRUPTED', overlayErrorTitle: 'No se pudo registrar la asistencia', overlayErrorDescription: 'Comprueba tu conexión e inténtalo de nuevo.',
      overlayClose: 'Cerrar', overlayBack: 'Volver al formulario'
    },
    en: {
      brandSubtitle: 'DARK-SECTOR OBSERVATORY',
      eyebrow: 'DARK-SECTOR TRANSMISSION // 03 JUL 2026',
      eventType: 'PHD THESIS DEFENCE', heroSubtitle: 'PhD Thesis Defence',
      thesisTitle: config.thesisTitleEn,
      researchLine: 'Dark Matter · Axions · Compact Objects · Numerical Relativity',
      clockHeader: 'MISSION CLOCK · THESIS DEFENCE INITIALIZATION',
      clockTag: 'T−Δt // EVENT HORIZON APPROACHING',
      days: 'DAYS', hours: 'HOURS', minutes: 'MINUTES', seconds: 'SECONDS',
      heroRsvpProtocol: 'INITIATE RSVP PROTOCOL', heroRsvp: 'Confirm attendance', heroDetails: 'View event details',
      dateLabel: 'DATE', timeLabel: 'TIME', venueLabel: 'VENUE',
      googleCalendar: 'Add to Google Calendar', otherCalendar: 'Add to another calendar',
      consoleTitle: 'EVENT STATUS', signalLabel: 'SIGNAL', signalValue: 'STABLE', systemLabel: 'SYSTEM', systemValue: 'READY', fieldLabel: 'FIELD',
      consoleFooter: 'A waiting room at the edge of the dark sector.',
      invitationKicker: 'INVITATION', invitationHeading: 'It would be a pleasure to have you there',
      invitationText: 'After several years chasing dark matter, arguing with equations, and trying to persuade computers to cooperate, the time has come to defend the thesis. I would be delighted if you could join me to witness that, against all odds, the signal has finally been detected hahaha... If you feel like crossing this small event horizon, please confirm your attendance below.',
      openMaps: 'Open in Google Maps', streamLabel: 'ONLINE STREAMING IN T- 00:01:00:00', joinStream: 'Join the livestream',
      rsvpKicker: 'RSVP', rsvpHeading: 'Will you join us?',
      rsvpIntro: 'I only need your name. Your email is optional, in case there is a last-minute update.',
      nameLabel: 'Full name <span aria-hidden="true">*</span>', namePlaceholder: 'Enter your name',
      emailLabel: 'Email address <span class="optional">(optional)</span>', emailPlaceholder: 'name@example.com',
      guestsLabel: 'Number of attendees', oneGuest: 'Just me', twoGuests: '2 people', threeGuests: '3 people', fourPlusGuests: '4 or more people',
      confirmAttendance: 'Yes, confirm attendance', transmittingButton: 'Transmitting…', declineAttendance: 'I cannot attend',
      privacyNote: 'Your details will only be used to organise this thesis defence.',
      footerText: 'From theoretical fields to a shared moment.',
      nameRequired: 'Please enter your name to confirm attendance.', invalidEmail: 'Please check the email address or leave it blank.',
      endpointMissing: 'The page still needs to be connected to Google Sheets. Check config.js.', sending: 'Registering your attendance…',
      success: 'Thank you! Your attendance has been registered. See you on 3 July.', declined: 'Thank you for letting me know. I will be sorry not to see you at the defence.',
      sendError: 'Your confirmation could not be sent. Please try again.', eventStarted: 'The defence has already started.',
      overlaySendingKicker: 'RSVP SIGNAL ACQUIRING', overlaySendingTitle: 'Transmitting your RSVP…', overlaySendingDescription: 'Establishing a link with the event.',
      overlaySuccessKicker: 'SIGNAL LOCKED', overlaySuccessTitle: 'Attendance confirmed!', overlaySuccessDescription: 'Your attendance has been registered. See you on 3 July.',
      overlayErrorKicker: 'TRANSMISSION INTERRUPTED', overlayErrorTitle: 'Your RSVP could not be registered', overlayErrorDescription: 'Please check your connection and try again.',
      overlayClose: 'Close', overlayBack: 'Back to the form'
    }
  };

  const formatDate = (date, locale, options) => new Intl.DateTimeFormat(locale, options).format(date);
  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  const setMessage = (text, type = '') => { message.textContent = text; message.className = `form-message ${type}`; };
  const configuredEndpoint = () => config.appsScriptUrl && config.appsScriptUrl.startsWith('https://script.google.com/');
  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  function eventText() {
    const locale = language === 'es' ? 'es-ES' : 'en-GB';
    const date = formatDate(start, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: config.event.timeZone });
    const time = formatDate(start, locale, { hour: '2-digit', minute: '2-digit', hour12: language === 'en', timeZone: config.event.timeZone });
    document.querySelector('#event-date').textContent = capitalize(date);
    document.querySelector('#event-time').textContent = language === 'es' ? `${time} h · CEST (UTC+2)` : `${time} · CEST (UTC+2)`;
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    document.documentElement.lang = language;
    const dictionary = translations[language];
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (dictionary[key] !== undefined) element.innerHTML = dictionary[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (dictionary[key] !== undefined) element.placeholder = dictionary[key];
    });
    languageButtons.forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    eventText();
  }

  function updateCountdown() {
    const remaining = start.getTime() - Date.now();
    const labels = document.querySelector('#countdown');
    if (remaining <= 0) {
      ['days', 'hours', 'minutes', 'seconds'].forEach((id) => { document.querySelector(`#${id}`).textContent = '00'; });
      labels.setAttribute('aria-label', translations[language].eventStarted);
      return;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
    Object.entries(values).forEach(([id, value]) => { document.querySelector(`#${id}`).textContent = String(value).padStart(2, '0'); });
  }

  function setupEventDetails() {
    document.querySelector('#event-venue').textContent = config.venue;
    document.querySelector('#venue-name').textContent = config.venue;
    document.querySelector('#venue-address').textContent = config.address;
    const mapsLink = document.querySelector('#maps-link');
    if (config.mapsUrl) mapsLink.href = config.mapsUrl;
    else mapsLink.hidden = true;
    const streamCard = document.querySelector('#stream-card');
    if (config.streamUrl) { streamCard.hidden = false; document.querySelector('#stream-link').href = config.streamUrl; }
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.set('action', 'TEMPLATE');
    googleUrl.searchParams.set('text', config.event.title);
    googleUrl.searchParams.set('dates', `${toGoogleDate(start)}/${toGoogleDate(end)}`);
    googleUrl.searchParams.set('ctz', config.event.timeZone);
    googleUrl.searchParams.set('location', `${config.venue}, ${config.address}`.trim());
    document.querySelector('#google-calendar-link').href = googleUrl.toString();
  }
  function toGoogleDate(date) { return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }

  function prepareOverlay(state) {
    const dictionary = translations[language];
    overlayState = state;
    overlay.classList.remove('is-success', 'is-error');
    overlayActions.hidden = state === 'sending';
    if (state === 'sending') {
      overlayKicker.textContent = dictionary.overlaySendingKicker;
      overlayTitle.textContent = dictionary.overlaySendingTitle;
      overlayDescription.textContent = dictionary.overlaySendingDescription;
    } else if (state === 'success') {
      overlay.classList.add('is-success');
      overlayKicker.textContent = dictionary.overlaySuccessKicker;
      overlayTitle.textContent = dictionary.overlaySuccessTitle;
      overlayDescription.textContent = dictionary.overlaySuccessDescription;
      overlayClose.textContent = dictionary.overlayClose;
    } else {
      overlay.classList.add('is-error');
      overlayKicker.textContent = dictionary.overlayErrorKicker;
      overlayTitle.textContent = dictionary.overlayErrorTitle;
      overlayDescription.textContent = dictionary.overlayErrorDescription;
      overlayClose.textContent = dictionary.overlayBack;
    }
  }

  function startRsvpTransmissionAnimation() {
    previousFocus = document.activeElement;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
    prepareOverlay('sending');
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    if (!reducedMotion) confirmationAnimation = createConfirmationAnimation();
  }

  function showRsvpSuccessState() {
    prepareOverlay('success');
    overlayClose.focus({ preventScroll: true });
  }

  function showRsvpErrorState() {
    prepareOverlay('error');
    overlayClose.focus({ preventScroll: true });
  }

  function closeRsvpOverlay() {
    if (overlayState === 'sending') return;
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-open');
    window.setTimeout(() => { overlay.hidden = true; }, 250);
    if (confirmationAnimation) { confirmationAnimation.stop(); confirmationAnimation = null; }
    if (overlayState === 'error') {
      document.querySelector('#name').focus({ preventScroll: true });
    } else if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus({ preventScroll: true });
    }
    overlayState = 'idle';
  }

  async function submitRsvp(payload) {
    await fetch(config.appsScriptUrl, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: payload.toString()
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const dictionary = translations[language];
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const honeypot = String(data.get('website') || '').trim();
    if (!name) return setMessage(dictionary.nameRequired, 'error');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return setMessage(dictionary.invalidEmail, 'error');
    if (!configuredEndpoint()) return setMessage(dictionary.endpointMissing, 'error');

    submitButton.disabled = true;
    submitLabel.textContent = dictionary.transmittingButton;
    setMessage(dictionary.sending);
    startRsvpTransmissionAnimation();
    const payload = new URLSearchParams({
      name, email,
      guests: String(data.get('guests') || '1'),
      language,
      source: window.location.href,
      userAgent: navigator.userAgent,
      website: honeypot
    });
    const minAnimation = wait(reducedMotion ? 0 : 1700);
    try {
      await Promise.all([submitRsvp(payload), minAnimation]);
      form.reset();
      localStorage.setItem('thesis-defence-rsvp', 'submitted');
      setMessage(dictionary.success, 'success');
      showRsvpSuccessState();
    } catch (error) {
      console.error(error);
      await minAnimation;
      setMessage(dictionary.sendError, 'error');
      showRsvpErrorState();
    } finally {
      submitButton.disabled = false;
      submitLabel.textContent = translations[language].confirmAttendance;
    }
  });

  function scrollToSection(selector) {
    const target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  // Explicit handlers make the hero navigation work consistently in local previews and GitHub Pages.
  document.querySelectorAll('a[href="#rsvp"]').forEach((button) => {
    button.addEventListener('click', (event) => { event.preventDefault(); scrollToSection('#rsvp'); });
  });
  document.querySelectorAll('a[href="#event-details"]').forEach((button) => {
    button.addEventListener('click', (event) => { event.preventDefault(); scrollToSection('#event-details'); });
  });

  declineButton.addEventListener('click', () => setMessage(translations[language].declined));
  overlayClose.addEventListener('click', closeRsvpOverlay);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && overlayState !== 'sending' && !overlay.hidden) closeRsvpOverlay(); });
  languageButtons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));

  function createConfirmationAnimation() {
    const canvas = document.querySelector('#confirmation-canvas');
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return null;
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let startTime = performance.now();
    const particles = [];
    const random = (min, max) => Math.random() * (max - min) + min;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles.length = 0;
      const count = width < 700 ? 50 : 112;
      for (let i = 0; i < count; i += 1) {
        const angle = random(0, Math.PI * 2); const speed = random(.45, 2.4);
        particles.push({ angle, speed, size: random(.45, 1.9), offset: random(0, 1), hue: Math.random() > .78 ? 275 : 190 });
      }
    }
    function bezierField(cx, cy, radius, rotation, alpha) {
      context.save(); context.translate(cx, cy); context.rotate(rotation); context.strokeStyle = `rgba(124,232,255,${alpha})`; context.lineWidth = 1;
      [-1, 1].forEach((side) => {
        context.beginPath(); context.moveTo(-radius * .99, side * radius * .32);
        context.bezierCurveTo(-radius * .48, side * radius * 1.05, radius * .45, side * radius * 1.05, radius * .99, side * radius * .32); context.stroke();
        context.beginPath(); context.moveTo(-radius * .82, side * radius * .11);
        context.bezierCurveTo(-radius * .25, side * radius * .55, radius * .25, side * radius * .55, radius * .82, side * radius * .11); context.stroke();
      });
      context.restore();
    }
    function draw(time) {
      const elapsed = (time - startTime) / 1000;
      const cx = width / 2; const cy = height / 2;
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(3,5,15,.13)'; context.fillRect(0, 0, width, height);
      const radius = Math.min(width, height) * .077;
      const pulse = 1 + Math.sin(elapsed * 5.1) * .055;
      for (let ring = 0; ring < 3; ring += 1) {
        const r = radius * (1.8 + ring * .75 + ((elapsed * .58 + ring * .22) % 1) * .54);
        context.beginPath(); context.strokeStyle = `rgba(${ring === 2 ? '233,196,125' : '123,232,255'},${.22 - ring * .05})`; context.lineWidth = 1;
        context.arc(cx, cy, r, 0, Math.PI * 2); context.stroke();
      }
      bezierField(cx, cy, radius * 3.2, elapsed * .25, .38);
      bezierField(cx, cy, radius * 2.55, -elapsed * .33 + 1.2, .28);
      const star = context.createRadialGradient(cx - radius * .26, cy - radius * .3, radius * .04, cx, cy, radius * 1.25 * pulse);
      star.addColorStop(0, 'rgba(255,255,255,1)'); star.addColorStop(.12, 'rgba(193,249,255,1)'); star.addColorStop(.35, 'rgba(104,219,255,.98)'); star.addColorStop(.65, 'rgba(153,113,255,.74)'); star.addColorStop(1, 'rgba(153,113,255,0)');
      context.beginPath(); context.fillStyle = star; context.arc(cx, cy, radius * 1.45 * pulse, 0, Math.PI * 2); context.fill();
      particles.forEach((particle) => {
        const distance = radius * 1.35 + elapsed * (60 + particle.speed * 130) + particle.offset * 180;
        const x = cx + Math.cos(particle.angle + Math.sin(elapsed + particle.offset) * .06) * distance;
        const y = cy + Math.sin(particle.angle + Math.sin(elapsed + particle.offset) * .06) * distance;
        const alpha = Math.max(0, .78 - distance / Math.max(width, height) * .7);
        context.beginPath(); context.fillStyle = particle.hue === 275 ? `rgba(184,140,255,${alpha})` : `rgba(123,232,255,${alpha})`;
        context.arc(x, y, particle.size, 0, Math.PI * 2); context.fill();
      });
      frame = requestAnimationFrame(draw);
    }
    resize(); window.addEventListener('resize', resize, { passive: true }); frame = requestAnimationFrame(draw);
    return { stop() { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); context.clearRect(0, 0, width, height); } };
  }

  function startDarkSectorBackground() {
    const canvas = document.querySelector('#dark-sector-canvas');
    if (!canvas || reducedMotion) return;
    const context = canvas.getContext('2d', { alpha: true }); if (!context) return;
    const reduceWork = window.matchMedia('(max-width: 700px)').matches;
    const count = reduceWork ? 38 : 92;
    const particles = []; let width = 0; let height = 0; let dpr = 1; let lastFrame = 0;
    const random = (min, max) => Math.random() * (max - min) + min;
    const makeParticle = () => ({ x: random(0,width), y: random(0,height), radius: random(.38,1.65), speedX: random(-.12,.15), speedY: random(-.10,.10), phase: random(0,Math.PI*2), alpha: random(.13,.66), tint: Math.random() > .74 ? 'violet' : 'cyan' });
    function resize() { dpr = Math.min(window.devicePixelRatio || 1, 1.75); width = window.innerWidth; height = window.innerHeight; canvas.width = Math.floor(width*dpr); canvas.height = Math.floor(height*dpr); canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; context.setTransform(dpr,0,0,dpr,0,0); particles.length = 0; for (let i=0;i<count;i+=1) particles.push(makeParticle()); }
    function draw(time) {
      if (time - lastFrame < 33) { requestAnimationFrame(draw); return; }
      lastFrame = time; context.clearRect(0,0,width,height); const t = time * .00014;
      particles.forEach((particle) => { particle.x += particle.speedX + Math.sin(t+particle.phase)*.075; particle.y += particle.speedY + Math.cos(t*.83+particle.phase)*.045; if(particle.x < -8) particle.x=width+8; if(particle.x>width+8) particle.x=-8; if(particle.y<-8) particle.y=height+8; if(particle.y>height+8) particle.y=-8; const pulse=.66+Math.sin(t*3.7+particle.phase)*.34; context.beginPath(); context.fillStyle=particle.tint==='violet' ? `rgba(174,137,255,${particle.alpha*pulse})` : `rgba(119,229,255,${particle.alpha*pulse})`; context.arc(particle.x,particle.y,particle.radius,0,Math.PI*2); context.fill(); });
      context.lineWidth=.55;
      for(let i=0;i<particles.length;i+=1){ for(let j=i+1;j<particles.length;j+=1){ const a=particles[i], b=particles[j], dx=a.x-b.x, dy=a.y-b.y, distanceSquared=dx*dx+dy*dy; if(distanceSquared<9700){ const alpha=(1-distanceSquared/9700)*.11; context.strokeStyle=`rgba(124,185,255,${alpha})`; context.beginPath(); context.moveTo(a.x,a.y); context.lineTo(b.x,b.y); context.stroke(); } } }
      requestAnimationFrame(draw);
    }
    resize(); window.addEventListener('resize', resize, { passive: true }); requestAnimationFrame(draw);
  }

  setupEventDetails();
  setLanguage('es');
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
  startDarkSectorBackground();
})();
