import { basePath, execCommand, showPrompt, noConnection } from './main.js';
import { updateCard } from './applist.js';

// Function to run the update check
export async function updateCheck() {
    try {
        const output = await execCommand(`sh ${basePath}common/get_extra.sh --update`);
        console.log("update script executed successfully.");
        noConnection.style.display = "none";
        if (output.includes("update")) {
            console.log("Update detected from extra script.");
            showPrompt("prompt.new_update");
            updateCard.style.display = "flex";
        } else {
            console.log("No update detected from extra script.");
        }
    } catch (error) {
        console.error("Failed to execute update script:", error);
        showPrompt("prompt.no_internet", false);
        noConnection.style.display = "flex";
    }
}
