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

# create new versionnumber file
touch "../version-$VERSIONNUMBER.txt"
#'git add' causes staging!
git add ../version-$VERSIONNUMBER.txt


#FILENAME=./test_lineendings.txt
#rm $FILENAME
#cp $FILENAME.ori $FILENAME
#sed -i "s/__VERSION__/$VERSIONNUMBER/g" $FILENAME
#git add $FILENAME  2>warning.txt
#echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"

FILENAME=src/js/config.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
sed -i "s/__VERSION__/$VERSIONNUMBER/g" $FILENAME
git add $FILENAME  2>warning.txt
echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"

FILENAME=./package.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME  2>warning.txt
echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"
sleep 4

FILENAME=../h5p/development/H5P.FormulaApplet-$MAJORNUMBER.$MINORNUMBER/library.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME  2>warning.txt
echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"

FILENAME=../h5p/development/H5PEditor.FormulaAppletEditor-$MAJORNUMBER.$MINORNUMBER/library.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME  2>warning.txt
echo "[patchmore.sh] patched file $FILENAME with version number $VERSIONNUMBER"

((PATCHNUMBER=PATCHNUMBER+1))
echo $PATCHNUMBER > ./nextpatchnumber.txt
# echo "[patch.sh] next patch number: $PATCHNUMBER"

rm ./warning.txt
# "git add" also has to "add" the deletion, but only if stashed before!
# git add ./warning.txt

# https://linuxconfig.org/bash-script-pause-script-before-proceeding
read -p "Pausing for 60 seconds" -t 60

