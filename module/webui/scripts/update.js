import { exec } from './assets/kernelsu.js';
import { basePath, showPrompt, noConnection, linkRedirect } from './main.js';
import { updateCard } from './applist.js';

const updateMenu = document.querySelector('.update-overlay');
const updateMenuContent = document.querySelector('.update-menu');
const closeUpdate = document.getElementById('close-update');
const releaseNotes = document.querySelector('.changelog');
const installButton = document.querySelector('.install');
const rebootButton = document.querySelector('.reboot');

let remoteVersionCode, remoteVersion, zipURL, changelogURL, downloading = false;

// Function to download file
function downloadFile(targetURL, fileName) {
    return new Promise((resolve, reject) => {
        fetch(targetURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const file = new File([blob], fileName, { type: blob.type });
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result.split(',')[1];
                    exec(`echo ${base64Data} | base64 -d > ${basePath}/common/tmp/${fileName}`)
                        .then(({ errno, stderr }) => {
                            errno === 0 ? resolve() : reject(stderr);
                        });
                };
                reader.readAsDataURL(file);
            })
            .catch(reject);
    });
}

// Function to check for updates
export async function updateCheck() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/update.json")
            .catch(async () => {
                return fetch("https://raw.gitmirror.com/KOWX712/Tricky-Addon-Update-Target-List/main/update.json");
            });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        noConnection.style.display = "none";
        const data = await response.json();
        remoteVersionCode = data.versionCode;
        remoteVersion = data.version;
        zipURL = data.zipUrl;
        changelogURL = data.changelog;

        const { stdout } = await exec(`sh ${basePath}/common/get_extra.sh --check-update ${remoteVersionCode}`);
        if (stdout.includes("update")) {
            showPrompt("prompt.new_update", true, 1500);
            updateCard.style.display = "flex";
            setupUpdateMenu();
        }
    } catch (error) {
        console.error("Error fetching JSON or executing command:", error);
        showPrompt("prompt.no_internet", false);
        noConnection.style.display = "flex";
    }
}

// Function to render changelog
function renderChangelog() {
    exec(`sh ${basePath}/common/get_extra.sh --release-note ${remoteVersion}`)
        .then(({ stdout }) => {
            window.linkRedirect = linkRedirect;
            marked.setOptions({
                sanitize: true,
                walkTokens(token) {
                    if (token.type === 'link') {
                        const href = token.href;
                        token.href = "javascript:void(0);";
                        token.type = "html";
                        token.text = `<a href="javascript:void(0);" onclick="linkRedirect('${href}')">${token.text}</a>`;
                    }
                }
            });
            const cleanedChangelog = stdout
                .split('\n')
                .filter(line => line.trim() !== '')
                .join('\n');
            const formattedChangelog = marked.parse(cleanedChangelog);
            releaseNotes.innerHTML = formattedChangelog;
        });
}

// Function to setup update menu
function setupUpdateMenu() {
    function openUpdateMenu() {
        updateMenu.style.display = "flex";
        setTimeout(async () => {
            updateMenu.style.opacity = "1";
            updateMenuContent.classList.add('open');
        }, 10);
        document.body.classList.add("no-scroll");
    }
    function closeUpdateMenu() {
        updateMenu.style.opacity = "0";
        updateMenuContent.classList.remove('open');
        document.body.classList.remove("no-scroll");
        setTimeout(async () => {
            updateMenu.style.display = "none";
        }, 200);
    }

    // Update card
    updateCard.addEventListener('click', async () => {
        try {
            const { stdout } = await exec(`
                [ -f ${basePath}/common/tmp/module.zip ] || echo "noModule"
                [ -f ${basePath}/common/tmp/changelog.md ] || echo "noChangelog"
                [ ! -f /data/adb/modules/TA_utl/update ] || echo "updated"
            `);
            if (stdout.trim().includes("updated")) {
                installButton.style.display = "none";
                rebootButton.style.display = "flex";
                openUpdateMenu();
            } else if (stdout.trim().includes("noChangelog")) {
                showPrompt("prompt.downloading");
                await downloadFile(changelogURL, "changelog.md");
                renderChangelog();
                openUpdateMenu();
                setTimeout(() => {
                    updateCard.click();
                }, 200);
            } else if (stdout.trim().includes("noModule")) {
                if (downloading) return;
                downloading = true;
                const { errno } = await exec(`sh ${basePath}/common/get_extra.sh --get-update ${zipURL}`);
                if (errno === 0) {
                    showPrompt("prompt.downloaded");
                    installButton.style.display = "flex";
                } else {
                    showPrompt("prompt.download_fail", false);
                }
                downloading = false;
            } else {
                installButton.style.display = "flex";
                renderChangelog();
                openUpdateMenu();
            }
        } catch (error) {
            showPrompt("prompt.download_fail", false);
            console.error('Error download module update:', error);
        }
    });

    // Close update menu
    closeUpdate.addEventListener("click", closeUpdateMenu);
    updateMenu.addEventListener("click", (event) => {
        if (event.target === updateMenu) closeUpdateMenu();
    });

    // Install button
    installButton.addEventListener('click', async () => {
        showPrompt("prompt.installing");
        await new Promise(resolve => setTimeout(resolve, 300));
        const { errno, stderr } = await exec(`sh ${basePath}/common/get_extra.sh --install-update`);
        if (errno === 0) {
            showPrompt("prompt.installed");
            installButton.style.display = "none";
            rebootButton.style.display = "flex";
        } else {
            showPrompt("prompt.install_fail", false);
            console.error('Fail to execute installation script:', stderr);
        }
    });

    // Reboot button
    rebootButton.addEventListener('click', async () => {
        try {
            showPrompt("prompt.rebooting");
            await new Promise(resolve => setTimeout(resolve, 1000));
            await exec("svc power reboot");
        } catch (error) {
            showPrompt("prompt.reboot_fail", false);
            console.error('Fail to reboot:', error);
        }
    });
}