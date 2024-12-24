// Header Elements
const headerBlock = document.querySelector('.header-block');
const title = document.querySelector('.header');
const helpButton = document.getElementById('help-button');
const noConnection = document.querySelector('.no-connection');
const languageButton = document.querySelector('.language-button');
const languageMenu = document.querySelector('.language-menu');
const languageOptions = document.querySelectorAll('.language-option');
const languageOverlay = document.getElementById('language-overlay');

// Help Overlay Elements
const helpOverlay = document.getElementById('help-overlay');
const closeHelp = document.getElementById('close-help');
const helpList = document.getElementById('help-list');

// Search and Menu Elements
const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clear-btn');
const searchMenuContainer = document.querySelector('.search-menu-container');
const searchCard = document.querySelector('.search-card');
const menu = document.querySelector('.menu');
const menuButton = document.getElementById('menu-button');
const menuOptions = document.getElementById('menu-options');
const selectDenylistElement = document.getElementById('select-denylist');
const menuOverlay = document.getElementById('menu-overlay');
const menuIcon = menuButton.querySelector('.menu-icon');

// BootHash Overlay Elements
const bootHashOverlay = document.getElementById('boot-hash-overlay');
const card = document.getElementById('boot-hash-card');
const inputBox = document.getElementById('boot-hash-input');
const saveButton = document.getElementById('boot-hash-save-button');

// Applist Elements
const appTemplate = document.getElementById('app-template').content;
const appListContainer = document.getElementById('apps-list');
const updateCard = document.getElementById('update-card');

// Loading, Save and Prompt Elements
const loadingIndicator = document.querySelector('.loading');
const floatingBtn = document.querySelector('.floating-btn');
const prompt = document.getElementById('prompt');

// About Elements
const telegramLink = document.getElementById('telegram');
const githubLink = document.getElementById('github');

const basePath = "set-path";
const ADDITIONAL_APPS = [
    "com.google.android.gms",
    "io.github.vvb2060.keyattestation",
    "io.github.vvb2060.mahoshojo",
    "icu.nullptr.nativetest"
];

// Variables
let e = 0;
let excludeList = [];
let isRefreshing = false;
let translations = {};
let currentLang = 'en-US';
let availableLanguages = ['en-US'];

// Function to check for available language
async function initializeAvailableLanguages() {
    try {
        const multiLang = await execCommand(`find ${basePath}webui/locales -type f -name "*.json" ! -name "A-template.json" -exec basename -s .json {} \\;`);
        availableLanguages = multiLang.trim().split('\n');
    } catch (error) {
        console.error('Failed to fetch available languages:', error);
        availableLanguages = ['en-US'];
    }
}

