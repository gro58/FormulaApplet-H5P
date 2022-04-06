"use strict"

/**
 * FormulaAppletEditor widget module
 *
 * @param {H5P.jQuery} $
 */

/**
 * Use params to assemble HTML <p class="formula_applet" ...>TEX with {{result}}</p>
 * createFieldMarkup, $wrapper.append(self.$item);
 * afterMainIsLoaded: await H5Pbridge.preparePage(), causes MathQuillify
 * mathQuillifyEditor (editor.js) causes refreshResultField.
 * getHTML -> textarea#html_output (substitute for HTML editor output, H5P version)
 */

var H5P = H5P || {};
console.log('Here is formulaapplet-editor.js 0.12.' + H5Pbridge.config.patchversion);
// console.log(H5PEditor.t('H5P.FormulaAppletEditor', 'testname'));

//TODO get rid of var obj_global and newLatex
var obj_global = {};
var newLatex;

H5PEditor.language['H5PEditor.FormulaAppletEditor'] = {
  libraryStrings: {
    inputFieldButtonText: 'Set input field',
    setUnitButtonText: 'Set Unit',
    eraseUnitButtonText: 'Clear Unit',
    spaceButtonText: 'Space'
  }
};

H5PEditor.widgets.formulaAppletEditor = H5PEditor.FormulaAppletEditor = (function ($) {

  /**
   * Creates an editor widget for a FormulaApplet.
   *
   * @class H5PEditor.FormulaAppletEditor
   * @param {Object} parent
   * @param {Object} field
   * @param {Object} params
   * @param {function} setValue
   */
  function FormulaAppletEditor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
    // console.log('params');
    // console.log(params);

    this.changes = [];
  }

  // /**
  //  * Provide parent parameters 
  //  * @public
  //  * @param {H5P.jQuery} 
  //  */
  // FormulaAppletEditor.prototype.provideParentParams = function () {
  //   var self = this;
  //   return self.parent.params;
  // }

  /**
   * Append the field to the wrapper. 
   * @public
   * @param {H5P.jQuery} $wrapper
   */
  FormulaAppletEditor.prototype.appendTo = function ($wrapper) {
    var self = this;
    const nextFieldId = ns.getNextFieldId(this.field);
    var params = self.parent.params;
    // console.log('self');
    // console.log(self);
    // params.TEX_expression = params.fa_applet;

    var hasSolution = (params.formulaAppletMode == 'manu');
    if (typeof params.id == 'undefined') {
      params.id = 'new_id';
    }
    var html = '<p class="formula_applet" id="' + params.id + '-edit"';
    // console.log(self);
    // console.log(params);
    if (params.formulaAppletPhysics === true) {
      html += ' mode="physics"';
    }
    var solution = '';
    if (hasSolution) {
      html += ' data-b64="' + params.data_b64 + '"';
      try {
        solution = H5Pbridge.decode(params.data_b64);
      } catch (error) {
        console.log(error);
        solution = '';
      }
    }
    var temp = params.TEX_expression;
    if (typeof temp === 'undefined') {
      temp = '17 + {{result}} = 21';
    }
    temp = temp.replace(/{{result}}/g, '\\class{inputfield}{' + solution + '}');
    html += '>';
    var span = '<span id="math-field">' + temp + '</span>';
    html += span;
    html += '<\p>';

    console.log('Assembled html: ' + html);

    var fieldMarkup = H5PEditor.createFieldMarkup(this.field, html, nextFieldId);
    self.$item = H5PEditor.$(fieldMarkup);
    self.$formulaApplet = self.$item.find('.formula_applet');

    self.config = {
      appendTo: self.$item[0],
      preferredFormat: 'hex',
      expression: self.getExpression(),
      change: function (expression) {
        self.setExpression(expression);
        console.log('self.config.change: ' + expression);
      },
      hide: function (expression) {
        // Need this to get expression if cancel is clicked
        self.setExpression(expression);
        console.log('self.config.hide: ' + expression);
      }
    };

    self.config.change('formula applet changed');
    $wrapper.append(self.$item);


    var $button = H5P.JoubelUI.createButton({
      title: 'set_input_field',
      // text: 'S-I-F',
      text: H5PEditor.t('H5PEditor.FormulaAppletEditor', 'inputFieldButtonText'),
      click: function (event) {
        event.preventDefault();
        console.log("editorAction setInputField");
        editorAction("setInputField");
      }
    });
    $button.attr('id', 'set-input-h5p');
    $wrapper.append($button);
    $button.on('mouseover', buttonMouseoverHandler);

    // language, translations for virtualKeyboard
    var buttonText;
    buttonText = H5PEditor.t('H5PEditor.FormulaAppletEditor', 'setUnitButtonText');
    H5Pbridge.setButtonText("setUnit", buttonText);
    buttonText = H5PEditor.t('H5PEditor.FormulaAppletEditor', 'eraseUnitButtonText');
    H5Pbridge.setButtonText("eraseUnit", buttonText);
    buttonText = H5PEditor.t('H5PEditor.FormulaAppletEditor', 'spaceButtonText');
    H5Pbridge.setButtonText("space", buttonText);

    function buttonMouseoverHandler(ev) {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      console.log("editorAction setInputFieldMouseover");
      // test_setValue(self);
      editorAction("setInputFieldMouseover");
    };

    $(function () {
      console.log('co(1)');
      //code that needs to be executed when DOM is ready, after manipulation, goes here
      var texinputparent = H5P.jQuery('div.field.field-name-TEX_expression.text input').parent();
      // disabled means read-only
      texinputparent.append('<br><br><textarea id="html_output" rows="10" cols="150" disabled>output</textarea>');
      afterAppend(self);
      waitForMainThenDo(afterMainIsLoaded);
    });
  };

  async function afterMainIsLoaded() {
    // this code is executed if main is loaded
    console.log('co(3)');
    await H5Pbridge.preparePage();
    // this is where editor_fApp was generated in old version
    // await H5Pbridge.editor_fApp;
  }

  /**
   * Hide expression selector
   * @method hide
   */
  FormulaAppletEditor.prototype.hide = function () {
    // this.$formulaApplet.spectrum('hide');
  };
  /**
   * Save the expression
   *
   * @param {Object} expression
   */
  FormulaAppletEditor.prototype.setExpression = function (expression) {
    // Save the value, allow null
    this.params = (expression === null ? null : expression);
    this.setValue(this.field, this.params);

    this.changes.forEach(function (cb) {
      cb(this.params);
    })
  };

  FormulaAppletEditor.prototype.getExpression = function () {
    var isEmpty = (this.params === null || this.params === "");
    return isEmpty ? null : this.params;
  };

  FormulaAppletEditor.prototype.getparentParams = function () {
    var pp = this.parent.params;
    var isEmpty = (pp === null || pp === "");
    // console.log('parent parameters:');
    // console.log(pp);
    return isEmpty ? 'null' : pp;
  };

  /**
   * Validate the current values.
   */
  FormulaAppletEditor.prototype.validate = function () {
    this.hide();
    return (this.params !== undefined && this.params.length !== 0);
  };

  FormulaAppletEditor.prototype.remove = function () {};
  return FormulaAppletEditor;
})(H5P.jQuery);

