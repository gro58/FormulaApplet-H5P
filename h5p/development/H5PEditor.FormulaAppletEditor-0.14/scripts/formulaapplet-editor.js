"use strict"

/**
 * formulaAppletEditor widget module
 *
 * @param {H5P.jQuery} $
 */

var H5P = H5P || {};
var H5PIntegration = H5PIntegration || {};
console.log('Here is formulaapplet-editor.js ' + H5Pbridge.config.version);

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

  // inspect available H5Pbridge methods
  // console.log(H5Pbridge);
  var editorMf = {};

  function FormulaAppletEditor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    this.changes = [];

    //inspect various objects:
    // console.log('FormulaAppletEditor object: ', this);
    // console.log('H5Pbridge: ', H5Pbridge);
    // console.log('H5PIntegration: ', H5PIntegration);
  }

  /**
   * Append the field to the wrapper.
   * @public
   * @param {H5P.jQuery} $wrapper
   */
  FormulaAppletEditor.prototype.appendTo = function ($wrapper) {
    var self = this;
    const h5p_id = ns.getNextFieldId(this.field);
    var params = self.parent.params;

    // compose an HTML tag to be used by MathQuill using params and H5Pbridge
    if (typeof params.id === 'undefined' || params.id === 'new_id') {
      // TODO if params.id already exists (duplicate import), create new one!
      params.id = randomId(14);
    }

    // start of composing HTML
    var html = '<p class="formula_applet';
    var expression = params.TEX_expression;
    if (typeof expression === 'undefined') {
      expression = '17 + {{result}} = 21';
    }
    var hasResultfield = (expression.indexOf('{{result}}') >= 0);
    if (!hasResultfield) {
      html += ' noresult';
    }
    html += '" id="' + params.id + '-edit">';

    // get solution from data_b64, if necessary 
    var solution = '';
    if ((hasResultfield) && params.formulaAppletMode === 'manu') {
      try {
        solution = H5Pbridge.decode(params.data_b64);
      } catch (error) {
        console.log(error);
      }
    }
    var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, true); //isEditor=true
    // temp contains text similar to LATEX, but with a special syntax for MathQuill added

    // wrap temp into <span> and close <p class="formula_applet"...> tag
    html += '<span id="math-field">' + temp + '</span></p>';
    // console.log('Assembled html: ' + html);

    var fieldMarkup = H5PEditor.createFieldMarkup(this.field, html, h5p_id);
    self.$item = H5PEditor.$(fieldMarkup);
    self.$formulaApplet = self.$item.find('.formula_applet');

    self.config = {
      // TODO investigate use of self.config 
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

    self.$item.appendTo($wrapper);
    editorMf = this.mathQuillifyEditor();
    init_synchronize(params);

    $(function () {
      //code that needs to be executed when DOM is ready, after manipulation, goes here
      console.log('DOM is ready');

      // var isMobile = (window.visualViewport.width <= 600);
      console.log(window.parent.innerWidth);
      var isMobile = (window.parent.innerWidth <= 600);
      H5Pbridge.initVirtualKeyboard(true, isMobile, false); 
      //isEditor=true isMobile=? hide=false

      // var kbDiv = H5Pbridge.createkeyboardDiv(true);
      // var keyboardparent = H5P.jQuery('p.formula_applet').parent();
      // keyboardparent.append(kbDiv);
      // H5Pbridge.virtualKeyboardBindEvents();
      // H5Pbridge.keyboardActivate('mixed');
      
      // get config.debug value from js/config.json.ori, show or hide debugging fields
      var css_display_value = (H5Pbridge.config.debug === 'true' ? '' : 'none');
      $('.field-name-data_b64').css('display', css_display_value);
      $('.field-name-id').css('display', css_display_value);
      $('.field-name-selected_language').css('display', css_display_value);
    });
  };

  // obsolete parts concerning spectrum commented out

  // /**
  //  * Hide color selector
  //  * @method hide
  //  */
  FormulaAppletEditor.prototype.hide = function () {};

  // /**
  //  * Save the color
  //  *
  //  * @param {Object} color The
  //  */
  // FormulaAppletEditor.prototype.setColor = function (color) {
  //     // Save the value, allow null
  //     this.params = (color === null ? null : this.colorToString(color));
  //     this.setValue(this.field, this.params);

  //     this.changes.forEach(function (cb) {
  //         cb(this.params);
  //     })
  // };

  // FormulaAppletEditor.prototype.getColor = function () {
  //     var isEmpty = (this.params === null || this.params === "");
  //     return isEmpty ? null : this.params;
  // };

  /**
   * Validate the current values.
   */
  FormulaAppletEditor.prototype.validate = function () {
      this.hide();
      return (this.params !== undefined && this.params.length !== 0);
  };

  FormulaAppletEditor.prototype.remove = function () {};

  FormulaAppletEditor.prototype.mathQuillifyEditor = function () {
    var parent = this.parent;
    // make whole mathFieldSpan editable
    var mathFieldSpan = document.getElementById('math-field');
    // TODO are next 3 lines necessary?
    var temp = mathFieldSpan.innerHTML;
    temp = temp.replace(/\\unit{/g, H5Pbridge.config.unit_replacement);
    if (mathFieldSpan.innerHTML === temp) {
      console.log(mathFieldSpan.innerHTML, 'did not change');
    } else {
      console.log(mathFieldSpan.innerHTML,'changed to',temp);
    }
    mathFieldSpan.innerHTML = temp;

    if (!mathFieldSpan) throw new Error("Cannot find math-field. The FormulaAppletEditor must provide one.");
    var editorMf = H5Pbridge.MQ.MathField(mathFieldSpan, {
      spaceBehavesLikeTab: true, // configurable
      handlers: {
        edit: function (mathField) {
          try {
            if (H5Pbridge.isEditHandlerActive()) {
              // latex -> expression, data_b64;
              var temp = H5Pbridge.MathQuill_to_H5P(mathField.latex());
              // TODO investigate if this.setValue() can be used instead of setValueAndSyncDOM().
              setValueAndSyncDOM('TEX_expression', temp.expression, parent);
              setValueAndSyncDOM('data_b64', temp.data_b64, parent);
            }
          } catch (error) {
            console.error('ERROR in MQ.MathField edit handler: ' + error);
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
    $tex_expression[0].addEventListener('input', function (event) {
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

function refreshEditor(editorMf, latex, params) {
  var solution = H5Pbridge.decode(params.data_b64);
  var temp = H5Pbridge.H5P_to_MathQuill(latex, solution, true);
  // H5P_to_MathQuill includes no_XSS method
  console.log('refresh editor widget with ' + temp);
  var fallback = editorMf.latex();
  editorMf.latex(temp);
  if (editorMf.latex() === '') {
    //no success
    console.log('refresh editor widget: NO SUCCESS');
    editorMf.latex(fallback);
  }
}

// avoid name collision with setValue
function setValueAndSyncDOM(name, value, parent) {
  parent.params[name] = value;
  // synchronize DOM 
  var targetField = H5PEditor.findField(name, parent);
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