// Function to detect user's default language
function detectUserLanguage() {
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
async function loadTranslations(lang) {
    try {
        const response = await fetch(`/locales/${lang}.json`);
        translations = await response.json();
        applyTranslations();
    } catch (error) {
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

// Language selection event listener
document.querySelectorAll(".language-option").forEach((button) => {
    button.addEventListener("click", (e) => {
        const lang = e.target.getAttribute("data-lang");
        loadTranslations(lang);
    });
});

// Function to setup the language menu
function setupLanguageMenu() {
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
}

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

// Function to setup the help menu
function setupHelpOverlay() {
    helpButton.addEventListener("click", () => {
        helpOverlay.classList.remove("hide");
        helpOverlay.style.display = "flex";
        requestAnimationFrame(() => {
            helpOverlay.classList.add("show");
        });
        document.body.classList.add("no-scroll");
    });
    const hideHelpOverlay = () => {
        helpOverlay.classList.remove("show");
        helpOverlay.classList.add("hide");
        document.body.classList.remove("no-scroll");
        setTimeout(() => {
            helpOverlay.style.display = "none";
        }, 200);
    };
    closeHelp.addEventListener("click", hideHelpOverlay);
    helpOverlay.addEventListener("click", (event) => {
        if (event.target === helpOverlay) {
            hideHelpOverlay();
        }
    });
}

// Function to toggle menu option
function setupMenuToggle() {
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

// Function to select all visible apps
function selectAllApps() {
    document.querySelectorAll(".card").forEach(card => {
        if (card.style.display !== "none") {
            card.querySelector(".checkbox").checked = true;
        }
    });
}

// Function to deselect all visible apps
function deselectAllApps() {
    document.querySelectorAll(".card").forEach(card => {
        if (card.style.display !== "none") {
            card.querySelector(".checkbox").checked = false;
        }
    });
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
            await execCommand(`
                su -c "
                    if [ -f '${basePath}action.sh' ]; then
                        if [ -d "/data/adb/modules/TA_utl" ]; then
                            rm -rf "/data/adb/modules/TA_utl"
                        fi
                        cp -rf '${basePath}common/update' '/data/adb/modules/TA_utl'
                    else
                        cp '${basePath}common/update/module.prop' '/data/adb/modules/TA_utl/module.prop'
                    fi
                "
            `);
        } else {
            console.log("No update detected from extra script.");
        }
    } catch (error) {
        console.error("Failed to execute update script:", error);
        showPrompt("prompt.no_internet", false);
        noConnection.style.display = "flex";
    }
}

// Function to read the exclude list and uncheck corresponding apps
async function deselectUnnecessaryApps() {
    try {
        const fileCheck = await execCommand(`test -f ${basePath}common/tmp/exclude-list && echo "exists" || echo "not found"`);
        if (fileCheck.trim() === "not found") {
            setTimeout(async () => {
                await execCommand(`sh ${basePath}common/get_extra.sh --unnecessary`);
            }, 0);
            console.log("Exclude list not found. Running the unnecessary apps script.");
        } else {
            setTimeout(async () => {
                await execCommand(`sh ${basePath}common/get_extra.sh --xposed`);
            }, 0);
            console.log("Exclude list found. Running xposed script.");
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = await execCommand(`cat ${basePath}common/tmp/exclude-list`);
        const UnnecessaryApps = result.split("\n").map(app => app.trim()).filter(Boolean);
        const apps = document.querySelectorAll(".card");
        apps.forEach(app => {
            const contentElement = app.querySelector(".content");
            const packageName = contentElement.getAttribute("data-package");
            const checkbox = app.querySelector(".checkbox");
            if (UnnecessaryApps.includes(packageName)) {
                checkbox.checked = false;
            }
        });
        console.log("Unnecessary apps deselected successfully.");
    } catch (error) {
        console.error("Failed to deselect unnecessary apps:", error);
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

// Function to read the denylist and check corresponding apps
async function selectDenylistApps() {
    try {
        const result = await execCommand(`
            magisk --denylist ls 2>/dev/null | \
            awk -F'|' '{print $1}' | \
            grep -v "isolated" | \
            sort | uniq
        `);
        const denylistApps = result.split("\n").map(app => app.trim()).filter(Boolean);
        const apps = document.querySelectorAll(".card");
        await deselectAllApps();
        apps.forEach(app => {
            const contentElement = app.querySelector(".content");
            const packageName = contentElement.getAttribute("data-package");
            const checkbox = app.querySelector(".checkbox");
            if (denylistApps.includes(packageName)) {
                checkbox.checked = true; // Select the app if found in denylist
            }
        });
        console.log("Denylist apps selected successfully.");
    } catch (error) {
        console.error("Failed to select Denylist apps:", error);
    }
}

// Function to replace aosp kb
async function aospkb() {
    try {
        const sourcePath = `${basePath}common/.default`;
        const destinationPath = "/data/adb/tricky_store/keybox.xml";
        await execCommand(`xxd -r -p ${sourcePath} | base64 -d > ${destinationPath}`);
        console.log("AOSP keybox copied successfully.");
        showPrompt("prompt.aosp_key_set");
    } catch (error) {
        console.error("Failed to copy AOSP keybox:", error);
        showPrompt("prompt.key_set_error", false);
    }
}

// Function to replace valid kb
async function extrakb() {
    setTimeout(async () => {
        await execCommand(`sh ${basePath}common/get_extra.sh --kb`);
    }, 100);
    const sourcePath = `${basePath}common/tmp/.extra`;
    const destinationPath = "/data/adb/tricky_store/keybox.xml";
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const fileExists = await execCommand(`[ -f ${sourcePath} ] && echo "exists"`);
        if (fileExists.trim() !== "exists") {
            throw new Error(".extra file not found");
        }
        await execCommand(`xxd -r -p ${sourcePath} | base64 -d > ${destinationPath}`);
        console.log("Valid keybox copied successfully.");
        showPrompt("prompt.valid_key_set");
    } catch (error) {
        console.error("Failed to copy valid keybox:", error);
        await aospkb();
        showPrompt("prompt.no_valid_fallback", false);
    }
}

// Function to handle Verified Boot Hash
async function setBootHash() {
    const showCard = () => {
        bootHashOverlay.style.display = "flex";
        card.style.display = "flex";
        requestAnimationFrame(() => {
            bootHashOverlay.classList.add("show");
            card.classList.add("show");
        });
        document.body.style.overflow = "hidden";
    };
    const closeCard = () => {
        bootHashOverlay.classList.remove("show");
        card.classList.remove("show");
        setTimeout(() => {
            bootHashOverlay.style.display = "none";
            card.style.display = "none";
            document.body.style.overflow = "auto";
        }, 200);
    };
    showCard();
    try {
        const bootHashContent = await execCommand("cat /data/adb/boot_hash");
        const validHash = bootHashContent
            .split("\n")
            .filter(line => !line.startsWith("#") && line.trim())[0];
        inputBox.value = validHash || "";
    } catch (error) {
        console.warn("Failed to read boot_hash file. Defaulting to empty input.");
        inputBox.value = "";
    }
    saveButton.addEventListener("click", async () => {
        const inputValue = inputBox.value.trim();
        try {
            await execCommand(`echo "${inputValue}" > /data/adb/boot_hash`);
            await execCommand(`su -c resetprop -n ro.boot.vbmeta.digest ${inputValue}`);
            showPrompt("prompt.boot_hash_set");
            closeCard();
        } catch (error) {
            console.error("Failed to update boot_hash:", error);
            showPrompt("prompt.boot_hash_set_error", false);
        }
    });
    bootHashOverlay.addEventListener("click", (event) => {
        if (event.target === bootHashOverlay) closeCard();
    });
}

// Function to show about overlay
function aboutMenu() {
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
}

// Fetch and render applist
async function fetchAppList() {
    try {
        let targetList = [];
        try {
            const targetFileContent = await execCommand('cat /data/adb/tricky_store/target.txt');
            targetList = targetFileContent.split("\n").filter(app => app.trim() !== ''); // Filter out empty lines
            console.log("Current target list:", targetList);
        } catch (error) {
            console.error("Failed to read target.txt file:", error);
        }

        let applistMap = {};
        try {
            const applistResult = await execCommand(`cat ${basePath}common/tmp/applist`);
            applistMap = applistResult
                .split("\n")
                .reduce((map, line) => {
                    const match = line.match(/app-name:\s*(.+),\s*package-name:\s*(.+)/);
                    if (match) {
                        const appName = match[1].trim();
                        const packageName = match[2].trim();
                        map[packageName] = appName;
                    }
                    return map;
                }, {});
            console.log("Applist loaded successfully.");
        } catch (error) {
            console.warn("Applist file not found or could not be loaded. Skipping applist lookup.");
        }

        const result = await execCommand("pm list packages -3");
        const appEntries = result
            .split("\n")
            .map(line => {
                const packageName = line.replace("package:", "").trim();
                const appName = applistMap[packageName] || null;
                return { appName, packageName };
            })
            .filter(entry => entry.packageName);
        for (const entry of appEntries) {
            if (!entry.appName) {
                try {
                    const apkPath = await execCommand(`pm path ${entry.packageName} | grep "base.apk" | awk -F: '{print $2}' | tr -d '\\r'`);
                    if (apkPath) {
                        const appName = await execCommand(`${basePath}common/aapt dump badging ${apkPath.trim()} 2>/dev/null | grep "application-label:" | sed "s/application-label://; s/'//g"`);
                        entry.appName = appName.trim() || "Unknown App";
                    } else {
                        entry.appName = "Unknown App";
                    }
                } catch (error) {
                    entry.appName = "Unknown App";
                }
            }
        }

        // Sort
        const sortedApps = appEntries.sort((a, b) => {
            const aChecked = targetList.includes(a.packageName);
            const bChecked = targetList.includes(b.packageName);
            if (aChecked !== bChecked) {
                return aChecked ? -1 : 1;
            }
            return (a.appName || "").localeCompare(b.appName || "");
        });

        // Render
        appListContainer.innerHTML = "";
        sortedApps.forEach(({ appName, packageName }) => {
            const appElement = document.importNode(appTemplate, true);
            const contentElement = appElement.querySelector(".content");
            contentElement.setAttribute("data-package", packageName);
            const nameElement = appElement.querySelector(".name");
            nameElement.innerHTML = `<strong>${appName || "Unknown App"}</strong><br>${packageName}`;
            const checkbox = appElement.querySelector(".checkbox");
            checkbox.checked = targetList.includes(packageName);
            appListContainer.appendChild(appElement);
        });
        console.log("App list with names and packages rendered successfully.");
    } catch (error) {
        console.error("Failed to fetch or render app list with names:", error);
    }
    floatingBtn.style.transform = "translateY(-120px)";
    toggleableCheckbox();
    if (appListContainer.firstChild !== updateCard) {
        appListContainer.insertBefore(updateCard, appListContainer.firstChild);
    }
}

// Make checkboxes toggleable
function toggleableCheckbox() {
    const appElements = appListContainer.querySelectorAll(".card");
    appElements.forEach(card => {
        const content = card.querySelector(".content");
        const checkbox = content.querySelector(".checkbox");
        content.addEventListener("click", (event) => {
            if (event.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        });
    });
}

// Function to show the prompt with a success or error message
function showPrompt(key, isSuccess = true) {
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
        await execCommand(`
            su -c "
                if [ -f '${basePath}action.sh' ]; then
                    if [ -d "/data/adb/modules/TA_utl" ]; then
                        rm -rf "/data/adb/modules/TA_utl"
                    fi
                    cp -rf '${basePath}common/update' '/data/adb/modules/TA_utl' &&
                    touch '/data/adb/modules/TA_utl/remove'
                else
                    touch '${basePath}remove'
                fi
            "
        `);
        showPrompt("prompt.uninstall_prompt");
    } catch (error) {
        console.error("Failed to execute uninstall command:", error);
        console.log("Error message:", error.message);
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

telegramLink.addEventListener('click', async () => {
    try {
        await execCommand('am start -a android.intent.action.VIEW -d https://t.me/kowchannel');
    } catch (error) {
        console.error('Error opening Telegram link:', error);
    }
});

githubLink.addEventListener('click', async () => {
    try {
        await execCommand('am start -a android.intent.action.VIEW -d https://github.com/KOWX712/Tricky-Addon-Update-Target-List');
    } catch (error) {
        console.error('Error opening GitHub link:', error);
    }
});

// Function to execute shell commands
async function execCommand(command) {
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