function randomId(length) {
  var result = 'fa';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  var numOfChars = characters.length;
  for (var i = 2; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * numOfChars));
  }
  return result;
}

//TODO avoid global var editor_fApp
var editor_fApp;

async function afterAppend(obj) {
  console.log('co(2-outer)');
  obj_global = obj;
  // waitForEditorFAppThenDo waits for H5Pbridge.editor_fApp to be defined by bundle (preparePage.js)
  // then calls anonymous function with argument x = H5Pbridge.editor_fApp
  waitForEditorFAppThenDo(async function (x) {
    console.log(x);
    editor_fApp = await x; //OMG. causes co(3)
    console.log('editor_fApp  OK');
    console.log('co(4, was 2-inner)');
    editor_fApp = await prepareEditorApplet(editor_fApp);
    console.log(editor_fApp.mathField);

    // generate new id if necessary (new applet), and spread it
    try {
      var idInput = getValue(obj, 'id');
      // console.log('idInput=' + idInput);
      if (idInput === 'new_id') {
        var newId = randomId(12);
        setValue(obj, 'id', newId);
        console.log('new_id -> ' + newId);
      }
    } catch (error) {
      console.error('ERROR: ' + error);
    }

    var elem = document.getElementById('new_id-edit');
    if (elem !== null) {
      console.log('change id of element "new_id-edit"');
      var new_id = getValue(obj, 'id') + '-edit';
      H5P.jQuery(elem).attr('id', new_id);
    }
    //TODO DELETE action refresh
    // console.log('editorAction refresh');
    // editorAction("refresh");
    // still afterAppend...

    // texinput is updated by editor.js: showEditorResults
    var texinput = H5P.jQuery('div.field.field-name-TEX_expression.text input')[0];
    texinput.addEventListener('input', updateTexinputEventHandler);

    function updateTexinputEventHandler(event) {
      setValue(obj, 'TEX_expression', event.target.value);
      // obj.parent.params['TEX_expression'] = event.target.value;
      var msg;
      if (event.isTrusted) {
        msg = ' event caused by keyboard input';
        event.preventDefault();
        editorAction('TEX_changed', event.target.value);
      } else {
        //do nothing (code moved to refreshResultFieldClone)

      }
      console.log('TEX_expression changed: ' + event.target.value + msg);
    }

    // first time at init
    sendModeTofApp();

    function sendModeTofApp() {
      var mode = obj.parent.params['formulaAppletMode'];
      // console.log('editorAction setMode: ' + mode);
      editorAction('setMode', mode);
      var physics = obj.parent.params['formulaAppletPhysics'];
      physics = '' + physics;
      // console.log('editorAction setPhysics: ' + physics);
      editorAction('setPhysics', physics);
    }

    // make tex_expr read-only: https://www.educba.com/jquery-disable-input/
    // var tex_expr = document.getElementById(getSelectorID('field-tex_expression'));
    // H5P.jQuery(tex_expr).attr('disabled', 'disabled');

    console.log(getField(obj, 'fa_applet'));

    // define eventHandler
    // https://www.codegrepper.com/code-examples/javascript/javascript+pass+parameter+to+event+listener
    const myEventHandler = (obsField) => {
      return (ev) => {
        var result;
        if (obsField.field.type === 'boolean') {
          result = obsField.value;
        } else {
          result = ev.target.value;
        }
        console.log(obsField.field.name + ": " + result);
        if (obsField.field.name === 'formulaAppletMode') {
          sendModeTofApp();
        }
        if (obsField.field.name === 'formulaAppletPhysics') {
          sendModeTofApp();
        }
      }
    }

    // attach eventHandler to fields
    var observedField = getField(obj, 'formulaAppletMode');
    var element = observedField.$item[0];
    element.addEventListener('change', myEventHandler(observedField));

    var observedField = getField(obj, 'TEX_expression');
    var element = observedField.$item[0];
    element.addEventListener('input', myEventHandler(observedField));

    var observedField = getField(obj, 'formulaAppletPhysics');
    var element = observedField.$item[0];
    element.addEventListener('change', myEventHandler(observedField));

    // var observedField = getField(obj, 'data_b64');
    // var element = observedField.$item[0];
    // element.addEventListener('input', myEventHandler(observedField));

    var observedField = getField(obj, 'id');
    var element = observedField.$item[0];
    element.addEventListener('input', myEventHandler(observedField));

    // var sel_lang_field = getField(obj, 'selected_language');
    // // do not use getValue  but use field default!
    // var lang = sel_lang_field.field.default;
    // // store in variable of main.js for use in virtual keyboard
    // H5Pbridge.selected_language['lang'] = lang;
  }) //
}

