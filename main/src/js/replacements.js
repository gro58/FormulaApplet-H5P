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
    // if expression is wrapped in span:
    // sanitize before applying no_XSS - dirty hack

    if (result !== str) {
        console.log('XSS protection:');
        console.log("'" + str + "' -> '" + result + "'");
    }

    return result;
}

export function H5P_to_MathQuill(expression, solution, language, isEditor) {
    result = expression;
    var wrapped_in_span = false;
    if (expression.indexOf('<span id="math-field">') >= 0) {
        console.log('remove math-field spans');
        wrapped_in_span = true;
        // unwrap, remove math-field spans
        result = result.replace(/<span id="math-field">/g, '');
        result = result.replace(/<\/span>/g, '');
    }
    var result = no_XSS(result);
    if (wrapped_in_span){
        result = '<span id="math-field">' + result + '</span>';
    }

    if (isEditor) {
        // whole expression editable; MathQuill will render class "inputfield" for use of CSS) 
        result = result.replace(/{{result}}/g, '\\class{inputfield}{' + no_XSS(solution) + '}');
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
    return result;
}