"use strict";

// import $ from "jquery";
import parse, {
    FaTree,
    evaluateTree,
    fillWithValues
} from "./texParser.js";
import definitionString2Array from 'definition_string_to_array.js';

// import {getFAppFromId} from "./preparePage.js";

/**
 * 
 * @param {string} leftside left side of equation 
 * @param {string} rightside right side of equation
 * @param {string} definitionSets  set of condioions to be fulfilled
 * @returns true if a = b, false if not<br>
 * 
 * assembles an equation a = b from left side a uns right side b, then checks if a = b is true<hr>
 * @augments checkIfEquality
 * @see checkIfEquality
 */
export function checkIfEqual(leftside, rightside, definitionSets, precision) {
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
    var dsList = definitionString2Array(definitionSets);
    var temp = equation.replace(/\\times/g, '\\cdot');
    var myTree = parse(temp);
    myTree = fillWithRandomValAndCheckDefSets(myTree, dsList);
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

function fillWithRandomValAndCheckDefSets(treeVar, dsList) {
    var rememberTree = JSON.stringify(treeVar);
    if (dsList.length == 0) {
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
            for (var i = 0; i < dsList.length; i++) {
                var definitionset = parse(dsList[i]);
                fillWithValues(definitionset, variableValueList);
                var value = evaluateTree(definitionset);
                success = ((value > 0) || typeof value == 'undefined');
                if (!success) {
                    // short circuit
                    i = dsList.length;
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