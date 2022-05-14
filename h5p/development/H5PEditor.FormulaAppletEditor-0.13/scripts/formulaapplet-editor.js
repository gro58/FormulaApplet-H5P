"use strict"

/**
 * ExpressionSelector widget module
 *
 * @param {H5P.jQuery} $
 */

var H5P = H5P || {};
console.log('Here is stub of formulaapplet-editor.js 0.13.' + H5Pbridge.config.patchversion);
//TODO get rid of var obj_global
var obj_global = {};

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
    console.log(params);
    // compose an HTML tag to be used by MathQuill using params and H5Pbridge
    if (typeof params.id === 'undefined') {
      //TODO get random id
      params.id = 'new_id';
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

    var language = H5Pbridge.docLang();
    var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, language, true); //isEditor=true
    // temp: like LATEX, but special syntax for MathQuill added
    // wrap temp into <span> and close <p class="formula_applet"...> tag
    html += '<span id="math-field">' + temp + '</span><\p>';
    console.log('Assembled html: ' + html);

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
    var editorMf = mathQuillifyEditor();
    init_synchronize(params);

    $(function () {
      console.log('DOM is ready');
      //code that needs to be executed when DOM is ready, after manipulation, goes here
      afterAppend(self);
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
  
  function mathQuillifyEditor() {
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
          // try {
          if (H5Pbridge.isEditHandlerActive()) {
            refreshFields(mathField.latex());
          }
          // } catch (error) {
          //   console.error('ERROR in MQ.MathField: ' + error);
          // }
        }
      }
    });
    console.log('mathQuillifyEditor: SUCCESS');
    return editorMf;
  }

  /**
   * init synchronization between TEX_expression (H5P field and DOM) and editorMf
   */

  async function init_synchronize() {
    await H5Pbridge.domLoad;
    var texinput = $('div.field.field-name-TEX_expression.text input')[0];
    console.log(texinput);
    texinput.addEventListener('input', function (event) {
      // DOM -> field - done by H5P
      // not necessary: setValue(obj, 'TEX_expression', event.target.value);

      // distinguish between events caused by keyboard input or by editorMf
      if (event.isTrusted) {
        var msg = ' (keyboard input)';
        event.preventDefault();
        //TODO editorAction('TEX_changed', event.target.value);
      } else {
        var msg = ' (editorMf) - do nothing';
        // maybe necessary: setValue(obj, 'TEX_expression', event.target.value);
        //TODO maybe can be replaced by 
        // obj.parent.params['TEX_expression'] = event.target.value;
      }
      console.log('TEX_expression changed: ' + event.target.value + msg);
    });
  }

  return FormulaAppletEditor;
})(H5P.jQuery);

async function afterAppend(obj) {
  console.log('afterAppend');
  obj_global = obj;
  console.log(obj_global);
}

function refreshFields(latex) {
  console.log(latex + ' -> expression, data_b64');
  var temp = H5Pbridge.MathQuill_to_H5P(latex);
  console.log(temp.expression);
  setValue(obj_global, 'TEX_expression', temp.expression);
  console.log(temp.data_b64);
  setValue(obj_global, 'data_b64', temp.data_b64);
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

//#########################################################################################
//#########################################################################################
//#########################################################################################
//#########################################################################################
//#########################################################################################
// *** unused legacy code follows ***

async function prepareEditorApplet(fApp) {
  console.log('prepareEditorApplet');
  await H5Pbridge.domLoad;
  var editorMf = mathQuillifyEditor(fApp);
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