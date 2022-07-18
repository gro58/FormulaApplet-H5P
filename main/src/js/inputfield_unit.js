"use strict";

import config from "./config.json";
import {
    findCorrespondingRightBracket
} from "./texParser.js";

import {
    setEditHandlerActive
} from "./switchEditHandler.js";


export function getSelection(mf, options) {
    // if options.erase is undefined, erase defaults to false
    var erase = options.erase || false;
    // console.log('getSelection: erase=' + erase);
    // typeof mf = mathField
    var ori = mf.latex();
    // console.log('ori= ' + ori);
    var erased = ori;
    if (erase) {
        erased = eraseInputfieldClass(ori);
    }
    var replacementCharacter = createreplacementCharacter(ori);
    if (ori.indexOf(replacementCharacter) === -1) {
        // replacement has to be done before erase of class{...
        // Do replacement!
        // eslint-disable-next-line no-import-assign
        setEditHandlerActive(false);
        mf.typedText(replacementCharacter);
        // eslint-disable-next-line no-import-assign
        setEditHandlerActive(true);
        // erase class{inputfield}
        var replacedAndErased = mf.latex();
        if (erase) {
            replacedAndErased = eraseInputfieldClass(replacedAndErased);
        }
        // console.log('replacedAndErased= ' + replacedAndErased);
        var preSelected = '?';
        var selected = '?';
        var postSelected = '?';
        var pos = replacedAndErased.indexOf(replacementCharacter);
        preSelected = replacedAndErased.substring(0, pos);
        // selected = replacement
        postSelected = replacedAndErased.substring(pos + replacementCharacter.length);
        // Delete preSelected from beginning of erased
        // and delete postSelected from end of erased
        var check = erased.substr(0, preSelected.length);
        if (check !== preSelected) {
            console.error('Something went wrong with replacement of input field', check, preSelected);
        }
        erased = erased.substring(preSelected.length);
        check = erased.substring(erased.length - postSelected.length);
        if (check !== postSelected) {
            console.error('Something went wrong with replacement of input field', check, postSelected);
        }
        selected = erased.substring(0, erased.length - postSelected.length);
        var result = {
            preSelected: preSelected,
            selected: selected,
            postSelected: postSelected,
            ori: ori
        };
        return result;
    }
}

export function setInputField(editorMf) {
    var sel = getSelection(editorMf, {
        erase: true
    });
    var preSelected = sel.preSelected;
    var selected = sel.selected;
    var postSelected = sel.postSelected;
    var result = {};
    result['old'] = sel.ori;
    var newLatex = sel.ori;
    if (selected.length > 0) {
        newLatex = preSelected + '\\class{inputfield}{' + selected + '}' + postSelected;
    } else {
        newLatex = sanitizeInputfieldTag(newLatex);
    }
    result['new'] = newLatex;
    return result;
}

function getPositionOfUnitTags(latex, unitTag) {
    // get position of exising unit tags
    var pos = 0;
    var startOfUnitTags = [];
    var endOfUnitTags = [];
    do {
        pos = latex.indexOf(unitTag, pos);
        if (pos >= 0) {
            var rest = latex.substr(pos + unitTag.length - 1);
            var bracket = findCorrespondingRightBracket(rest, '{');
            var posRightBracket = pos + unitTag.length + bracket.rightPos;
            startOfUnitTags.push(pos);
            endOfUnitTags.push(posRightBracket);
            //posRightBracket points to char right of the right bracket
            pos++;
        }
    } while (pos >= 0)
    return {
        sofUnitTags: startOfUnitTags,
        eofUnitTags: endOfUnitTags
    };
}

export function setUnit(mf) {
    var i, k;
    var unitTag = config.unit_replacement;
    var sel = getSelection(mf, {
        erase: false
    });
    var preSelected = sel.preSelected;
    var selected = sel.selected;
    var postSelected = sel.postSelected;
    var ori = sel.ori;

    var start = preSelected.length;
    var end = start + selected.length;
    var selectpattern = '.'.repeat(ori.length).split(''); // split: transform from string to array
    for (k = start; k < end; k++) {
        selectpattern[k] = 's';
    }

    var posn = getPositionOfUnitTags(ori, unitTag);
    var startOfUnitTags = posn.sofUnitTags;
    var endOfUnitTags = posn.eofUnitTags;
    var pattern = '.'.repeat(ori.length).split(''); // split: transform from string to array
    for (i = 0; i < startOfUnitTags.length; i++) {
        for (k = startOfUnitTags[i]; k < endOfUnitTags[i]; k++) {
            pattern[k] = '#';
        }
    }
    // inspect selection start
    for (i = 0; i < startOfUnitTags.length; i++) {
        if (startOfUnitTags[i] < start && start <= endOfUnitTags[i]) {
            // move start leftwards
            start = startOfUnitTags[i];
            // short circuit:
            i = startOfUnitTags.length;
        }
    }
    // inspect selection end
    for (i = 0; i < startOfUnitTags.length; i++) {
        if (startOfUnitTags[i] <= end && end <= endOfUnitTags[i]) {
            // move end rightwards
            end = endOfUnitTags[i];
            // short circuit:
            i = startOfUnitTags.length;
        }
    }
    // debug
    selectpattern = '.'.repeat(ori.length).split(''); // split: transform from string to array
    for (k = start; k < end; k++) {
        selectpattern[k] = 's';
    }

    // delete unittags inside selection
    var ori_array = ori.split('');
    for (i = 0; i < startOfUnitTags.length; i++) {
        if (start <= startOfUnitTags[i] && endOfUnitTags[i] <= end) {
            for (k = startOfUnitTags[i]; k < startOfUnitTags[i] + unitTag.length; k++) {
                ori_array[k] = '§';
            }
            ori_array[endOfUnitTags[i] - 1] = '§';
        }
    }
    ori = ori_array.join('');

    if (selected.length > 0) {
        // new calculation necessary
        preSelected = ori.substring(0, start);
        selected = ori.substring(start, end);
        postSelected = ori.substring(end);
        var newLatex = preSelected + unitTag + selected + '}' + postSelected;
        // newLatex = newLatex.replace(/\xA7/g, '');
        newLatex = newLatex.replace(/§/g, '');
    } else {
        newLatex = ori.replace(/§/g, '');
    }
    mf.latex(sanitizeInputfieldTag(newLatex));
}

