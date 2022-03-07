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
 * getHTML -> textarea#html-output (substitute for HTML editor output, H5P version)
 * 
 * Send data from formulaapplet widget to editor params:
 * Send "tex" and "enc" using dispatchEvent and trigger('click')
 * Received by formulaapplet-editor.js, setValue(obj, 'data_b64', b64);
 * Workaround. Better solution?
 */


var H5P = H5P || {};
console.log('Here is formulaapplet-editor.js 0.12');

// var selectionArray = []; //DELETE
var $button;

H5PEditor.widgets.formulaAppletEditor = H5PEditor.FormulaAppletEditor = (function ($) {

  /**
   * Creates and edits a FormulaApplet.
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
    // params.TEX_expression = params.fa_applet;

    var hasSolution = (params.formulaAppletMode == 'manu');
    if (typeof params.id == 'undefined') {
      params.id = 'new_id';
    }
    var html = '<p class="formula_applet" id="' + params.id + '-edit"';
    console.log(params);
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

    // var $button = H5P.JoubelUI.createButton({
    $button = H5P.JoubelUI.createButton({
      title: 'set_input_field',
      text: 'Set input field',
      click: function (event) {
        event.preventDefault();
        console.log("H5Pbridge.editorAction setInputField");
        H5Pbridge.editorAction("setInputField");
      }
    });
    $button.attr('id', 'set-input-h5p');
    $wrapper.append($button);
    $button.on('mouseover', buttonMouseoverHandler);

    function buttonMouseoverHandler(ev) {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      console.log("H5Pbridge.editorAction setInputFieldMouseover");
      // test_setValue(self);
      H5Pbridge.editorAction("setInputFieldMouseover");
    };

    $(function () {
      console.log('co(1)');
      //code that needs to be executed when DOM is ready, after manipulation, goes here
      var texinputparent = H5P.jQuery('div.field.field-name-TEX_expression.text input').parent();
      // disabled: read-only
      texinputparent.append('<br><br><textarea id="html-output" rows="10" cols="150" disabled>output</textarea>');
      texinputparent.append('<br><p id="data_b64_click"></p>');
      afterAppend(self);
      waitForMainThenDo(afterMainIsLoaded);
      // waitForMainThenDo2(afterMainIsLoaded2);
    });
  };

  async function afterMainIsLoaded() {
    // this code is executed if main is loaded
    console.log('co(3)');
    await H5Pbridge.preparePage();
  }
  async function afterMainIsLoaded2() {
    // this code is executed if main is loaded
    console.log('co(4)');
    await H5Pbridge.preparePage();
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

async function afterAppend(obj) {
  console.log('co(2)');

  // generate new id if necessary (new applet), and spread it
  try {
    var idInput = getValue(obj, 'id');
    // console.log('idInput=' + idInput);
    if (idInput === 'new_id') {
      var newId = H5Pbridge.randomId(12);
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
  console.log('H5Pbridge.editorAction refresh');
  H5Pbridge.editorAction("refresh");


  // compare field retrieve methods
  // var targetField_1 = H5PEditor.findField('data_b64', obj.parent);
  // var targetField_2 = getField(obj, 'data_b64');

  // https://stackoverflow.com/questions/27541004/detect-paragraph-element-change-with-jquery 'change' doesn't work
  // data transfer with invisible HTML element. OMG!
  H5P.jQuery('#data_b64_click').on('click', function (ev) {
    var b64 = ev.target.innerHTML;
    console.log('data_b64_click: ' + b64);
    setValue(obj, 'data_b64', b64);
  });

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
      H5Pbridge.editorAction('TEX_changed', event.target.value);
    } else {
      msg = ' event caused by JavaScript';
      // no editorAction ->  avoid infinite loop
    }
    console.log('TEX_expression changed: ' + event.target.value + msg);
  }

  // var checkbox = document.getElementById(getSelectorID('field-formulaappletphysics'));
  // checkbox.addEventListener('change', function () {
  //   if (this.checked) {
  //     console.log("Physics Mode");
  //   } else {
  //     console.log("Math Mode");
  //   }
  // });

  // TODO replace by getField, addEventListener
  // var formulaAppletMode = document.getElementById(getSelectorID('field-formulaappletmode'));
  // formulaAppletMode.addEventListener('change', function (_e) {
  //   // mode=auto means hasSolution=false  mode=manu means hasSolution=true
  //   sendModeTofApp();
  // });
  // var formulaAppletPhysics = document.getElementById(getSelectorID('field-formulaappletphysics'));
  // formulaAppletPhysics.addEventListener('change', function (_e) {
  //   // mode=auto means hasSolution=false  mode=manu means hasSolution=true
  //   sendModeTofApp();
  // });

  // first time at init
  sendModeTofApp();

  function sendModeTofApp() {
    var mode = obj.parent.params['formulaAppletMode'];
    console.log('H5Pbridge.editorAction setMode: ' + mode);
    H5Pbridge.editorAction('setMode', mode);
    var physics = obj.parent.params['formulaAppletPhysics'];
    physics = '' + physics;
    console.log('H5Pbridge.editorAction setPhysics: ' + physics);
    H5Pbridge.editorAction('setPhysics', physics);
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

  var observedField = getField(obj, 'data_b64');
  var element = observedField.$item[0];
  element.addEventListener('input', myEventHandler(observedField));

  var observedField = getField(obj, 'id');
  var element = observedField.$item[0];
  element.addEventListener('input', myEventHandler(observedField));

  // console.log('make data_b64_click invisible');
  H5P.jQuery('#data_b64_click').css('display', 'none');

  // if (obj.field['debug'] === 'true') {
  //   H5P.jQuery('.field-name-data_b64').css('display', '');
  //   H5P.jQuery('.field-name-id').css('display', '');
  //   H5P.jQuery('.field-name-sel_lang').css('display', '');
  // } else {
  //   H5P.jQuery('.field-name-data_b64').css('display', 'none');
  //   H5P.jQuery('.field-name-id').css('display', 'none');
  //   H5P.jQuery('.field-name-sel_lang').css('display', 'none');
  // }
  // if (obj.field['tex_output'] === 'true') {
  //   H5P.jQuery('#html-output').css('display', '');
  // } else {
  //   H5P.jQuery('#html-output').css('display', 'none');
  // }
  var lang = getValue(obj, 'sel_lang');
  console.log('lang=' + lang);
  if (lang === 'de') {
    // Translation of "Set input field"
    $button.html("Eingabe-Feld setzen");
  }


} // end of afterAppend

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
  // if (typeof $targetField !== 'undefined') {
  //   $targetField[0].value = value;
  // }
}

async function waitForMainThenDo2(cont) {
  await H5Pbridge.sensorTimer(800, 40, function () {
    var sensor = H5Pbridge.mainIsLoaded();
    console.log('Main Sensor=' + sensor);
    return sensor
  });
  cont;
}


// Start of waitForMain mechanism
//TODO get rid of global var
var try_counter = 0;
var try_counter_limit = 10;

function waitForMainThenDo(cont) {
  var mainIsLoaded = false;
  try {
    mainIsLoaded = H5Pbridge.mainIsLoaded();
  } catch (error) {
    console.log(try_counter);
    // console.log(H5Pbridge);
  }
  if (mainIsLoaded) {
    // execute callback
    cont();
  } else {
    try_counter++;
    console.info(`waitForMain try_counter=${try_counter}`);
    if (try_counter < try_counter_limit) {
      setTimeout(function () {
        // recurse
        waitForMainThenDo(cont);
      }, 300);
    } else {
      console.error('waitForMainThenDo: Timeout');
      // optimistic approach
      afterMainIsLoaded();
    }
  }
}
// End of waitForMain mechanism


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