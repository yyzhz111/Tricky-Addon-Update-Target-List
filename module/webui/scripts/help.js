const helpButton = document.getElementById('help-button');
const helpOverlay = document.getElementById('help-overlay');
const closeHelp = document.getElementById('close-help');
const helpList = document.getElementById('help-list');

// Open help menu
helpButton.addEventListener("click", () => {
    helpOverlay.classList.remove("hide");
    helpOverlay.style.display = "flex";
    requestAnimationFrame(() => {
        helpOverlay.classList.add("show");
    });
    document.body.classList.add("no-scroll");
});

const hideHelpOverlay = () => {
    helpOverlay.classList.remove("show");
    helpOverlay.classList.add("hide");
    document.body.classList.remove("no-scroll");
    setTimeout(() => {
        helpOverlay.style.display = "none";
    }, 200);
};

// Close help menu
closeHelp.addEventListener("click", hideHelpOverlay);
helpOverlay.addEventListener("click", (event) => {
    if (event.target === helpOverlay) {
        hideHelpOverlay();
    }
});