var H5P = H5P || {};
console.log('Here is formulaapplet.js 0.12');

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
    // this.options.TEX_expression = this.options.fa_applet;
    // console.log('Constructor #=' + id);
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
    console.log(this.options);
    console.log(H5PIntegration.l10n.H5P.language);
    console.log(H5P.getLibraryConfig('H5P.FormulaApplet'));
    console.log(this.options.testname);
    console.log(this.options.eraseUnitButton);
    console.log(this.options.setUnitButton);
    console.log(this.options.spaceButton);
    H5Pbridge.setButtonText("space", this.options.spaceButton);
    H5Pbridge.setButtonText("setUnit", this.options.setUnitButton);
    H5Pbridge.setButtonText("eraseUnit", this.options.eraseUnitButton);

    
    if (this.options.formulaAppletPhysics == true) {
      html += ' mode="physics"';
    }
    if (this.options.formulaAppletMode == 'manu') {
      html += ' data-b64="' + this.options.data_b64 + '"';
    } else {
      this.options.data_b64 = 'Automatic solution';
    }
    html += '>' + this.options.TEX_expression + '</p>'; //do not use fa_applet
    // debugging
    // var testname = this.options.testname; only for one applet
    var testname = H5Pbridge.getButtonText('testname'); //same for all applets
    html += '<p>' + "H5Pbridge.getButtonText('testname') = " + testname + '</p>';
    // html += '<p>' + this.options.data_b64 + '</p>';
    // console.log(html);
    $container.append(html, afterAppend(this.options.id), self);
    console.log(self);
  };
  return C;
})(H5P.jQuery);

function afterAppend(id) {
  console.log(id + ' appended');
  console.log('patch version 0.12.' + H5Pbridge.config.patchversion);
  // var success = true;
  // H5P.XAPIEvent(2, 6, instance, false, success);
  H5P.jQuery(document).trigger('resize');
}