"use strict";

import $ from "jquery";
import Hammer from "@egjs/hammerjs";
import config from "./config.json";
import {
    keys
} from "./virtualKeyboard-keys";
import {
    keys_mixed_mobile
} from "./virtualKeyboard-keys-mobile";
import {
    setUnit,
    eraseUnit,
    setInput
} from "./inputfield_unit.js";
import {
    docLang,
    isMobile
} from "./dom.js";
import MQ from "./lib/mathquillWrapper.js";
import repo from "../../package.json";

var unitText = '<span>(Un)Set<br>Unit</span>';
var inputText = '<span style="font-size: 80%; color:green">Set input</span>';

if (docLang() == 'de') {
    // TODO use language/*.json H5P.t(...)
    unitText = '<span>Einheit<br>setzen<br>löschen</span>';
    inputText = '<span style="font-size: 80%; color:green">Eingabefeld setzen</span>';
}

// const squareroot = '<span style="white-space: nowrap; font-size:larger">&radic;<span style="text-decoration:overline;">&nbsp;&#x2b1a;&nbsp;</span></span>';
// const nthRoot = '<sup style="position: relative; top: -0.5em; right: -0.5em;">\u2b1a</sup>' + squareroot;
// const left = ['left', '<span style="font-size: 130%">\u25c5</span>', '#Left'];
// const right = ['right', '<span style="font-size: 130%">\u25bb</span>', '#Right'];
// const setunitkey = ['setunsetUnit', unitText, '#setUnit'];
// const enter = ['enter', '<span style="font-size: 150%; color:green">\u23ce</span>', '#Enter'];
// const setinput = ['setinput', inputText, '#setInput'];
// const backspace = ['backspace', '\u232B', '#Backspace'];
// const poweroften = ['power_of_ten', '10<sup style="font-size: 85%">\u2b1a</sup>', '10^'];
const version = config.version + ' (' + docLang() + ') isMobile=' + isMobile();
var message = '<p>&nbsp;</p>';
message += '<p>H5P.FormulaApplet Version ' + version + '</p>';
var temp = repo.repository.url.slice(4) + '#readme'; //slice(4): delete start "git+"
message += '<p><a href="' + temp + '">' + temp + '</a></p>';
message += '<p>by <a href="https://www.grossmann.info">gro58</a></p>';
message += '<p>&nbsp;</p>';

keys['info'][0] = [
    ['version', message, ' ']
];
if (isMobile()) {
    keys['mixed'] = keys_mixed_mobile;
    // [2][3][1] row 2, column 3, parameter 1
    // parameters: 0:name, 1:text, 2:command
    keys['mixed'][2][3][1] = unitText;
} else {
    // [2][2][1] row 2, column 2, parameter 1
    // parameters: 0:name, 1:text, 2:command
    keys['mixed'][2][2][1] = unitText;
};

function getVirtualKeyboard(isEditor) {
    let result = document.createElement("div");
    result.id = "virtualKeyboard";
    $(result).addClass(isEditor ? "h5pEditor" : "h5p");
    let header = document.createElement("div");
    header.id = "virtualKeyboard_header";
    header.innerText = "Move";
    result.append(header);
    let tabs = document.createElement("div");
    tabs.id = "virtualKeyboard_tab";
    tabs.classList.add("virtualKeyboard_tab");
    var tabButtons = {
        "mixed": "&radic;+-&nbsp;&nbsp;&nbsp;",
        "function": "&nbsp;f(x)&nbsp;",
        "abc": "abc",
        "greek": "\u03b1\u03b2\u03b3",
        "info": "&nbsp;\u2754",
        // reversed order caused by 'float: right'
        "off": "&nbsp;\u2716",
        // "info_old": 'Version ' + config.version + ' (' + docLang() + ')'
    };
    if (isMobile()) {
        delete tabButtons.abc;
    };
    if (isEditor) {
        delete tabButtons.off;
    }
    for (let tabId of Object.keys(tabButtons)) {
        let button = document.createElement("button");
        button.classList.add("tablinks");
        button.id = "button-table_" + tabId;
        button.onclick = evt => tabClick(evt, tabId);
        button.innerHTML = tabButtons[tabId];
        if (tabId == 'off') {
            button.title = 'version=' + version;
        }
        tabs.append(button);
    }
    result.append(tabs);

    for (let tabId of ["abc", "abc_caps", "mixed", "function", "greek", "greek_caps", "info"]) {
        result.append(createTable(tabId, isEditor));
    }

    return result;
}

