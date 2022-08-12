"use strict";

var H5P = H5P || {};

H5P.FormulaApplet = (function ($, Question) {
  console.log('define H5P.FormulaApplet class');

  /**
   * @constant
   * @default
   * @see blanks.js
   */
  var STATE_ONGOING = 'ongoing';
  var STATE_CHECKING = 'checking';
  var STATE_SHOWING_SOLUTION = 'showing-solution';
  var STATE_FINISHED = 'finished';
  var listOfAllFormulaAppletIds = [];

  $(document).trigger('resize');


  /**
   * Constructor function.
   */
  function C(params, id) {

    // Extend with Question
    var self = this;
    // Inheritance
    // Question.call(self, 'blanks');
    Question.call(self, 'FormulaApplet');

    this.$ = $(this);
    // Extend defaults with provided params
    this.params = $.extend(true, {}, {
      // add option for result of sanitizedPrecision()
      // this.params.precision will not be changed
      sanitizedPrecision: '',
      // TODO make use of overallFeedback
      overallFeedback: [],
      // i18n done in JoubelUI?
      showSolutions: "Show solution",
      tryAgain: "Try again",
      checkAnswer: "Check",
      unitButtonText: "Unit",
      inputButtonText: "Input",
      // behaviour from blanks.js
      behaviour: {
        enableRetry: true,
        enableSolutionsButton: false, //default: true
        enableCheckButton: true,
        caseSensitive: true,
        showSolutionsRequiresInput: true,
        autoCheck: false,
        separateLines: false
      },
      domElem: {}
    }, params);
    // Keep provided id.
    this.id = id;
    this.params.sanitizedPrecision = sanitizedPrecision(this.params.precision);
  };

  // C.prototype.attach($container) is replaced by
  // self.setContent(self.createFormulaApplet()...)
  // and self.afterAppend()

  // Inheritance from Question class
  C.prototype = Object.create(Question.prototype);
  C.prototype.constructor = C;

  // variable shared by all C's
  // C.prototype.sharedVar = 'shared example';

  // createFormulaApplet: replacement for Blanks.prototype.createQuestions
  C.prototype.createFormulaApplet = function (labelId) {
    var self = this;
    // $container.addClass("h5p-formulaapplet");

    var html = '<p class="formula_applet" id="';
    html += self.params.id;
    html += '">';
    html += self.params.TEX_expression
    html += '</p>';
    // $container.append(html, afterAppend(self), self);
    return $(html);
  };

  // 3. register your questions sections:
  // ```js
  /**
   * Registers this question type's DOM elements before they are attached.
   * Called from H5P.Question.
   */
  C.prototype.registerDomElements = function () {
    var self = this;

    if (self.params.image) {
      // Register task image
      self.setImage(self.params.image.path);
    }

    // Register task introduction text
    self.setIntroduction(self.params.text);

    // Register task content area
    // self.setContent(self.createQuestions(), {
    //   'class': self.params.behaviour.separateLines ? 'h5p-separate-lines' : ''
    // });
    var html = self.createFormulaApplet();
    console.log('html:',html);
    self.setContent(html, {
      'class': self.params.behaviour.separateLines ? 'h5p-separate-lines' : ''
    });
    self.afterAppend();

    // ... and buttons
    self.registerButtons();
  };
  // ```

  // 4. Register your buttons:
  // ```js
  /**
   * Create all the buttons for the task
   */
  C.prototype.registerButtons = function () {
    var self = this;

    if (!self.params.behaviour.autoCheck) {
      // Check answer button
      self.addButton('check-answer', self.params.checkAnswer, function () {
        self.toggleButtonVisibility(STATE_CHECKING);
        // specific for blanks.js
        // self.markResults();
        self.showEvaluation();
        // TODO XAPI
        // self.triggerXAPICompleted(self.getScore(), self.getMaxScore());
      });
    }

    // Check answer button
    self.addButton('show-solution', self.params.showSolutions, function () {
      // TODO specific for blanks.js?
      // if (self.allBlanksFilledOut()) {
      self.toggleButtonVisibility(STATE_SHOWING_SOLUTION);
      // TODO implement self.showCorrectAnswers();
      // }
    }, self.params.behaviour.enableSolutionsButton);

    // Try again button
    if (self.params.behaviour.enableRetry === true) {
      self.addButton('try-again', self.params.tryAgain, function () {
        // TODO DELETE self.removeMarkedResults(); 
        self.hideSolutions();
        self.hideEvaluation();
        // TODO self.clearAnswers();
        // TODO DELETE self.resetGrowTextField();
        self.done = false;
        self.toggleButtonVisibility(STATE_ONGOING);
        // self.$questions.filter(':first').find('input:first').focus();
      });
      // console.log('try again button', self, self.params, self.params.behaviour, self.params.tryAgain);
    }
    self.toggleButtonVisibility(STATE_ONGOING);
  };
  // ```

  //from blanks.js
  /**
   * Toggle buttons dependent of state.
   *
   * Using CSS-rules to conditionally show/hide using the data-attribute [data-state]
   */
  C.prototype.toggleButtonVisibility = function (state) {
    // The show solutions button is hidden if all answers are correct
    var allCorrect = (this.getScore() === this.getMaxScore());
    if (this.params.behaviour.autoCheck && allCorrect) {
      // We are viewing the solutions
      state = STATE_FINISHED;
    }

    if (this.params.behaviour.enableSolutionsButton) {
      if (state === STATE_CHECKING && !allCorrect) {
        this.showButton('show-solution');
      } else {
        this.hideButton('show-solution');
      }
    }

    if (this.params.behaviour.enableRetry) {
      if ((state === STATE_CHECKING && !allCorrect) || state === STATE_SHOWING_SOLUTION) {
        this.showButton('try-again');
      } else {
        this.hideButton('try-again');
      }
    }

    if (state === STATE_ONGOING) {
      this.showButton('check-answer');
    } else {
      this.hideButton('check-answer');
    }

    this.trigger('resize');
  };

  C.prototype.getScore_debug = function () {
    var self = this;
    var params = self.params;
    var id = params.id;
    var mf = params.MathField;
    var domElem = params.domElem;
    if (Object.keys(domElem).length > 0) {
      console.log('debug getScore: ' + id, domElem, mf);
    }
  }

  // stub, from blanks.js
  /**
   * Count the number of correct answers.
   *
   * @returns {Number} Points
   */
  C.prototype.getScore = function () {
    // await H5Pbridge.domLoad;
    var self = this;
    var params = self.params;
    var domElem = params.domElem;
    var correct = 0;
    if (Object.keys(domElem).length > 0) {
      var id = params.id;
      var data_b64 = params.data_b64;
      var precision = params.sanitizedPrecision;
      var definitionSets = params.definitionSets;
      var hasSolution = (params.formulaAppletMode === 'manu');
      // console.log('getScore params ', id, params);

      var isEqual;
      if (hasSolution) {
        var latex = params.MathField.latex();
        isEqual = H5Pbridge.checkIfEqual(latex, data_b64, definitionSets, precision);
      } else {
        // look at whole equation: input field and surroundings
        var mfContainer = H5Pbridge.MQ.StaticMath(params.domElem);
        isEqual = H5Pbridge.checkIfEquality(mfContainer.latex(), definitionSets, precision);
        // console.log(mfContainer.latex() + ' isEqual= ' + isEqual);
      }

      // var key = '#' + id + '.formula_applet + span.truefalse';
      // H5Pbridge.setOkWrongTag(key, isEqual); replaced by H5P.setScoredResult(1,5,instance,false, false);
      // ok_wrong_tagging.js deleted

      correct = (isEqual ? 1 : 0);
    }
    return correct;
  };

  /**
   * Show evaluation widget, i.e: 'You got x of y blanks correct'
   */
  C.prototype.showEvaluation = function () {
    var maxScore = this.getMaxScore();
    var score = this.getScore();
    var scoreText = H5P.Question.determineOverallFeedback(this.params.overallFeedback, score / maxScore).replace('@score', score).replace('@total', maxScore);

    this.setFeedback(scoreText, score, maxScore, this.params.scoreBarLabel);

    if (score === maxScore) {
      this.toggleButtonVisibility(STATE_FINISHED);
    }
  };

  /**
   * Hide the evaluation widget
   */
  C.prototype.hideEvaluation = function () {
    // Clear evaluation section.
    this.removeFeedback();
  };

  /**
   * Hide solutions. (/try again)
   */
  C.prototype.hideSolutions = function () {
    // TODO Clean solution from quiz
    // this.$questions.find('.h5p-correct-answer').remove();
  };

  // stub, from blanks.js
  /**
   * Get maximum number of correct answers.
   *
   * @returns {Number} Max points
   */
  C.prototype.getMaxScore = function () {
    // var self = this;
    // TODO implement getMaxScore()
    // return self.clozes.length;
    return 1;
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


  var counter;
  // afterAppend is called multiple times, once for every appended FormulaApplet
  // function afterAppend(fa_obj) {
  C.prototype.afterAppend = function () {
    var self = this;
    // if counter is undefined, init with value 0.
    // if counter is defined (increased), do not change
    counter = counter || 0;
    if (counter === 0) {
      // things to be done once
      console.log('formulaapplet.js ' + H5Pbridge.config.version);
      var viewp = $('meta[name="viewport"]')[0];
      if (typeof viewp === 'undefined') {
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
      }

      $('body').append('<div id="hiddenList" style="display:none;">hidden list</div>');
      //add visualViewport handler
      // https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
      $('body').append('<div id="layoutViewport"></div>');
      var layoutViewport = document.getElementById('layoutViewport');
      window.visualViewport.addEventListener('scroll', visualVP_scrollHandler);
      window.visualViewport.addEventListener('resize', function () {
        refreshVirtualKeyboard(false, true); //forced=false, hide does not matter: no change of old value
      });

      function visualVP_scrollHandler() {
        var visualVP = window.visualViewport;
        // console.log(visualVP);
        // console.log(layoutViewport.getBoundingClientRect());
        // Since the vkbd is position: fixed we need to offset it by the visual
        // viewport's offset from the layout viewport origin.
        var offsetX = visualVP.offsetLeft;
        var offsetY = visualVP.height;
        offsetY -= layoutViewport.getBoundingClientRect().height;
        offsetY += visualVP.offsetTop;

        // You could also do this by setting style.left and style.top if you
        // use width: 100% instead.
        var vkbd = document.getElementById('virtualKeyboard');
        if (typeof vkbd !== 'undefined') {
          var transform_style;
          transform_style = 'translate(';
          transform_style += offsetX + 'px,';
          transform_style += offsetY + 'px,';
          transform_style += 'scale(' + 1 / visualVP.scale + ')';
          // console.log('transform_style', transform_style);
          vkbd.style.transform = transform_style;
        }
      }

      // mathQuillify legacy applets with syntax <p class="formula_applet solution">...</p>
      mathQuillifyLegacyApplets();
      // first call of refreshVirtualKeyboard
      refreshVirtualKeyboard(true, true); // forced=true, hide=true
    }
    counter++;

    var isMobile_old;
    /** refreshVirtualKeyboard calls initVirtualKeyboard if
     * - called the first time
     * - if isMobile has changed, then with hide=isVirtualKeyboardHidden()
     */
    function refreshVirtualKeyboard(forced, hide) {
      var isMobile = (window.visualViewport.width <= 600);
      if (forced) {
        //if forced, do not check if isMobile has changed and respect parameter hide
        H5Pbridge.initVirtualKeyboard(false, isMobile, hide); //isEditor=false
      } else {
        // if not forced, check if isMobile changed
        // if changed, ignore parameter hide; take hide from state of keyboard
        if (isMobile !== isMobile_old) {
          var hide_old = H5Pbridge.isVirtualKeyboardHidden();
          H5Pbridge.initVirtualKeyboard(false, isMobile, hide_old); //isEditor=false
          isMobile_old = isMobile;
        }
      }
    }

    // things to be done after each append
    var params = self.params;

    try {
      var id = params.id;
      listOfAllFormulaAppletIds.push(id);
      var jsonList = JSON.stringify(listOfAllFormulaAppletIds);
      document.getElementById('hiddenList').innerHTML = jsonList;
    } catch (error) {
      console.log('ERROR creating listOfAllFormulaAppletIds (hidden)');
    }

    // mathQuillifying
    var MQ = H5Pbridge.MQ;
    // console.log('try to mathquillify ' + id);
    var $el = $('#' + id + '.formula_applet:not(.mq-math-mode)');
    if (typeof $el === 'undefined') {
      throw id + ' not found';
    }

    var waitForDomElem = H5Pbridge.createWaiter('waitForDomElem: ' + id);
    waitForDomElem.condition = function () {
      $el = $('#' + id + '.formula_applet:not(.mq-math-mode)');
      return (typeof $el[0] !== 'undefined');
    };
    waitForDomElem.doError = async function () {
      console.log('waitForDomElem: counter limit exceeded - ' + id);
    }

    waitForDomElem.doRest = async function () {
      var domElem = $('#' + id + '.formula_applet:not(.mq-math-mode)')[0];
      // console.log(domElem);
      var expression = domElem.innerHTML;

      // look for {{resultfield}}:
      var hasResultField = (expression.indexOf('{{result}}') >= 0);
      // hasResultField will be used in clickEvent
      // remember here, because expression will be changed soon by H5P_to_MathQuill
      if (hasResultField) {
        $(domElem).addClass('hasresultfield');
      }
      //start with empty user input, hasSolution=true/false does not matter
      var solution = '';
      var isEditor = false;
      var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, isEditor);
      domElem.innerHTML = temp;

      var mqEditableField;
      try {
        mqEditableField = MQ.StaticMath(domElem);
      } catch (err) {
        console.error('Error using MQ.StaticMath: ' + err);
        console.trace();
      }

      $el.on('click', clickHandler);

      function clickHandler(ev) {
        // console.log(ev.target, ev);
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
              //static formula
              console.log(ev.currentTarget.id + ' has no ResultField');
            }
          }
        } catch (error) {
          // TODO ERROR ReferenceError: ev is not defined (maybe if hasSolution = false) 
          console.log('ERROR ' + error);
        }
      }

      // attach button for evoking virtual keyboard
      try {
        // make virtual keyboard show/hide by mouseclick
        var $keyboardInvokeButton = $('<button class="keyb_button">\u2328</button>');
        $keyboardInvokeButton.insertAfter($el);
        $keyboardInvokeButton.on('mousedown', function (ev) {
          // console.log('mousedown -> unitButtonText=' + self.params.unitButtonText);
          H5Pbridge.setUnitButtonText(self.params.unitButtonText);
          refreshVirtualKeyboard(true, false); //forced=true, hide=false -> show keyboard
          $("button.keyb_button").removeClass('selected');
        });
      } catch (error) {
        console.error(error);
      }
      if ($('#' + id).hasClass('mq-math-mode')) {
        console.log(id + ' is mathQuillified');
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
              mathQuillEditHandler();
            },
            enter: () => {
              // mathQuillEditHandler();
              self.showEvaluation();
            },
          }
        });
        params.MathField = mf;
      }

      function mathQuillEditHandler() {
        if (H5Pbridge.isEditHandlerActive()) {
          if (params.formulaAppletPhysics) {
            H5Pbridge.makeAutoUnitstring(mf);
          }
        }
      }
      params.domElem = domElem;
    };
    waitForDomElem.start();

    async function mathQuillifyLegacyApplets() {
      await H5Pbridge.domLoad;
      var MQ = H5Pbridge.MQ;
      console.log('mathQuillifyLegacyApplets');
      $('p.formula_applet.solution').each(function (index) {
        var domElem = $(this)[0];
        var expression = domElem.innerHTML;
        var solution = '';
        var isEditor = false;
        var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, isEditor);
        domElem.innerHTML = temp;
        MQ.StaticMath(domElem);
      });
    }
  }
  // is this place for resize sufficient for Lumi? Answer:No
  // $(document).trigger('resize');
  return C;
})(H5P.jQuery, H5P.Question);