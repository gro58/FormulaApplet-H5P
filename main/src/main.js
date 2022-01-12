import preparePage, {
    mathQuillify,
} from "./js/preparePage.js";
import {
    formulaAppletLanguage,
    getCookie
} from "./js/translate.js";
import {
    isH5P
} from "./js/dom.js";
import {
    randomId,
    editorAction
} from "./js/editor.js";
import decode from "./js/decode.js";
import config from "./js/config.json";

// H5Pbridge
export {
    decode,
    editorAction,
    mathQuillify,
    preparePage,
    randomId,
};

window.onload = function () {
    var lang;
    if (isH5P()) {
        // TODO this code causes bugs:
        // eslint-disable-next-line no-undef
        lang = H5P.jQuery('html')[0].getAttribute('xml:lang');
        preparePage();
    } else {
        //no H5P
        lang = getCookie('lang');
        if (lang == null || lang == 'null') {
            lang = 'de';
        }
        // mathQuillifyAll(); is included in preparePage()
        preparePage();
    }
    console.log('formulaAppletLanguage.set ' + lang);
    formulaAppletLanguage.set(lang);
    // This information is used by preparePage.js and translate.js/clickLanguage()
};

export function mainIsLoaded() {
    return true;
}

export function getCommitNumber(){
    return config.commit_number;
}