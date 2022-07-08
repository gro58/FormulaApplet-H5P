"use strict";
// 

import decode, {
    encode
} from "./js/decode.js";
import config from "./js/config.json";
import {
    setInput,
    separateInputfield,
} from "./js/inputfield_unit.js";
import {
    domLoad,
    isH5P,
    docLang
} from "./js/dom.js";
import MQ from "./js/lib/mathquillWrapper.js";
import isEditHandlerActive from "./js/switchEditHandler.js";
import createWaiter from "./js/waiterFactory.js";
import {
    H5P_to_MathQuill,
    MathQuill_to_H5P
} from "./js/replacements.js";
import initVirtualKeyboardnoEditor, {
    showVirtualKeyboard,
    createkeyboardDiv,
    virtualKeyboardBindEvents,
    keyboardActivate,
    isVirtualKeyboardHidden
} from "./js/virtualKeyboard.js";
import {
    checkIfEqual,
    checkIfEquality
} from "./js/checkIfEqual.js";
// import setOkWrongTag from "./js/ok_wrong_tagging.js";
import makeAutoUnitstring from "./js/autoUnit.js";

// H5Pbridge
export {
    decode,
    encode,
    config,
    setInput,
    separateInputfield,
    isH5P,
    domLoad,
    MQ,
    isEditHandlerActive,
    H5P_to_MathQuill,
    MathQuill_to_H5P,
    docLang,
    initVirtualKeyboardnoEditor,
    showVirtualKeyboard,
    createkeyboardDiv,
    virtualKeyboardBindEvents,
    keyboardActivate,
    isVirtualKeyboardHidden,
    checkIfEqual,
    checkIfEquality,
    // setOkWrongTag,
    makeAutoUnitstring,
    createWaiter
};

// window.onload = function () {
//     preparePage();
// };

export function mainIsLoaded() {
    return true;
}

// export let selected_language = {
//     lang: "de"
// };