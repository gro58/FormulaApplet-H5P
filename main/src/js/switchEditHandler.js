"use strict";
// editHandlerActive is not global - bundler uses output.format = 'iife'
var editHandlerActive = true;

export function setEditHandlerActive(truefalse){
    editHandlerActive = truefalse;
}

export default function isEditHandlerActive(){
    return editHandlerActive;
}
