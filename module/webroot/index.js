// Header Elements
const title = document.querySelector('.header');
const helpButton = document.getElementById('help-button');
const noConnection = document.querySelector('.no-connection');
const languageButton = document.querySelector('.language-button');
const languageMenu = document.querySelector('.language-menu');
const languageOptions = document.querySelectorAll('.language-option');

// Loading and Prompt Elements
const loadingIndicator = document.querySelector('.loading');
const prompt = document.getElementById('prompt');

// Floating Button
const floatingBtn = document.querySelector('.floating-btn');

// Search and Menu Elements
const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clear-btn');
const searchMenuContainer = document.querySelector('.search-menu-container');
const searchCard = document.querySelector('.search-card');
const menu = document.querySelector('.menu');
const menuButton = document.getElementById('menu-button');
const menuOptions = document.getElementById('menu-options');
const selectDenylistElement = document.getElementById('select-denylist');

// Applist Elements
const appTemplate = document.getElementById('app-template').content;
const appListContainer = document.getElementById('apps-list');

// Help Overlay Elements
const helpOverlay = document.getElementById('help-overlay');
const closeHelp = document.getElementById('close-help');
const helpList = document.getElementById('help-list');

// BootHash Overlay Elements
const bootHashOverlay = document.getElementById('boot-hash-overlay');
const card = document.getElementById('boot-hash-card');
const inputBox = document.getElementById('boot-hash-input');
const saveButton = document.getElementById('boot-hash-save-button');

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

// Function to detect user's default language
function detectUserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0];
    const availableLanguages = ['en-US', 'ru-RU', 'tl-PH', 'zh-CN', 'zh-TW'];
    if (availableLanguages.includes(userLang)) {
        return userLang;
    }
    else if (availableLanguages.includes(langCode)) {
        return langCode;
    }
    else {
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
        const key = el.getAttribute("data-i18n");
        if (translations[key]) {
            if (el.hasAttribute("placeholder")) {
                el.setAttribute("placeholder", translations[key]);
            } else {
                el.textContent = translations[key];
            }
        }
    });
    updateHelpMenu();
}

// Language selection event listener
document.querySelectorAll(".language-option").forEach((button) => {
    button.addEventListener("click", (e) => {
        const lang = e.target.getAttribute("data-lang");
        loadTranslations(lang);
    });
});

