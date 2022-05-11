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
    // https://stackoverflow.com/questions/7394748/whats-the-right-way-
    // to-decode-a-string-that-has-special-html-entities-in-it?lq=1
    console.log(def_with_entities + ' -> ' + def);
    var def = $('<div>').html(def_with_entities).text();
    def = def.replace(/\s/g, "");
    def = def.replace(/&&/g, "&");
    var dsList = def.split("&");
    for (var i = 0; i < dsList.length; i++) {
      var ds = dsList[i];
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
      dsList[i] = result;
    }
    return dsList;
  }
  