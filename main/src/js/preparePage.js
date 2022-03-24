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
import Hammer from "@egjs/hammerjs";
import MQ from "./lib/mathquillWrapper.js";
import {
  domLoad,
  isH5P
} from "./dom.js";

import config from "./config.json";
import {
  mathQuillEditHandlerActive
} from "./inputfield_unit.js";
import decode, {
  encode
} from "./decode.js";
import {
  separateInputfield
} from "./inputfield_unit.js";

import {
  findCorrespondingRightBracket,
  checkScientificNotation
}
from "./texParser.js";

import initVirtualKeyboard, {
  showVirtualKeyboard,
  virtualKeyboardEventHandler
} from "./virtualKeyboard.js";

import {
  checkIfEqual,
  checkIfEquality
} from "./checkIfEqual.js";

console.log('preparePage.js');
//TODO hide global vars
export var FAList = {};
export var editor_fApp;
var editHandlerActive = true;

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
  console.log('mathQuillifyAll');
  try {
    // if already mathquillified, class="formula_applet mq-math-mode ..."
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
    var temp = domElem.innerHTML;
    temp = temp.replace(/{{result}}/g, '\\MathQuillMathField{}');
    temp = temp.replace(/\\Ohm/g, '\\Omega');
    temp = temp.replace(/\\mathrm/g, '');
    temp = temp.replace(/\\unit{/g, config.unit_replacement);
    temp = temp.replace(/\\cdot/g, config.multiplicationSign);
    //TODO
    if (isEditor && isH5P()) {
      console.log('H5P & Editor');
      var mf = document.getElementById('math-field');
      temp = mf.textContent;
      console.log('editor & H5P: replace {{result}} with \\class{inputfield}{} - does this ever happen?');
      temp = temp.replace(/{{result}}/g, '\\class{inputfield}{}');
      mf.textContent = temp;
    } else {
      domElem.innerHTML = temp; // does not work with H5P-Editor!!!
    }
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
    // physics mode if unit=auto or mode=physics, else math mode
    var unitAttr = $el.attr('unit');
    var unitAuto = (typeof unitAttr !== 'undefined' && unitAttr === 'auto');
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
    editor_fApp = prepareEditorApplet(fApp);
    // no success: call of prepareEditorApplet() move from preparePage.js to formulaapplet-editor.js
    // console.log('EditorApplet is prepared.');
    // mqEditableField = $el.find('.mq-editable-field')[0]; // why? DELETE
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
              mathQuillEditHandler(fApp.id);
            },
            enter: () => {
              mathQuillEditHandler(fApp.id);
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

function makeAutoUnitstring(mf) {
  // mf = MathField
  var str = mf.latex();
  var mfLatexForParser = str;
  // var unitTag = '\\textcolor{blue}{';
  var unitTag = config.unit_replacement;

  var pos = str.indexOf(unitTag);
  if (pos >= 0) {
    var left = str.substr(0, pos);
    // rest has to start with {
    var rest = str.substr(pos + unitTag.length - 1);
    var bracket = findCorrespondingRightBracket(rest, '{');
    var middle = rest.substring(1, bracket.rightPos);
    var right = rest.substr(bracket.rightPos + 1);
    var sci = checkScientificNotation(left).isScientific;
    if (sci && middle.length > 0) {
      // expand the unit tag at the right side
      var newLatex = left + unitTag + middle + right + '}';
      // mfLatexForParser = csn.repl + unitTag + middle + right + '}';
      mfLatexForParser = left + unitTag + middle + right + '}';
      editHandlerActive = false;
      mf.latex(newLatex);
      mf.keystroke('Left');
      editHandlerActive = true;
    }
  } else {
    // maybe create unit tag
    var beginning = '';
    for (var i = str.length; i >= 0; i--) {
      beginning = str.substr(0, i);
      sci = checkScientificNotation(beginning).isScientific;
      if (sci) {
        break;
      }
    }
    if (beginning.length > 0) {
      rest = str.substr(beginning.length);
      if (rest.length > 0) {
        newLatex = beginning + unitTag + rest + '}';
        // mfLatexForParser = csn.repl + unitTag + rest + '}';
        mfLatexForParser = beginning + unitTag + rest + '}';
        editHandlerActive = false;
        mf.latex(newLatex);
        mf.keystroke('Left');
        editHandlerActive = true;
      }
    }
  }
  return mfLatexForParser;
}

function mathQuillEditHandler(id) {
  if (editHandlerActive == true) {
    var fApp = FAList[id];
    var mf = fApp.mathField;
    var mfContainer = MQ.StaticMath(fApp.formulaApplet);
    var solution = fApp.solution;
    var hasSolution = fApp.hasSolution;
    var unitAuto = fApp.unitAuto;
    var precision = fApp.precision;
    var dsList = fApp.definitionsetList;

    var mfLatexForParser = '';
    if (hasSolution) {
      mfLatexForParser = mf.latex();
    } else {
      mfLatexForParser = mfContainer.latex();
    }
    if (unitAuto) {
      mfLatexForParser = makeAutoUnitstring(mf);
    }

    var isEqual;
    if (hasSolution) {
      isEqual = checkIfEqual(mfLatexForParser, solution, dsList, precision);
      console.log(mfLatexForParser + ' = ' + solution + ' ' + isEqual);
    } else {
      isEqual = checkIfEquality(mfContainer.latex(), dsList, precision);
      console.log(mfContainer.latex() + ' isEqual= ' + isEqual);
    }
    var key = '#' + id + '.formula_applet + span.truefalse';
    var truefalse = $(key)[0];
    if (isEqual) {
      $(truefalse).css({
        "color": "green",
        "font-size": "30pt"
      });
      truefalse.innerHTML = "&nbsp;&#x2714;";
    } else {
      $(truefalse).css({
        "color": "red",
        "font-size": "30pt"
      });
      truefalse.innerHTML = "&nbsp;&#x21AF;";
    }
  }
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
            mathQuillEditHandler(_evnt.currentTarget.id, 'enter');
          } else {
            virtualKeyboardEventHandler(_evnt, cmd, fApp.mathField);
          }
        });
        $("button.keyb_button").removeClass('selected');
        if (($('#virtualKeyboard').css('display') || 'none') == 'none') {
          // if virtual keyboard is hidden, select keyboard button
          $(fApp.formulaApplet).nextAll("button.keyb_button:first").addClass('selected');
        }
      }
      // else {
      //   // fApp has no ResultField (static formula)
      //   try {
      //     var mfContainer = MQ.StaticMath(fApp.formulaApplet);
      //     var mfLatexForParser = mfContainer.latex();
      //     var myTree = new FaTree();
      //     myTree.leaf.content = mfLatexForParser;
      //   } catch (error) {
      //     console.log('ERROR ' + error);
      //   }
      // }
    }
  } catch (error) {
    console.log('ERROR ' + error);
  }
}

