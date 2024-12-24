import { aboutMenu } from './about.js';
import { appListContainer, updateCard, fetchAppList } from './applist.js';
import { setupHelpOverlay } from './help.js';
import { initializeAvailableLanguages, detectUserLanguage, loadTranslations, setupLanguageMenu, translations } from './language.js';
import { selectAllApps, deselectAllApps, selectDenylistApps, deselectUnnecessaryApps, aospkb, extrakb } from './menu_option.js';
import { searchMenuContainer, searchInput, clearBtn, setupMenuToggle } from './search_menu.js';
import { setBootHash } from './vbmeta-digest.js';

// Header Elements
const headerBlock = document.querySelector('.header-block');
const title = document.querySelector('.header');
const noConnection = document.querySelector('.no-connection');

// Menu Elements
const selectDenylistElement = document.getElementById('select-denylist');

// Loading, Save and Prompt Elements
const loadingIndicator = document.querySelector('.loading');
const prompt = document.getElementById('prompt');
export const floatingBtn = document.querySelector('.floating-btn');

export const basePath = "set-path";
const ADDITIONAL_APPS = [
    "com.google.android.gms",
    "io.github.vvb2060.keyattestation",
    "io.github.vvb2060.mahoshojo",
    "icu.nullptr.nativetest"
];

// Variables
let e = 0;
let isRefreshing = false;

// Function to refresh app list
async function refreshAppList() {
    isRefreshing = true;
    title.style.transform = 'translateY(0)';
    searchMenuContainer.style.transform = 'translateY(0)';
    floatingBtn.style.transform = 'translateY(0)';
    searchInput.value = '';
    clearBtn.style.display = "none";
    appListContainer.innerHTML = '';
    loadingIndicator.style.display = 'flex';
    document.querySelector('.uninstall-container').classList.add('hidden-uninstall');
    await new Promise(resolve => setTimeout(resolve, 500));
    window.scrollTo(0, 0);
    if (noConnection.style.display === "flex") {
        try {
            await updateCheck();
            await execCommand(`[ -f ${basePath}common/tmp/exclude-list ] && rm -f "${basePath}common/tmp/exclude-list"`);
        } catch (error) {
            console.error("Error occurred:", error);
        }
    }
    await fetchAppList();
    loadingIndicator.style.display = 'none';
    document.querySelector('.uninstall-container').classList.remove('hidden-uninstall');
    isRefreshing = false;
}

// Function to run the update check
async function updateCheck() {
    try {
        const scriptPath = `sh ${basePath}common/get_extra.sh --update`;
        const output = await execCommand(scriptPath);
        console.log("update script executed successfully.");
        noConnection.style.display = "none";
        if (output.includes("update")) {
            console.log("Update detected from extra script.");
            showPrompt("prompt.new_update");
            updateCard.style.display = "flex";
        } else {
            console.log("No update detected from extra script.");
        }
    } catch (error) {
        console.error("Failed to execute update script:", error);
        showPrompt("prompt.no_internet", false);
        noConnection.style.display = "flex";
    }
}

// Function to check if Magisk
async function checkMagisk() {
    try {
        const magiskEnv = await execCommand(`command -v magisk >/dev/null 2>&1 && echo "OK"`);
        if (magiskEnv.trim() === "OK") {
            console.log("Denylist conditions met, displaying element.");
            selectDenylistElement.style.display = "flex";
        } else {
            console.log("ksud or apd detected, leaving denylist element hidden.");
        }
    } catch (error) {
        console.error("Error while checking denylist conditions:", error);
    }
}

// Function to show the prompt with a success or error message
export function showPrompt(key, isSuccess = true) {
    const message = key.split('.').reduce((acc, k) => acc && acc[k], translations) || key;
    prompt.textContent = message;
    prompt.classList.toggle('error', !isSuccess);
    if (window.promptTimeout) {
        clearTimeout(window.promptTimeout);
    }
    setTimeout(() => {
        prompt.classList.add('visible');
        prompt.classList.remove('hidden');
        window.promptTimeout = setTimeout(() => {
            prompt.classList.remove('visible');
            prompt.classList.add('hidden');
        }, 3000);
    }, 200);
}

