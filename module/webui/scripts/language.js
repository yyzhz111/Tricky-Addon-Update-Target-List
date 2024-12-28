import { basePath, execCommand, toast } from './main.js';

const languageButton = document.querySelector('.language-button');
const languageMenu = document.querySelector('.language-menu');
const languageOptions = document.querySelectorAll('.language-option');
const languageOverlay = document.getElementById('language-overlay');

export let translations = {};
let currentLang = 'en-US';
let availableLanguages = ['en-US'];

// Function to check for available language
export async function initializeAvailableLanguages() {
    try {
        const multiLang = await execCommand(`find ${basePath}webui/locales -type f -name "*.json" ! -name "A-template.json" -exec basename -s .json {} \\;`);
        availableLanguages = multiLang.trim().split('\n');
        generateLanguageMenu();
    } catch (error) {
        toast("Failed to get available langauge!");
        console.error('Failed to fetch available languages:', error);
        availableLanguages = ['en-US'];
    }
}

// Function to detect user's default language
export function detectUserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0];
    if (availableLanguages.includes(userLang)) {
        return userLang;
    } else if (availableLanguages.includes(langCode)) {
        return langCode;
    } else {
        return 'en-US';
    }
}

// Load translations dynamically based on the selected language
export async function loadTranslations(lang) {
    try {
        const response = await fetch(`/locales/${lang}.json`);
        translations = await response.json();
        applyTranslations();
    } catch (error) {
        toast(`Failed to load translation for ${lang}!`);
        console.error(`Error loading translations for ${lang}:`, error);
        if (lang !== 'en-US') {
            console.log("Falling back to English.");
            loadTranslations('en-US');
        }
    }
}

// Function to apply translations to all elements with data-i18n attributes
function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const keyString = el.getAttribute("data-i18n");
        const translation = keyString.split('.').reduce((acc, key) => acc && acc[key], translations);
        if (translation) {
            if (el.hasAttribute("placeholder")) {
                el.setAttribute("placeholder", translation);
            } else {
                el.textContent = translation;
            }
        }
    });
}

// Function to setup the language menu
export function setupLanguageMenu() {
    languageButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const isVisible = languageMenu.classList.contains("show");
        if (isVisible) {
            closeLanguageMenu();
        } else {
            openLanguageMenu();
        }
    });
    document.addEventListener("click", (event) => {
        if (!languageButton.contains(event.target) && !languageMenu.contains(event.target)) {
            closeLanguageMenu();
        }
    });
    languageOptions.forEach(option => {
        option.addEventListener("click", () => {
            closeLanguageMenu();
        });
    });
    window.addEventListener('scroll', () => {
        if (languageMenu.classList.contains("show")) {
            closeLanguageMenu();
        }
    });
    function openLanguageMenu() {
        languageMenu.classList.add("show");
        languageOverlay.style.display = 'flex';
    }
    function closeLanguageMenu() {
        languageMenu.classList.remove("show");
        languageOverlay.style.display = 'none';
    }
    languageMenu.addEventListener("click", (e) => {
    if (e.target.classList.contains("language-option")) {
        const lang = e.target.getAttribute("data-lang");
        loadTranslations(lang);
        closeLanguageMenu();
    }
});
}

// Function to generate the language menu dynamically
async function generateLanguageMenu() {
    languageMenu.innerHTML = '';
    const languagePromises = availableLanguages.map(async (lang) => {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            const data = await response.json();
            return { lang, name: data.language || lang };
        } catch (error) {
            console.error(`Error fetching language name for ${lang}:`, error);
            return { lang, name: lang };
        }
    });
    const languageData = await Promise.all(languagePromises);
    const sortedLanguages = languageData.sort((a, b) => a.name.localeCompare(b.name));
    sortedLanguages.forEach(({ lang, name }) => {
        const button = document.createElement('button');
        button.classList.add('language-option');
        button.setAttribute('data-lang', lang);
        button.textContent = name;
        languageMenu.appendChild(button);
    });
}