/**
 * decomposes a definition string into a list of definitions
 * 
 * @param {string} def definition sets, composed with & or &&
 * @returns {string[]} array of string expressions with condition to be positive
 * @example def="x > 0 && y < 5" returns ["x", "5-y"], meaning x > 0 and 5-y > 0
 */
function unifyDefinitions(def) {
  def = def.replace(/\s/g, "");
  def = def.replace(/&&/g, "&");
  var dsList = def.split("&");
  for (var i = 0; i < dsList.length; i++) {
    var ds = dsList[i];
    var result = '';
    var temp;
    if (ds.indexOf('>') > -1) {
      temp = ds.split('>');
      if (temp[1] == '0') {
        result = temp[0];
      } else {
        result = temp[0] + '-' + temp[1];
      }
    }
    if (ds.indexOf('<') > -1) {
      temp = ds.split('<');
      if (temp[0] == '0') {
        result = temp[1];
      } else {
        result = temp[1] + '-' + temp[0];
      }
    }
    dsList[i] = result;
  }
  return dsList;
}


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


function refreshResultFieldClone(latex, fApp) {
  console.log("refreshResultFieldClone");
  latex = latex.replaceAll(config.unit_replacement, '\\unit{');
  var parts = separateInputfield(latex);
  var tex = parts.before + '{{result}}' + parts.after;
  var enc = encode(parts.tag);
  console.log(tex + ' enc=' + enc + ' -> ' + decode(enc));
  // latexHandler(tex, enc);
  // $(document).trigger('texevent');

  // H5P editor: send tex and enc using dispatchEvent and trigger('click')
  if (isH5P()) {
    var texinput = $('div.field.field-name-TEX_expression.text input')[0];
    if (typeof texinput !== 'undefined') {
      // value of TEX_expression field is set to EditorResult
      texinput.value = tex;
      // trigger InputEvent. EventListener see formulaapplet-editor.js
      texinput.dispatchEvent(new InputEvent('input', {
        bubbles: true
      }))
    }
  }
  // getHTML
  var html = '<p class="formula_applet" id="' + fApp.id;
  if (fApp.hasSolution) {
    html += '" data-b64="' + enc;
  }
  if (fApp.unitAuto) {
    html += '" mode="physics';
  }
  html += '">' + tex + '</p>';
  console.log(html);
  var out = $('textarea#html_output');
  if (typeof out !== 'undefined') {
    out.text(html);
  }
}



