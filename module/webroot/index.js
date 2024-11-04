let e = 0;
const appTemplate = document.getElementById("app-template").content;
const appListContainer = document.getElementById("apps-list");
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

// Function to fetch the app list using the package manager
async function fetchAppList() {
    try {
        const result = await execCommand("pm list packages -3 </dev/null 2>&1 | cat");
        return result.split("\n").map(line => line.replace("package:", "").trim()).filter(Boolean);
    } catch (error) {
        console.error("Failed to fetch app list:", error);
        return [];
    }
}

// Function to render apps
async function renderAppList() {
    await readExcludeFile();
    const apps = await fetchAppList();
    const sortedApps = apps.sort((a, b) => {
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
}

// Function to refresh the app list and clear the search input
async function refreshAppList() {
    const searchInput = document.getElementById("search");
    searchInput.value = '';
    const apps = appListContainer.querySelectorAll(".card");
    apps.forEach(app => app.style.display = "block");
    await renderAppList();
}

// Function to select all apps
function selectAllApps() {
    document.querySelectorAll(".checkbox").forEach(checkbox => checkbox.checked = true);
}

// Function to deselect all apps
function deselectAllApps() {
    document.querySelectorAll(".checkbox").forEach(checkbox => checkbox.checked = false);
}

let promptTimeout; // Variable to store the current timeout

// Function to show the prompt with a success or error message
function showPrompt(message, isSuccess = true) {
    const prompt = document.getElementById('prompt');
    prompt.textContent = message;
    prompt.classList.toggle('error', !isSuccess); // Apply error class if not success
    prompt.style.display = 'block';

    if (promptTimeout) {
        clearTimeout(promptTimeout);
    }

    promptTimeout = setTimeout(() => {
        prompt.style.display = 'none';
    }, 2000);
}

// Function to update the target list by executing a script
async function updateTargetList() {
    try {
        await execCommand("/data/adb/tricky_store/UpdateTargetList.sh");
        showPrompt("Successfully updated target.txt");
    } catch (error) {
        console.error("Failed to update target list:", error);
        showPrompt("Failed to update target.txt !", false);
    }
}

// Menu toggle functionality
function setupMenuToggle() {
    const menuButton = document.getElementById('menu-button');
    const menuOptions = document.getElementById('menu-options');

    menuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (menuOptions.classList.contains('visible')) {
            closeMenu();
        } else {
            menuOptions.style.display = 'block';
            setTimeout(() => {
                menuOptions.classList.remove('hidden');
                menuOptions.classList.add('visible');
                menuButton.classList.add('menu-open');
                menuButton.classList.remove('menu-closed');
            }, 10);
        }
    });

    document.addEventListener('click', (event) => {
        if (!menuOptions.contains(event.target) && event.target !== menuButton) {
            closeMenu();
        }
    });

    const closeMenuItems = ['refresh', 'select-all', 'deselect-all', 'update'];
    closeMenuItems.forEach(id => {
        const item = document.getElementById(id);
        if (item) {
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                closeMenu();
            });
        }
    });

    function closeMenu() {
        if (menuOptions.classList.contains('visible')) {
            menuOptions.classList.remove('visible');
            menuOptions.classList.add('hidden');
            menuButton.classList.remove('menu-open');
            menuButton.classList.add('menu-closed');
            setTimeout(() => {
                menuOptions.style.display = 'none';
            }, 300);
        }
    }
}

// Search functionality
document.getElementById("search").addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const apps = appListContainer.querySelectorAll(".card");
    apps.forEach(app => {
        const name = app.querySelector(".name").textContent.toLowerCase();
        app.style.display = name.includes(searchQuery) ? "block" : "none";
    });
});

// Add button click event to update EXCLUDE file
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
        const updatedExcludeContent = excludeList.join("\n");
        await execCommand(`echo "${updatedExcludeContent}" > /data/adb/tricky_store/target_list_config/EXCLUDE`);
        console.log("EXCLUDE file updated successfully.");
        showPrompt("Config saved successfully");
    } catch (error) {
        console.error("Failed to update EXCLUDE file:", error);
        showPrompt("Failed to save config", false);
    }
    await readExcludeFile();
});

// Event listener for the "Update Target List" menu option
document.getElementById('update').addEventListener('click', updateTargetList);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    setupMenuToggle();
    document.getElementById("refresh").addEventListener("click", refreshAppList);
    document.getElementById("select-all").addEventListener("click", selectAllApps);
    document.getElementById("deselect-all").addEventListener("click", deselectAllApps);
    renderAppList();
});

// Scroll event
let lastScrollY = window.scrollY;
const title = document.getElementById('title');
const searchCard = document.querySelector('.search-card');
const menu = document.querySelector('.menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > lastScrollY) {
        title.style.transform = 'translateY(-100%)';
        searchCard.style.transform = 'translateY(-40px)';
        menu.style.transform = 'translateY(-40px)';
    } else {
        title.style.transform = 'translateY(0)';
        searchCard.style.transform = 'translateY(0)';
        menu.style.transform = 'translateY(0)';
    }
    lastScrollY = window.scrollY;
});