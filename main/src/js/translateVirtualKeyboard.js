"use strict";
// TODO get rid of global object
let buttonText = {};
setButtonText("setUnit", "setUnit!");
setButtonText("eraseUnit", "eraseUnit!");
setButtonText("space", "space!");
setButtonText("testname", "testname!");
export function setButtonText(buttonName, text) {
    buttonText[buttonName] = text;
    // console.log(buttonText);
}
export function getButtonText(buttonName) {
    return buttonText[buttonName];
}