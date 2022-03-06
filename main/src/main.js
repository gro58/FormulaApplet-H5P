import preparePage, {
    mathQuillify,
} from "./js/preparePage.js";
// import {
//     getCookie
// } from "../public/build/translate.js";
// import {
//     isH5P
// } from "./js/dom.js";
import {
    randomId,
    editorAction,
    sensorTimer
} from "./js/editor.js";
import decode from "./js/decode.js";
// import config from "./js/config.json";

// H5Pbridge
export {
    decode,
    editorAction,
    mathQuillify,
    preparePage,
    randomId,
    sensorTimer
};

window.onload = function () {
        preparePage();
 };

export function mainIsLoaded() {
    return true;
}