// Function to dynamically update the help menu
function updateHelpMenu() {
    helpList.innerHTML = "";
    const helpSections = [
        { title: "save_and_update_button", description: "save_and_update_description" },
        { title: "refresh", description: "refresh_description" },
        { title: "select_deselect", description: "select_description" },
        { title: "select_denylist", description: "select_denylist_description" },
        { title: "deselect_unnecessary", description: "deselect_unnecessary_description" },
        { title: "set_keybox", description: "set_aosp_keybox_description" },
        { title: "set_verified_boot_hash", description: "set_verified_boot_hash_description" }
    ];
    helpSections.forEach((section) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<strong data-i18n="${section.title}">${translations[section.title]}</strong>`;
        const description = document.createElement("ul");
        const descriptionItem = document.createElement("li");
        descriptionItem.textContent = translations[section.description] || `[Missing: ${section.description}]`;
        description.appendChild(descriptionItem);
        listItem.appendChild(description);
        helpList.appendChild(listItem);
        const emptyLine = document.createElement("li");
        emptyLine.innerHTML = "<br>";
        helpList.appendChild(emptyLine);
    });
}

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
            const applistResult = await execCommand(`cat ${basePath}applist`);
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
                        const appName = await execCommand(`${basePath}aapt dump badging ${apkPath.trim()} 2>/dev/null | grep "application-label:" | sed "s/application-label://; s/'//g"`);
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
        await runExtraScript();
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

// Function to run the extra script
async function runExtraScript() {
  try {
    const scriptPath = `${basePath}get_extra.sh`;
    const output = await execCommand(scriptPath);
    console.log("Extra script executed successfully.");
    noConnection.style.display = "none";
    if (output.includes("update")) {
      console.log("Update detected from extra script.");
      showPrompt("new_update");
      await execCommand(`
        su -c "mkdir -p '/data/adb/modules/TA_utl' &&
        cp -rf '${basePath}temp/'* '/data/adb/modules/TA_utl/'"
      `);
    } else {
      console.log("No update detected from extra script.");
    }
  } catch (error) {
    console.error("Failed to execute Extra script:", error);
    showPrompt("no_internet", false);
    noConnection.style.display = "flex";
  }
}

// Function to read the exclude list and uncheck corresponding apps
async function deselectUnnecessaryApps() {
    try {
        const result = await execCommand(`cat ${basePath}exclude-list`);
        const UnnecessaryApps = result.split("\n").map(app => app.trim()).filter(Boolean);
        const apps = document.querySelectorAll(".card");
        apps.forEach(app => {
            const contentElement = app.querySelector(".content");
            const packageName = contentElement.getAttribute("data-package");
            const checkbox = app.querySelector(".checkbox");
            if (UnnecessaryApps.includes(packageName)) {
                checkbox.checked = false; // Uncheck if found in more-exclude list
            }
        });
        console.log("unnecessary apps deselected successfully.");
    } catch (error) {
        console.error("Failed to deselect unnecessary apps:", error);
    }
}

// Function to check if Magisk
async function checkMagisk() {
    try {
        const hasDenylistCondition = await execCommand(`
            if [ ! -f "/data/adb/apd" ] && [ ! -f "/data/adb/ksud" ]; then
                echo "OK"
            else
                echo ""
            fi
        `);
        if (hasDenylistCondition.trim() === "OK") {
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
        const sourcePath = `${basePath}.default`;
        const destinationPath = "/data/adb/tricky_store/keybox.xml";
        await execCommand(`xxd -r -p ${sourcePath} | base64 -d > ${destinationPath}`);
        console.log("AOSP keybox copied successfully.");
        showPrompt("aosp_key_set");
    } catch (error) {
        console.error("Failed to copy AOSP keybox:", error);
        showPrompt("key_set_error", false);
    }
}

// Function to replace valid kb
async function extrakb() {
    const sourcePath = `${basePath}.extra`;
    const destinationPath = "/data/adb/tricky_store/keybox.xml";
    try {
        const fileExists = await execCommand(`[ -f ${sourcePath} ] && echo "exists"`);
        if (fileExists.trim() !== "exists") {
            throw new Error(".extra file not found");
        }
        await execCommand(`xxd -r -p ${sourcePath} | base64 -d > ${destinationPath}`);
        console.log("Valid keybox copied successfully.");
        showPrompt("valid_key_set");
    } catch (error) {
        console.error("Failed to copy valid keybox:", error);
        await aospkb();
        showPrompt("no_valid_fallback", false);
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
            showPrompt("boot_hash_set");
            closeCard();
        } catch (error) {
            console.error("Failed to update boot_hash:", error);
            showPrompt("boot_hash_set_error", false);
        }
    });
    bootHashOverlay.addEventListener("click", (event) => {
        if (event.target === bootHashOverlay) closeCard();
    });
}

// Function to show about overlay
function aboutMenu() {
    const aboutOverlay = document.getElementById('about-overlay');
    const menu = document.getElementById('about-menu');
    const closeAbout = document.getElementById('close-about');
    const showMenu = () => {
        aboutOverlay.style.display = 'flex';
        setTimeout(() => {
            aboutOverlay.style.opacity = '1';
            menu.style.opacity = '1';
        }, 10);
        document.body.style.overflow = 'hidden';
    };
    const hideMenu = () => {
        aboutOverlay.style.opacity = '0';
        menu.style.opacity = '0';
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
        if (!menu.contains(event.target)) {
            hideMenu();
        }
    });
    menu.addEventListener('click', (event) => event.stopPropagation());
}

// Function to show the prompt with a success or error message
function showPrompt(key, isSuccess = true) {
    const message = translations[key] || key;
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
    }, 500);
}

// Function to toggle menu option
function setupMenuToggle() {
    const menuIcon = menuButton.querySelector('.menu-icon');
    const menuOptions = document.getElementById('menu-options');
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

    const closeMenuItems = ['refresh', 'select-all', 'deselect-all', 'select-denylist', 'deselect-unnecessary', 'aospkb', 'extrakb', 'boot-hash', 'about'];
    closeMenuItems.forEach(id => {
        const item = document.getElementById(id);
        if (item) {
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                closeMenu();
            });
        }
    });

    function openMenu() {
        menuAnimating = true;
        menuOptions.style.display = 'block';
        setTimeout(() => {
            menuOptions.classList.remove('hidden');
            menuOptions.classList.add('visible');
            menuIcon.classList.add('menu-open');
            menuIcon.classList.remove('menu-closed');
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
            setTimeout(() => {
                menuOptions.style.display = 'none';
                menuOpen = false;
                menuAnimating = false;
            }, 200);
        }
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
        showPrompt("saved_target");
    } catch (error) {
        console.error("Failed to update target.txt:", error);
        showPrompt("save_error", false);
    }
    await refreshAppList();
});

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    const userLang = detectUserLanguage();
    await loadTranslations(userLang);
    setupMenuToggle();
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
    loadingIndicator.style.display = "none";
    document.querySelector('.uninstall-container').classList.remove('hidden-uninstall');
    runExtraScript();
});

// Toggle the visibility of the language menu when clicking the button
languageButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isVisible = languageMenu.classList.contains("show");
    if (isVisible) {
        languageMenu.classList.remove("show");
    } else {
        languageMenu.classList.add("show");
    }
});
document.addEventListener("click", (event) => {
    if (!languageButton.contains(event.target) && !languageMenu.contains(event.target)) {
        languageMenu.classList.remove("show");
    }
});
languageOptions.forEach(option => {
    option.addEventListener("click", () => {
        languageMenu.classList.remove("show");
    });
});

// Scroll event
let lastScrollY = window.scrollY;
const scrollThreshold = 40;
window.addEventListener('scroll', () => {
    if (isRefreshing) return;
    if (window.scrollY > lastScrollY && window.scrollY > scrollThreshold) {
        title.style.transform = 'translateY(-100%)';
        searchMenuContainer.style.transform = 'translateY(-40px)';
        floatingBtn.style.transform = 'translateY(0)';
    } else if (window.scrollY < lastScrollY) {
        title.style.transform = 'translateY(0)';
        searchMenuContainer.style.transform = 'translateY(0)';
        floatingBtn.style.transform = 'translateY(-120px)';
    }
    if (languageMenu.classList.contains("show")) {
        languageMenu.classList.remove("show");
    }
    lastScrollY = window.scrollY;
});

// Show help overlay
helpButton.addEventListener("click", () => {
    helpOverlay.classList.remove("hide");
    helpOverlay.style.display = "flex";
    requestAnimationFrame(() => {
        helpOverlay.classList.add("show");
    });
    document.body.classList.add("no-scroll");
});

// Hide help overlay
const hideHelpOverlay = () => {
    helpOverlay.classList.remove("show");
    helpOverlay.classList.add("hide");
    document.body.classList.remove("no-scroll");
    setTimeout(() => {
        helpOverlay.style.display = "none";
    }, 200);
};

// Hide when clicking on close button or outside of the overlay content
closeHelp.addEventListener("click", hideHelpOverlay);
helpOverlay.addEventListener("click", (event) => {
    if (event.target === helpOverlay) {
        hideHelpOverlay();
    }
});

// Uninstall WebUI
document.querySelector(".uninstall-container").addEventListener("click", async () => {
    try {
        await execCommand(`
            su -c "
                if [ -d '${basePath}temp/' ]; then
                    mkdir -p '/data/adb/modules/TA_utl' &&
                    cp -rf '${basePath}temp/'* '/data/adb/modules/TA_utl/' &&
                    touch '/data/adb/modules/TA_utl/remove'
                else
                    touch '/data/adb/modules/TA_utl/remove'
                fi
            "
        `);
        showPrompt("uninstall_prompt");
    } catch (error) {
        console.error("Failed to execute uninstall command:", error);
        console.log("Error message:", error.message);
        showPrompt("uninstall_failed", false);
    }
});
