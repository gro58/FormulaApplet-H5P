"use strict";

var H5P = H5P || {};

H5P.FormulaApplet = (function ($) {
  console.log('define H5P.FormulaApplet class');

  var counter;
  // afterAppend is called multiple times, once for every appended FormulaApplet
  function afterAppend(fa_obj) {
    // if counter is undefined, init with value 0.
    // if counter is defined (increased), do not change
    counter = counter || 0;
    if (counter === 0) {
      // things to be done once
      console.log('formulaapplet.js 0.13.' + H5Pbridge.config.patchversion);
      H5Pbridge.initVirtualKeyboard(true); //isEditor=false
    }
    counter++;

    var options = fa_obj.options;
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
      var hasSolution = (typeof $(domElem).attr('data-b64') !== 'undefined');

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
          //TODO ERROR ReferenceError: _evnt is not defined (maybe if hasSolution = false) 
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

      //create MathField and attach edithandler
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
            // TODO ENTER: is case enter necessary?
            enter: () => {
              mathQuillEditHandler(options);
            },
          }
        });
      }

      //TODO no need for argument "options" because defined in surrounding function
      function mathQuillEditHandler(options) {
        if (H5Pbridge.isEditHandlerActive()) {
          // var mf = fApp.mathField;
          // var mfContainer = MQ.StaticMath(fApp.formulaApplet);
          // var solution = fApp.solution;
          var data_b64 = options.data_b64;
          // var hasSolution = fApp.hasSolution;
          // var unitAuto = fApp.unitAuto;
          var unitAuto = options.formulaAppletPhysics;
          // var precision = fApp.precision;
          var precision = options.sanitizedPrecision;
          // var dsList = fApp.definitionsetList;
          // dsList replaced by definitionSets
          var definitionSets = options.definitionSets;

          // var sel = getSelection(mf, true);
          // console.log('>> ' + sel.preSelected + '|' + sel.postSelected);

          if (unitAuto) {
            // has to be done before checkIfEqual
            H5Pbridge.makeAutoUnitstring(mf);
          }

          var isEqual;
          if (hasSolution) {
            isEqual = H5Pbridge.checkIfEqual(mf.latex(), data_b64, definitionSets, precision);
          } else {
            // look at whole equation, input field and surroundings
            var mfContainer = MQ.StaticMath(domElem);
            isEqual = H5Pbridge.checkIfEquality(mfContainer.latex(), definitionSets, precision);
            console.log(mfContainer.latex() + ' isEqual= ' + isEqual);
          }
          // see ok_wrong_tagging.js
          var key = '#' + id + '.formula_applet + span.truefalse';
          H5Pbridge.setOkWrongTag(key, isEqual);
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
      // add option for result of sanitizedPrecision()
      // this.options.precision will not be changed
      sanitizedPrecision: ''
    }, options);
    // Keep provided id.
    this.id = id;
    this.options.sanitizedPrecision = sanitizedPrecision(this.options.precision);
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    // "this" points to H5P.FormulaApplet 
    var self = this;
    $container.addClass("h5p-formulaapplet");

    var html = '<p class="formula_applet" id="';
    html += self.options.id;
    html += '">';
    html += self.options.TEX_expression
    html += '</p>';
    $container.append(html, afterAppend(self), self);
  };

  function sanitizedPrecision(prec) {
    try {
      prec = prec.replace(/,/g, '.');
      var endsWithPercent = prec.slice(-1) === '%';
      if (endsWithPercent) {
        prec = prec.substring(0, prec.length - 1);
      }
      prec = prec.valueOf();
      if (endsWithPercent) {
        prec = prec * 0.01;
      }
    } catch (error) {
      // for example, prec = undefined, '', ' ',...
      // then take default, same as in semantics.json
      prec = "0.000001";
    }
    return prec;
  }

  return C;
})(H5P.jQuery);