// getField is used by getValue
function getField(obj, name) {
  var children = obj.parent.children;
  var result;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.field.name == name) {
      result = child;
      i = children.length; //short circuit
    }
  }
  return result;
}

function getValue(obj, name) {
  var field = getField(obj, name);
  if (field.field.type === 'text') {
    return field.$input[0].value;
  } else {
    return field.value;
  }
}

// setValue() sucks if field "name" has a widget attached
function setValue(obj, name, value) {
  // H5P
  obj.parent.params[name] = value;
  // synchronize DOM
  var targetField = H5PEditor.findField(name, obj.parent);
  var type = targetField.field.type;
  if (type === 'select') {
    var $targetField = targetField.$select;
    $targetField[0].value = value;
  };
  if (type === 'text') {
    var $targetField = targetField.$input;
    $targetField[0].value = value;
  };
  if (type === 'boolean') {
    var $targetField = targetField.$input;
    $targetField[0].checked = value;
  };
}

//TODO use .then() syntax
async function waitForMainThenDo(cont) {
  var y = await sensorTimer(500, 20, function () {
    var sensor = H5Pbridge.mainIsLoaded();
    console.log('Main Sensor=' + sensor);
    return sensor;
  });
  console.log(y);
  cont();
}

function getSelectorID(selectorName) {
  var result = '';
  H5P.jQuery('select').each(function () {
    var haystack = (this.id).toLowerCase();
    var needle = selectorName.toLowerCase();
    if (haystack.startsWith(needle)) {
      result = this.id;
    }
  });
  if (result == '') {
    H5P.jQuery('input').each(function () {
      var haystack = (this.id).toLowerCase();
      var needle = selectorName.toLowerCase();
      if (haystack.startsWith(needle)) {
        result = this.id;
      }
    });
  }
  return result;
}

