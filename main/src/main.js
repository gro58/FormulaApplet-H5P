import preparePage, {
    mathQuillify,
} from "./js/preparePage.js";
import {
    // editorAction,
    sensorTimer
} from "./js/editor.js";
import decode, {encode} from "./js/decode.js";
// import config from "./js/config.json";

// H5Pbridge
export {
    decode,
    encode,
    // editorAction,
    mathQuillify,
    preparePage,
    sensorTimer
};

window.onload = function () {
        preparePage();
 };

export function mainIsLoaded() {
    return true;
}
