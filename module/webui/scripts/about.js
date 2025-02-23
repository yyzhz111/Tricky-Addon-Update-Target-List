import { linkRedirect } from './main.js';

const telegramLink = document.getElementById('telegram');
const githubLink = document.getElementById('github');

// Function to show about overlay
document.getElementById("about").addEventListener("click", () => {
    const aboutOverlay = document.getElementById('about-overlay');
    const aboutMenu = document.getElementById('about-menu');
    const closeAbout = document.getElementById('close-about');
    const showMenu = () => {
        aboutOverlay.style.display = 'flex';
        setTimeout(() => {
            aboutOverlay.style.opacity = '1';
            aboutMenu.style.opacity = '1';
        }, 10);
        document.body.style.overflow = 'hidden';
    };
    const hideMenu = () => {
        aboutOverlay.style.opacity = '0';
        aboutMenu.style.opacity = '0';
        setTimeout(() => {
            aboutOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 200);
    };
    showMenu();
    closeAbout.addEventListener('click', (event) => {
        event.stopPropagation();
        hideMenu();
    });
    aboutOverlay.addEventListener('click', (event) => {
        if (!aboutMenu.contains(event.target)) {
            hideMenu();
        }
    });
    menu.addEventListener('click', (event) => event.stopPropagation());
});

// Event listener for link redirect
telegramLink.addEventListener('click', function() {
    linkRedirect('https://t.me/kowchannel');
});
githubLink.addEventListener('click', function() {
    linkRedirect('https://github.com/KOWX712/Tricky-Addon-Update-Target-List');
});