let e = 0;
const appTemplate = document.getElementById("app-template").content;
const appListContainer = document.getElementById("apps-list");
const loadingIndicator = document.querySelector(".loading");
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-btn");
const title = document.getElementById('title');
const searchCard = document.querySelector('.search-card');
const menu = document.querySelector('.menu');
const floatingBtn = document.querySelector('.floating-btn');
const basePath = "set-path";
let excludeList = [];

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

// Function to fetch, sort, and render the app list
async function fetchAppList() {
    try {
        await readExcludeFile();
        const result = await execCommand("pm list packages -3 </dev/null 2>&1 | cat");
        const packageList = result.split("\n").map(line => line.replace("package:", "").trim()).filter(Boolean);
        const sortedApps = packageList.sort((a, b) => {
            const aInExclude = excludeList.includes(a);
            const bInExclude = excludeList.includes(b);
            return aInExclude === bInExclude ? a.localeCompare(b) : aInExclude ? 1 : -1;
        });
        appListContainer.innerHTML = "";
        sortedApps.forEach(appName => {
            const appElement = document.importNode(appTemplate, true);
            appElement.querySelector(".name").textContent = appName;
            const checkbox = appElement.querySelector(".checkbox");
            checkbox.checked = !excludeList.includes(appName);
            appListContainer.appendChild(appElement);
        });
        console.log("App list fetched, sorted, and rendered successfully.");
    } catch (error) {
        console.error("Failed to fetch or render app list:", error);
    }
    floatingBtn.style.transform = 'translateY(-100px)';
}

// Function to refresh app list
let isRefreshing = false;
async function refreshAppList() {
    isRefreshing = true;
    title.style.transform = 'translateY(0)';
    searchCard.style.transform = 'translateY(0)';
    menu.style.transform = 'translateY(0)';
    floatingBtn.style.transform = 'translateY(0)';
    const searchInput = document.getElementById("search");
    searchInput.value = '';
    clearBtn.style.display = "none";
    appListContainer.innerHTML = '';
    loadingIndicator.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 500));
    window.scrollTo(0, 0);
    await fetchAppList();
    loadingIndicator.style.display = 'none';
    isRefreshing = false;
}

// Function to run the Xposed script
async function runXposedScript() {
    try {
        const scriptPath = `${basePath}get_xposed.sh`;
        await execCommand(scriptPath);
        console.log("Xposed script executed successfully.");
    } catch (error) {
        console.error("Failed to execute Xposed script:", error);
    }
}

// Function to read the xposed list and uncheck corresponding apps
async function deselectXposedApps() {
    try {
        const result = await execCommand(`cat ${basePath}xposed-list`);
        const xposedApps = result.split("\n").map(app => app.trim()).filter(Boolean);
        const apps = document.querySelectorAll(".card");
        apps.forEach(app => {
            const appName = app.querySelector(".name").textContent.trim();
            const checkbox = app.querySelector(".checkbox");
            if (xposedApps.includes(appName)) {
                checkbox.checked = false; // Uncheck if found in xposed-list
            }
        });
        console.log("Xposed apps deselected successfully.");
    } catch (error) {
        console.error("Failed to deselect Xposed apps:", error);
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

// Menu toggle functionality
function setupMenuToggle() {
    const menuButton = document.getElementById('menu-button');
    const menuIcon = menuButton.querySelector('.menu-icon');
    const menuOptions = document.getElementById('menu-options');
    let menuOpen = false;

    menuButton.addEventListener('click', (event) => {
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

    const closeMenuItems = ['refresh', 'select-all', 'deselect-all', 'deselect-xposed'];
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
        menuOptions.style.display = 'block';
        setTimeout(() => {
            menuOptions.classList.remove('hidden');
            menuOptions.classList.add('visible');
            menuIcon.classList.add('menu-open');
            menuIcon.classList.remove('menu-closed');
            menuOpen = true;
        }, 10);
    }

    function closeMenu() {
        if (menuOptions.classList.contains('visible')) {
            menuOptions.classList.remove('visible');
            menuOptions.classList.add('hidden');
            menuIcon.classList.remove('menu-open');
            menuIcon.classList.add('menu-closed');
            setTimeout(() => {
                menuOptions.style.display = 'none';
            }, 400);
            menuOpen = false;
        }
    }
}

// Search functionality
searchInput.addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const apps = appListContainer.querySelectorAll(".card");
    apps.forEach(app => {
        const name = app.querySelector(".name").textContent.toLowerCase();
        app.style.display = name.includes(searchQuery) ? "block" : "none";
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
    document.getElementById("deselect-xposed").addEventListener("click", deselectXposedApps);   
    await runXposedScript();
    await fetchAppList();    
    loadingIndicator.style.display = "none";
});

// Scroll event
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    if (isRefreshing) return;
    if (window.scrollY > lastScrollY) {
        title.style.transform = 'translateY(-100%)';
        searchCard.style.transform = 'translateY(-35px)';
        menu.style.transform = 'translateY(-35px)';
        floatingBtn.style.transform = 'translateY(0)';
    } else {
        title.style.transform = 'translateY(0)';
        searchCard.style.transform = 'translateY(0)';
        menu.style.transform = 'translateY(0)';
        floatingBtn.style.transform = 'translateY(-100px)';
    }
    lastScrollY = window.scrollY;
});