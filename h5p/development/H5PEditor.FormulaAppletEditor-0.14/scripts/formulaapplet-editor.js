"use strict"

/**
 * ExpressionSelector widget module
 *
 * @param {H5P.jQuery} $
 */

var H5P = H5P || {};
console.log('Here is formulaapplet-editor.js ' + H5Pbridge.config.version);
//TODO get rid of var FAE_global
var FAE_global = {};

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

  // available H5Pbridge methods
  // console.log(H5Pbridge);
  var editorMf = {};

  function FormulaAppletEditor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    this.changes = [];
  }

  /**
   * Append the field to the wrapper.
   * @public
   * @param {H5P.jQuery} $wrapper
   */
  FormulaAppletEditor.prototype.appendTo = function ($wrapper) {
    var self = this;
    const h5p_id = ns.getNextFieldId(this.field);
    // console.log(self);
    var params = self.parent.params;
    // console.log(params);
    // compose an HTML tag to be used by MathQuill using params and H5Pbridge
    if (typeof params.id === 'undefined' || params.id === 'new_id') {
      //TODO if params.id already exists (duplicate import), create new one!
      params.id = randomId(14);
    }

    // start of composing HTML
    var expression = params.TEX_expression;
    if (typeof expression === 'undefined') {
      expression = '17 + {{result}} = 21';
    }
    var hasResultfield = (expression.indexOf('{{result}}') >= 0)
    if (hasResultfield) {
      var html = '<p class="formula_applet" id="' + params.id + '-edit"';
    } else {
      var html = '<p class="formula_applet noresult" id="' + params.id + '-edit"';
    }
    // get solution from data_b64, if necessary 
    var solution = '';
    if (hasResultfield && params.formulaAppletMode === 'manu') {
      try {
        solution = H5Pbridge.decode(params.data_b64);
      } catch (error) {
        console.log(error);
      }
    }
    html += '>';
    // end of composing HTML

    // var language = H5Pbridge.docLang();
    var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, true); //isEditor=true
    // temp: like LATEX, but special syntax for MathQuill added
    // wrap temp into <span> and close <p class="formula_applet"...> tag
    html += '<span id="math-field">' + temp + '</span><\p>';
    // console.log('Assembled html: ' + html);

    // var inner = '<input type="text" id="' + params.id + '" class="formula_applet">dummy';
    var fieldMarkup = H5PEditor.createFieldMarkup(this.field, html, h5p_id);
    self.$item = H5PEditor.$(fieldMarkup);
    self.$formulaApplet = self.$item.find('.formula_applet');

    self.config = {
      appendTo: self.$item[0],
      preferredFormat: 'hex',
      // expression: self.getExpression(),
      expression: " get: myExpression",
      change: function (expression) {
        // self.setExpression(expression);
        console.log('do, what is necessary if expression is changed ' + expression);
      },
      hide: function (expression) {
        // Need this to get expression if cancel is clicked
        // self.setExpression(expression);
        console.log('do, what is necessary if expression is hidden ' + expression);
      }
    };

    // DELETE parts concerning spectrum
    // Make it possible to set spectrum config
    // if (self.field.spectrum !== undefined) {
    //   self.config = $.extend(self.config, self.field.spectrum);
    // }

    // // Create color picker widget
    // self.$colorPicker.spectrum(self.config);

    self.$item.appendTo($wrapper);
    //TODO maybe wait for math-field appear in DOM
    editorMf = mathQuillifyEditor();
    init_synchronize(params);

    $(function () {
      console.log('DOM is ready');
      //code that needs to be executed when DOM is ready, after manipulation, goes here
      var kbDiv = H5Pbridge.createkeyboardDiv(true);
      var keyboardparent = H5P.jQuery('p.formula_applet').parent();
      // keyboardparent.append('<br><br><textarea id="html_output" rows="3" cols="150" disabled>space for virtual keyboard</textarea>');
      keyboardparent.append(kbDiv);
      H5Pbridge.virtualKeyboardBindEvents();
      H5Pbridge.keyboardActivate('mixed');
      (async function () {
        FAE_global = self;
        // console.log(FAE_global);
        // console.log(H5PEditor.FormulaAppletEditor);
      })();
      // get config.debug value from js/config.json.ori, show or hide 4 fields
      var css_display_value = (H5Pbridge.config.debug === 'true' ? '' : 'none');
      H5P.jQuery('.field-name-data_b64').css('display', css_display_value);
      H5P.jQuery('.field-name-id').css('display', css_display_value);
      H5P.jQuery('.field-name-selected_language').css('display', css_display_value);

      // afterAppend(self);
    });
  };

  /**
   * Return colorcode in "css" format
   *
   * @method colorToString
   * @param  {Object}      color
   * @return {String}
   */
  FormulaAppletEditor.prototype.colorToString = function (color) {
    // switch (this.config.preferredFormat) {
    //   case 'rgb': return color.toRgbString();
    //   case 'hsv': return color.toHsvString();
    //   case 'hsl': return color.toHslString();
    //   default: return color.toHexString();
    // }
    return 'test - string returned by colorToString(color)';
  };

  /**
   * Hide color selector
   * @method hide
   */
  FormulaAppletEditor.prototype.hide = function () {
    // DELETE parts concerning spectrum
    // this.$colorPicker.spectrum('hide');
  };

  // START - parts from ColorPicker example
  /**
   * Save the color
   *
   * @param {Object} color The
   */
  FormulaAppletEditor.prototype.setColor = function (color) {
    // Save the value, allow null
    this.params = (color === null ? null : this.colorToString(color));
    this.setValue(this.field, this.params);

    this.changes.forEach(function (cb) {
      cb(this.params);
    })
  };

  FormulaAppletEditor.prototype.getColor = function () {
    var isEmpty = (this.params === null || this.params === "");
    return isEmpty ? null : this.params;
  };

  /**
   * Validate the current values.
   */
  FormulaAppletEditor.prototype.validate = function () {
    this.hide();
    return (this.params !== undefined && this.params.length !== 0);
  };

  FormulaAppletEditor.prototype.remove = function () {};

  // END - parts from ColorPicker example 


  function mathQuillifyEditor() {
    var self = this;
    // make whole mathFieldSpan editable
    var mathFieldSpan = document.getElementById('math-field');
    //TODO are next 3 lines necessary?
    var temp = mathFieldSpan.innerHTML;
    temp = temp.replace(/\\unit{/g, H5Pbridge.config.unit_replacement);
    mathFieldSpan.innerHTML = temp;

    if (!mathFieldSpan) throw new Error("Cannot find math-field. The FormulaAppletEditor must provide one.");
    var editorMf = H5Pbridge.MQ.MathField(mathFieldSpan, {
      spaceBehavesLikeTab: true, // configurable
      handlers: {
        edit: function (mathField) { // useful event handlers
          try {
            if (H5Pbridge.isEditHandlerActive()) {
              // latex -> expression, data_b64;
              var temp = H5Pbridge.MathQuill_to_H5P(mathField.latex());
              setValue_workaround('TEX_expression', temp.expression, self);
              setValue_workaround('data_b64', temp.data_b64, self);
            }
          } catch (error) {
            console.error('ERROR in MQ.MathField: ' + error);
          }
        }
      }
    });
    console.log('mathQuillifyEditor: SUCCESS');
    return editorMf;
  }

  /**
   * init synchronization between TEX_expression (H5P field and DOM) and editorMf
   */

  async function init_synchronize(params) {
    // console.log('init_synchronize(params)');
    // console.log(params);
    await H5Pbridge.domLoad;
    var $tex_expression = $('div.field.field-name-TEX_expression.text input');
    // https://stackoverflow.com/questions/7060750/detect-the-enter-key-in-a-text-input-field#7060762
    $tex_expression.on('keyup', function (event) {
      if (event.key === 'Enter' || event.keyCode === 13) {
        // console.log(event.target);
        //process enter event
        refreshEditor(editorMf, event.target.value, params);
      }
    });
    // console.log(tex_expression);
    $tex_expression[0].addEventListener('input', function (event) {
      // console.log(event);
      // DOM -> field - done by H5P

      // distinguish between events caused by keyboard input or by editorMf
      if (event.isTrusted) {
        var msg = ' (keyboard input)';
        event.preventDefault();
      } else {
        var msg = ' (editorMf) - do nothing';
      }
      // console.log('TEX_expression changed: ' + event.target.value + msg);
    });
  }

  return FormulaAppletEditor;
})(H5P.jQuery);

