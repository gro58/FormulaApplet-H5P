"use strict";

import preparePage, {
    mathQuillify,
    editor_fApp
} from "./js/preparePage.js";
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
    isH5P
} from "./js/dom.js";
import {
    getButtonText,
    setButtonText
} from "./js/translateVirtualKeyboard.js";
import MQ from "./js/lib/mathquillWrapper.js";
import isEditHandlerActive from "./js/switchEditHandler.js";


// H5Pbridge
export {
    decode,
    encode,
    mathQuillify,
    preparePage,
    editor_fApp,
    config,
    setInput,
    separateInputfield,
    isH5P,
    domLoad,
    MQ,
    getButtonText,
    setButtonText,
    isEditHandlerActive
};

window.onload = function () {
    preparePage();
};

export function mainIsLoaded() {
    return true;
}

// export let selected_language = {
//     lang: "de"
// };