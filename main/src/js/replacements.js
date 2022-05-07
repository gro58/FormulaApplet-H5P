"use strict";

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

export function H5P_to_MathQuill(expression, solution, language, isEditor){
    return true;
}

