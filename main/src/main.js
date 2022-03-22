import preparePage, {
    mathQuillify,
} from "./js/preparePage.js";
// import {
//     // editorAction,
//     // sensorTimer,
//     editor_fApp
// } from "./js/editor.js";
import {
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
    // domLoad,
    isH5P
} from "./js/dom.js";



// H5Pbridge
export {
    decode,
    encode,
    // editorAction,
    mathQuillify,
    preparePage,
    editor_fApp,
    config,
    setInput,
    separateInputfield,
    isH5P
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

// export function get_selected_language() {
//     return selected_language || 'de';
// }

// export function set_selected_language(lang) {
//     selected_language = lang;
// }