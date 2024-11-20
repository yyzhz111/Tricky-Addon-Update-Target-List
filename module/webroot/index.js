let e = 0;
const appTemplate = document.getElementById("app-template").content;
const appListContainer = document.getElementById("apps-list");
const loadingIndicator = document.querySelector(".loading");
const searchMenuContainer = document.querySelector('.search-menu-container');
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-btn");
const title = document.querySelector('.title-container');
const noConnection = document.querySelector(".no-connection");
const helpButton = document.getElementById("help-button");
const helpOverlay = document.getElementById("help-overlay");
const closeHelp = document.getElementById("close-help");
const searchCard = document.querySelector('.search-card');
const menu = document.querySelector('.menu');
const selectDenylistElement = document.getElementById("select-denylist");
const floatingBtn = document.querySelector('.floating-btn');
const basePath = "set-path";
let excludeList = [];
let isRefreshing = false;

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

// Function to read the EXCLUDE file and return its contents as an array
async function readExcludeFile() {
    try {
        const result = await execCommand('cat /data/adb/tricky_store/target_list_config/EXCLUDE');
        excludeList = result.split("\n").filter(app => app.trim() !== ''); // Filter out empty lines
        console.log("Current EXCLUDE list:", excludeList);
    } catch (error) {
        console.error("Failed to read EXCLUDE file:", error);
    }
}

// Helper function to check if an app name should be excluded
function isExcluded(appName) {
    return excludeList.some(excludeItem => appName.includes(excludeItem));
}

// Function to fetch, sort, and render the app list with app names
async function fetchAppList() {
    try {
        await readExcludeFile();
        const result = await execCommand(`
            pm list packages -3 | while read -r line; do
                PACKAGE=$(echo "$line" | awk -F: '{print $2}')
                APK_PATH=$(pm path "$PACKAGE" | grep "base.apk" | awk -F: '{print $2}' | tr -d '\\r')
                if [ -n "$APK_PATH" ]; then
                    APP_NAME=$( ${basePath}aapt dump badging "$APK_PATH" 2>/dev/null | grep "application-label:" | sed "s/application-label://; s/'//g" )
                    echo "$APP_NAME|$PACKAGE"
                else
                    echo "Unknown App|$PACKAGE"
                fi
            done
        `);
        const appEntries = result.split("\n").map(line => {
            const [appName, packageName] = line.split("|").map(item => item.trim());
            return { appName, packageName };
        }).filter(entry => entry.packageName); // Remove invalid entries
        const sortedApps = appEntries.sort((a, b) => {
            const aInExclude = isExcluded(a.packageName);
            const bInExclude = isExcluded(b.packageName);
            return aInExclude === bInExclude ? a.appName.localeCompare(b.appName) : aInExclude ? 1 : -1;
        });
        appListContainer.innerHTML = ""; // Clear the container before rendering
        sortedApps.forEach(({ appName, packageName }) => {
            const appElement = document.importNode(appTemplate, true);
            const contentElement = appElement.querySelector(".content");
            contentElement.setAttribute("data-package", packageName);
            const nameElement = appElement.querySelector(".name");
            nameElement.innerHTML = `<strong>${appName || "Unknown App"}</strong><br>${packageName}`;
            const checkbox = appElement.querySelector(".checkbox");
            checkbox.checked = !isExcluded(packageName);
            appListContainer.appendChild(appElement);
        });
        console.log("App list with names and packages rendered successfully.");
    } catch (error) {
        console.error("Failed to fetch or render app list with names:", error);
    }

    floatingBtn.style.transform = "translateY(-100px)";
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
    await new Promise(resolve => setTimeout(resolve, 500));
    window.scrollTo(0, 0);
    if (noConnection.style.display === "flex") {
        await runExtraScript();
    }
    await fetchAppList();[]
    loadingIndicator.style.display = 'none';
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
        await execCommand(scriptPath);
        console.log("Extra script executed successfully.");
        noConnection.style.display = "none";
    } catch (error) {
        console.error("Failed to execute Extra script:", error);
        showPrompt("Please check your Internet connection", false);
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
        showPrompt("keybox.xml successfully updated with AOSP keybox.");
    } catch (error) {
        console.error("Failed to copy AOSP keybox:", error);
        showPrompt("Failed to update keybox.", false);
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
        showPrompt("Successfully updated with valid keybox.");
    } catch (error) {
        console.error("Failed to copy valid keybox:", error);
        await aospkb();
        showPrompt("No valid keybox found, replaced with AOSP keybox.", false);
    }
}

