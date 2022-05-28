﻿"use strict";

var H5P = H5P || {};

H5P.FormulaApplet = (function ($, Question) {
  console.log('define H5P.FormulaApplet class');
  // console.log(Question);

  // from blanks.js:
  /**
   * @constant
   * @default
   */
  var STATE_ONGOING = 'ongoing';
  var STATE_CHECKING = 'checking';
  var STATE_SHOWING_SOLUTION = 'showing-solution';
  var STATE_FINISHED = 'finished';



  var counter;
  // afterAppend is called multiple times, once for every appended FormulaApplet
  function afterAppend(fa_obj) {
    // if counter is undefined, init with value 0.
    // if counter is defined (increased), do not change
    counter = counter || 0;
    if (counter === 0) {
      // things to be done once
      console.log('formulaapplet.js 0.13.' + H5Pbridge.config.patchversion);
      // mathQuillify legacy applets with syntax <p class="formula_applet solution">...</p>
      mathQuillifyLegacyApplets();
      H5Pbridge.initVirtualKeyboardnoEditor();
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
      // look for {{resultfield}}:
      var hasResultField = (expression.indexOf('{{result}}') >= 0);
      // hasResultField will be used in clickEvent
      // remember here, because expression will be changed soon by H5P_to_MathQuill
      if (hasResultField) {
        $(domElem).addClass('hasresultfield');
      }
      var hasSolution = (options.formulaAppletMode === 'manu');

      var language = H5Pbridge.docLang();
      //start with empty user input
      var solution = '';
      var isEditor = false;
      var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, language, isEditor);
      domElem.innerHTML = temp;

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
              console.log(ev.currentTarget.id + ' has no ResultField');
            }
          }
        } catch (error) {
          //TODO ERROR ReferenceError: ev is not defined (maybe if hasSolution = false) 
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
              mathQuillEditHandler();
            },
            //TODO ENTER: is case enter necessary?
            enter: () => {
              mathQuillEditHandler();
            },
          }
        });
      }

      //TODO no need for argument "options" because defined in surrounding function
      function mathQuillEditHandler() {
        if (H5Pbridge.isEditHandlerActive()) {
          var data_b64 = options.data_b64;
          var unitAuto = options.formulaAppletPhysics;
          var precision = options.sanitizedPrecision;
          var definitionSets = options.definitionSets;

          if (unitAuto) {
            // has to be done before checkIfEqual
            H5Pbridge.makeAutoUnitstring(mf);
          }

          var isEqual;
          if (hasSolution) {
            isEqual = H5Pbridge.checkIfEqual(mf.latex(), data_b64, definitionSets, precision);
          } else {
            // look at whole equation: input field and surroundings
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

    async function mathQuillifyLegacyApplets() {
      await H5Pbridge.domLoad;
      var MQ = H5Pbridge.MQ;
      console.log(MQ);
      console.log('mathQuillifyLegacyApplets');
      $('p.formula_applet.solution').each(function (index) {
        var domElem = $(this)[0];
        var expression = domElem.innerHTML;
        var solution = '';
        var language = H5Pbridge.docLang();
        var isEditor = false;
        var temp = H5Pbridge.H5P_to_MathQuill(expression, solution, language, isEditor);
        domElem.innerHTML = temp;
        console.log(index, temp);
        MQ.StaticMath(domElem);
      });
    }
  }



  //TODO resize
  // $(document).trigger('resize');


  /**
   * Constructor function.
   */
  function C(options, id) {

    // Extend with Question
    var self = this;
    // console.log(self);
    // Inheritance
    // Question.call(self, 'blanks');
    Question.call(self, 'FormulaApplet');

    this.$ = $(this);
    // console.log(options);
    // formulaapplet.js uses options like https://h5p.org/tutorial-greeting-card
    // but blank.js uses params 
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      // add option for result of sanitizedPrecision()
      // this.options.precision will not be changed
      sanitizedPrecision: '',
      //TODO
      overallFeedback: [],
      // behaviour from blanks.js
      behaviour: {
        enableRetry: true,
        enableSolutionsButton: true,
        enableCheckButton: true,
        caseSensitive: true,
        showSolutionsRequiresInput: true,
        autoCheck: false,
        separateLines: false
      },
      testoption: 'test'
    }, options);
    // console.log(this.options)
    this.params = this.options;
    // console.log(this.params);
    // Keep provided id.
    this.id = id;
    this.options.sanitizedPrecision = sanitizedPrecision(this.options.precision);
    this.options.testoption = 'test changed';
    // console.log(this.options)
    // console.log(this.params);
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  // C.prototype.attach = function ($container) {
  //   // "this" points to H5P.FormulaApplet 
  //   var self = this;
  //   $container.addClass("h5p-formulaapplet");

  //   var html = '<p class="formula_applet" id="';
  //   html += self.options.id;
  //   html += '">';
  //   html += self.options.TEX_expression
  //   html += '</p>';
  //   $container.append(html, afterAppend(self), self);
  // };



  // C.prototype.attach($container) will be replaced by
  // self.setContent(self.createFormulaApplet()...)
  // problem: afterAppend(self) has to be called!

  // Inheritance from Question class
  // Blanks.prototype = Object.create(Question.prototype);
  // Blanks.prototype.constructor = Blanks;
  C.prototype = Object.create(Question.prototype);
  C.prototype.constructor = C;

  // createFormulaApplet: replacement for Blanks.prototype.createQuestions
  C.prototype.createFormulaApplet = function (labelId) {
    var self = this;
    // $container.addClass("h5p-formulaapplet");

    var html = '<p class="formula_applet" id="';
    html += self.options.id;
    html += '">';
    html += self.options.TEX_expression
    html += '</p>';
    // $container.append(html, afterAppend(self), self);
    var $html = $(html);
    return $html;
  };

  // 3. register your questions sections:
  // ```js
  /**
   * Registers this question type's DOM elements before they are attached.
   * Called from H5P.Question.
   */
  C.prototype.registerDomElements = function () {
    var self = this;

    // console.log(self);
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
    self.setContent(self.createFormulaApplet(), {
      'class': self.params.behaviour.separateLines ? 'h5p-separate-lines' : ''
    });
    afterappend(self);
    // ... and buttons
    self.registerButtons(); //TODO button logic
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
        //TODO XAPI
        // self.triggerXAPICompleted(self.getScore(), self.getMaxScore());
      });
    }

    // Check answer button
    self.addButton('show-solution', self.params.showSolutions, function () {
      // specific for blanks.js
      //TODO
      // if (self.allBlanksFilledOut()) {
      //   self.toggleButtonVisibility(STATE_SHOWING_SOLUTION);
      //   self.showCorrectAnswers();
      // }
    }, self.params.behaviour.enableSolutionsButton);

    // Try again button
    if (self.params.behaviour.enableRetry === true) {
      self.addButton('try-again', self.params.tryAgain, function () {
        self.removeMarkedResults();
        self.hideSolutions();
        self.hideEvaluation();
        self.clearAnswers();
        self.resetGrowTextField();
        self.done = false;
        self.toggleButtonVisibility(STATE_ONGOING);
        self.$questions.filter(':first').find('input:first').focus();
      });
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

  // stub, from blanks.js
  /**
   * Count the number of correct answers.
   *
   * @returns {Number} Points
   */
  C.prototype.getScore = function () {
    var self = this;
    var correct = 1;
    // for (var i = 0; i < self.clozes.length; i++) {
    //   if (self.clozes[i].correct()) {
    //     correct++;
    //   }
    //   self.params.userAnswers[i] = self.clozes[i].getUserAnswer();
    // }

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
    // Clean solution from quiz
    this.$questions.find('.h5p-correct-answer').remove();
  };

  /**
   * Get maximum number of correct answers.
   *
   * @returns {Number} Max points
   */

  // stub, from blanks.js
  /**
   * Get maximum number of correct answers.
   *
   * @returns {Number} Max points
   */
  C.prototype.getMaxScore = function () {
    // var self = this;
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

  return C;
})(H5P.jQuery, H5P.Question);