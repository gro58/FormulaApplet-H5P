import makeAutoUnitstring from "./autoUnit.js";
import {
    checkIfEqual,
    checkIfEquality
} from "./checkIfEqual.js";
import config from "./config.json";
import isEditHandlerActive from "./switchEditHandler.js";
import setOkWrongTag from "./ok_wrong_tagging.js";

export default function mathQuillEditHandler_debug(options) {
    console.log(options);
}

function mathQuillEditHandler_old(fApp, MQ) {
    if (isEditHandlerActive()) {
        var mf = fApp.mathField;
        var mfContainer = MQ.StaticMath(fApp.formulaApplet);
        var solution = fApp.solution;
        var hasSolution = fApp.hasSolution;
        var unitAuto = fApp.unitAuto;
        var precision = fApp.precision;
        var defArray = fApp.definitionsetList;

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
            isEqual = checkIfEqual(mfLatexForParser, solution, defArray, precision);
            console.log(mfLatexForParser + ' = ' + solution + ' ' + isEqual);
        } else {
            isEqual = checkIfEquality(mfContainer.latex(), defArray, precision);
            console.log(mfContainer.latex() + ' isEqual= ' + isEqual);
        }
        // see ok_wrong_tagging.js
        var key = '#' + fApp.id + '.formula_applet + span.truefalse';
        setOkWrongTag(key, isEqual);
    }
}