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

  fetch('reservations.json')
    .then(r => r.json())
    .then(data => { bookedRanges = data; renderCalendars(); })
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

  function renderCalendars() {
    const grid = document.getElementById("calendars-grid");
    const lang = document.documentElement.lang || 'fr';
    grid.innerHTML = "";

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

      // Build HTML
      let html = `<div class="cal-month">`;
      html += `<div class="cal-month-title">${monthName} ${year}</div>`;
      html += `<div class="cal-grid">`;
      dayLabels.forEach(d => {
        html += `<div class="cal-cell cal-day-label">${d}</div>`;
      });
      // Empty cells before first day
      for (let i = 0; i < firstDow; i++) {
        html += `<div class="cal-cell cal-empty"></div>`;
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        let cls = "cal-cell cal-day";
        if (isToday(dateStr))   cls += " cal-today";
        if (isPast(dateStr))    cls += " cal-past";
        else if (isBooked(dateStr)) cls += " cal-booked";
        else                    cls += " cal-available";
        html += `<div class="${cls}">${day}</div>`;
      }
      html += `</div></div>`; // cal-grid + cal-month
      grid.innerHTML += html;
    }

    // Disable prev if at current month
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
