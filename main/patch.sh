#!/bin/bash

PATCHNUMBER=$(cat nextpatchnumber.txt)
echo "[patch.sh] patch number: $PATCHNUMBER"

rm ../patch-*.txt
touch "../patch-$PATCHNUMBER.txt"
# "git add" also has to "add" the deletion!
git add ../patch-*.txt


FILENAME=src/js/config.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
# git add $FILENAME
echo "[patch.sh] patched file $FILENAME with patch number $PATCHNUMBER"

FILENAME=./package.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
# git add $FILENAME
echo "[patch.sh] patched file $FILENAME with patch number $PATCHNUMBER"

FILENAME=../h5p/development/H5P.FormulaApplet-0.12/library.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME
echo "[patch.sh] patched file $FILENAME with patch number $PATCHNUMBER"

FILENAME=../h5p/development/H5PEditor.FormulaAppletEditor-0.12/library.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME
echo "[patch.sh] patched file $FILENAME with patch number $PATCHNUMBER"

((PATCHNUMBER=PATCHNUMBER+1))
echo $PATCHNUMBER > ./nextpatchnumber.txt
echo "[patch.sh] next patch number: $PATCHNUMBER"
# https://linuxconfig.org/bash-script-pause-script-before-proceeding
read -p "Pausing for 30 seconds" -t 30

