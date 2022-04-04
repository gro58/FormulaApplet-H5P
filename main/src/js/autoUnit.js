"use strict";

import {
    findCorrespondingRightBracket,
    checkScientificNotation
}
from "./texParser.js";
import config from "./config.json";
// import mathQuillEditHandlerActive
// from "./editHandler.js";
import { setEditHandlerActive }
from "./switchEditHandler.js";

export default function makeAutoUnitstring(mf) {
    // mf = MathField
    var str = mf.latex();
    console.log(str);
    var mfLatexForParser = str;
    // var unitTag = '\\textcolor{blue}{';
    var unitTag = config.unit_replacement;

    var pos = str.indexOf(unitTag);
    if (pos >= 0) {
        var left = str.substr(0, pos);
        // rest has to start with {
        var rest = str.substr(pos + unitTag.length - 1);
        var bracket = findCorrespondingRightBracket(rest, '{');
        var middle = rest.substring(1, bracket.rightPos);
        var right = rest.substr(bracket.rightPos + 1);
        var sci = checkScientificNotation(left).isScientific;
        if (sci && middle.length > 0) {
            // expand the unit tag at the right side
            var newLatex = left + unitTag + middle + right + '}';
            // mfLatexForParser = csn.repl + unitTag + middle + right + '}';
            mfLatexForParser = left + unitTag + middle + right + '}';
            setEditHandlerActive(false);
            mf.latex(newLatex);
            mf.keystroke('Left');
            setEditHandlerActive(true);
        }
    } else {
        // maybe create unit tag
        var beginning = '';
        for (var i = str.length; i >= 0; i--) {
            beginning = str.substr(0, i);
            sci = checkScientificNotation(beginning).isScientific;
            if (sci) {
                break;
            }
        }
        if (beginning.length > 0) {
            rest = str.substr(beginning.length);
            if (rest.length > 0) {
                newLatex = beginning + unitTag + rest + '}';
                // mfLatexForParser = csn.repl + unitTag + rest + '}';
                mfLatexForParser = beginning + unitTag + rest + '}';
                setEditHandlerActive(false);
                mf.latex(newLatex);
                mf.keystroke('Left');
                setEditHandlerActive(true);
            }
        }
    }
    return mfLatexForParser;
}