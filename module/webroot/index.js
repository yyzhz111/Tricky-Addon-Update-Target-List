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
    apps.forEach(appName => {
        const appElement = document.importNode(appTemplate, true);
        appElement.querySelector(".name").textContent = appName;
        const checkbox = appElement.querySelector(".checkbox");
        checkbox.checked = !excludeList.includes(appName); // Deselect if in EXCLUDE
        appListContainer.appendChild(appElement);
    });
}

// Add button click event to update EXCLUDE file
document.getElementById("add").addEventListener("click", async () => {
    await readExcludeFile();
    const deselectedApps = Array.from(appListContainer.querySelectorAll(".checkbox:not(:checked)"))
        .map(checkbox => checkbox.closest(".card").querySelector(".name").textContent);
    const selectedApps = Array.from(appListContainer.querySelectorAll(".checkbox:checked"))
        .map(checkbox => checkbox.closest(".card").querySelector(".name").textContent);
    // Add deselected apps to EXCLUDE if not already present
    for (const app of deselectedApps) {
        if (!excludeList.includes(app)) {
            excludeList.push(app); // Add to the local list
            console.log("Added to EXCLUDE list:", app);
        } else {
            console.log("App already in EXCLUDE file, skipping:", app);
        }
    }
    // Remove selected apps from EXCLUDE
    if (selectedApps.length > 0) {
        selectedApps.forEach(app => {
            excludeList = excludeList.filter(excludedApp => excludedApp !== app); // Remove from local list
            console.log("Removed from EXCLUDE list:", app);
        });
    }
    // Overwrite the EXCLUDE file with the updated list
    try {
        const updatedExcludeContent = excludeList.join("\n");
        await execCommand(`echo "${updatedExcludeContent}" > /data/adb/tricky_store/target_list_config/EXCLUDE`);
        console.log("EXCLUDE file updated successfully.");
    } catch (error) {
        console.error("Failed to update EXCLUDE file:", error);
    }
    await readExcludeFile();
});

// Search functionality
document.getElementById("search").addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const apps = appListContainer.querySelectorAll(".card");
    apps.forEach(app => {
        const name = app.querySelector(".name").textContent.toLowerCase();
        app.style.display = name.includes(searchQuery) ? "block" : "none";
    });
});

// Initial load
renderAppList();