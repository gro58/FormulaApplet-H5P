"use strict";

import config from "./config.json";

// manage replacements in one place

// for H5P parameters and getHTML syntax <p class="formula_applet" >LATEX...</p>
// use {{result}} and \unit{...}; use data-b64 (H5P: data_b64); 
// use \cdot for multiplication sign and in texParser.js
//
// for MathQuill (MathField.latex(...)) use
// ,  and "unit_replacement": "\\textcolor{blue}{"
// for editor: \class{inputfield}{...}
// for editor and texParser: decode(data_b64)
// 
// use \times for \cdot if lang="en"

export function no_XSS(str) {
    var result = str;
    // erase < > " ' & space
    result = result.replace(/</g, '');
    result = result.replace(/>/g, '');
    result = result.replace(/"/g, '');
    result = result.replace(/'/g, '');
    result = result.replace(/&/g, '');
    result = result.replace(/ /g, '');
    if (result !== str) {
        console.log('XSS protection:');
        console.log("'"+str + "' -> '" + result + "'");
    }
    return result;
}

export function H5P_to_DOM(expression, solution, language, isEditor) {
    var result = expression;
    if (isEditor) {
        // whole expression editable; MathQuill will render class "inputfield" for use of CSS) 
        result = result.replace(/{{result}}/g, '\\class{inputfield}{' + solution + '}');
    } else {
        // MathQuill will render expression with empty inputfield and other parts not editable
        result = result.replace(/{{result}}/g, '\\MathQuillMathField{}');
    }
    // replacements for both expression and solution
    result = result.replace(/\\unit{/g, config.unit_replacement);
    result = result.replace(/\\Ohm/g, '\\Omega');
    result = result.replace(/\\mathrm/g, '');
    if (language === 'en') {
        result = result.replace(/\\cdot/g, config.multiplicationCross);
        result = result.replace(/\,/g, '.');
    }
    result = no_XSS(result);
    return result;
}