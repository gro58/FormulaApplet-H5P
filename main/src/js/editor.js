"use strict";

import $ from "jquery";
import config from "./config.json";

import {
    domLoad,
    isH5P
} from "./dom.js";

import decode, {
    encode
} from "./decode.js";

import MQ from "./lib/mathquillWrapper.js";

import {
    setInput,
    separateInputfield,
} from "./inputfield_unit.js";

var mathQuillEditHandlerActive = true;
var editor_fApp;
//TODO get rid of global vars

function mathQuillifyEditor(fApp) {
    // make whole mathFieldSpan editable
    var mathFieldSpan = document.getElementById('math-field');
    if (!mathFieldSpan) throw new Error("Cannot find math-field. The math editor must provide one.");
    var editorMf = MQ.MathField(mathFieldSpan, {
        spaceBehavesLikeTab: true, // configurable
        handlers: {
            edit: function (mathField) { // useful event handlers
                try {
                    if (mathQuillEditHandlerActive) {
                        var latex = mathField.latex();
                        // console.log('** mathQuillEditHandler latex=' + latex);
                        refreshResultField(latex, fApp);
                    }
                } catch (error) {
                    console.error('ERROR in MQ.MathField: ' + error);
                }
            }
        }
    });
    return editorMf;
}

export function sensorTimer(interval, max_count, sensor) {
    return new Promise(function (resolve, reject) {
        function timer(counter) {
            console.log('counter=' + counter + ' sensor=' + sensor());
            if (counter > max_count) {
                reject('max count exceeded');
            } else {
                if (sensor()) {
                    resolve('success');
                } else {
                    setTimeout(() => {
                        timer(counter + 1);
                    }, interval);
                }
            }
        }
        // start sensorTimer
        timer(0);
    });
}

async function waitForEditorFAppThenDo(cont) {
    console.log(editor_fApp);
    await sensorTimer(500, 20, function () {
        var sensor = (typeof editor_fApp !== 'undefined');
        console.log('EditorFApp Sensor=' + sensor);
        return sensor
    });
    // await sensorTimer(500, 20, function(){return (false)});
    cont;
}

var newLatex = 'new'; //TODO get rid of global vars

export async function editorAction() { //replaces messageHandler
    var actionType = arguments[0];
    var data = arguments[1] || "dummy";
    console.log('actionType=' + actionType + ' data=' + data);
    waitForEditorFAppThenDo(
        editorActionDefined(actionType, data)
    );
}

