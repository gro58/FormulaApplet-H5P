"use strict";

import $ from "jquery";

/**
 * decomposes a definition string into a list of definitions
 * 
 * @param {string} def definition sets, composed with & or &&
 * @returns {string[]} array of string expressions with condition to be positive
 * @example def="x > 0 && y < 5" returns ["x", "5-y"], meaning x > 0 and 5-y > 0
 */
export default function definitionString2Array(def_with_entities) {
  // https://tertiumnon.medium.com/js-how-to-decode-html-entities-8ea807a140e5
  var decodeArea = document.createElement('textarea');
  decodeArea.innerHTML = def_with_entities;
  // console.log(decodeArea);
  var def = decodeArea.value;
  // console.log(def_with_entities + ' -> ' + def);
  def = def.replace(/\s/g, "");
  def = def.replace(/&&/g, "&");
  var defArray = def.split("&");
  for (var i = 0; i < defArray.length; i++) {
    var ds = defArray[i];
    var result = '';
    var temp;
    if (ds.indexOf('>') > -1) {
      temp = ds.split('>');
      if (temp[1] == '0') {
        result = temp[0];
      } else {
        result = temp[0] + '-' + temp[1];
      }
    }
    if (ds.indexOf('<') > -1) {
      temp = ds.split('<');
      if (temp[0] == '0') {
        result = temp[1];
      } else {
        result = temp[1] + '-' + temp[0];
      }
    }
    defArray[i] = result;
  }
  return defArray;
}