"use strict";

/** JSDoc documentation
 * [JSDoc]{@link https://jsdoc.app/index.html} Documentation
 * npm run doc
 */

/**
 * read <p class="formula_applet" ...>TEX with {{result}}</p>,
 * assemble fApp objects, store in FAList. MathQuillify(id)
 * Install mathQuillEditHandler, clickHandler, hammer (doubletap)
 * if isEditor: prepareEditorApplet from editor.js
 */
import $ from "jquery";
import MQ from "./lib/mathquillWrapper.js";
import Hammer from "@egjs/hammerjs";
// import mathQuillEditHandler from "./editHandler.js";
import {
  domLoad,
  isH5P,
  docLang
} from "./dom.js";
import {
  H5P_to_MathQuill
} from "./replacements.js";
import config from "./config.json";
import decode from "./decode.js";

import initVirtualKeyboard, {
  showVirtualKeyboard
} from "./virtualKeyboard.js";

//TODO hide global vars
var FAList = {};
export let editor_fApp = {};

var default_fApp = {
  id: '',
  hasSolution: undefined,
  solution: '',
  hasResultField: true,
  formulaApplet: '',
  mqEditableField: '',
  mathField: '',
  hammer: '',
  definitionsetList: [],
  precision: config.defaultPrecision,
  unitAuto: false,
}

export default async function preparePage() {
  await domLoad;

  // body click deselects all applets
  $('body').on('click', function () {
    $(".formula_applet").removeClass('selected');
    $("button.keyb_button").removeClass('selected');
  });

  // make tab key work
  $('body').on('keyup', function (ev) {
    var key = ev.originalEvent.key;
    if (key == 'Tab') {
      var fa = $(ev.target).parents('.formula_applet');
      // var id = $(fa).attr('id');
      fa.trigger('click');
    }
  });
  // initTranslation(); //not for H5P. Call manually for HTML
  initVirtualKeyboard();
  mathQuillifyAll();
}

export async function mathQuillifyAll() {
  try {
    // if class="formula_applet mq-math-mode ...", then already mathquillified, 
    $(".formula_applet:not(.mq-math-mode)").each(function () {
      // retrieve ids of .formula_applet
      // if editor, id ends with -edit
      mathQuillify(this.id);
    });
  } catch (error) {
    console.error('ERROR: ' + error);
  }
}