function createTable(tableId, isEditor) {
    let result = document.createElement("table");
    result.id = "table_" + tableId;
    let tbody = document.createElement("tbody");
    result.append(tbody);
    for (let rowNumber = 0; rowNumber < keys[tableId].length; rowNumber++) {
        var keylist = keys[tableId][rowNumber];
        let tr = document.createElement("tr");
        tr.classList.add("virtualKeyboard-row" + rowNumber);
        tbody.append(tr);
        for (var keyindex = 0; keyindex < keylist.length; keyindex++) {
            var key = keylist[keyindex];
            if (isEditor && key[0] === 'enter') {
                // key = setinput;
                key = ['setinput', inputText, '#setInput'];
            }
            if (typeof key[1] == 'undefined') {
                key[1] = key[0];
            }
            if (typeof key[2] == 'undefined') {
                if (tableId == 'greek' || tableId == 'greek_caps') {
                    const ignore = '0_1_2_3_4_5_6_7_8_9_shift_';
                    if (ignore.indexOf(key[0] + '_') < 0) {
                        key[2] = '\\' + key[0] + ' ';
                    } else {
                        key[2] = key[0];
                    }
                } else {
                    key[2] = key[0];
                }
            }
            let td = document.createElement("td");
            td.classList.add("virtualKeyboardButton");
            td.classList.add("virtualKeyboard-" + key[0]);
            if (key[0].startsWith('smallgap')) {
                td.classList.add("smallgap");
            }
            td.setAttribute("cmd", key[2]);
            td.innerHTML = key[1];
            tr.append(td);
        }
    }
    return result;
}

export function virtualKeyboardBindEvents() {
    $(".virtualKeyboardButton").mousedown(function (ev) {
        ev.preventDefault();
        var cmd = clickEvent(ev);
        keyboardEvent0(cmd);
    });
    // also children and grandchildren and...
    $(".virtualKeyboardButton").find().mousedown(function (ev) {
        ev.preventDefault();
        var cmd = clickEvent(ev);
        keyboardEvent0(cmd);
    });
    // dragElement(document.getElementById("virtualKeyboard"));
    var virtualKeyboardElement = document.getElementById('virtualKeyboard');
    // https://hammerjs.github.io/getting-started/
    var mc = new Hammer(virtualKeyboardElement);

    var leftTemp = 1;
    var topTemp = 1;
    var leftStart = 1;
    var topStart = 1;
    mc.on("panstart panmove", function (ev) {
        if (ev.type == 'panstart') {
            leftStart = virtualKeyboardElement.offsetLeft;
            topStart = virtualKeyboardElement.offsetTop;
            leftTemp = leftStart;
            topTemp = topStart;
        }
        if (ev.type == 'panmove') {
            leftTemp = leftStart + ev.deltaX;
            topTemp = topStart + ev.deltaY;
            virtualKeyboardElement.style.left = leftTemp + 'px';
            virtualKeyboardElement.style.top = topTemp + 'px';
        }
    });
    var scaleTemp = 1;
    var scaleStart = 1;
    mc.get('pinch').set({
        enable: true
    });

    mc.on('pinch pinchstart', function (ev) {
        if (ev.type == 'pinchstart') {
            // start with scaleTemp of the last pinch
            scaleStart = scaleTemp;
        }
        if (ev.type == 'pinch') {
            scaleTemp = scaleStart * ev.scale;
            var scalecommand = "translate(-50%, -50%) scale(" + scaleTemp + ")";
            $("#virtualKeyboard").css("transform", scalecommand);
        }
    });

    function clickEvent(ev) {
        var cmd = $(ev.target).attr('cmd');
        if (typeof cmd === 'undefined') {
            var temp = $(ev.target).parents().filter('.virtualKeyboardButton');
            cmd = $(temp).attr('cmd');
        }
        // $('#output').text(cmd);
        return cmd;
    }
}

