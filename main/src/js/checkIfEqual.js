"use strict";

// import $ from "jquery";
import parse, {
    FaTree,
    evaluateTree,
    fillWithValues
} from "./texParser.js";
import definitionString2Array from './definition_string_to_array.js';
import config from "./config.json";


// import {getFAppFromId} from "./preparePage.js";

/**
 * 
 * @param {string} leftside left side of equation 
 * @param {string} data_b64 right side of equation, encoded
 * @param {string} definitionSets  set of conditions to be fulfilled
 * @returns true if a = b, false if not<br>
 * 
 * assembles an equation a = b from left side a and decoded right side b, then checks if a = b is true<hr>
 * @augments checkIfEquality
 * @see checkIfEquality
 */
export function checkIfEqual(leftside, data_b64, definitionSets, precision) {
    var rightside = H5Pbridge.decode(data_b64);
    var equation = leftside + '=' + rightside;
    return checkIfEquality(equation, definitionSets, precision);
}

/**
 * 
 * @param {string} equation TEX string representing an equation to be checked
 * @param {string} definitionSets  set of condioions to be fulfilled
 * @returns true if equality holds, false if not
 * @see checkIfEqual
 */

export function checkIfEquality(equation, definitionSets, precision) {
    equation = equation.replace(/\\unit{/g, config.unit_replacement);
    // legacy: use of config.unit_replacement
    //TODO: use of \\unit, replace parseTextColor(tree) by parseUnit(tree) in texParser.js
    // console.log(equation);
    var definitionArray = definitionString2Array(definitionSets);
    // console.log(definitionArray);
    var temp = equation.replace(/\\times/g, '\\cdot');
    var myTree = parse(temp);
    myTree = fillWithRandomValAndCheckDefSets(myTree, definitionArray);
    var almostOne = evaluateTree(myTree);
    var dif = Math.abs(almostOne - 1);
    // var fApp = getFAppFromId(id);
    // var precision = fApp.precision;
    if (dif < precision) {
        return true;
        // $('#' + id).removeClass('mod_wrong').addClass('mod_ok');
    } else {
        return false;
        // $('#' + id).removeClass('mod_ok').addClass('mod_wrong');
    }
}

function fillWithRandomValAndCheckDefSets(treeVar, definitionArray) {
    var rememberTree = JSON.stringify(treeVar);
    if (definitionArray.length == 0) {
        fillWithValues(treeVar);
        return treeVar;
    } else {
        // start watchdog
        var success = false;
        var start = new Date();
        var timePassedMilliseconds = 0;
        while (!success && timePassedMilliseconds < 2000) {
            var tree2 = new FaTree();
            tree2 = JSON.parse(rememberTree);
            fillWithValues(tree2);
            var variableValueList = tree2.variableValueList;
            // CheckDefinitionSets
            for (var i = 0; i < definitionArray.length; i++) {
                var definitionset = parse(definitionArray[i]);
                fillWithValues(definitionset, variableValueList);
                var value = evaluateTree(definitionset);
                success = ((value > 0) || typeof value == 'undefined');
                if (!success) {
                    // short circuit
                    i = definitionArray.length;
                    // restore leafs with value = undefined
                }
            }
            var now = new Date();
            timePassedMilliseconds = now.getTime() - start.getTime();
        }
        if (!success) {
            tree2.hasValue = false;
            tree2.variableValueList = [];
        }
        return tree2;
    }
}