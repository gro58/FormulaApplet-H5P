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
    console.log('Constructor #=' + id);
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
    console.log(this.options.sel_lang);
    H5Pbridge.selected_language['lang'] = this.options.sel_lang; //store in main
    
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
    // html += '<p>' + this.options.id + '</p>';
    // html += '<p>' + this.options.data_b64 + '</p>';
    // console.log(html);
    $container.append(html, afterAppend(this.options.id), self);
  };
  return C;
})(H5P.jQuery);

function afterAppend(id, instance) {
  console.log(id + ' appended');
  var success = true;
  // H5P.XAPIEvent(2, 6, instance, false, success);
  H5P.jQuery(document).trigger('resize');
}