function keyboardEvent0(cmd) {
    if (cmd.toLowerCase() == 'shift') {
        switch (activeKeyboard) {
            case 'abc':
                activeKeyboard = 'abc_caps';
                break;
            case 'abc_caps':
                activeKeyboard = 'abc_capslock';
                break;
            case 'abc_capslock':
                activeKeyboard = 'abc';
                break;
            default:
                // activeKeyboard = 'abc';
        }
        switch (activeKeyboard) {
            case 'greek':
                activeKeyboard = 'greek_caps';
                break;
            case 'greek_caps':
                activeKeyboard = 'greek_capslock';
                break;
            case 'greek_capslock':
                activeKeyboard = 'greek';
                break;
            default:
                // activeKeyboard = 'abc';
                // no change of keyboard

        }
    } else {
        // console.log($(".formula_applet"));
        // $(".formula_applet").trigger('virtualKeyboardEvent', cmd);
        // replaced by processVirtualKeyboardCommand
        processVirtualKeyboardCommand(cmd);
        // switch back
        if (activeKeyboard == 'abc_caps') {
            activeKeyboard = 'abc';
        }
        if (activeKeyboard == 'greek_caps') {
            activeKeyboard = 'greek';
        }
    }
    keyboardActivate(activeKeyboard);
}

var activeKeyboard = 'dummy';

export function keyboardActivate(keyboardId) {
    $('.virtualKeyboard_tab button').removeClass("selected");
    switch (keyboardId) {
        case 'abc':
        case 'abc_caps':
        case 'abc_capslock':
            $('.virtualKeyboard_tab button#button-table_abc').addClass("selected");
            var buttontext = 'abc'
            if (keyboardId == 'abc_caps') {
                buttontext = 'ABC';
            }
            if (keyboardId == 'abc_capslock') {
                buttontext = '[ABC]';
            }
            $('.virtualKeyboard_tab button#button-table_abc').text(buttontext);
            break;
        case 'greek':
        case 'greek_caps':
        case 'greek_capslock':
            $('.virtualKeyboard_tab button#button-table_greek').addClass("selected");
            buttontext = '\u03b1\u03b2\u03b3'
            if (keyboardId == 'greek_caps') {
                buttontext = '\u0391\u0392\u0393';
            }
            if (keyboardId == 'greek_capslock') {
                buttontext = '[\u0391\u0392\u0393]';
            }
            $('.virtualKeyboard_tab button#button-table_greek').text(buttontext);
            break;
        case 'off':
            hideVirtualKeyboard();
            break;
        default:
            $('.virtualKeyboard_tab button#button-table_' + keyboardId).addClass("selected");
    }
    $('#virtualKeyboard table').css("display", "none");
    var temp = keyboardId;
    if (keyboardId == 'abc_capslock') {
        temp = 'abc_caps';
    }
    if (keyboardId == 'greek_capslock') {
        temp = 'greek_caps';
    }
    $('#virtualKeyboard table#table_' + temp).css("display", "table");
    activeKeyboard = keyboardId;
}

