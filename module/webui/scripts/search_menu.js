import { appListContainer } from './applist.js';

const searchCard = document.querySelector('.search-card');
export const searchInput = document.getElementById('search');
export const clearBtn = document.getElementById('clear-btn');
export const searchMenuContainer = document.querySelector('.search-menu-container');
const menu = document.querySelector('.menu');
const menuButton = document.getElementById('menu-button');
const menuOptions = document.getElementById('menu-options');
const menuOverlay = document.getElementById('menu-overlay');
const menuIcon = menuButton.querySelector('.menu-icon');

// Focus on search input when search card is clicked
searchCard.addEventListener("click", () => {
    searchInput.focus();
});

// Search functionality
searchInput.addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const apps = appListContainer.querySelectorAll(".card");
    apps.forEach(app => {
        const name = app.querySelector(".name").textContent.toLowerCase();
        app.style.display = name.includes(searchQuery) ? "block" : "none";
        window.scrollTo(0, 0);
    });
    if (searchQuery !== "") {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }
});

// Clear search input
clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
    window.scrollTo(0, 0);
    const apps = appListContainer.querySelectorAll(".card");
    apps.forEach(app => {
        app.style.display = "block";
    });
});

// Function to toggle menu option
export function setupMenuToggle() {
    let menuOpen = false;
    let menuAnimating = false;
    menuButton.addEventListener('click', (event) => {
        if (menuAnimating) return;
        event.stopPropagation();
        if (menuOptions.classList.contains('visible')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    document.addEventListener('click', (event) => {
        if (!menuOptions.contains(event.target) && event.target !== menuButton) {
            closeMenu();
        }
    });
    window.addEventListener('scroll', () => {
        if (menuOptions.classList.contains('visible')) {
            closeMenu();
        }
    });
    const menuOptionsList = document.querySelectorAll('#menu-options li');
    menuOptionsList.forEach(option => {
        option.addEventListener('click', (event) => {
            event.stopPropagation();
            closeMenu();
        });
    });
    function openMenu() {
        menuAnimating = true;
        menuOptions.style.display = 'block';
        setTimeout(() => {
            menuOptions.classList.remove('hidden');
            menuOptions.classList.add('visible');
            menuIcon.classList.add('menu-open');
            menuIcon.classList.remove('menu-closed');
            menuOverlay.style.display = 'flex';
            menuOpen = true;
            menuAnimating = false;
        }, 10);
    }
    function closeMenu() {
        if (menuOptions.classList.contains('visible')) {
            menuAnimating = true;
            menuOptions.classList.remove('visible');
            menuOptions.classList.add('hidden');
            menuIcon.classList.remove('menu-open');
            menuIcon.classList.add('menu-closed');
            menuOverlay.style.display = 'none';
            setTimeout(() => {
                menuOptions.style.display = 'none';
                menuOpen = false;
                menuAnimating = false;
            }, 200);
        }
    }
}