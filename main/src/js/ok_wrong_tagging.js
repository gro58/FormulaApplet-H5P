"use strict";
import $ from "jquery";
import {
    isH5P
} from "./dom.js";

export default function setOkWrongTag(key, isEqual, instance) {
    // if (isH5P()) {
    //     H5P.setScoredResult(1,5,instance,false, false);
    // } else {
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
    // }
}