// Function to show the prompt with a success or error message
function showPrompt(message, isSuccess = true) {
    const prompt = document.getElementById('prompt');
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
    const menuButton = document.getElementById('menu-button');
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

    const closeMenuItems = ['refresh', 'select-all', 'deselect-all', 'select-denylist', 'deselect-unnecessary', 'aospkb', 'extrakb'];
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

// Add button click event to update EXCLUDE file and run UpdateTargetList.sh
document.getElementById("save").addEventListener("click", async () => {
    await readExcludeFile();
    const deselectedApps = Array.from(appListContainer.querySelectorAll(".checkbox:not(:checked)"))
        .map(checkbox => checkbox.closest(".card").querySelector(".content").getAttribute("data-package"));
    const selectedApps = Array.from(appListContainer.querySelectorAll(".checkbox:checked"))
        .map(checkbox => checkbox.closest(".card").querySelector(".content").getAttribute("data-package"));
    // Add deselected apps to EXCLUDE list
    for (const packageName of deselectedApps) {
        if (!excludeList.includes(packageName)) {
            excludeList.push(packageName);
            console.log("Added to EXCLUDE list:", packageName);
        } else {
            console.log("Package already in EXCLUDE file, skipping:", packageName);
        }
    }
    // Remove selected apps from EXCLUDE list
    if (selectedApps.length > 0) {
        selectedApps.forEach(packageName => {
            excludeList = excludeList.filter(excludedPackage => excludedPackage !== packageName);
            console.log("Removed from EXCLUDE list:", packageName);
        });
    }
    try {
        // Save the EXCLUDE file
        const updatedExcludeContent = excludeList.join("\n");
        await execCommand(`echo "${updatedExcludeContent}" > /data/adb/tricky_store/target_list_config/EXCLUDE`);
        console.log("EXCLUDE file updated successfully.");

        // Execute UpdateTargetList.sh
        try {
            await execCommand("/data/adb/tricky_store/UpdateTargetList.sh");
            showPrompt("Config and target.txt updated");
        } catch (error) {
            console.error("Failed to update target list:", error);
            showPrompt("Config saved, but failed to update target list", false);
        }
    } catch (error) {
        console.error("Failed to update EXCLUDE file:", error);
        showPrompt("Failed to save config", false);
    }
    await readExcludeFile();
    await refreshAppList();
});

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    setupMenuToggle();
    document.getElementById("refresh").addEventListener("click", refreshAppList);
    document.getElementById("select-all").addEventListener("click", selectAllApps);
    document.getElementById("deselect-all").addEventListener("click", deselectAllApps);
    document.getElementById("select-denylist").addEventListener("click", selectDenylistApps);
    document.getElementById("deselect-unnecessary").addEventListener("click", deselectUnnecessaryApps);
    document.getElementById("aospkb").addEventListener("click", aospkb);
    document.getElementById("extrakb").addEventListener("click", extrakb);
    await fetchAppList();
    checkMagisk();
    runExtraScript();
    loadingIndicator.style.display = "none";
});

// Scroll event
let lastScrollY = window.scrollY;
const scrollThreshold = 35;
window.addEventListener('scroll', () => {
    if (isRefreshing) return;
    if (window.scrollY > lastScrollY && window.scrollY > scrollThreshold) {
        title.style.transform = 'translateY(-100%)';
        searchMenuContainer.style.transform = 'translateY(-35px)';
        floatingBtn.style.transform = 'translateY(0)';
    } else if (window.scrollY < lastScrollY) {
        title.style.transform = 'translateY(0)';
        searchMenuContainer.style.transform = 'translateY(0)';
        floatingBtn.style.transform = 'translateY(-100px)';
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