function sanitizeInputfieldTag(latex) {
    var result;
    if (typeof latex === 'undefined') {
        result = '';
    } else {
        // first make shorter
        result = latex.replace('\\class{inputfield}{', '\\class{');
        // then make longer again
        result = result.replace('\\class{', '\\class{inputfield}{');
        return result;
    }
}

export function eraseUnit(mf) {
    var unitTag = config.unit_replacement; //'\\textcolor{blue}{';

    var sel = getSelection(mf, {
        erase: false
    });
    var ori = sel.ori;
    // get position of unittags
    var posn = getPositionOfUnitTags(ori, unitTag);
    var startOfUnitTags = posn.sofUnitTags;
    var endOfUnitTags = posn.eofUnitTags;

    // delete unittag outside of cursor (or left boundary of selection)
    var cursorpos = sel.preSelected.length;
    var ori_array = ori.split('');
    for (var i = 0; i < startOfUnitTags.length; i++) {
        if (startOfUnitTags[i] <= cursorpos && cursorpos <= endOfUnitTags[i]) {
            for (var k = startOfUnitTags[i]; k < startOfUnitTags[i] + unitTag.length; k++) {
                ori_array[k] = '§';
            }
            ori_array[endOfUnitTags[i] - 1] = '§';
        }
    }
    ori = ori_array.join('');
    ori = ori.replace(/§/g, '');
    // restore selection-checked mf
    mf.latex(sanitizeInputfieldTag(ori));
}

/**
 * 
 * @param {string} latex string containing latex code
 * @returns {object} object consisting of three strings: before, tag, after
 * @example result = separateInputfield("bli\\class{inputfield}{bla}blu"), then
 * @example result.before = "bli", result.tag = "bla", result.after = "blu"
 * @example result = separateInputfield("string_without_inputfield"), then
 * @example result.before = "", result.tag = "", result.after = "string_without_inputfield"
 */

// separateInputfield is also used by refreshResultField.
export function separateInputfield(latex) {
    var beforeTag, tag, afterTag;
    var classTag = '\\class{inputfield}{';
    var pos = latex.indexOf(classTag);
    if (pos > -1) {
        beforeTag = latex.substring(0, pos);
        var rest = latex.substring(pos + classTag.length - 1);
        // rest starts with {
        var bracket = findCorrespondingRightBracket(rest, '{');
        if (bracket.leftPos !== 0 || bracket.bracketLength !== 1 || bracket.rightBracketLength !== 1) {
            console.error('Something went wront at separateInputfield()', bracket);
        }
        tag = rest.substring(1, bracket.rightPos);
        afterTag = rest.substring(bracket.rightPos + 1);
    } else {
        beforeTag = '';
        tag = '';
        afterTag = latex;
    }
    var result = {
        before: beforeTag,
        tag: tag,
        after: afterTag
    };
    // console.info(latex);
    // console.info(beforeTag + '|' + tag + '|' + afterTag);
    return result;
}

function eraseInputfieldClass(latex) {
    // latex = 'abc\\class{inputfield}{def}ghi';
    // temp = {before: 'abc', tag: 'def', after: 'ghi'};
    // return 'abcdefghi';
    var temp = separateInputfield(latex);
    return temp.before + temp.tag + temp.after;
}

export function createreplacementCharacter(latexstring) {
    const separators = '∀µ∉ö∋∐∔∝∤∮∱∸∺∽≀';
    var i = 0;
    sep = '';
    do {
        var sep = separators[i];
        var found = (latexstring.indexOf(sep) > -1);
        var cont = found;
        i++;
        if (i > separators.length) {
            cont = false;
            sep = 'no replacementCharacter char found';
        }
    } while (cont)
    return sep;
}