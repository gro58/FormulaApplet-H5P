# *ToDo* #

## FormulaApplet as an H5P package
* Exercise how to deal with other H5P packages (math, physics)
* Use apps.zum.de and unterrichten.zum.de
* Ask H5P Forum
* Use H5P-standalone or Lumi as an editor
* make H5P take care of type <p class="formula_applet solution" id="bla">TEX code</p> - mathQuillify(id).
## Coding
* <del>get rid of WaitFor...ThenDo constructs and sensorTimer.</del> Replaced by waiterFactory, createWaiter().<br> 
Maybe use of async/await is even better? Ask Sebastian Rettig?
* accept e.g. .080 for 0.080
* Virtual Keyboard: editor mode with Integral, Limit, no solution.
* avoid code doubling <del>(preparePage.js/refreshResultFieldClone - formulaapplet-editor.js/refreshResultField)</del>
* <del>move mathQuillifyEditor(fApp) from preparePage.js to formulaapplet-editor.js</del>
* delete console.logs of solution
* <del>semantic versioning. Change version numbers 2.8 and 2.10 to 0.x.y</del> patch number is increased by script prh.ps1<br/>
  package.json is also patched.
* <del>refactoring of fApp object or even **get rid of fApp object**</del> Done!
* 'missing input field' bug at 'addition theorem' example (index.html)
* <del>translate.js uses localStore<del> Obsolete. Replaced by H5Pbridge.docLang()
* VirtualKeyboard position (improved. Still not perfect)
* Use iife, revealing module pattern, OOP
* Use JSDoc https://jsdoc.app/ Started!
* enable debugging in Visual Studio Code
* <del>Render \cdot as times(cross) if docLang()=en</del>
* <del>Render , as . if docLang()=en</del>
* e for Exponent interferes with e for Euler's number.
* try/catch
* Tests (https://developer.mozilla.org/en-US/docs/Web/API/console/assert), unit tests, jest
* Test using tree2tex.js
* Tests using browsers like FireFox, IE, Edge, and using OS like Linux, Android, iOS
* <del>separate code for "replace"</del> **Done!**
* if two solutions: The order should not matter.

## Nice to have
* Mobile devices: Get rid of virtual keyboard by expanding the system keyboard
* Transfer this list (ToDo.md) to Issues (GitHub)
* Integral, Limit (virtualKeyboard - editor mode)
* Block trivial solutions
* Random parameters for varying problems
* condition = ...
* number of significant digits
* Natural constants like e, c,...
* <del>Contact Karl Kirst</del> **Done!**
* Hammer as jQuery plugin. Why?
* <del>H5P Editor</del>
* asinh, acosh, atanh
* Complex Numbers
* Vectors
* Check only after pressing Enter
* GeoGebra as an H5P package. Why?
## GitHub
* License (2nd)
* [GIT Cheat Sheet](../../git-cheat.php "Spickzettel für GIT")
## www.formelapplet.de
1) <del>Beispiele/Examples</del> **Done!**
1) GWK
1) Tree (Kategorienbaum)
1) Befreundete Seiten
1) YouTube HowTo (stable Version of Formula Applet needed)
1) DOC, Usage
1) Search with Phuchs
1) Community, Support
