URL="https://github.com/5ec1cff/KsuWebUIStandalone/releases/download/v1.0/KsuWebUI-1.0-34-release.apk"
APK_DIR="$COMPATH"

check_wget

echo "- Downloading the WebUI apk..."
download_webui
echo "- Download complete."

APK_PATH=$(find "$APK_DIR" -type f -name "*.apk" | head -n 1)
if [ -z "$APK_PATH" ]; then
    echo "Error: No APK file found in $APK_DIR."
    exit 1
fi

echo "- Installing..."
install_webui
echo "- Done."
rm -f "$APK_PATH"
echo "- Launching..."
am start -n "${PACKAGE_NAME}/.WebUIActivity" -e id "tricky_store" </dev/null 2>&1 | cat
if [ $? -ne 0 ]; then
    echo "Error: Failed to start application."
    exit 1
fi
echo "- Application launched successfully."