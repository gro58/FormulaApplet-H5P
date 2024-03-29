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
    var params = self.parent.params;

    // retrieve existing ids
    var listOfFormulaAppletIds;
    try {
      //escape from nested iframes
      var hiddenList = window.parent.parent.document.getElementById('hiddenList').innerHTML;
      listOfFormulaAppletIds = JSON.parse(hiddenList);
    } catch (error) {
      listOfFormulaAppletIds = [];
    }
    // console.log('listOfFormulaAppletIds:', listOfFormulaAppletIds);

    var id = params.id;
    if (typeof id === 'undefined') {
      id = 'new_id';
    } else {
      if (listOfFormulaAppletIds.indexOf(id) >= 0) {
        // duplicate id (maybe importing twice)
        id = 'new_id';
      }
    }
    if (id === 'new_id') {
      params.id = randomId(14);
    }

    // compose an HTML tag to be used by MathQuill using params and H5Pbridge
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
    var fieldMarkup = H5PEditor.createFieldMarkup(this.field, html, h5p_id);
    self.$item = H5PEditor.$(fieldMarkup);
    self.$formulaApplet = self.$item.find('.formula_applet');

    self.config = {
      // TODO investigate use of self.config 
      appendTo: self.$item[0],
      preferredFormat: 'hex',
      // ori: expression: self.getExpression(),
      expression: " get: myExpression",
      change: function (expression) {
        // ori: self.setExpression(expression);
        console.log('do, what is necessary if expression is changed ' + expression);
      },
      hide: function (expression) {
        // need this to get expression if cancel is clicked
        // ori: self.setExpression(expression);
        console.log('do, what is necessary if expression is hidden ' + expression);
      }
    };

    self.$item.appendTo($wrapper);
    editorMf = this.mathQuillifyEditor();
    init_synchronize(params);
    hideDebugFields();

    async function hideDebugFields() {
      await H5Pbridge.domLoad;
      // get config.debug value from js/config.json.ori -> show or hide debugging fields
      var debug = (H5Pbridge.config.debug === "true"); //typeof ... is string, not boolean! OMG
      var css_display_value = (debug ? '' : 'none');
      var targetField;
      // console.log(self);
      // console.log(self.parent);
      targetField = H5PEditor.findField('data_b64', self.parent);
      targetField.$item.css('display', css_display_value);
      targetField = H5PEditor.findField('id', self.parent);
      targetField.$item.css('display', css_display_value);
    };

    $(function () {
      //code that needs to be executed when DOM is ready, after manipulation, goes here
      console.log('DOM is ready');
      var textWaiter = H5Pbridge.createWaiter('for inputButtonText');
      textWaiter.condition = function () { return (typeof params.inputButtonText !== 'undefined') };
      textWaiter.doRest = async function () {
        var isMobile = (window.parent.innerWidth <= 600);
        H5Pbridge.setUnitButtonText(params.unitButtonText);
        H5Pbridge.setInputButtonText(params.inputButtonText);
        H5Pbridge.initVirtualKeyboard(true, isMobile, false); //isEditor=true isMobile=? hide=false
      };
      textWaiter.doError = async function () {
        console.log("error waiting for typeof params.inputButtonText !== 'undefined'")
        console.log('counter limit exceeded');
      };
      // console.log('before call of waiter ' + textWaiter.name);
      textWaiter.start();
      // console.log('after call of waiter ' + textWaiter.name);
    });
  };

 /**
 * rest of spectrum example, may not be deleted
 */
  FormulaAppletEditor.prototype.hide = function () { };

  /**
   * Validate the current values.
   */
  FormulaAppletEditor.prototype.validate = function () {
    this.hide();
    return (this.params !== undefined && this.params.length !== 0);
  };

  FormulaAppletEditor.prototype.remove = function () { };

  FormulaAppletEditor.prototype.mathQuillifyEditor = function () {
    var parent = this.parent;
    // make whole mathFieldSpan editable
    var mathFieldSpan = document.getElementById('math-field');
    // TODO are next 8 lines necessary?
    var temp = mathFieldSpan.innerHTML;
    temp = temp.replace(/\\unit{/g, H5Pbridge.config.unit_replacement);
    // if (mathFieldSpan.innerHTML === temp) {
    //   console.log(mathFieldSpan.innerHTML, 'did not change');
    // } else {
    //   console.log(mathFieldSpan.innerHTML, 'changed to', temp);
    // }
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
              var expression = temp.expression;
              var data_b64 = temp.data_b64;
              // replacement for setValueAndSyncDOM (obsolete)
              // TODO investigate if this.setValue() can be used to sync DOM, instead of targetField.
              parent.params['TEX_expression'] = expression;
              var targetField = H5PEditor.findField('TEX_expression', parent);
              targetField.$input[0].value = expression;
              parent.params['data_b64'] = data_b64;
              var targetField = H5PEditor.findField('data_b64', parent);
              // console.log('data_b64: ', data_b64);
              targetField.$input[0].value = data_b64;
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
        //process enter event
        refreshEditor(editorMf, event.target.value, params);
      }
    });

    // TODO delete code for debugging
    // $tex_expression[0].addEventListener('input', function (event) {
    //   // distinguish between events caused by keystrokes or by editorMf
    //   if (event.isTrusted) {
    //     var msg = ' (keyboard input)';
    //     event.preventDefault();
    //   } else {
    //     var msg = ' (editorMf) - do nothing';
    //   }
    //   console.log('TEX_expression changed: ' + event.target.value + msg);
    // });
  }
  return FormulaAppletEditor;
})(H5P.jQuery);

function refreshEditor(editorMf, latex, params) {
  var solution = H5Pbridge.decode(params.data_b64);
  var temp = H5Pbridge.H5P_to_MathQuill(latex, solution, true);
  // H5P_to_MathQuill includes no_XSS method
  // console.log('refresh editor widget with ' + temp);
  var fallback = editorMf.latex();
  editorMf.latex(temp);
  if (editorMf.latex() === '') {
    //no success
    console.log('refresh editor widget: NO SUCCESS, use fallback');
    editorMf.latex(fallback);
  }
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