function refreshResultField(latex, fApp) {
  console.log("refreshResultField");
  latex = latex.replaceAll(H5Pbridge.config.unit_replacement, '\\unit{');
  console.log('latex=' + latex);
  var parts = H5Pbridge.separateInputfield(latex);
  var tex = parts.before + '{{result}}' + parts.after;
  var enc = H5Pbridge.encode(parts.tag);
  setValue(obj_global, 'data_b64', enc);
  setValue(obj_global, 'TEX_expression', tex);
  //TODO maybe necessary: fApp.solution = parts.tag

  // console.log(tex + ' enc=' + enc + ' -> ' + H5Pbridge.decode(enc));

  // getHTML
  var html = '<p class="formula_applet" id="' + fApp.id;
  if (fApp.hasSolution) {
    html += '" data-b64="' + enc;
  }
  if (fApp.unitAuto) {
    html += '" mode="physics';
  }
  html += '">' + tex + '</p>';
  // console.log(html);
  var out = H5P.jQuery('textarea#html_output');
  if (typeof out !== 'undefined') {
    out.text(html);
  }
}

function sensorTimer(interval, max_count, sensor) {
  return new Promise(function (resolve, reject) {
    function timer(counter) {
      console.log('counter=' + counter + ' sensor=' + sensor());
      if (counter > max_count) {
        reject('max count exceeded');
      } else {
        if (sensor()) {
          resolve('Timer: success (' + counter + ')');
        } else {
          setTimeout(() => {
            timer(counter + 1);
          }, interval);
        }
      }
    }
    // start sensorTimer
    timer(0);
  });
}

// function definition
async function waitForEditorFAppThenDo(cont) {
  var y = await sensorTimer(500, 20, function () {
    var sensor = (typeof H5Pbridge.editor_fApp !== 'undefined' && typeof H5Pbridge.editor_fApp.id !== 'undefined');
    // console.log('editor_fApp  sensor=' + sensor);
    return sensor;
  });
  console.log(y);
  console.log(H5Pbridge.editor_fApp);
  cont(H5Pbridge.editor_fApp);
}

