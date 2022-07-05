D:
cd D:\Users\privat\Laufwerk_E\gut\gf09-h5p\make-h5p
dir
del temp.h5p
copy .\template.h5p .\temp.h5p
D:\PortableApps\7-ZipPortable\App\7-Zip\7z a temp.h5p D:\Users\privat\Laufwerk_E\gut\gf09-h5p\h5p\development\H5P.FormulaApplet-0.14
pause
D:\PortableApps\7-ZipPortable\App\7-Zip\7z a temp.h5p D:\Users\privat\Laufwerk_E\gut\gf09-h5p\h5p\development\H5PEditor.FormulaAppletEditor-0.14
pause
D:\PortableApps\7-ZipPortable\App\7-Zip\7z d temp.h5p *.map *.ori .???ignore -r
pause