export async function mathQuillify(id) {
  await domLoad;
  // create new FApp object and store it in FAList
  // var fApp = new FApp();
  var fApp = Object.create(default_fApp);
  // H5P: applets should have different ids in view mode and in edit mode
  var isEditor = (id.slice(-5) === '-edit');
  if (isEditor) {
    // prepare for getHTML()
    // id is not changed, still ends with -edit
    fApp.id = id.slice(0, -5);
  } else {
    fApp.id = id
  }

  var $el = $('#' + id + '.formula_applet:not(.mq-math-mode)');
  if (typeof $el === 'undefined') {
    throw id + ' not found';
  }
  // activate mouse clicks
  $el.on('click', clickHandler);

  var domElem = $el[0];
  if (typeof domElem !== 'undefined') {
    // var temp = domElem.innerHTML;

    var language = docLang();
     if (isEditor){
      var mf = document.getElementById('math-field');
      var expression = mf.textContent;
      var temp = H5P_to_MathQuill(expression, '', language, isEditor) // solution=''
      console.log('editor & H5P - does this ever happen?');
      mf.textContent = temp;
    } else {
      expression = domElem.innerHTML;
      var temp = H5P_to_MathQuill(expression, '', language, isEditor) // solution=''
       domElem.innerHTML = temp;
    }
    // var temp = H5P_to_MathQuill(domElem.innerHTML, '', language, isEditor);

    // temp = temp.replace(/{{result}}/g, '\\MathQuillMathField{}');
    // temp = temp.replace(/\\Ohm/g, '\\Omega');
    // temp = temp.replace(/\\mathrm/g, '');
    // temp = temp.replace(/\\unit{/g, config.unit_replacement);
    // temp = temp.replace(/\\times/g, config.multiplicationDot);
    // // temp = temp.replace(/\\cdot/g, config.multiplicationCross);
    // //TODO simplify code 
    // if (isEditor && isH5P()) {
    //   console.log('H5P & Editor');
    //   var mf = document.getElementById('math-field');
    //   temp = mf.textContent;
    //   console.log('editor & H5P: replace {{result}} with \\class{inputfield}{} - does this ever happen?');
    //   temp = temp.replace(/{{result}}/g, '\\class{inputfield}{}');
    //   mf.textContent = temp;
    // } else {
    //   domElem.innerHTML = temp; // does not work with H5P-Editor!!!
    // }



    fApp.formulaApplet = domElem;

    if (isEditor) {
      fApp.hasResultField = true;
    } else {
      fApp.hasResultField = ($el.html().indexOf('\\MathQuillMathField{}') >= 0);
    }

    // retrieve definitionsets
    var def = $el.attr('def');
    if (typeof def !== 'undefined') {
      fApp.definitionsetList = unifyDefinitions(def);
    }
    // physics mode or math mode
    var unitAttr = $el.attr('unit');
    var unitAuto = (typeof unitAttr !== 'undefined' && unitAttr === 'auto');
    // mode="physics" is a synonym for "unit="auto"
    var modeAttr = $el.attr('mode');
    var modePhysics = (typeof modeAttr !== 'undefined' && modeAttr === 'physics');
    fApp.unitAuto = unitAuto || modePhysics;

    // retrieve precision
    var prec = $el.attr('precision');
    if (typeof prec === 'undefined') {
      // second chance: allow abbreviation 'prec' for attribute 'precision'
      prec = $el.attr('prec');
    }
    fApp.precision = sanitizePrecision(prec);

    if (typeof $el.attr('data-b64') !== 'undefined') {
      fApp.hasSolution = true;
      fApp.solution = decode($el.attr('data-b64'));
    } else {
      fApp.hasSolution = false;
    }

    // store FApp object in FAList and take id as key
    // editor applets: id ends with -edit, fApp.id is shortened
    FAList[id] = fApp;
  } else {
    throw 'ERROR: no domElem';
  }

  var mqEditableField;
  if (isEditor) {
    editor_fApp = fApp;
  } else {
    // *** no editor ***
    try {
      MQ.StaticMath(domElem);
      // MQ.StaticMath seems to generate a mqEditableField
    } catch (err) {
      console.error('Error using MQ.StaticMath: ' + err);
      console.trace();
    }
    try {
      if (fApp.hasResultField) {
        mqEditableField = $el.find('.mq-editable-field')[0];
        fApp.mqEditableField = mqEditableField;
        mf = MQ.MathField(mqEditableField, {});
        mf.config({
          handlers: {
            edit: () => {
              mqEditableField.focus();
              mathQuillEditHandler(fApp, MQ);
            },
            enter: () => {
              mathQuillEditHandler(fApp, MQ);
            },
          }
        });
        fApp.mathField = mf;

        // make touch sensitive
        try {
          fApp.hammer = new Hammer(mqEditableField);
          fApp.hammer.on("doubletap", function () {
            showVirtualKeyboard();
          });
        } catch (error) {
          console.error('Hammer error: ' + error);
        }
      }
    } catch (error) {
      console.error('ERROR ' + error);
    }
  } // end of *** no editor ***

  try {
    // make virtual keyboard show/hide by mouseclick
    ($('<button class="keyb_button">\u2328</button>')).insertAfter($el);
    $('button.keyb_button').on('mousedown', function () {
      showVirtualKeyboard();
      $("button.keyb_button").removeClass('selected');
    });
    // insert span for right/wrong tag
    $('<span class="truefalse">&nbsp;</span>').insertAfter($el);
  } catch (error) {
    console.error(error);
  }
  if ($('#' + id).hasClass('mq-math-mode')) {
    console.log('mathquillifying ' + id + ': SUCCESS');
  }
  return fApp;
}

function sanitizePrecision(prec) {
  if (typeof prec == 'undefined') {
    prec = config.defaultPrecision;
  } else {
    prec = prec.replace(/,/g, '.');
    var endsWithPercent = prec.slice(-1) === '%';
    if (endsWithPercent) {
      prec = prec.substring(0, prec.length - 1);
    }
    prec = prec.valueOf();
    if (endsWithPercent) {
      prec = prec * 0.01;
    }
  }
  return prec;
}

