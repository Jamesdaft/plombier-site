// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Burger menu
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Animate cards on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .contact-card, .about-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ===== CARTE ISOCHRONE 30 MIN =====
(function () {
  if (!document.getElementById('map')) return;

  const map = L.map('map', { zoomControl: true, scrollWheelZoom: false });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 18
  }).addTo(map);

  const epcIcon = L.divIcon({
    className: '',
    html: `<div style="background:linear-gradient(135deg,#C0392B,#2E6DA4);width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 14px rgba(0,0,0,0.25);border:3px solid white;display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);color:white;font-weight:900;font-size:11px;font-family:Montserrat,sans-serif;">EPC</span>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40]
  });

  // Pane dédié pour le fondu des bords
  map.createPane('isoPane');
  map.getPane('isoPane').style.filter = 'blur(10px)';
  map.getPane('isoPane').style.zIndex = '400';

  fetch('isochrone.json')
    .then(r => r.json())
    .then(data => {
      const iso = L.geoJSON(data, {
        pane: 'isoPane',
        style: {
          color: 'transparent',
          weight: 0,
          fillColor: '#2E6DA4',
          fillOpacity: 0.55
        }
      }).addTo(map);

      map.fitBounds(iso.getBounds(), { padding: [-80, -80] });

      L.marker([44.466096, 6.122948], { icon: epcIcon })
        .addTo(map)
        .bindPopup('<strong style="font-family:Montserrat,sans-serif;color:#2E6DA4">EPC – Eliott Van Holderbeke</strong><br>Plombier Chauffagiste<br>📞 07 71 80 60 82', { maxWidth: 200 })
        .openPopup();
    });
})();

// ===== GALLERY CAROUSEL =====
(function () {
  const track    = document.getElementById('galleryTrack');
  const dotsWrap = document.getElementById('galleryDots');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.gallery-slide'));
  const total  = slides.length;
  let current  = 0;

  // Créer les dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Photo ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function updateDots() {
    dotsWrap.querySelectorAll('.gallery-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    const slide  = slides[current];
    const slideW = slide.offsetWidth + 20; // width + gap
    track.scrollTo({ left: current * slideW, behavior: 'smooth' });
    updateDots();
  }

  document.querySelector('.gallery-prev').addEventListener('click', () => goTo(current - 1));
  document.querySelector('.gallery-next').addEventListener('click', () => goTo(current + 1));

  // Sync dot au scroll libre
  track.addEventListener('scroll', () => {
    const slideW = slides[0].offsetWidth + 20;
    const idx = Math.round(track.scrollLeft / slideW);
    if (idx !== current) { current = idx; updateDots(); }
  }, { passive: true });

  // Auto-play
  let autoplay = setInterval(() => goTo(current + 1), 4000);
  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.parentElement.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1), 4000);
  });

  // Swipe mobile
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; clearInterval(autoplay); }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });
})();
