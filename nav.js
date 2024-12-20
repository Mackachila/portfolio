const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const overlay = document.querySelector('.overlay');
const closeBtn = document.querySelector('.close-btn');

navToggle.addEventListener('click', () => {
    navLinks.classList.add('open');
    overlay.classList.add('visible');
});

closeBtn.addEventListener('click', () => {
    navLinks.classList.remove('open');
    overlay.classList.remove('visible');
});

overlay.addEventListener('click', () => {
    navLinks.classList.remove('open');
    overlay.classList.remove('visible');
});
