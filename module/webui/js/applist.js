import { basePath, execCommand, floatingBtn } from './main.js';

const appTemplate = document.getElementById('app-template').content;
export const appListContainer = document.getElementById('apps-list');
export const updateCard = document.getElementById('update-card');

// Fetch and render applist
export async function fetchAppList() {
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