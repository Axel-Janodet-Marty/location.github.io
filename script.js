// Protection anti-clickjacking (complément : l'en-tête X-Frame-Options / frame-ancestors
// ne peut pas être envoyé par GitHub Pages)
if (window.top !== window.self) {
  window.top.location = window.self.location.href;
}

    const toggleBtn = document.getElementById('lang-toggle');

    toggleBtn.addEventListener('click', () => {
      const isEnglish = document.body.classList.toggle('lang-en');
      toggleBtn.textContent = isEnglish ? '🇫🇷 Français' : '🇬🇧 English';
      document.documentElement.lang = isEnglish ? 'en' : 'fr';
    });

    // Script lightbox
    const links = Array.from(document.querySelectorAll('.lightbox-link'));
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');
    let currentIndex = 0;

    function showImage(index) {
      const link = links[index];
      img.src = link.href;
      lightbox.classList.add('active');
      currentIndex = index;
    }

    links.forEach((link, index) => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showImage(index);
      });
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % links.length;
      showImage(currentIndex);
    });

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + links.length) % links.length;
      showImage(currentIndex);
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === img || e.target === nextBtn || e.target === prevBtn) return;
      lightbox.classList.remove('active');
      img.src = "";
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;

      if (e.key === "ArrowRight") {
        currentIndex = (currentIndex + 1) % links.length;
        showImage(currentIndex);
      }

      if (e.key === "ArrowLeft") {
        currentIndex = (currentIndex - 1 + links.length) % links.length;
        showImage(currentIndex);
      }

      if (e.key === "Escape") {
        lightbox.classList.remove('active');
        img.src = "";
      }
    });

    const toTop = document.getElementById('toTop');
      window.addEventListener('scroll', () => {
  toTop.style.display = window.scrollY > 600 ? 'block' : 'none';
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ===================================================
  // CALENDRIER DISPONIBILITÉS
  // ===================================================
  // 📝 POUR MODIFIER LES RÉSERVATIONS :
  // Ajoutez ou supprimez des plages dans le tableau ci-dessous.
  // Format : { start: "AAAA-MM-JJ", end: "AAAA-MM-JJ" }
  // Les deux bornes (start et end) sont INCLUSES.
  // ===================================================
  // Les réservations sont dans reservations.json — éditez ce fichier pour les mettre à jour
  // Les dates ci-dessous servent de fallback si le fichier JSON ne charge pas (ex: ouverture locale)
  let bookedRanges = [
    { start: "2026-04-04", end: "2026-04-06" },
    { start: "2026-04-16", end: "2026-04-19" },
    { start: "2026-04-29", end: "2026-05-02" },
    { start: "2026-05-07", end: "2026-05-09" },
    { start: "2026-05-14", end: "2026-05-17" },
    { start: "2026-05-22", end: "2026-05-25" },
    { start: "2026-06-12", end: "2026-06-13" },
    { start: "2026-07-02", end: "2026-07-06" },
    { start: "2026-07-04", end: "2026-07-08" },
    { start: "2026-08-01", end: "2026-08-15" },
  ];

  // Ne garde que les plages au format attendu (AAAA-MM-JJ) : un fichier mal
  // formé ou modifié ne peut ni casser le calendrier ni y injecter du contenu.
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function sanitizeRanges(data) {
    if (!Array.isArray(data)) return null;
    return data.filter(r =>
      r && typeof r.start === 'string' && typeof r.end === 'string' &&
      DATE_RE.test(r.start) && DATE_RE.test(r.end)
    );
  }

  fetch('reservations.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
      const clean = sanitizeRanges(data);
      if (clean) { bookedRanges = clean; renderCalendars(); }
    })
    .catch(() => {});

  // Utilitaires
  function toYMD(d) {
    return d.toISOString().slice(0, 10);
  }
  function isBooked(dateStr) {
    return bookedRanges.some(r => dateStr >= r.start && dateStr <= r.end);
  }
  function isPast(dateStr) {
    return dateStr < toYMD(new Date());
  }
  function isToday(dateStr) {
    return dateStr === toYMD(new Date());
  }

  const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS_FR   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  const DAYS_EN   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  let calOffset = 0; // nombre de mois depuis aujourd'hui (0 = mois courant)

  // Crée un élément avec une classe et un texte (textContent : jamais interprété comme du HTML)
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderCalendars() {
    const grid = document.getElementById("calendars-grid");
    const lang = document.documentElement.lang || 'fr';
    const fragment = document.createDocumentFragment();

    for (let m = 0; m < 2; m++) {
      const now = new Date();
      const target = new Date(now.getFullYear(), now.getMonth() + calOffset + m, 1);
      const year  = target.getFullYear();
      const month = target.getMonth(); // 0-based

      const monthName = (lang === 'en' ? MONTHS_EN : MONTHS_FR)[month];
      const dayLabels = lang === 'en' ? DAYS_EN : DAYS_FR;

      // Premier jour de la semaine (lundi = 0)
      let firstDow = target.getDay(); // 0=Sun..6=Sat
      firstDow = (firstDow === 0) ? 6 : firstDow - 1; // convert to Mon=0

      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const monthEl = el('div', 'cal-month');
      monthEl.appendChild(el('div', 'cal-month-title', `${monthName} ${year}`));

      const calGrid = el('div', 'cal-grid');
      dayLabels.forEach(d => calGrid.appendChild(el('div', 'cal-cell cal-day-label', d)));

      // Cases vides avant le premier jour
      for (let i = 0; i < firstDow; i++) {
        calGrid.appendChild(el('div', 'cal-cell cal-empty'));
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        let cls = "cal-cell cal-day";
        if (isToday(dateStr))   cls += " cal-today";
        if (isPast(dateStr))    cls += " cal-past";
        else if (isBooked(dateStr)) cls += " cal-booked";
        else                    cls += " cal-available";
        calGrid.appendChild(el('div', cls, String(day)));
      }

      monthEl.appendChild(calGrid);
      fragment.appendChild(monthEl);
    }

    grid.replaceChildren(fragment);

    // Désactive "mois précédent" sur le mois courant
    document.getElementById("cal-prev").disabled = (calOffset <= 0);
  }

  document.getElementById("cal-prev").addEventListener("click", () => {
    if (calOffset > 0) { calOffset--; renderCalendars(); }
  });
  document.getElementById("cal-next").addEventListener("click", () => {
    calOffset++;
    renderCalendars();
  });

  renderCalendars();

  // Re-render on lang toggle to update month/day names
  toggleBtn.addEventListener('click', () => {
    setTimeout(renderCalendars, 10);
  });

  // ===================================================

let touchStartX = 0;

lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 50) return;
  if (dx < 0) nextBtn.click();
  else prevBtn.click();
});

// Animation d'apparition au défilement pour les éléments .reveal
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

reveals.forEach(reveal => revealObserver.observe(reveal));

// ===================================================
// CARTE GOOGLE MAPS — chargée seulement après un clic (RGPD)
// ===================================================
const MAP_URL = "https://maps.google.com/maps?q=Asni%C3%A8res-sous-Bois%2C+89660%2C+France&t=m&z=14&ie=UTF8&iwloc=&output=embed";
const mapLoadBtn = document.getElementById('map-load');

if (mapLoadBtn) {
  mapLoadBtn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = MAP_URL;
    iframe.title = 'Carte Asnières-sous-Bois';
    iframe.width = '100%';
    iframe.height = '380';
    iframe.allowFullscreen = true;
    // Isolation : la carte peut fonctionner et ouvrir Google Maps dans un nouvel onglet,
    // mais ne peut ni rediriger votre page, ni ouvrir de formulaire, ni télécharger.
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    document.getElementById('map-container').replaceChildren(iframe);
  });
}
