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

// Function to fetch, sort, and render the app list
async function fetchAppList() {
    try {
        await readExcludeFile();
        const result = await execCommand("pm list packages -3 </dev/null 2>&1 | cat");
        const packageList = result.split("\n").map(line => line.replace("package:", "").trim()).filter(Boolean);
        const sortedApps = packageList.sort((a, b) => {
            const aInExclude = isExcluded(a);
            const bInExclude = isExcluded(b);
            return aInExclude === bInExclude ? a.localeCompare(b) : aInExclude ? 1 : -1;
        });
        appListContainer.innerHTML = "";
        sortedApps.forEach(appName => {
            const appElement = document.importNode(appTemplate, true);
            appElement.querySelector(".name").textContent = appName;
            const checkbox = appElement.querySelector(".checkbox");
            checkbox.checked = !isExcluded(appName);
            appListContainer.appendChild(appElement);
        });
        console.log("App list fetched, sorted, and rendered successfully.");
    } catch (error) {
        console.error("Failed to fetch or render app list:", error);
    }
    floatingBtn.style.transform = 'translateY(-100px)';
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
        await runXposedScript();
    }
    await fetchAppList();[]
    loadingIndicator.style.display = 'none';
    isRefreshing = false;
}

// Function to run the Xposed script
async function runXposedScript() {
    try {
        const scriptPath = `${basePath}get_exclude-list.sh`;
        await execCommand(scriptPath);
        console.log("Xposed script executed successfully.");
        noConnection.style.display = "none";
    } catch (error) {
        console.error("Failed to execute Xposed script:", error);
        showPrompt("Please check your Internet connection", false);
        noConnection.style.display = "flex";
    }
}

// Function to read the xposed list and uncheck corresponding apps
async function deselectXposedApps() {
    try {
        const result = await execCommand(`cat ${basePath}exclude-list`);
        const xposedApps = result.split("\n").map(app => app.trim()).filter(Boolean);
        const apps = document.querySelectorAll(".card");
        apps.forEach(app => {
            const appName = app.querySelector(".name").textContent.trim();
            const checkbox = app.querySelector(".checkbox");
            if (xposedApps.includes(appName)) {
                checkbox.checked = false; // Uncheck if found in exclude-list
            }
        });
        console.log("Xposed apps deselected successfully.");
    } catch (error) {
        console.error("Failed to deselect Xposed apps:", error);
    }
}

// Function to run the Denylist script
async function runDenylistScript() {
    try {
        const denylistScriptPath = `${basePath}get_denylist.sh`;
        await execCommand(denylistScriptPath);
        console.log('Denylist element displayed successfully.');
        selectDenylistElement.style.display = "flex";
    } catch (error) {
        console.error("Failed to execute Denylist script:", error);
    }
}

// Function to read the denylist and check corresponding apps
async function selectDenylistApps() {
    try {
        const result = await execCommand(`cat ${basePath}denylist`);
        const denylistApps = result.split("\n")
            .map(app => app.trim())
            .filter(Boolean);
        const apps = document.querySelectorAll(".card");
        apps.forEach(app => {
            const appName = app.querySelector(".name").textContent.trim();
            const checkbox = app.querySelector(".checkbox");
            if (denylistApps.includes(appName)) {
                checkbox.checked = true; // Select the app if found in denylist
            }
        });
        console.log("Denylist apps selected successfully.");
    } catch (error) {
        console.error("Failed to select Denylist apps:", error);
    }
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

    const closeMenuItems = ['refresh', 'select-all', 'deselect-all', 'select-denylist', 'deselect-xposed'];
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
        .map(checkbox => checkbox.closest(".card").querySelector(".name").textContent);
    const selectedApps = Array.from(appListContainer.querySelectorAll(".checkbox:checked"))
        .map(checkbox => checkbox.closest(".card").querySelector(".name").textContent);

    for (const app of deselectedApps) {
        if (!excludeList.includes(app)) {
            excludeList.push(app);
            console.log("Added to EXCLUDE list:", app);
        } else {
            console.log("App already in EXCLUDE file, skipping:", app);
        }
    }

    if (selectedApps.length > 0) {
        selectedApps.forEach(app => {
            excludeList = excludeList.filter(excludedApp => excludedApp !== app);
            console.log("Removed from EXCLUDE list:", app);
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
    document.getElementById("deselect-xposed").addEventListener("click", deselectXposedApps);
    await fetchAppList();
    runDenylistScript();
    runXposedScript();
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