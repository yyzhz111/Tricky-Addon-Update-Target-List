import { basePath, execCommand, showPrompt, noConnection } from './main.js';
import { updateCard } from './applist.js';

const updateCardText = document.getElementById('redirect-to-release');
const UpdateMenu = document.querySelector('.update-overlay');
const closeUpdate = document.querySelector('.close-update');
const releaseNotes = document.querySelector('.changelog');
const installButton = document.querySelector('.install');
const rebootButton = document.querySelector('.reboot');

// Function to run the update check
export async function updateCheck() {
    try {
        const output = await execCommand(`sh ${basePath}common/get_extra.sh --update`);
        console.log("update script executed successfully.");
        noConnection.style.display = "none";
        if (output.includes("update")) {
            console.log("Update detected from extra script.");
            showPrompt("prompt.new_update", true, 2000);
            updateCard.style.display = "flex";
            setupUpdateMenu();
        } else {
            console.log("No update detected from extra script.");
        }
    } catch (error) {
        console.error("Failed to execute update script:", error);
        showPrompt("prompt.no_internet", false);
        noConnection.style.display = "flex";
    }
}

// Function to setup update menu
function setupUpdateMenu() {
    function openUpdateMenu() {
        UpdateMenu.style.display = "flex";
        setTimeout(async () => {
            UpdateMenu.style.opacity = "1";
        }, 10);
        document.body.classList.add("no-scroll");
    }
    function closeUpdateMenu() {
        UpdateMenu.style.opacity = "0";
        document.body.classList.remove("no-scroll");
        setTimeout(async () => {
            UpdateMenu.style.display = "none";
        }, 200);
    }
    updateCard.addEventListener('click', async () => {
        try {
            const module = await execCommand(`[ -f ${basePath}common/tmp/module.zip ] || echo "false"`);
            if (module.trim() === "false") {
                showPrompt("prompt.downloading");
                await new Promise(resolve => setTimeout(resolve, 200));
                await execCommand(`sh ${basePath}common/get_extra.sh --get-update`);
                showPrompt("prompt.downloaded");
            }
            const changelog = await execCommand(`sh ${basePath}common/get_extra.sh --release-note`);
            const lines = changelog
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => line.startsWith('- ') ? line.slice(2) : line);
            const formattedChangelog = `
                    <li class="changelog-title">${lines[0]}</li>
                    ${lines.slice(1).map(line => `<li>${line}</li>`).join('')}
            `;
            releaseNotes.innerHTML = formattedChangelog;
            openUpdateMenu();
        } catch (error) {
            showPrompt("prompt.download_fail", false);
            console.error('Error download module update:', error);
        }
    });
    closeUpdate.addEventListener("click", closeUpdateMenu);
    UpdateMenu.addEventListener("click", (event) => {
        if (event.target === UpdateMenu) {
            closeUpdateMenu();
        }
    });
    installButton.addEventListener('click', async () => {
        try {
            showPrompt("prompt.installing");
            setTimeout(async () => {
                await execCommand(`sh ${basePath}common/get_extra.sh --install-update`);
                showPrompt("prompt.installed");
                installButton.style.display = "none";
                rebootButton.style.display = "flex";
            }, 300);
        } catch (error) {
            showPrompt("prompt.install_fail", false);
            console.error('Fail to execute installation script:', error);
        }
    });
    rebootButton.addEventListener('click', async () => {
        try {
            showPrompt("prompt.rebooting");
            setTimeout(async () => {
                await execCommand("svc power reboot");
            }, 1000);
        } catch (error) {
            showPrompt("prompt.reboot_fail", false);
            console.error('Fail to reboot:', error);
        }
    });
}