// tabs for the different keyboards
function tabClick(ev, keyboardId) {
    switch (keyboardId) {
        case 'abc':
            // toggle abc and abc_caps
            if (activeKeyboard == 'abc') {
                activeKeyboard = 'abc_caps';
            } else {
                activeKeyboard = 'abc';
            }
            break;
        case 'greek':
            // toggle greek and greek_caps
            if (activeKeyboard == 'greek') {
                activeKeyboard = 'greek_caps';
            } else {
                activeKeyboard = 'greek';
            }
            break;
        default:
            activeKeyboard = keyboardId;
    }
    $('#virtualKeyboard table').css("display", "none");
    $('#virtualKeyboard table#table_' + activeKeyboard).css("display", "table");
    keyboardActivate(activeKeyboard);
}

export function createkeyboardDiv(isEditor) {
    var kb = $('#keyboard')[0];
    // create div if necessary
    if (typeof kb === 'undefined') {
        kb = document.createElement('div');
        kb.id = 'keyboard';
        kb.append(getVirtualKeyboard(isEditor));
    }
    return kb;
}

export default function initVirtualKeyboardnoEditor() {
    var kb = createkeyboardDiv(false);
    document.body.appendChild(kb);
    virtualKeyboardBindEvents();
    keyboardActivate('mixed');
    hideVirtualKeyboard();
}

function hideVirtualKeyboard() {
    $('#virtualKeyboard').css('display', 'none');
    $('.formula_applet.selected').nextAll("button.keyb_button:first").addClass('selected');
}

export function showVirtualKeyboard() {
    $('#virtualKeyboard').css('display', 'table');
    $('#virtualKeyboard table').css('display', 'none');
    keyboardActivate('mixed');
    $('#virtualKeyboard table#table_' + activeKeyboard).css('display', 'table');
    $('.virtualKeyboard-space')[0].innerHTML = 'free';
}

// export function virtualKeyboardEventHandlerDebugging(_event, cmd, mf) {
//     console.log(cmd);
//     console.log(_event);
//     console.log(_event.currentTarget.id);
//     console.log(mf);
// }

function processVirtualKeyboardCommand(cmd) {

    if (cmd === '#Enter') {
        // TODO ENTER: deal with case cmd=enter
        console.log('vkbd: button "enter"');
    }

    // get selected mathField from DOM 
    // instead of get many from H5P.FormulaApplet (formulaapplet.js )
    console.log(cmd);
    var mqEditableField = $('.formula_applet.mq-math-mode.selected').find('.mq-editable-field')[0];
    if (typeof mqEditableField === 'undefined') {
        mqEditableField = $('#math-field')[0];
    }
    // console.log(mqEditableField);
    var mf = MQ.MathField(mqEditableField, {});

    if (typeof mf !== 'undefined') {
        var endsWithSpace = (cmd.substr(-1) === ' ');
        if (endsWithSpace) {
            // remove space from end of cmd
            cmd = cmd.substring(0, cmd.length - 1);
        }
        if (cmd.startsWith('#')) {
            // remove # from start of cmd
            cmd = cmd.substring(1);
            if (cmd === 'Enter') {
                console.log('vkbd: keystroke "Shift-Enter"');
                mf.keystroke('Shift-Enter');
            } else if (cmd === 'setInput') {
                console.log('setInput-Event');
                var temp = setInput(mf);
                // restore mf - not necessary any more
                // mf.latex(temp.old);
                mf.latex(temp.new);
            } else if (cmd === 'setUnit') {
                setUnit(mf);
            } else if (cmd === 'eraseUnit') {
                eraseUnit(mf);
            } else if (cmd === 'nthroot') {
                nthroot(mf);
            } else if (cmd === 'square') {
                mf.keystroke('Up');
                mf.typedtext('2');
            } else {
                mf.keystroke(cmd);
            }
        } else {
            // no #
            mf.typedText(cmd);
        }
        if (endsWithSpace) {
            mf.typedText(' ');
            mf.keystroke('Backspace');
        }
    }
}

function nthroot(mf) {
    mf.cmd('\\nthroot');
    mf.typedText(' ');
    mf.keystroke('Tab');
    mf.typedText(' ');
    mf.keystroke('Left');
    mf.keystroke('Left');
    mf.keystroke('Shift-Left');
}