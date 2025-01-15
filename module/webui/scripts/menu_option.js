import { basePath, execCommand, showPrompt, toast } from './main.js';

// Function to check or uncheck all app
function toggleCheckboxes(shouldCheck) {
    document.querySelectorAll(".card").forEach(card => {
        if (card.style.display !== "none") {
            card.querySelector(".checkbox").checked = shouldCheck;
        }
    });
}

// Function to select all visible apps
document.getElementById("select-all").addEventListener("click", () => toggleCheckboxes(true));

// Function to deselect all visible apps
document.getElementById("deselect-all").addEventListener("click", () => toggleCheckboxes(false));

// Function to read the denylist and check corresponding apps
document.getElementById("select-denylist").addEventListener("click", async () => {
    try {
        const result = await execCommand(`magisk --denylist ls 2>/dev/null | awk -F'|' '{print $1}' | grep -v "isolated" | sort | uniq`);
        const denylistApps = result.split("\n").map(app => app.trim()).filter(Boolean);
        const apps = document.querySelectorAll(".card");
        toggleCheckboxes(false);
        apps.forEach(app => {
            const contentElement = app.querySelector(".content");
            const packageName = contentElement.getAttribute("data-package");
            const checkbox = app.querySelector(".checkbox");
            if (denylistApps.includes(packageName)) {
                checkbox.checked = true;
            }
        });
        console.log("Denylist apps selected successfully.");
    } catch (error) {
        toast("Failed to read DenyList!");
        console.error("Failed to select Denylist apps:", error);
    }
});

// Function to read the exclude list and uncheck corresponding apps
document.getElementById("deselect-unnecessary").addEventListener("click", async () => {
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
        toast("Failed!");
        console.error("Failed to deselect unnecessary apps:", error);
    }
});

// Function to replace aosp kb
export async function aospkb() {
    try {
        const sourcePath = `${basePath}common/.default`;
        const destinationPath = "/data/adb/tricky_store/keybox.xml";
        await execCommand(`mv -f ${destinationPath} ${destinationPath}.bak && xxd -r -p ${sourcePath} | base64 -d > ${destinationPath}`);
        console.log("AOSP keybox copied successfully.");
        showPrompt("prompt.aosp_key_set");
    } catch (error) {
        console.error("Failed to copy AOSP keybox:", error);
        showPrompt("prompt.key_set_error", false);
    }
}

// Function to replace valid kb
document.getElementById("extrakb").addEventListener("click", async () => {
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
        await execCommand(`mv -f ${destinationPath} ${destinationPath}.bak && xxd -r -p ${sourcePath} | base64 -d > ${destinationPath}`);
        console.log("Valid keybox copied successfully.");
        showPrompt("prompt.valid_key_set");
    } catch (error) {
        console.error("Failed to copy valid keybox:", error);
        await aospkb();
        showPrompt("prompt.no_valid_fallback", false);
    }
});