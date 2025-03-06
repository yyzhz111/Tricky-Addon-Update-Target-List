import { execCommand, showPrompt } from './main.js';

const bootHashOverlay = document.getElementById('boot-hash-overlay');
const inputBox = document.getElementById('boot-hash-input');
const saveButton = document.getElementById('boot-hash-save-button');

// Remove empty spaces from input and convert to lowercase
window.trimInput = (input) => {
    input.value = input.value.replace(/\s+/g, '').toLowerCase();
};

// Function to handle Verified Boot Hash
document.getElementById("boot-hash").addEventListener("click", async () => {
    // Display boot hash menu
    document.body.classList.add("no-scroll");
    bootHashOverlay.style.display = "flex";
    setTimeout(() => {
        bootHashOverlay.style.opacity = 1;
    }, 10);

    const closeBootHashMenu = () => {
        document.body.classList.remove("no-scroll");
        bootHashOverlay.style.opacity = 0;
        setTimeout(() => {
            bootHashOverlay.style.display = "none";
        }, 200);
    };
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
            await execCommand(`
                PATH=/data/adb/ap/bin:/data/adb/ksu/bin:/data/adb/magisk:$PATH
                resetprop -n ro.boot.vbmeta.digest ${inputValue}
                [ -z "${inputValue}" ] && rm -f /data/adb/boot_hash || {
                    echo "${inputValue}" > /data/adb/boot_hash
                    chmod 644 /data/adb/boot_hash
                }
            `);
            showPrompt("prompt.boot_hash_set");
            closeBootHashMenu();
        } catch (error) {
            console.error("Failed to update boot_hash:", error);
            showPrompt("prompt.boot_hash_set_error", false);
        }
    });
    bootHashOverlay.addEventListener("click", (event) => {
        if (event.target === bootHashOverlay) closeBootHashMenu();
    });

    // Enter to save
    inputBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveButton.click();
        }
    });
});