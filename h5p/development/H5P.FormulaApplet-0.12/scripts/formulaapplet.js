var H5P = H5P || {};

H5P.FormulaApplet = (function ($) {
  /**
   * Constructor function.
   */
  function C(options, id) {
    this.$ = $(this);
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      bli: 'bla'
    }, options);
    // Keep provided id.
    this.id = id;
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    var self = this;
    $container.addClass("h5p-formulaapplet");

    var html = '<p class="formula_applet" id="' + this.options.id + '"';
    // console.log(H5PIntegration.l10n.H5P.language);
    
    if (this.options.formulaAppletPhysics == true) {
      html += ' mode="physics"';
    }
    if (this.options.formulaAppletMode == 'manu') {
      html += ' data-b64="' + this.options.data_b64 + '"';
    } else {
      this.options.data_b64 = 'Automatic solution';
    }
    html += '>' + this.options.TEX_expression + '</p>'; //do not use fa_applet
    // html += '<p>' + this.options.data_b64 + '</p>';
    // console.log(html);    
    $container.append(html, afterAppend(this.options.id), self);
  };
  return C;
})(H5P.jQuery);

function afterAppend(id) {
  console.log(id + ' appended by formulaapplet.js 0.12.' + H5Pbridge.config.patchversion);
  // var success = true;
  // H5P.XAPIEvent(2, 6, instance, false, success);
  H5P.jQuery(document).trigger('resize');
}