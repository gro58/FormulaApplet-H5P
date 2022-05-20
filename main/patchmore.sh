#!/bin/bash
#

MAJORNUMBER=0
MINORNUMBER=13
PATCHNUMBER=$(cat nextpatchnumber.txt)
VERSIONNUMBER=$MAJORNUMBER.$MINORNUMBER.$PATCHNUMBER
echo "[patchmore.sh] version number: $VERSIONNUMBER"

# 
rm ../version-*.txt
# "git add" also has to "add" the deletion!
git add ../version-*.txt
touch "../version-$VERSIONNUMBER.txt"
git add ../version-$VERSIONNUMBER.txt


FILENAME=src/js/test_lineendings.txt
rm $FILENAME
cp $FILENAME.ori $FILENAME
echo "[patchmore.sh] copied file $FILENAME.ori to $FILENAME"

FILENAME=src/js/config.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
sed -i "s/__VERSION__/$VERSIONNUMBER/g" $FILENAME
git add $FILENAME
echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"

FILENAME=./package.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME
echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"
sleep 4

FILENAME=../h5p/development/H5P.FormulaApplet-$MAJORNUMBER.$MINORNUMBER/library.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME
echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"

FILENAME=../h5p/development/H5PEditor.FormulaAppletEditor-$MAJORNUMBER.$MINORNUMBER/library.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME
echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"

((PATCHNUMBER=PATCHNUMBER+1))
echo $PATCHNUMBER > ./nextpatchnumber.txt
# echo "[patch.sh] next patch number: $PATCHNUMBER"
# https://linuxconfig.org/bash-script-pause-script-before-proceeding
read -p "Pausing for 60 seconds" -t 60

