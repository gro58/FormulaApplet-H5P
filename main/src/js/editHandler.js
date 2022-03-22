import $ from "jquery";
import {
    mathQuillEditHandlerActive
} from "./preparePage.js";

import {
    makeAutoUnitstring
} from "./preparePage.js";
import {
    checkIfEqual,
    checkIfEquality
} from "./checkIfEqual.js";

export default function mathQuillEditHandler(fApp, MQ) {
    if (mathQuillEditHandlerActive.flag == true) {
        // var fApp = FAList[id]; //deprecated
        var mf = fApp.mathField;
        var mfContainer = MQ.StaticMath(fApp.formulaApplet);
        var solution = fApp.solution;
        var hasSolution = fApp.hasSolution;
        var unitAuto = fApp.unitAuto;
        var precision = fApp.precision;
        var dsList = fApp.definitionsetList;

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
            isEqual = checkIfEqual(mfLatexForParser, solution, dsList, precision);
            console.log(mfLatexForParser + ' = ' + solution + ' ' + isEqual);
        } else {
            isEqual = checkIfEquality(mfContainer.latex(), dsList, precision);
            console.log(mfContainer.latex() + ' isEqual= ' + isEqual);
        }
        var key = '#' + fApp.id + '.formula_applet + span.truefalse';
        var truefalse = $(key)[0];
        if (isEqual) {
            $(truefalse).css({
                "color": "green",
                "font-size": "30pt"
            });
            truefalse.innerHTML = "&nbsp;&#x2714;";
        } else {
            $(truefalse).css({
                "color": "red",
                "font-size": "30pt"
            });
            truefalse.innerHTML = "&nbsp;&#x21AF;";
        }
    }
}