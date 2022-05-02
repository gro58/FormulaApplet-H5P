# *ToDo* #

## FormulaApplet as an H5P package
* Exercise how to deal with other H5P packages (math, physics)
* Use apps.zum.de and unterrichten.zum.de
* Ask H5P Forum
* Use H5P-standalone or Lumi as an editor
## Coding
* <del>get rid of WaitFor...ThenDo constructs and sensorTimer.</del> Replaced by waiterFactory, createWaiter().</br> 
Maybe use of async/await is even better? Ask Sebastian Rettig?
* accept e.g. .080 for 0.080
* avoid code doubling <del>(preparePage.js/refreshResultFieldClone - formulaapplet-editor.js/refreshResultField)</del>
* <del>move mathQuillifyEditor(fApp) from preparePage.js to formulaapplet-editor.js</del>
* delete console.logs of solution
* semantic versioning. <del>Change version numbers 2.8 and 2.10 to 0.x.y</del>
* refactoring of fApp object
* 'missing input field' bug at 'addition theorem' example (index.html)
* translate.js uses localStore
* VirtualKeyboard position
* Use iife, revealing module pattern, OOP
* Use JSDoc https://jsdoc.app/ Started!
* enable debugging in Visual Studio Code
* <del>Render \cdot as times(cross) if lang=en</del>
* <del>Render , as . if lang=en</del>
* e for Exponent interferes with e for Euler's number.
* try/catch
* Tests (https://developer.mozilla.org/en-US/docs/Web/API/console/assert), unit tests, jest
* Test using tree2tex.js
* Tests using browsers like FireFox, IE, Edge, and using OS like Linux, Android, iOS

## Nice to have
* Mobile devices: Get rid of virtual keyboard by expanding the system keyboard
* Transfer this list (ToDo.md) to Issues (GitHub)
* Integral, Limit (virtualKeyboard - editor mode)
* Block trivial solutions
* Random parameters for varying problems
* condition = ...
* number of significant digits
* Natural constants like e, c,...
* Contact Karl Kirst
* Hammer as jQuery plugin. Why?
* <del>H5P Editor</del>
* asinh, acosh, atanh
* Complex Numbers
* Vectors
* Check only after pressing Enter
* GeoGebra as an H5P package. Why?
## GitHub
* <del>Instruction: Install with PHP</del> 
* License (2nd)
* ToDo (this file)
## [GIT Cheat Sheet](../../git-cheat.php "Spickzettel für GIT")
## wp.formelapplet.de
* Beispiele/Examples
* GWK
* rename to www.formelapplet.de
## www.formelapplet.de
* Tree (Kategorienbaum)
* Befreundete Seiten
* YouTube HowTo (stable Version of Formula Applet needed)
* DOC, Usage
* Search with Phuchs
* Community, Support
