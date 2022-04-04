## 2022-04-04
* circular dependencies
<pre>
bundles src/main.js ? public\build\bundle.js...
after 2 seconds
(!) Circular dependencies
D:\Users\privat\Laufwerk_E\gut\gf09\main\src\js\preparePage.js -> D:\Users\privat\Laufwerk_E\gut\gf09\main\src\js\editHandler.js -> D:\Users\privat\Laufwerk_E\gut\gf09\main\src\js\preparePage.js
D:\Users\privat\Laufwerk_E\gut\gf09\main\src\main.js -> D:\Users\privat\Laufwerk_E\gut\gf09\main\src\js\preparePage.js -> D:\Users\privat\Laufwerk_E\gut\gf09\main\src\js\virtualKeyboard.js -> D:\Users\privat\Laufwerk_E\gut\gf09\main\src\main.js
created public\build\bundle.js in 2.3s
</pre>

* <del>Kopieren der bundle.js und bundle.map.js eventuell zu spät (vor dem bundling)?</del> Gelöst: Use	hook: "writeBundle" in rollup.config.js

* provisorische Lösung:
  * !patchrun.ps1, ruft patch.sh und npm run h5p#
  * warten auf Rückmeldung des bundlers, dann Batch-Datei copybundles.cmd
* Turnaround-Zeit 
  * bei Docker/Drupal7/H5P OK.
  * Docker/WordPress/H5P nutzt das development-Verzeichnis nicht. Gelöst: Nur Drupal7/H5P zum Entwickeln nehmen, nicht Wordpress/H5P  
* falls alles passt, commit, ab und zu push
* bei größeren Änderungen vorher branch und danach, wenn alles passt, pull request und merge
* GIT: Wie macht man commit rückgängig? 
  * Gelöst: VSC - Quellcodeverwaltung - DreiPunkteMenü - Commit - letzten Commit rückgängig machen & Änderungen - Änderungen verwerfen
* WordPress: Theme "2021":
  * CSS für visual keyboard OK, fix am unteren Bildschirmrand
  * CSS bei Editor buggy, visual keyboard am unteren Seitenrand: Fehlerursache iFrame
* Sprache wechseln in Drupal7 OK. In WordPress: kein Erfolg
## Dies und Das
* (function(){ ... })(); oder (function(){ ... }());
* wieso npm run build, aber npm start ohne run? Antwort: "npm start" ist Shortcut für "npm run start"
* Ständig muss man manuell den Cache von Chrome löschen
  *  Es gibt eine Chrome-Einstellung "Disable cache (while DevTools is open)", die bewirkt aber nichts. 
  *  Hilfe: Chrome Shortcut für "Reload mit Cache löschen": Strg-Shift-R
## nice to have...
* npm run h5p braucht keinen Abbruch der Batch-Datei
* npm run h5p wartet, bis bundle fertig und kopiert dann oder ruft ./copybundles
* livereload auch für Drupal
* Variante, die die *.map-Dateien in E:\gut\gf09\h5p\development\* löscht.
* VSC merkt sich Window-Size nicht. Problem mit Zusatz-Bildschirm
