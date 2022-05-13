/**
 * ExpressionSelector widget module
 *
 * @param {H5P.jQuery} $
 */

 var H5P = H5P || {};
 console.log('Here is new formulaapplet-editor.js 0.13.' + H5Pbridge.config.patchversion);

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

    this.changes = [];
  }

  /**
   * Append the field to the wrapper.
   * @public
   * @param {H5P.jQuery} $wrapper
   */
   FormulaAppletEditor.prototype.appendTo = function ($wrapper) {
    var self = this;
    const id = ns.getNextFieldId(this.field);
    // TODO change class-name
    var inner = '<input type="text" id="' + id + '" class="h5p-expression-picker">';
    var html = H5PEditor.createFieldMarkup(this.field, inner, id);
    self.$item = H5PEditor.$(html);
    self.$formulaApplet = self.$item.find('.h5p-expression-picker');

    self.config = {
      appendTo: self.$item[0],
      preferredFormat: 'hex',
      expression: self.getExpression(),
      change: function (expression) {
        self.setExpression(expression);
      },
      hide: function (expression) {
        // Need this to get expression if cancel is clicked
        self.setExpression(expression);
      }
    };

    // Make it possible to set spectrum config
    if (self.field.spectrum !== undefined) {
      self.config = $.extend(self.config, self.field.spectrum);
    }

    // Create expression picker widget
    self.$expressionPicker.spectrum(self.config);

    self.$item.appendTo($wrapper);
  };

  /**
   * Return expressioncode in "css" format
   *
   * @method expressionToString
   * @param  {Object}      expression
   * @return {String}
   */
  ExpressionSelector.prototype.expressionToString = function (expression) {
    switch (this.config.preferredFormat) {
      case 'rgb': return expression.toRgbString();
      case 'hsv': return expression.toHsvString();
      case 'hsl': return expression.toHslString();
      default: return expression.toHexString();
    }
  };

  /**
   * Hide expression selector
   * @method hide
   */
  ExpressionSelector.prototype.hide = function () {
    this.$expressionPicker.spectrum('hide');
  };
  /**
   * Save the expression
   *
   * @param {Object} expression The
   */
  ExpressionSelector.prototype.setExpression = function (expression) {
    // Save the value, allow null
    this.params = (expression === null ? null : this.expressionToString(expression));
    this.setValue(this.field, this.params);

    this.changes.forEach(function (cb) {
      cb(this.params);
    })
  };

  ExpressionSelector.prototype.getExpression = function () {
    var isEmpty = (this.params === null || this.params === "");
    return isEmpty ? null : this.params;
  };

  /**
   * Validate the current values.
   */
  ExpressionSelector.prototype.validate = function () {
    this.hide();
    return (this.params !== undefined && this.params.length !== 0);
  };

  ExpressionSelector.prototype.remove = function () {};

  return ExpressionSelector;
})(H5P.jQuery);