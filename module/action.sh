MODDIR=${0%/*}
echo "**********************************************"
echo "- Staring script..."
echo " "

sh "$MODDIR"/common/UpdateTargetList.sh || true

echo "**********************************************"
echo "\(__All set!__)/"