// Save configure
document.getElementById("save").addEventListener("click", async () => {
    const selectedApps = Array.from(appListContainer.querySelectorAll(".checkbox:checked"))
        .map(checkbox => checkbox.closest(".card").querySelector(".content").getAttribute("data-package"));
    let finalAppsList = new Set(selectedApps);
    ADDITIONAL_APPS.forEach(app => {
        finalAppsList.add(app);
    });
    finalAppsList = Array.from(finalAppsList);
    try {
        const updatedTargetContent = finalAppsList.join("\n");
        await execCommand(`echo "${updatedTargetContent}" > /data/adb/tricky_store/target.txt`);
        console.log("target.txt updated successfully.");
        showPrompt("prompt.saved_target");
    } catch (error) {
        console.error("Failed to update target.txt:", error);
        showPrompt("prompt.save_error", false);
    }
    await refreshAppList();
});

// Uninstall WebUI
document.querySelector(".uninstall-container").addEventListener("click", async () => {
    try {
        await execCommand(`sh ${basePath}common/get_extra.sh --uninstall`);
        console.log("uninstall script executed successfully.");
        showPrompt("prompt.uninstall_prompt");
    } catch (error) {
        console.error("Failed to execute uninstall command:", error);
        showPrompt("prompt.uninstall_failed", false);
    }
});

// Function to check if running in MMRL
function adjustHeaderForMMRL() {
    if (typeof ksu !== 'undefined' && ksu.mmrl) {
        console.log("Running in MMRL");
        title.style.top = 'var(--window-inset-top)';
        const insetTop = getComputedStyle(document.documentElement).getPropertyValue('--window-inset-top');
        const insetTopValue = parseInt(insetTop, 10);
        searchMenuContainer.style.top = `${insetTopValue + 40}px`;
        headerBlock.style.display = 'block';
    }
}

// Scroll event
let lastScrollY = window.scrollY;
const scrollThreshold = 40;
window.addEventListener('scroll', () => {
    if (isRefreshing) return;
    if (window.scrollY > lastScrollY && window.scrollY > scrollThreshold) {
        title.style.transform = 'translateY(-80px)';
        headerBlock.style.transform = 'translateY(-80px)';
        searchMenuContainer.style.transform = 'translateY(-40px)';
        floatingBtn.style.transform = 'translateY(0)';
    } else if (window.scrollY < lastScrollY) {
        headerBlock.style.transform = 'translateY(0)';
        title.style.transform = 'translateY(0)';
        searchMenuContainer.style.transform = 'translateY(0)';
        floatingBtn.style.transform = 'translateY(-120px)';
    }
    lastScrollY = window.scrollY;
});

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    adjustHeaderForMMRL();
    await initializeAvailableLanguages();
    const userLang = detectUserLanguage();
    await loadTranslations(userLang);
    setupMenuToggle();
    setupLanguageMenu();
    setupHelpOverlay();
    document.getElementById("refresh").addEventListener("click", refreshAppList);
    document.getElementById("select-all").addEventListener("click", selectAllApps);
    document.getElementById("deselect-all").addEventListener("click", deselectAllApps);
    document.getElementById("select-denylist").addEventListener("click", selectDenylistApps);
    document.getElementById("deselect-unnecessary").addEventListener("click", deselectUnnecessaryApps);
    document.getElementById("aospkb").addEventListener("click", aospkb);
    document.getElementById("extrakb").addEventListener("click", extrakb);
    document.getElementById("boot-hash").addEventListener("click", setBootHash);
    document.getElementById("about").addEventListener("click", aboutMenu);
    await fetchAppList();
    checkMagisk();
    updateCheck();
    loadingIndicator.style.display = "none";
    document.querySelector('.uninstall-container').classList.remove('hidden-uninstall');
});

// Redirect to GitHub release page
updateCard.addEventListener('click', async () => {
    try {
        await execCommand('am start -a android.intent.action.VIEW -d https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/latest');
    } catch (error) {
        console.error('Error opening GitHub Release link:', error);
    }
});

// Function to execute shell commands
export async function execCommand(command) {
    return new Promise((resolve, reject) => {
        const callbackName = `exec_callback_${Date.now()}_${e++}`;
        window[callbackName] = (errno, stdout, stderr) => {
            delete window[callbackName];
            if (errno === 0) {
                resolve(stdout);
            } else {
                console.error(`Error executing command: ${stderr}`);
                reject(stderr);
            }
        };
        try {
            ksu.exec(command, "{}", callbackName);
        } catch (error) {
            console.error(`Execution error: ${error}`);
            reject(error);
        }
    });
}
