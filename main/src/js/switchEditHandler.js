"use strict";
//TODO get rid of global var
var editHandlerActive = true;

export function setEditHandlerActive(truefalse){
    editHandlerActive = truefalse;
}

export default function isEditHandlerActive(){
    return editHandlerActive;
}
