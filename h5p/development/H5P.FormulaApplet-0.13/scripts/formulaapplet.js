var H5P = H5P || {};

H5P.FormulaApplet = (function ($) {
  console.log('define H5P.FormulaApplet object');
  var counter; //TODO get rid of global var counter
  function afterAppend(id) {
    counter = counter || 0;
    if (counter === 0) {
      console.log('formulaapplet.js 0.13.' + H5Pbridge.config.patchversion);
      H5Pbridge.initVirtualKeyboard();
    }
    counter++;

    // mathQuillifying
    var MQ = H5Pbridge.MQ;
    console.log('try to mathquillify ' + id);
    var $el = $('#' + id + '.formula_applet:not(.mq-math-mode)');
    if (typeof $el === 'undefined') {
      throw id + ' not found';
    }

    var waitForDomElem = H5Pbridge.createWaiter();
    waitForDomElem.name = 'waiter for domElem ';
    waitForDomElem.max_count = 100; // 100*200ms=100*0,2s= 20s
    waitForDomElem.condition = function () {
      $el = $('#' + id + '.formula_applet:not(.mq-math-mode)');
      return (typeof $el[0] !== 'undefined');
    };
    waitForDomElem.doTheRest = async function () {
      console.log(this.name + ' stopped. Mathquillify ' + id);
      var domElem = $('#' + id + '.formula_applet:not(.mq-math-mode)')[0];
      // console.log(domElem);
      var expression = domElem.innerHTML;
      console.log(expression);
      var hasResultField = (expression.indexOf('{{result}}') >= 0);
      // hasResultField will be used in clickEvent
      // remember here, because expression is changed soon by H5P_to_MathQuill
      var language = H5Pbridge.docLang();
      var solution = '';
      var isEditor = false;
      var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, language, isEditor);
      domElem.innerHTML = temp;

      //TODO retrieve H5P parameters - see preparePage.js
      try {
        MQ.StaticMath(domElem);
        // MQ.StaticMath seems to generate a mqEditableField
      } catch (err) {
        console.error('Error using MQ.StaticMath: ' + err);
        console.trace();
      }

      $el.on('click', clickHandler);

      function clickHandler(ev) {
        // console.log(ev);
        // console.log(domElem);
        try {
          if (typeof domElem !== 'undefined') {
            if (hasResultField) {
              ev.stopPropagation(); // avoid body click
              // deselect all applets
              $(".formula_applet").removeClass('selected');
              $(".formula_applet").off('virtualKeyboardEvent');
              $(domElem).addClass('selected');
              // attach virtualkeyboardEvent
              $("button.keyb_button").removeClass('selected');
              if (($('#virtualKeyboard').css('display') || 'none') === 'none') {
                // if virtual keyboard is hidden, select keyboard button
                $(domElem).nextAll("button.keyb_button:first").addClass('selected');
              }
            } else {
              // element has no ResultField (static formula)
              console.log(_evnt.currentTarget.id + ' has no ResultField');
              // TODO handle case "no ResultField"
              // try {
              //   var mfContainer = MQ.StaticMath(fApp.formulaApplet);
              //   var mfLatexForParser = mfContainer.latex();
              //   var myTree = new FaTree();
              //   myTree.leaf.content = mfLatexForParser;
              // } catch (error) {
              //   console.log('ERROR ' + error);
              // }
            }
          }
        } catch (error) {
          console.log('ERROR ' + error);
        }
      }

      // attach button for evoking virtual keyboard
      try {
        // make virtual keyboard show/hide by mouseclick
        ($('<button class="keyb_button">\u2328</button>')).insertAfter($el);
        $('button.keyb_button').on('mousedown', function () {
          H5Pbridge.showVirtualKeyboard();
          $("button.keyb_button").removeClass('selected');
        });
        // insert span for right/wrong tag
        // will be replaced by H5P scoring
        $('<span class="truefalse">&nbsp;</span>').insertAfter($el);

        // replaced by processVirtualKeyboardCommand(cmd) in virtualKeyboard.js
        // let domElem receive virtualKeyboardEvents
        // console.log($(domElem));
        // $(domElem).on('virtualKeyboardEvent', function (_evnt, cmd) {
        //   console.log(_evnt);
        //   console.log(cmd);
        //   if (cmd === '#Enter') {
        //     // mathQuillEditHandler cannot be outsourced to virtualKeyboard (circular dependency)
        //     console.log(_evnt.currentTarget.id);
        //     //TODO mathQuillEditHandler(fApp, MQ, 'enter'); 
        //     // or mathQuillEditHandler(fApp, MQ);
        //   } else {
        //     // H5Pbridge.virtualKeyboardEventHandler(_evnt, cmd, fApp.mathField);
        //   }
        // });

      } catch (error) {
        console.error(error);
      }
      if ($('#' + id).hasClass('mq-math-mode')) {
        console.log(id + ': SUCCESS');
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