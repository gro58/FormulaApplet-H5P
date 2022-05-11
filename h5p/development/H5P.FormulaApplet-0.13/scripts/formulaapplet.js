var H5P = H5P || {};

H5P.FormulaApplet = (function ($) {
  console.log('define H5P.FormulaApplet class');

  var counter;
  // afterAppend is called multiple times, once for every appended FormulaApplet
  function afterAppend(fa_obj) {
    // if counter is undefined, init 0. if increased, do not change
    counter = counter || 0;
    if (counter === 0) {
      // things to be done once
      console.log('formulaapplet.js 0.13.' + H5Pbridge.config.patchversion);
      H5Pbridge.initVirtualKeyboard();
    }
    counter++;

    // console.log(fa_obj);
    var options = fa_obj.options;
    // console.log(options);
    var id = options.id;
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
      var domElem = $('#' + id + '.formula_applet:not(.mq-math-mode)')[0];
      // console.log(domElem);
      var expression = domElem.innerHTML;
      console.log('Mathquillify ' + id + ': ' + expression);
      var hasResultField = (expression.indexOf('{{result}}') >= 0);
      // hasResultField will be used in clickEvent
      // remember here, because expression is changed soon by H5P_to_MathQuill
      var language = H5Pbridge.docLang();
      var solution = '';
      var isEditor = false;
      var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, language, isEditor);
      domElem.innerHTML = temp;

      //TODO retrieve H5P parameters - see preparePage.js
      var mqEditableField;
      try {
        mqEditableField = MQ.StaticMath(domElem);
        // MQ.StaticMath seems to generate a mqEditableField
      } catch (err) {
        console.error('Error using MQ.StaticMath: ' + err);
        console.trace();
      }

      $el.on('click', clickHandler);

      function clickHandler(ev) {
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
                // if virtual keyboard is hidden, show keyboard button
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

      //install edithandler
      if (hasResultField) {
        mqEditableField = $el.find('.mq-editable-field')[0];
        // console.log(mqEditableField);
        var mf = MQ.MathField(mqEditableField, {});
        // console.log(mf);
        mf.config({
          handlers: {
            edit: () => {
              mqEditableField.focus();
              mathQuillEditHandler(options);
            },
            // TODO is case enter necessary?
            enter: () => {
              mathQuillEditHandler(options);
            },
          }
        });
      }
      function mathQuillEditHandler(options) {
        //stub
        console.log(options);
      }

      function mathQuillEditHandler_new(options) {
        if (isEditHandlerActive()) {
            // var mf = fApp.mathField;
            // var mfContainer = MQ.StaticMath(fApp.formulaApplet);
            var mfContainer = MQ.StaticMath(domElem);
            var solution = fApp.solution;
            var hasSolution = fApp.hasSolution;
            var unitAuto = fApp.unitAuto;
            var precision = fApp.precision;
            var dsList = fApp.definitionsetList;
    
            // var sel = getSelection(mf, true);
            // console.log('>> ' + sel.preSelected + '|' + sel.postSelected);
        
            var mfLatexForParser = '';
            if (hasSolution) {
                mfLatexForParser = mf.latex();
            } else {
                mfLatexForParser = mfContainer.latex();
            }
            if (unitAuto) {
                mfLatexForParser = makeAutoUnitstring(mf);
            }
    
            var isEqual;
            if (hasSolution) {
                solution = solution.replace(/\\unit{/g, config.unit_replacement);
                isEqual = H5Pbridge.checkIfEqual(mfLatexForParser, solution, dsList, precision);
                console.log(mfLatexForParser + ' = ' + solution + ' ' + isEqual);
            } else {
                isEqual = H5Pbridge.checkIfEquality(mfContainer.latex(), dsList, precision);
                console.log(mfContainer.latex() + ' isEqual= ' + isEqual);
            }
            // see ok_wrong_tagging.js
            var key = '#' + fApp.id + '.formula_applet + span.truefalse';
            setOkWrongTag(key, isEqual);
        }
    }


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
    // this points to H5P.FormulaApplet 
    var self = this;
    $container.addClass("h5p-formulaapplet");

    var html = '<p class="formula_applet" id="' + self.options.id + '"';
    // console.log(H5PIntegration.l10n.H5P.language);

    // obsolete to store options in DOM. options are available via self.options
    // if (self.options.formulaAppletPhysics == true) {
    //   html += ' mode="physics"';
    // }
    // if (self.options.formulaAppletMode == 'manu') {
    //   html += ' data-b64="' + self.options.data_b64 + '"';
    // } else {
    //   self.options.data_b64 = 'Automatic solution';
    // }
    html += '>' + self.options.TEX_expression + '</p>'; //do not use fa_applet
    // html += '<p>' + self.options.data_b64 + '</p>';
    // console.log(html);    
    $container.append(html, afterAppend(self), self);
  };
  return C;

})(H5P.jQuery);