async function editorAction() {
  var actionType = arguments[0];
  var data = arguments[1] || "empty arg[1]";
  console.log('editorAction: ' + actionType + ' data=' + data);
  // if (typeof editor_fApp  !== 'undefined') {
  waitForEditorFAppThenDo(async function () {
    // H5P
    var editorMf = await editor_fApp.mathField;
    console.log('editor_fApp.mathField');
    console.log(editor_fApp.mathField);
    if (actionType === 'idChanged') {
      var newId = data;
      console.info('idChanged data=' + newId);
      editor_fApp.id = newId;
      refreshResultField(editorMf.latex(), editor_fApp);
    }
    if (actionType === 'setInputFieldMouseover') {
      console.info('setInputFieldMouseover');
      var latex = H5Pbridge.setInput(editorMf);
      console.log(latex);
      editorMf.latex(latex.old);
      //TODO get rid of global vars
      newLatex = latex.new; //prepare for setInputField
    }

    // setInputFieldMouseover precedes setInputField
    // global var newLatex is renewed by function setInput() 
    if (actionType === 'setInputField') {
      console.info('setInputField');
      editorMf.latex(newLatex);
    }

    // if (actionType === 'refresh') {
    //   console.info('refresh');
    //   try {
    //     refreshResultField(editor_fApp.mathField.latex(), editor_fApp);
    //   } catch (error) {
    //     console.error('ERROR: ' + error);
    //   }
    // }

    if (actionType === 'setMode') {
      var auto_or_manu = data;
      console.info('setMode ' + auto_or_manu);
      if (auto_or_manu == 'auto') {
        editor_fApp.hasSolution = false;
        refreshResultField(editorMf.latex(), editor_fApp)
      }
      if (auto_or_manu == 'manu') {
        editor_fApp.hasSolution = true;
        refreshResultField(editorMf.latex(), editor_fApp)
      }
    }
    if (actionType === 'setPhysics') {
      console.info('setPhysics ' + data);
      if (data === 'true') {
        editor_fApp.unitAuto = true;
        refreshResultField(editorMf.latex(), editor_fApp);
      }
      if (data === 'false') {
        editor_fApp.unitAuto = false;
        refreshResultField(editorMf.latex(), editor_fApp);
      }
    }
    if (actionType === 'TEX_changed') {
      console.info('*** TEX_changed ' + data);
      var temp = data.replace(/{{result}}/g, '\\class{inputfield}{' + editor_fApp.solution + '}');
      //avoid XSS
      temp = temp.replace(/</g, '');
      temp = temp.replace(/>/g, '');
      temp = temp.replace(/"/g, '');
      temp = temp.replace(/'/g, '');
      temp = temp.replace(/&/g, '');
      temp = temp.replace(/ /g, '_');
      console.log('editorMf.latex(temp) ' + temp);
      editorMf.latex(temp);
    }
    // }
  });
}

async function prepareEditorApplet(fApp) {
  // *** editor ***
  await H5Pbridge.domLoad;
  // await initEditor();
  console.log('prepareEditorApplet: define editor_fApp_id');
  var editorMf = mathQuillifyEditor(fApp);
  console.log(editorMf);
  // editorMf provides commands like editorMf.latex('\\sqrt{2}') and var latextext = editorMf.latex();
  fApp.mathField = editorMf;
  console.log('editorMf.latex=' + editorMf.latex());
  refreshResultField(editorMf.latex(), fApp);
  //TODO code replacement for refreshLatexEvent. Get rid of unused event types
  // $.event.trigger("refreshLatexEvent"); //adjust \cdot versus \times

  // get config.debug value from js/config.json.ori, show or hide 4 fields
  var css_display_value = (H5Pbridge.config.debug === 'true' ? '' : 'none');
  H5P.jQuery('.field-name-data_b64').css('display', css_display_value);
  H5P.jQuery('.field-name-id').css('display', css_display_value);
  H5P.jQuery('.field-name-selected_language').css('display', css_display_value);

  if (H5Pbridge.config.htmloutput === 'true') {
    H5P.jQuery('#html_output').css('display', '');
  } else {
    H5P.jQuery('#html_output').css('display', 'none');
  }
  return fApp;
} // end of prepareEditorApplet

function mathQuillifyEditor(fApp) {
  // make whole mathFieldSpan editable
  var mathFieldSpan = document.getElementById('math-field');
  if (!mathFieldSpan) throw new Error("Cannot find math-field. The math editor must provide one.");
  var editorMf = H5Pbridge.MQ.MathField(mathFieldSpan, {
    spaceBehavesLikeTab: true, // configurable
    handlers: {
      edit: function (mathField) { // useful event handlers
        // try {
        // if (H5Pbridge.mathQuillEditHandlerActive.flag) {
        if (H5Pbridge.isEditHandlerActive()) {
          var latex = mathField.latex();
          console.log('mathQuillEditHandler refreshResultField latex=' + latex);
          refreshResultField(latex, fApp);
        }
        // } catch (error) {
        //   console.error('ERROR in MQ.MathField: ' + error);
        // }
      }
    }
  });
  return editorMf;
}