//TODO move to (formulaapplet-editor) better to preparePage.js to have access to refreshResultField
function mathQuillifyEditor(fApp) {
  // make whole mathFieldSpan editable
  var mathFieldSpan = document.getElementById('math-field');
  if (!mathFieldSpan) throw new Error("Cannot find math-field. The math editor must provide one.");
  var editorMf = MQ.MathField(mathFieldSpan, {
    spaceBehavesLikeTab: true, // configurable
    handlers: {
      edit: function (mathField) { // useful event handlers
        try {
          if (mathQuillEditHandlerActive) {
            var latex = mathField.latex();
            console.log('mathQuillEditHandler refreshResultFieldClone latex=' + latex);
            refreshResultFieldClone(latex, fApp);
          }
        } catch (error) {
          console.error('ERROR in MQ.MathField: ' + error);
        }
      }
    }
  });
  return editorMf;
}

//TODO move to formulaapplet-editor to have access to refreshResultField
async function prepareEditorApplet(fApp) {
  // *** editor ***
  await domLoad; //TODO use H5Pbridge?
  // await initEditor();
  console.log('prepareEditorApplet: define editor_fApp_id');
  var editorMf = mathQuillifyEditor(fApp);
  console.log(editorMf);
  // editorMf provides commands like editorMf.latex('\\sqrt{2}') and var latextext = editorMf.latex();
  fApp.mathField = editorMf;
  console.log('editorMf.latex=' + editorMf.latex());
  refreshResultFieldClone(editorMf.latex(), fApp);
  $.event.trigger("refreshLatexEvent"); //adjust \cdot versus \times

  var css_display_value;
  // get config.debug value from js/config.json.ori
  if (config.debug === 'true') {
    // if debug, show 4 fields
    css_display_value = '';
  } else {
    // if not debug, hide 4 fields
    css_display_value = 'none';
  }
  $('.field-name-data_b64').css('display', css_display_value);
  $('.field-name-id').css('display', css_display_value);
  $('.field-name-selected_language').css('display', css_display_value);
  $('.field-name-input_field_button_text').css('display', css_display_value);

  if (config.htmloutput === 'true') {
    $('#html_output').css('display', '');
  } else {
    $('#html_output').css('display', 'none');
  }
  return fApp;
} // end of prepareEditorApplet