async function editorActionDefined(actionType, data) {
    console.log('editorAction: ' + actionType + ' data=' + data);
    if (typeof editor_fApp !== 'undefined') {
        // H5P
        console.log('editor_fApp.id=' + editor_fApp.id);
        var editorMf = editor_fApp.mathField;
        if (actionType == 'idChanged') {
            var newId = data;
            console.info('idChanged data=' + newId);
            editor_fApp.id = newId;
            refreshResultField(editorMf.latex(), editor_fApp);
        }
        if (actionType == 'setInputFieldMouseover') {
            console.info('setInputFieldMouseover');
            var latex = setInput(editorMf);
            console.log(latex);
            editorMf.latex(latex.old);
            //TODO get rid of global vars
            newLatex = latex.new; //prepare for setInputField
        }

        // setInputFieldMouseover precedes setInputField
        // global var newLatex is renewed by function setInput() 
        if (actionType == 'setInputField') {
            console.info('setInputField');
            editorMf.latex(newLatex);
        }

        if (actionType == 'refresh') {
            console.info('refresh');
            try {
                refreshResultField(editor_fApp.mathField.latex(), editor_fApp);
            } catch (error) {
                console.error('ERROR: ' + error);
            }
        }

        if (actionType == 'setMode') {
            var auto_or_manu = data;
            console.info('setMode ' + auto_or_manu);
            if (auto_or_manu == 'auto') {
                editor_fApp.hasSolution = false;
                refreshResultField(editorMf.latex(), editor_fApp)
            }
            if (auto_or_manu == 'manu') {
                editor_fApp.hasSolution = true;
                refreshResultField(editorMf.latex(), editor_fApp)
            }
        }
        if (actionType === 'setPhysics') {
            console.info('setPhysics ' + data);
            if (data === 'true') {
                editor_fApp.unitAuto = true;
                refreshResultField(editorMf.latex(), editor_fApp);
            }
            if (data === 'false') {
                editor_fApp.unitAuto = false;
                refreshResultField(editorMf.latex(), editor_fApp);
            }
        }
        if (actionType === 'TEX_changed') {
            console.info('*** TEX_changed ' + data);
            var temp = data.replace(/{{result}}/g, '\\class{inputfield}{' + editor_fApp.solution + '}');
            //avoid XSS
            temp = temp.replace(/</g, '');
            temp = temp.replace(/>/g, '');
            temp = temp.replace(/"/g, '');
            temp = temp.replace(/'/g, '');
            temp = temp.replace(/&/g, '');
            temp = temp.replace(/ /g, '_');
            console.log('editorMf.latex(temp) ' + temp);
            editorMf.latex(temp);
        }
    }

}

export async function prepareEditorApplet(fApp) {
    // *** editor ***
    await domLoad;
    // await initEditor();
    console.log('prepareEditorApplet: define editor_fApp');
    var editorMf = mathQuillifyEditor(fApp);
    console.log(editorMf);
    // editorMf provides commands like editorMf.latex('\\sqrt{2}') and var latextext = editorMf.latex();
    fApp.mathField = editorMf;
    console.log('editorMf.latex=' + editorMf.latex());
    refreshResultField(editorMf.latex(), fApp);
    $.event.trigger("refreshLatexEvent"); //adjust \cdot versus \times


    editor_fApp = fApp;
    console.log('editor_fApp');
    console.log(editor_fApp);

    if (config.debug === 'true') {
        // if debug, show three fields
        $('.field-name-data_b64').css('display', '');
        $('.field-name-id').css('display', '');
        $('.field-name-sel_lang').css('display', '');
    } else {
        $('.field-name-data_b64').css('display', 'none');
        $('.field-name-id').css('display', 'none');
        $('.field-name-sel_lang').css('display', 'none');
    }
    if (config.htmloutput === 'true') {
        $('#html_output').css('display', '');
    } else {
        $('#html_output').css('display', 'none');
    }


} // end of prepareEditorApplet

function refreshResultField(latex, fApp) {
    latex = latex.replaceAll(config.unit_replacement, '\\unit{');
    var parts = separateInputfield(latex);
    var tex = parts.before + '{{result}}' + parts.after;
    var enc = encode(parts.tag);
    console.log(tex + ' enc=' + enc + ' -> ' + decode(enc));
    // latexHandler(tex, enc);
    // $(document).trigger('texevent');

    // H5P editor: send tex and enc using dispatchEvent and trigger('click')
    if (isH5P()) {
        var texinput = $('div.field.field-name-TEX_expression.text input')[0];
        if (typeof texinput !== 'undefined') {
            // value of TEX_expression field is set to EditorResult
            texinput.value = tex;
            // trigger InputEvent. EventListener see formulaapplet-editor.js
            texinput.dispatchEvent(new InputEvent('input', {
                bubbles: true
            }))
        }
        var $b64 = $('#data_b64_click');
        if ($b64.length > 0) {
            console.log('data_b64_click: set value=' + enc + ' and trigger click event ');
            $b64.text(enc);
            $b64.trigger("click");
        }
    }
    // getHTML
    var html = '<p class="formula_applet" id="' + fApp.id;
    if (fApp.hasSolution) {
        html += '" data-b64="' + enc;
    }
    if (fApp.unitAuto) {
        html += '" mode="physics';
    }
    html += '">' + tex + '</p>';
    console.log(html);
    var out = $('textarea#html_output');
    if (typeof out !== 'undefined') {
        out.text(html);
    }
}