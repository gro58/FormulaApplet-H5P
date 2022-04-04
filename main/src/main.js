"use strict";

import preparePage, {
    mathQuillify,
    // mathQuillifyEditor,
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
import MQ from "./js/lib/mathquillWrapper.js";
import {
    mathQuillEditHandlerActive
} from "./js/editHandler.js";


// H5Pbridge
export {
    decode,
    encode,
    mathQuillify,
    // mathQuillifyEditor,
    preparePage,
    editor_fApp,
    config,
    setInput,
    separateInputfield,
    isH5P,
    domLoad,
    MQ,
    mathQuillEditHandlerActive
};

window.onload = function () {
    preparePage();
};

export function mainIsLoaded() {
    return true;
}

export let selected_language = {
    lang: "de"
};