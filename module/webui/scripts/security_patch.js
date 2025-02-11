import { execCommand, showPrompt } from './main.js';

const overlay = document.getElementById('security-patch-overlay');
const card = document.getElementById('security-patch-card');
const advancedToggle = document.getElementById('advanced-mode');
const normalInputs = document.getElementById('normal-mode-inputs');
const advancedInputs = document.getElementById('advanced-mode-inputs');
const allPatchInput = document.getElementById('all-patch');
const bootPatchInput = document.getElementById('boot-patch');
const systemPatchInput = document.getElementById('system-patch');
const vendorPatchInput = document.getElementById('vendor-patch');
const autoButton = document.getElementById('auto-config');
const saveButton = document.getElementById('save-patch');

export function showSecurityPatchDialog() {
    overlay.style.display = 'block';
    card.style.display = 'block';
    loadCurrentConfig();
}

// Hide security patch dialog
function hideSecurityPatchDialog() {
    overlay.style.display = 'none';
    card.style.display = 'none';
}

// Load current configuration
async function loadCurrentConfig() {
    try {
        const result = await execCommand('cat /data/adb/security_patch');
        if (result) {
            const lines = result.split('\n');
            let autoConfig = '1', allValue = '0', bootValue = '0', systemValue = '0', vendorValue = '0';
            for (const line of lines) {
                if (line.startsWith('auto_config=')) {
                    autoConfig = line.split('=')[1];
                }
            }

            if (autoConfig === '1') {
                allValue = null;
                bootValue = null;
                systemValue = null;
                vendorValue = null;
                overlay.classList.add('hidden');
            } else {
                // Read values from tricky_store if auto_config is 0
                const trickyResult = await execCommand('cat /data/adb/tricky_store/security_patch.txt');
                if (trickyResult) {
                    const trickyLines = trickyResult.split('\n');
                    for (const line of trickyLines) {
                        if (line.startsWith('all=')) {
                            allValue = line.split('=')[1] || null;
                            if (allValue !== null) allPatchInput.value = allValue;
                        }
                        if (line.startsWith('boot=')) {
                            bootValue = line.split('=')[1] || null;
                            if (bootValue !== null) bootPatchInput.value = bootValue;
                        }
                        if (line.startsWith('system=')) {
                            systemValue = line.split('=')[1] || null;
                            if (systemValue !== null) systemPatchInput.value = systemValue;
                        }
                        if (line.startsWith('vendor=')) {
                            vendorValue = line.split('=')[1] || null;
                            if (vendorValue !== null) vendorPatchInput.value = vendorValue;
                        }
                    }
                }
                overlay.classList.add('hidden');
            }

            // Check if in advanced mode
            if (autoConfig === '0' && allValue === null && (bootValue || systemValue || vendorValue)) {
                advancedToggle.checked = true;
                normalInputs.classList.add('hidden');
                advancedInputs.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Failed to load security patch config:', error);
    }
}

// Validate date format YYYY-MM-DD
function isValidDateFormat(date) {
    if (date === 'no') return true;
    const regex = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
    return regex.test(date);
}

// Validate 6-digit format YYYYMM
function isValid6Digit(value) {
    if (value === 'prop') return true;
    const regex = /^\d{6}$/;
    return regex.test(value);
}

// Validate 8-digit format YYYYMMDD
function isValid8Digit(value) {
    const regex = /^\d{8}$/;
    return regex.test(value);
}

// Initialize event listeners
export function securityPatch() {
    document.getElementById("security-patch").addEventListener("click", showSecurityPatchDialog);

    // Toggle advanced mode
    advancedToggle.addEventListener('change', () => {
        normalInputs.classList.toggle('hidden');
        advancedInputs.classList.toggle('hidden');
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hideSecurityPatchDialog();
        }
    });

    // Auto config button
    autoButton.addEventListener('click', async () => {
        try {
            await execCommand(`sed -i "s/^auto_config=.*/auto_config=1/" /data/adb/security_patch`);
            showPrompt('security_patch.auto_success');
        } catch (error) {
            showPrompt('security_patch.auto_failed');
        }
        hideSecurityPatchDialog();
        loadCurrentConfig();
    });

    // Save button
    saveButton.addEventListener('click', async () => {
        if (!advancedToggle.checked) {
            // Normal mode validation
            const allValue = allPatchInput.value.trim();
            if (!allValue) {
                showPrompt('security_patch.value_empty');
                return;
            }
            if (!isValid8Digit(allValue)) {
                showPrompt('security_patch.invalid_all');
                return;
            }
            try {
                await execCommand(`
                    sed -i "s/^auto_config=.*/auto_config=0/" /data/adb/security_patch
                    echo all=${allValue} > /data/adb/tricky_store/security_patch.txt
                `);
                showPrompt('security_patch.save_success');
            } catch (error) {
                showPrompt('security_patch.save_failed');
            }
        } else {
            // Advanced mode validation
            const bootValue = bootPatchInput.value.trim();
            const systemValue = systemPatchInput.value.trim();
            const vendorValue = vendorPatchInput.value.trim();

            if (!bootValue && !systemValue && !vendorValue) {
                showPrompt('security_patch.value_empty');
                return;
            }

            if (bootValue && !isValid6Digit(bootValue)) {
                showPrompt('security_patch.invalid_boot');
                return;
            }

            if (systemValue && !isValidDateFormat(systemValue)) {
                showPrompt('security_patch.invalid_system');
                return;
            }

            if (vendorValue && !isValidDateFormat(vendorValue)) {
                showPrompt('security_patch.invalid_vendor');
                return;
            }

            try {
                const config = [
                    bootValue ? `boot=${bootValue}` : '',
                    systemValue ? `system=${systemValue}` : '',
                    vendorValue ? `vendor=${vendorValue}` : ''
                ].filter(Boolean);
                await execCommand(`
                    sed -i "s/^auto_config=.*/auto_config=0/" /data/adb/security_patch
                    echo "${config.join(' ')}" > /data/adb/tricky_store/security_patch.txt
                `);
                showPrompt('security_patch.save_success');
                hideSecurityPatchDialog();
            } catch (error) {
                showPrompt('security_patch.save_failed');
            }
        }
        hideSecurityPatchDialog();
        loadCurrentConfig();
    });
}