//DELETE - refreshFields() moved to MathQuillifyEditor, handler
// function refreshFields(latex) {
//   // latex -> expression, data_b64;
//   var temp = H5Pbridge.MathQuill_to_H5P(latex);
//   setValue_workaround('TEX_expression', temp.expression);
//   setValue_workaround('data_b64', temp.data_b64);
// }

function refreshEditor(editorMf, latex, params) {
  // var language = H5Pbridge.docLang();
  // var data_b64_workaround = getValue_workaround('data_b64');
  // var data_b64 = params.data_b64;
  var solution = H5Pbridge.decode(params.data_b64);
  // console.log(latex, solution, language);
  var temp = H5Pbridge.H5P_to_MathQuill(latex, solution, true);
  // H5P_to_MathQuill includes no_XSS
  // console.log(editorMf);
  console.log('refresh editor widget with ' + temp);
  var fallback = editorMf.latex();
  editorMf.latex(temp);
  //check if empty
  if (editorMf.latex() === '') {
    //no success
    console.log('refresh editor widget: NO SUCCESS');
    editorMf.latex(fallback);
  }
}

// function getValue_workaround(name) {
//   var children = FAE_global.parent.children;
//   var found;
//   for (var i = 0; i < children.length; i++) {
//     var child = children[i];
//     if (child.field.name == name) {
//       found = child;
//       i = children.length; //short circuit
//     }
//   }
//   if (found.field.type === 'text') {
//     return found.$input[0].value;
//   } else {
//     return found.value;
//   }
// }

// setValue_workaround() sucks if field "name" has a widget attached
function setValue_workaround(name, value, self) {
  console.log(self);
  // H5P
  FAE_global.parent.params[name] = value;
  // synchronize DOM
  var targetField = H5PEditor.findField(name, FAE_global.parent);
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

function randomId(length) {
  var result = 'fa-';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  var numOfChars = characters.length;
  for (var i = 3; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * numOfChars));
  }
  return result;
}