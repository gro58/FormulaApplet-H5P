import makeAutoUnitstring from "./autoUnit.js";
import {
    checkIfEqual,
    checkIfEquality
} from "./checkIfEqual.js";
import config from "./config.json";
import isEditHandlerActive from "./switchEditHandler.js";
import setOkWrongTag from "./ok_wrong_tagging.js";

export default function mathQuillEditHandler(fApp, MQ) {
    // if (mathQuillEditHandlerActive.flag === true) {
    if (isEditHandlerActive()) {
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
            solution = solution.replace(/\\unit{/g, config.unit_replacement);
            isEqual = checkIfEqual(mfLatexForParser, solution, dsList, precision);
            console.log(mfLatexForParser + ' = ' + solution + ' ' + isEqual);
        } else {
            isEqual = checkIfEquality(mfContainer.latex(), dsList, precision);
            console.log(mfContainer.latex() + ' isEqual= ' + isEqual);
        }
        // see ok_wrong_tagging.js
        var key = '#' + fApp.id + '.formula_applet + span.truefalse';
        setOkWrongTag(key, isEqual);
    }
}