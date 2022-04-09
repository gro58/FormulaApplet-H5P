## 2022-04-04
* <del>circular dependencies</del> Gelöst.
* <del>Kopieren der bundle.js und bundle.map.js eventuell zu spät (vor dem bundling)?</del> Gelöst: Use	hook: "writeBundle" in rollup.config.js<del>
* Turnaround-Zeit 
  * Gelöst: Nur Drupal7/H5P zum Entwickeln nehmen, nicht Wordpress/H5P  
* falls alles passt, commit, ab und zu push; bei größeren Änderungen vorher branch und danach, wenn alles passt, pull request und merge
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
  *  Hilfe: Chrome Shortcut für "Reload inclusive Löschen des Cache": Strg-Shift-R
## nice to have...
* npm run h5p braucht keinen Abbruch der Batch-Datei
* livereload auch für Drupal
* Variante, die die *.map-Dateien in E:\gut\gf09\h5p\development\* löscht.
* VSC merkt sich Window-Size nicht. Problem mit Zusatz-Bildschirm
