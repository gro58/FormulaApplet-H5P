export var keys = {
    "mixed": [
        [
            ["a"],
            ["b"],
            ["c"],
            ["pi", "&pi;", "\\pi "],
            ["smallgap-0", "", ""],
            ["7"],
            ["8"],
            ["9"],
            ["times", "&times;", "\\cdot "],
            ["divided", "&divide;", "/"]
        ],
        [
            ["x"],
            ["y"],
            ["z"],
            ["e"],
            ["smallgap-1", "", ""],
            ["4"],
            ["5"],
            ["6"],
            ["plus", "+", "+"],
            ["minus", "-", "-"]
        ],
        [
            ["power_of_ten", "10<sup>⬚</sup>", "10^"],
            ["lg", "lg", "lg("],
            ["setunsetUnit", "dummy: set unit", "#setUnit"],
            ["nthRoot",
            // "<sup style=\"position: relative; top: -0.6em; right: -0.5em;\">⬚</sup><span style=\"white-space: nowrap; font-size:larger\">&radic;<span style=\"text-decoration:overline;\">&nbsp;&#x2b1a;&nbsp;</span></span>",
            "<sup>⬚</sup><span>&radic;<span>&nbsp;&#x2b1a;&nbsp;</span></span>",
            "#nthroot"
            ],
            ["smallgap-2", "", ""],
            ["1"],
            ["2"],
            ["3"],
            // ["up", "↑", "^"],
            ["up", "&uarr;", "^"],
            ["backspace", "⌫", "#Backspace"]
        ],
        [
            ["bracket-left", "(", "("],
            ["bracket-right", ")", ")"],
            ["square", "⬚<sup>2</sup>", "#square"],
            ["squareroot", "<span style=\"white-space: nowrap; font-size:larger\">&radic;<span style=\"text-decoration:overline;\">&nbsp;&#x2b1a;&nbsp;</span></span>", "\\sqrt "],
            ["smallgap-3", "", ""],
            ["0"],
            ["comma", ",", ","],
            ["left", "<span>◅</span>", "#Left"],
            ["right", "<span>▻</span>", "#Right"],
            ["enter", "<span>⏎</span>", "#Enter"]
        ]
    ],
    "function": [
        [
            ["sin", "<span>sin</span>"],
            ["cos", "<span>cos</span>"],
            ["tan", "<span>tan</span>"],
            ["smallgap-0", "", ""],
            ["integral", "∫", "#integral"],
            ["degree", "°", "°"],
            ["minute", "'", "'"],
            ["second", "''", "''"],
            ["pi", "&pi;", "\\pi "]
        ],
        [
            ["arcsin", "<span>sin<sup>-1</sup></span>"],
            ["arccos", "<span>cos<sup>-1</sup></span>"],
            ["arctan", "<span>tan<sup>-1</sup></span>"],
            ["smallgap-1", "", ""],
            ["limit", "lim", "\\lim_{x \\to \\infty} {}"],
            ["down", "&darr;", "#Down"],
            ["left", "<span>◅</span>", "#Left"],
            ["right", "<span>▻</span>", "#Right"],
            ["up", "&uarr;", "^"],
        ],
        [
            ["ln"],
            ["lg"],
            ["log_base", "log<sub>⬚</sub>", "log_"],
            ["smallgap-2", "", ""],
            ["abs_f", "<span>abs</span>"],
            ["subscript", "⬚<sub>⬚</sub>", "#Down"],
            ["bracket-left", "(", "("],
            ["bracket-right", ")", ")"],
            ["backspace", "⌫", "#Backspace"]
        ],
        [
            ["exp", "e<sup>⬚</sup>"],
            ["power_of_ten", "10<sup>⬚</sup>", "10^"],
            ["power", "⬚<sup>⬚</sup>", "^"],
            ["smallgap-3", "", ""],
            ["space", "&#826;", "\\ "],
            ["abs", "│⬚│", "| |"],
            ["infinity", "&infin;", "\\infinity "],
            ["squareroot", "<span style=\"white-space: nowrap; font-size:larger\">&radic;<span style=\"text-decoration:overline;\">&nbsp;&#x2b1a;&nbsp;</span></span>", "\\sqrt "],
            ["enter", "<span>⏎</span>", "#Enter"]
        ]
    ],
    "abc": [
        [
            ["1"],
            ["2"],
            ["3"],
            ["4"],
            ["5"],
            ["6"],
            ["7"],
            ["8"],
            ["9"],
            ["0"],
            ["szlig", "&szlig;", "ß"]
        ],
        [
            ["q"],
            ["w"],
            ["e"],
            ["r"],
            ["t"],
            ["z"],
            ["u"],
            ["i"],
            ["o"],
            ["p"],
            ["ue", "&uuml;", "ü"]
        ],
        [
            ["a"],
            ["s"],
            ["d"],
            ["f"],
            ["g"],
            ["h"],
            ["j"],
            ["k"],
            ["l"],
            ["oe", "&ouml;", "ö"],
            ["ae", "&auml;", "ä"],
            ["backspace", "⌫", "#Backspace"]
        ],
        [
            ["shift", "⇑"],
            ["y"],
            ["x"],
            ["c"],
            ["v"],
            ["b"],
            ["n"],
            ["m"],
            ["comma", ",", ","],
            ["up", "&uarr;", "^"],
            ["left", "<span>◅</span>", "#Left"],
            ["right", "<span>▻</span>", "#Right"],
            ["enter", "<span>⏎</span>", "#Enter"]
        ]
    ],
    "abc_caps": [
        [
            ["1"],
            ["2"],
            ["3"],
            ["4"],
            ["5"],
            ["6"],
            ["7"],
            ["8"],
            ["9"],
            ["0"],
            ["szlig", "&szlig;"]
        ],
        [
            ["Q"],
            ["W"],
            ["E"],
            ["R"],
            ["T"],
            ["Z"],
            ["U"],
            ["I"],
            ["O"],
            ["P"],
            ["UE", "&Uuml;", "Ü"]
        ],
        [
            ["A"],
            ["S"],
            ["D"],
            ["F"],
            ["G"],
            ["H"],
            ["J"],
            ["K"],
            ["L"],
            ["OE", "&Ouml;", "Ö"],
            ["AE", "&Auml;", "Ä"],
            ["backspace", "⌫", "#Backspace"]
        ],
        [
            ["shift", "⇑"],
            ["Y"],
            ["X"],
            ["C"],
            ["V"],
            ["B"],
            ["N"],
            ["M"],
            ["comma", ",", ","],
            ["up", "&uarr;", "^"],
            ["left", "<span>◅</span>", "#Left"],
            ["right", "<span>▻</span>", "#Right"],
            ["enter", "<span>⏎</span>", "#Enter"]
        ]
    ],
    "greek": [
        [
            ["1"],
            ["2"],
            ["3"],
            ["4"],
            ["5"],
            ["6"],
            ["7"],
            ["8"],
            ["9"],
            ["0"]
        ],
        [
            ["varphi", "&phi;"],
            ["zeta", "&zeta;"],
            ["epsilon", "&epsilon;"],
            ["rho", "&rho;"],
            ["tau", "&tau;"],
            ["ypsilon", "&upsilon;", "\\upsilon "],
            ["theta", "&theta;"],
            ["iota", "&iota;"],
            ["omikron", "&omicron;", "o "],
            ["pi", "&pi;"]
        ],
        [
            ["alpha", "&alpha;"],
            ["sigma", "&sigma;"],
            ["delta", "&delta;"],
            ["phi", "&varphi;"],
            ["gamma", "&gamma;"],
            ["eta", "&eta;"],
            ["xi", "&xi;"],
            ["kappa", "&kappa;"],
            ["lambda", "&lambda;"],
            ["backspace", "⌫", "#Backspace"]
        ],
        [
            ["shift", "⇑"],
            ["zeta", "&zeta;"],
            ["chi", "&chi;"],
            ["psi", "&psi;"],
            ["omega", "&omega;"],
            ["beta", "&beta;"],
            ["ny", "&nu;", "\\nu "],
            ["my", "&mu;", "µ "],
            ["left", "<span>◅</span>", "#Left"],
            ["right", "<span>▻</span>", "#Right"],
            ["enter", "<span>⏎</span>", "#Enter"]
        ]
    ],
    // greek capitals, also used in mobile mode
    "greek_caps": [
        [
            ["1"],
            ["2"],
            ["3"],
            ["4"],
            ["5"],
            ["6"],
            ["7"],
            ["8"],
            ["9"],
            ["0"]
        ],
        [
            ["Phi", "&Phi;"],
            ["Zeta", "&Zeta;"],
            ["Epsilon", "E", "E"],
            ["Rho", "R", "R"],
            ["Tau", "T", "T"],
            ["Upsilon", "&Upsilon;"],
            // ["Upsilon", "Y", "Y"],
            ["Theta", "&Theta;"],
            ["Iota", "I", "I"],
            // ["Omikron", "&Omicron;"],
            ["Omikron", "O", "O"],
            ["Pi", "&Pi;"]
        ],
        [
            ["Alpha", "A", "A"],
            ["Sigma", "&Sigma;"],
            ["Delta", "&Delta;"],
            ["Phi", "&Phi;"],
            ["Gamma", "&Gamma;"],
            ["Eta", "E", "E"],
            ["Xi", "&Xi;"],
            ["Kappa", "K", "K"],
            ["Lambda", "&Lambda;"],
            ["backspace", "⌫", "#Backspace"]
        ],
        [
            ["shift", "⇑"],
            ["Zeta", "Z", "Z"],
            ["Chi", "X", "X"],
            ["Psi", "&Psi;"],
            ["Omega", "&Omega;"],
            ["Beta", "B", "B"],
            ["Ny", "N", "N"],
            // ["My", "&Mu;"],
            ["My", "M", "M"],
            ["left", "<span>◅</span>", "#Left"],
            ["right", "<span>▻</span>", "#Right"],
            ["enter", "<span>⏎</span>", "#Enter"]
        ]
    ],
    "info": [
        [
            ['version', 'message dummy', ' '] //message updated(replaced) by virtualkeyboard.js
        ]
    ]
}