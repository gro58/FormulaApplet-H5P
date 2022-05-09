var H5P = H5P || {};

H5P.FormulaApplet = (function ($) {
  console.log('define H5P.FormulaApplet object');
  var counter; //TODO get rid of global var counter
  function afterAppend(id) {
    counter = counter || 0;
    if (counter === 0) {
      console.log('formulaapplet.js 0.13.' + H5Pbridge.config.patchversion);
    }
    counter++;

    // mathQuillifying
    var MQ = H5Pbridge.MQ;
    console.log('try to mathquillify ' + id);
    var $el = $('#' + id + '.formula_applet:not(.mq-math-mode)');
    // console.log($el);
    if (typeof $el === 'undefined') {
      throw id + ' not found';
    }

    // TODO activate mouse clicks
    // $el.on('click', clickHandler);

    var waitForDomElem = H5Pbridge.createWaiter();
    waitForDomElem.name = 'waiter for domElem ';
    waitForDomElem.max_count = 100; // 100*200ms=100*0,2s= 20s
    waitForDomElem.condition = function () {
      $el = $('#' + id + '.formula_applet:not(.mq-math-mode)');
      return (typeof $el[0] !== 'undefined');
    };
    waitForDomElem.doTheRest = async function () {
      console.log('domElem of ' + id + ' found');
      var domElem = $('#' + id + '.formula_applet:not(.mq-math-mode)')[0];
      console.log(domElem);
      var language = H5Pbridge.docLang();
      var expression = domElem.innerHTML;
      // solution='', isEditor=false
      var temp = H5Pbridge.H5P_to_MathQuill(expression, '', language, false)
      domElem.innerHTML = temp;

      //TODO retrieve H5P parameters - see preparePage.js
      try {
        MQ.StaticMath(domElem);
        // MQ.StaticMath seems to generate a mqEditableField
      } catch (err) {
        console.error('Error using MQ.StaticMath: ' + err);
        console.trace();
      }
      //TODO install edithandler - see preparePage.js
    };
    waitForDomElem.start();
  }
  //TODO resize
  // $(document).trigger('resize');


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