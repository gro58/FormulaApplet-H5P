"use strict"

/**
 * ExpressionSelector widget module
 *
 * @param {H5P.jQuery} $
 */

var H5P = H5P || {};
console.log('Here is stub of formulaapplet-editor.js 0.13.' + H5Pbridge.config.patchversion);

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
    // compose an HTML tag to be used by MathQuill using params and H5Pbridge
    if (typeof params.id === 'undefined') {
      // TODO get random id
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
    var solution = '';
    if (hasResultfield) {
      if (params.formulaAppletMode === 'manu') {
        try {
          solution = H5Pbridge.decode(params.data_b64);
        } catch (error) {
          console.log(error);
        }
      }
    }
    html += '>';
    // end of composing HTML

    var language = H5Pbridge.docLang();
    var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, language, true); //isEditor=true
    // TODO if hasSolution and is<Editor, take solution into account using H5P_to_MathQuill
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

  return FormulaAppletEditor;
})(H5P.jQuery);