function clickHandler(ev) {
  try {
    var fApp = FAList[ev.currentTarget.id];
    if (typeof fApp !== 'undefined') {
      if (fApp.hasResultField) {
        ev.stopPropagation(); // avoid body click
        // deselect all applets
        $(".formula_applet").removeClass('selected');
        $(".formula_applet").off('virtualKeyboardEvent');
        $(fApp.formulaApplet).addClass('selected');
        $(fApp.formulaApplet).on('virtualKeyboardEvent', function (_evnt, cmd) {
          if (cmd === '#Enter') {
            // mathQuillEditHandler cannot be outsourced to virtualKeyboard (circular dependency)
            fApp = FAList[_evnt.currentTarget.id];
            //TODO see, if special syntax necessary? 
            //TODO mathQuillEditHandler(fApp, MQ, 'enter'); 
            mathQuillEditHandler(fApp, MQ);
          } else {
            virtualKeyboardEventHandler(_evnt, cmd, fApp.mathField);
          }
        });
        $("button.keyb_button").removeClass('selected');
        if (($('#virtualKeyboard').css('display') || 'none') == 'none') {
          // if virtual keyboard is hidden, select keyboard button
          $(fApp.formulaApplet).nextAll("button.keyb_button:first").addClass('selected');
        }
      } else {
        // fApp has no ResultField (static formula)
        console.log(fApp.id + ' has no input field');
        try {
          var mfContainer = MQ.StaticMath(fApp.formulaApplet);
          var mfLatexForParser = mfContainer.latex();
          var myTree = new FaTree();
          myTree.leaf.content = mfLatexForParser;
        } catch (error) {
          console.log('ERROR ' + error);
        }
      }
    }
  } catch (error) {
    console.log('ERROR ' + error);
  }
}

// moved to definition_string_to_array.js - DELETE
// /**
//  * decomposes a definition string into a list of definitions
//  * 
//  * @param {string} def definition sets, composed with & or &&
//  * @returns {string[]} array of string expressions with condition to be positive
//  * @example def="x > 0 && y < 5" returns ["x", "5-y"], meaning x > 0 and 5-y > 0
//  */
// function unifyDefinitions(def) {
//   def = def.replace(/\s/g, "");
//   def = def.replace(/&&/g, "&");
//   var defArray = def.split("&");
//   for (var i = 0; i < defArray.length; i++) {
//     var ds = defArray[i];
//     var result = '';
//     var temp;
//     if (ds.indexOf('>') > -1) {
//       temp = ds.split('>');
//       if (temp[1] == '0') {
//         result = temp[0];
//       } else {
//         result = temp[0] + '-' + temp[1];
//       }
//     }
//     if (ds.indexOf('<') > -1) {
//       temp = ds.split('<');
//       if (temp[0] == '0') {
//         result = temp[1];
//       } else {
//         result = temp[1] + '-' + temp[0];
//       }
//     }
//     defArray[i] = result;
//   }
//   return defArray;
// }
//TODO delete refreshLatex, replace with refreshTimesGlyph
// function refreshLatex(lang) {
//   var id;
//   for (id in FAList) {
//     var fApp = FAList[id];
//     var isEditor = (id.slice(-5) == '-edit');
//     if (!isEditor) {
//       var hasSolution = fApp.hasSolution || false;
//       var oldLatex, newLatex;
//       if (hasSolution) {
//         var mf = fApp.mathField;
//         oldLatex = mf.latex();
//       } else {
//         try {
//           var mfContainer = MQ.StaticMath(fApp.formulaApplet);
//           oldLatex = mfContainer.latex();
//         } catch (error) {
//           console.log('ERROR ' + error);
//         }
//       }
//       if (lang == 'de') {
//         newLatex = oldLatex.replace(/\\times/g, '\\cdot');
//         newLatex = newLatex.replace(/[.]/g, ',');
//       }
//       if (lang == 'en') {
//         newLatex = oldLatex.replace(/\\cdot/g, '\\times');
//         newLatex = newLatex.replace(/,/g, '.');
//       }
//       newLatex = sanitizeInputfieldTag(newLatex);
//       if (oldLatex !== newLatex) {
//         console.log('oldLatex=' + oldLatex);
//         console.log('newLatex=' + newLatex);
//         editHandlerActive = false;
//         if (fApp.hasSolution) {
//           mf.latex(newLatex);
//         } else {
//           mfContainer.latex(newLatex);
//         }
//         editHandlerActive = true;
//       }
//     }
//   }
// }