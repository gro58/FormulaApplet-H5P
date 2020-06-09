let parsetree_counter = {
    counter: 0,

    getCounter() {
        return this.counter;
    },

    setCounter(value) {
        this.counter = value;
    },

    inc() {
        this.counter++;
    }
}

function parsetree_by_index(tree) {
    // counter++;
    parsetree_counter.inc();
    var end_parse = false;
    // console.log('switch to ' + counter)
    // console.log(tree);
    var message = '';
    switch (parsetree_counter.getCounter()) {
        case 1:
            message = 'delete spaces and remove backslash at \min';
            // console.clear();
            var temp = tree.leaf.content;
            temp = temp.replace(/\\min/g, 'min');
            // https://stackoverflow.com/questions/4025482/cant-escape-the-backslash-with-regex#4025505
            // http://www.javascripter.net/faq/backslashinregularexpressions.htm
            tree.leaf.content = temp.replace(/\\\s/g, '');
            break;
        case 2:
            message = 'parse brackets';
            result = parse_brackets(tree);
            break;
        case 3:
            message = 'parse plusminus';
            result = remove_operators(tree, 'plusminus');
            break;
        case 4:
            message = 'parse timesdivided';
            result = remove_operators(tree, 'timesdivided');
            break;
        case 5:
            message = 'unify subscript and exponent (part 1)';
            unify_sub_exponent(tree);
            break;
        case 6:
            message = 'parse integral';
            parse_integral(tree);
            break;
        case 7:
            message = 'parse square root / nth root';
            parse_nthroot(tree);
            parse_sqrt(tree);
            break;
        case 8:
            message = 'parse log_base';
            parse_log_lim(tree, 'log'); //log
            // check_children(tree);
            break;
        case 9:
            message = 'parse lim';
            parse_log_lim(tree, 'lim'); //lim
            // check_children(tree);
            break;
        case 10:
            message = 'parse functions';
            parse_function(tree);
            // check_children(tree);
            break;
        case 11:
            message = 'parse fractions';
            parse_frac(tree);
            break;
        case 12:
            message = 'parse textcolor (unit)';
            parse_textcolor(tree);
            break;
        case 13:
            message = 'delete single § nodes'
            var list_of_free = delete_single_nodes(tree);
            break;
        case 14:
            message = 'parse greek';
            parse_greek(tree);
            break;
        case 15:
            message = 'parse numbers';
            parse_numbers(tree);
            break;
        case 16:
            message = 'delete single § nodes'
            var list_of_free = delete_single_nodes(tree);
            break;
        case 17:
            message = 'unify subscript (part 2) '
            unify_sub_or_power(tree, false);
            break;
        case 18:
            message = 'parse subscript'
            parse_sub_power(tree, false);
            break;
        case 19:
            message = 'unify power (part 2) '
            unify_sub_or_power(tree, true);
            break;
        case 20:
            message = 'parse power'
            parse_sub_power(tree, true);
            break;
        case 21:
            message = 'delete single § nodes'
            var list_of_free = delete_single_nodes(tree);
            break;
        case 22:
            message = 'parse unit'
            parse_unit(tree);
            break;
        case 23:
            message = 'parse factors';
            parse_factors(tree);
            break;
        case 24:
            message = 'delete single § nodes';
            var list_of_free = delete_single_nodes(tree);
            break;
        default:
            message = 'end of parse';
            end_parse = true;
    }
    // check_children(tree);
    return [message, end_parse];
}

function parse(tree) {
    var end_parse = false;
    // parsetree_init();
    parsetree_counter.setCounter(0);
    while (!end_parse) {
        var temp = parsetree_by_index(tree);
        var message = temp[0];
        // console.log('parse: ' + message);
        end_parse = temp[1];
        //paint_tree(tree, canvas, message);
    }
}

function parse_brackets(tree) {
    tree.withEachLeaf(function (node) {
        var stop = false;
        do {
            var left_pos = node.addBracket(tree);
            if (left_pos == -1) {
                stop = true;
            }
        } while (stop === false)
    });
    return tree.nodelist;
}

function unify_sub_exponent(tree) {
    for (var needle of ['_', '^']) {
        tree.withEachLeaf(function (node) {
            var stop = false;
            var start = 0;
            do {
                // console.log('parsing ' + node.content + ' with ' + needle);
                var pos = node.content.indexOf(needle, start);
                if (pos < 0) {
                    stop = true;
                } else {
                    start = pos + 1;
                    var leftpart = node.content.substring(0, pos);
                    var left_count = (leftpart.match(/§/g) || []).length;
                    var rest = node.content.substr(pos + 2);
                    // var predecessor = node.content.substr(pos - 1, 1);
                    var exponent_or_subscript = node.content.substr(pos + 1, 1);
                    // console.log(leftpart + ' | ' + needle + exponent_or_subscript + ' | ' + rest + ' left_count=' + left_count);

                    // if (predecessor !== '§') {
                    //     new_node = create_node('leaf', predecessor, tree);
                    //     new_node.parent = node.id;
                    //     node.children.splice(left_count, 0, new_node.id);
                    //     // for (var i = 0; i < node.children.length; i++) {
                    //     //     console.log(i, node.children[i], tree.nodelist[node.children[i]].content);
                    //     // }
                    // }
                    // Now in any case predecessor equals '§'. 
                    // Number of § in leftpart+predecessor is one higher al old left_count
                    // left_count++;

                    if (exponent_or_subscript !== '§') {
                        new_node = create_node('leaf', exponent_or_subscript, tree);
                        new_node.parent = node.id;
                        node.children.splice(left_count, 0, new_node.id);
                        // for (var i = 0; i < node.children.length; i++) {
                        //     console.log(i, node.children[i], tree.nodelist[node.children[i]].content);
                        // }
                    }
                    node.content = leftpart + needle + '§' + rest;
                }
            } while (stop === false)
        });
    }
}

function parse_integral(tree) {
    // for (var i = 0; i < list_of_nodes.length; i++) {
    // does not fit because length of list changes
    tree.withEachLeaf(function (node) {
        content = node.content;
        var needle = '\\int_§^§';
        var pos = content.indexOf(needle);
        if (pos > -1) {
            // console.log('int found at ' + content + ' pos= ' + pos);
            var left = node.content.substring(0, pos);
            var right = node.content.substring(pos + needle.length);
            var left_count = (left.match(/§/g) || []).length;
            var right_count = (right.match(/§/g) || []).length;
            // if there is no § in left, then left_count = 0
            // console.log(' content=' + node.content + ' pos=' + pos);
            // console.log(' left=###' + left + '###' + ' right=###' + right + '###');
            var newcontent = left + '§';
            // node has one § less! 
            // console.log('newcontent=' + newcontent);
            node.content = newcontent;
            //check
            var lower_bound = tree.nodelist[node.children[left_count]];
            var upper_bound = tree.nodelist[node.children[left_count + 1]];
            var integral = create_node('integral', '', tree);
            var integrand = create_node('leaf', right, tree);
            // last two characters
            var differential = right.substring(right.length - 2);
            if (differential.startsWith('d')) {
                // repair if differential is too short
                if (differential.length == 1) {
                    differential += 'x';
                }
                integrand.content = right.substr(0, right.length - 2);
                var diff = create_node('differential', differential, tree);
                //integral has four children 
                integral.children = [lower_bound.id, upper_bound.id, integrand.id, diff.id];
                diff.parent = integral.id;
            } else {
                //integral has three children 
                integral.children = [lower_bound.id, upper_bound.id, integrand.id];
            }

            // link integral
            integral.parent = node.id;
            // now the other directions
            lower_bound.parent = integral.id;
            upper_bound.parent = integral.id;
            integrand.parent = integral.id;
            node.children[left_count] = integral.id;
            node.children.splice(left_count + 1, 1);
            // console.log('left_count=' + left_count);
            // console.log('right_count=' + right_count);
            for (var i = left_count + 1; i <= left_count + right_count; i++) {
                var id = node.children[i];
                // console.log('i=' + i + ' id=' + id);
                // console.log(tree.nodelist[id]);
                integrand.children.push(id);
                tree.nodelist[id].parent = integrand.id;
            }
            // console.log(node.children);
            node.children.splice(left_count + 1, right_count);
            // console.log(node.children);
        }
    });
}

function parse_nthroot(tree) {
    parse_radix(tree, true);
}

function parse_sqrt(tree) {
    parse_radix(tree, false);
}

function parse_radix(tree, nthroot) {
    var needle = '\\sqrt§';
    if (nthroot === true) {
        needle = '\\sqrt§§';
    }

    tree.withEachLeaf(function (node) {
        var stop = false;
        do {
            pos = node.content.indexOf(needle);
            if (pos > -1) {
                var left = node.content.substring(0, pos);
                var right = node.content.substring(pos + needle.length);
                var rad_index = (left.match(/§/g) || []).length;
                // if there is no § in left, then rad_index = 0
                // console.log(i + ' content=' + node.content + ' pos=' + pos);
                // console.log(' left=###' + left + '###' + ' right=###' + right + '###');
                if (nthroot === true) {
                    var newcontent = left + '§' + right;
                    // node has one § less! 
                    // console.log('new=' + newcontent);
                    node.content = newcontent;
                    //check
                    var test = tree.nodelist[node.children[rad_index]].type;
                    // console.log(test + ' should be bracket-[');
                    test = tree.nodelist[node.children[rad_index + 1]].type;
                    // console.log(test + ' should be bracket-{');
                    var radix = create_node('nthroot', '', tree);
                    // link radix
                    radix.parent = node.id;
                    //radix has two children 
                    radix.children = [node.children[rad_index], node.children[rad_index + 1]];
                    // now the other directions
                    tree.nodelist[node.children[rad_index]].parent = radix.id;
                    tree.nodelist[node.children[rad_index + 1]].parent = radix.id;
                    node.children[rad_index] = radix.id;
                    node.children.splice(rad_index + 1, 1);
                } else {
                    var newcontent = left + '§' + right;
                    // console.log('new=' + newcontent);
                    //check
                    var test = tree.nodelist[node.children[rad_index]].type;
                    // console.log(test + ' should be bracket-{');
                    node.content = newcontent;
                    var radix = create_node('sqrt', '', tree);
                    // link radix
                    radix.parent = node.id;
                    //radix has only one child
                    radix.children = [node.children[rad_index]];
                    // now the other directions
                    tree.nodelist[node.children[rad_index]].parent = radix.id;
                    node.children[rad_index] = radix.id;
                }
            } else {
                stop = true;
            }
        } while (stop === false)
    });
}

function parse_log_lim(tree, kind) {
    var needle = '\\' + kind + '_§';
    tree.withEachLeaf(function (node) {
        var stop = false;
        do {
            var pos = node.content.indexOf(needle);
            if (pos > -1) {
                // console.log(needle + ' found at ' + node.content + ' pos= ' + pos);
                var left = node.content.substring(0, pos);
                var right = node.content.substring(pos + needle.length);
                var left_count = (left.match(/§/g) || []).length;
                var right_count = (right.match(/§/g) || []).length;
                // if there is no § in left, then left_count = 0
                // console.log(' content=' + node.content + ' pos=' + pos);
                // console.log(' left=###' + left + '###' + ' right=###' + right + '###');
                var newcontent = left + '§'; //right is moved to arg
                // node has one § less! 
                // console.log('newcontent=' + newcontent);
                node.content = newcontent;
                //check
                var base = tree.nodelist[node.children[left_count]];
                var log = create_node('fu-' + kind, '', tree);
                var arg = create_node('leaf', right, tree);
                // link log
                log.parent = node.id;
                //log has two children 
                log.children = [base.id, arg.id];
                // now the other directions
                base.parent = log.id;
                arg.parent = log.id;
                node.children[left_count] = log.id;
                for (var i = left_count + 1; i < left_count + 1 + right_count; i++) {
                    arg.children.push(node.children[i]);
                    tree.nodelist[node.children[i]].parent = arg.id;
                }
                node.children.splice(left_count + 1, right_count);
            } else {
                stop = true;
            }
        } while (stop === false)
    });
}

function function_list() {
    var result = ['sinh', 'cosh', 'tanh', 'sin', 'cos', 'tan', 'ln', 'lg', 'log', 'exp'];
    return result;
}

function parse_function(tree) {
    // including function^exponent syntax, e.g. sin^2(x)

    tree.withEachLeaf(function (node) {
        var stop = false;
        var k = 0;
        do {
            var fu = function_list()[k];
            var type = 'fu-' + fu;
            fu = '\\' + fu;
            pos = node.content.indexOf(fu);
            if (pos > -1) {
                var pow = '';
                var leftpart = node.content.substring(0, pos);
                var left_count = (leftpart.match(/§/g) || []).length;
                var rest = node.content.substring(pos + fu.length);
                var right_count = (rest.match(/§/g) || []).length;
                var fu_node = create_node(type, '', tree);
                // link node <-> fu_node
                fu_node.parent = node.id;
                // console.log('left_count=' + left_count + ' id=' + node.id + ' children=' + node.children);
                var remember = node.children[left_count] || 0;
                // console.log('remember=' + remember);
                node.children[left_count] = fu_node.id;
                if (rest.startsWith('^§')) {
                    //fu-power
                    fu_node.content = 'power';
                    rest = rest.substring(2);
                    // console.log('found ' + fu + '^§ (power) at ' + node.id + ' rest=' + rest);
                    var arg = create_node('leaf', rest, tree);
                    fu_node.children[0] = remember;
                    tree.nodelist[remember].parent = fu_node.id;
                    fu_node.children[1] = arg.id;
                    arg.parent = fu_node.id;
                    // console.log('type=' + type + ' rest=' + rest);
                } else {
                    // no power:", "\\sin...
                    // console.log('found ' + fu + ' rest=' + rest);
                    if (rest == '§') {
                        // \\sin§
                        fu_node.children[0] = remember;
                        tree.nodelist[remember].parent = fu_node.id;
                    } else {
                        //", "\\sin2\alpha
                        var arg = create_node('leaf', rest, tree);
                        arg.parent = fu_node.id;
                        //fu_node.children[0] = remember;
                        fu_node.children[0] = arg.id;

                        // console.log('node=' + node.content + ' right_count=' + right_count + ' rest=' + rest);
                        for (var i = left_count + 1; i <= left_count + right_count; i++) {
                            var id = node.children[i];
                            console.log('i=' + i + ' id=' + id + ' ' + tree.nodelist[id]);
                            arg.children.push(id);
                            tree.nodelist[id].parent = arg.id;
                        }
                        // console.log('node.children=' + node.children);
                        node.children.splice(left_count, right_count);
                        // console.log('node.children=' + node.children);

                        //tree.nodelist[remember].parent = fu_node.id;
                        //arg.children[0] = remember;
                        //tree.nodelist[remember].parent = arg.id;
                    }
                }
                node.content = leftpart + '§';
            } else {
                // fu not found. Try next fu
                k++;
            }
            if (k >= function_list().length) {
                stop = true;
            }
        }
        while (stop === false);
    });

}

function parse_frac(tree) {
    needle = '\\frac§§';
    tree.withEachLeaf(function (node) {
        var stop = false;
        do {
            pos = node.content.indexOf(needle);
            if (pos > -1) {
                var left = node.content.substring(0, pos);
                var right = node.content.substring(pos + needle.length);
                var frac_index = (left.match(/§/g) || []).length; //= left_count
                // if there is no § in left, then frac_index = 0
                // console.log(i + ' content=' + node.content + ' pos=' + pos);
                // console.log(' left=###' + left + '###' + ' right=###' + right + '###');
                // node has one § less! 
                node.content = left + '§' + right;
                // console.log('new=' + node.content);
                //check
                var test = tree.nodelist[node.children[frac_index]].type;
                // console.log(test + ' should be bracket-{');
                test = tree.nodelist[node.children[frac_index + 1]].type;
                // console.log(test + ' should be bracket-{');

                var fraction = create_node('frac', '', tree);
                // link fraction
                fraction.parent = node.id;
                //radix has two children 
                fraction.children = [node.children[frac_index], node.children[frac_index + 1]];
                // now the other directions
                tree.nodelist[node.children[frac_index]].parent = fraction.id;
                tree.nodelist[node.children[frac_index + 1]].parent = fraction.id;
                node.children[frac_index] = fraction.id;
                node.children.splice(frac_index + 1, 1);
            } else {
                stop = true;
            }
        } while (stop === false)
    })
}

function parse_textcolor(tree) {
    needle = '\\textcolor§§';
    tree.withEachLeaf(function (node) {
        var stop = false;
        do {
            pos = node.content.indexOf(needle);
            if (pos > -1) {
                var left = node.content.substring(0, pos);
                var right = node.content.substring(pos + needle.length);
                var unit_index = (left.match(/§/g) || []).length; //= left_count
                // if there is no § in left, then unit_index = 0
                // console.log(i + ' content=' + node.content + ' pos=' + pos);
                // console.log(' left=###' + left + '###' + ' right=###' + right + '###');
                // node has one § less! 
                node.content = left + '§' + right;
                // console.log('new=' + node.content);
                var bracket = tree.nodelist[node.children[unit_index]];
                var test = tree.nodelist[node.children[unit_index + 1]].type;
                //check
                // console.log(bracket.type + ' and ' + test + ' should be bracket-{');
                // fetch the color
                var color = tree.nodelist[bracket.children[0]].content;
                var unit = create_node('unit', color, tree);
                // link unit
                unit.parent = node.id;
                //unit has one child 
                unit.children[0] = node.children[unit_index + 1];
                // now the other directions
                tree.nodelist[node.children[unit_index + 1]].parent = unit.id;
                node.children[unit_index] = unit.id;
                node.children.splice(unit_index + 1, 1); //one child less
            } else {
                stop = true;
            }
        } while (stop === false)
    })
}

function greek_list() {
    result = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta"];
    result = result.concat(["iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi"]);
    result = result.concat(["rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"]);
    result = result.concat(["varepsilon", "vartheta", "varkappa", "varpi", "varrho", "varsigma", "varphi"]);
    result = result.concat(["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"]);
    result = result.concat(["Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi"]);
    result = result.concat(["Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"]);
    result = result.concat(["to", "infty"]);
    return result;
}

function parse_greek(tree) {
    tree.withEachLeaf(function (node) {
        var stop = false;
        var k = 0;
        var pos = -1;
        do {
            var greek = '\\' + greek_list()[k];
            // console.log('search for ' + greek);
            pos = node.content.indexOf(greek);
            if (pos > -1) {
                var leftpart = node.content.substring(0, pos);
                var left_count = (leftpart.match(/§/g) || []).length;
                var rest = node.content.substring(pos + greek.length);
                // console.log('leftpart=' + leftpart + ' rest=' + rest + ' greek=' + greek);
                var greek_node = create_node('greek', greek_list()[k], tree);
                // link node <-> greek_node
                greek_node.parent = node.id;
                // console.log('left_count=' + left_count + 'id=' + node.id + ' children=' + node.children);
                // console.log(node.children.join());
                node.children.splice(left_count, 0, greek_node.id);
                // console.log(node.children.join());
                node.content = leftpart + '§' + rest;
                // maybe use same k again 
            } else {
                k++;
            }
            if (k > greek_list().length) {
                stop = true;
            }
        } while (stop === false);
    });
}

function parse_numbers(tree) {
    tree.withEachLeaf(function (node) {
        var content = node.content;
        // console.log('number leaf ' + content);
        // var regex = '\\d+((\\.|\\,)\\d+)?';
        var regex = '(\\d+(\\.|\\,))?\\d+';
        // backslash must be masked: \\
        var pos = content.search(regex);
        if (pos == 0) {
            var match = content.match(regex);
            var num = content.substr(0, match[0].length);
            var rest = content.substring(match[0].length);
            node.content = "§" + rest;
            var number = create_node("number", num, tree);
            number.parent = node.id;
            node.children.splice(0, 0, number.id)
        }
    })
}

function unify_sub_or_power(tree, power) {
    var needle = '_§';
    if (power) {
        needle = '^§';
    }
    tree.withEachLeaf(function (node) {
        var start = 0;
        var nextnode = false;
        do {
            // console.log('parsing ' + node.content + ' with ' + needle);
            var pos = node.content.indexOf(needle, start);
            if (pos < 0) {
                nextnode = true;
            } else {
                start = pos + 1;
                var leftpart = node.content.substring(0, pos - 1);
                var left_count = (leftpart.match(/§/g) || []).length;
                var base = node.content.substr(pos - 1, 1);
                var rest = node.content.substr(pos + 2);
                if (node.isInUnit(tree)) {
                    leftpart = '';
                    left_count = 0;
                    base = node.content.substr(0, pos);
                }
                // console.log(leftpart + ' | ' + base + needle + ' | ' + rest + ' left_count=' + left_count);
                if (base !== '§') {
                    new_node = create_node('leaf', base, tree);
                    new_node.parent = node.id;
                    node.children.splice(left_count, 0, new_node.id);
                }
                node.content = leftpart + '§' + needle + rest;
            }
        } while (nextnode == false)
    });
}

function parse_sub_power(tree, power) {
    var needle = '§_§';
    var type = 'sub';
    if (power) {
        needle = '§^§';
        type = 'power';
    }
    tree.withEachLeaf(function (node) {
        // if (!node.isInUnit(tree)) {
        var stop = false;
        var pos = -1;
        do {
            pos = node.content.indexOf(needle);
            if (pos > -1) {
                var leftpart = node.content.substring(0, pos);
                var middlepart = node.content.substr(pos, 3);
                var rest = node.content.substr(pos + 3);
                // console.log('#>' + leftpart + ' | ' + middlepart + ' | ' + rest);
                var left_count = (leftpart.match(/§/g) || []).length; //same for ^ and _
                var base = tree.nodelist[node.children[left_count]];
                var exponent_or_subscript = tree.nodelist[node.children[left_count + 1]];
                if (!power) {
                    if (exponent_or_subscript.type.startsWith('bracket')) {
                        var child = tree.nodelist[exponent_or_subscript.children[0]];
                        if (child.type == 'leaf') {
                            child.type = 'text'; //avoid later "timification"
                        }
                    }
                }
                if (middlepart !== needle) {
                    console.log('Error in parse_sub_power: ' + needle + ' not found');
                }
                var new_node = create_node(type, '', tree);
                new_node.parent = node.id;
                node.children.splice(left_count, 2, new_node.id);
                node.content = leftpart + '§' + rest;
                new_node.children.push(base.id);
                base.parent = new_node.id;
                new_node.children.push(exponent_or_subscript.id);
                exponent_or_subscript.parent = new_node.id;
            } else {
                stop = true;
            }
        } while (stop === false);
        // }
    });
}

function parse_unit(tree) {
    tree.withEachLeaf(function (node) {
        if (node.isInUnit(tree)) {
            var temp = decompose_unit(node.content);
            var out = temp[1] + '-' + temp[2] + ' value=' + temp[3];
            console.log(node.content + " -> " + out);
        }
    });
}

function parse_factors(tree) {
    tree.withEachLeaf(function (node) {
        if (!node.isInUnit(tree)) {
            var content = node.content.trim();
            // console.log('factor leaf ' + content);
            if (content == "") {
                content = "?";
            }
            if (content.length == 1) {
                // console.log('nothing to do');
            } else {
                // abc -> a*b*c
                var content_with_times = content[0];
                for (var k = 1; k < content.length; k++) {
                    content_with_times += '*' + content[k];
                }
                node.content = content_with_times;
                // console.log('time-ified:' + content_with_times);
            }
        } else {
            var content = node.content.trim();
            if (decompose_unit(content)[0] == false) {
                // try to separate rightmost (youngest) character
                var left = content.substr(0, content.length - 1);
                var right = content.substr(content.length - 1);
                console.log(left + ':' + right);
                if (decompose_unit(left)[0] == true) {  //left is Unit
                    if (decompose_unit(right)[0] == true) { // right isUnit
                        node.content = left + "*" + right;
                    }
                }
            }
        }
    });
    remove_operators(tree, 'invisible_times');
    //check_children(tree);
}

function decompose_unit(unitstring) {

    unitstring = unitstring.trim();
    var isUnit = false;
    // default 
    var prefix = '';
    var unit = 'dummy';
    var value = unit2value(unitstring);
    if (typeof value == 'undefined') {
        if (unitstring.length > 1) {
            // attempt to separate prefix and unit
            var prefix = unitstring.substr(0, 1);
            // preserve default value of var unit
            var rest = unitstring.substr(1);
            var power = prefix2power(prefix);
            if (typeof power == 'undefined') {
                isUnit = false;
            } else {
                temp = unit2value(rest);
                if (typeof temp == 'undefined') {
                    isUnit = false;
                } else {
                    // success of separation
                    value = power * temp;
                    unit = rest;
                    isUnit = true;
                }
            }
        }
    } else {
        // length= 1. value exists. No separation necessary.
        // e.g. m, s, A,...
        unit = unitstring;
        isUnit = true;
    }
    if (isUnit == false) {
        prefix = '';
        value = 1;
        unit = '<unknown unit>';
    }
    return [isUnit, prefix, unit, value];
}

function prefix2power(needle) {
    let prefixes = "y__z__a__f__p__n__µ__mcd__hk__M__G__T__P__E__Z__Y";
    // let Mu = String.fromCharCode(956);
    var pos = prefixes.indexOf(needle);
    if (pos > -1) {
        power = Math.pow(10, pos - 24);
    } else {
        power = undefined;
    }
    return power;
}

function unit2value(unitname) {
    var valueOf = {
        // dummy values, phantasy 
        // do not matter for purpose of comparison
        "g": 7.003725611783e-2,
        "m": 5.933875512401e-1,
        "A": 8.049921777482e1,
        "s": 9.066344172904e-3,
        "mol": 3.904471947388e-4,
        "Celsius": 7.2209518210337e-3,
        "Kelvin": 8.573310992341e2
    }
    valueOf["min"] = 60 * valueOf["s"];
    valueOf["h"] = 60 * valueOf["min"];
    valueOf["d"] = 24 * valueOf["h"];
    valueOf["C"] = valueOf["A"] * valueOf["s"];
    valueOf["e"] = 1.60217648740e-19 * valueOf["C"];
    valueOf["N"] = 1000 * valueOf["g"] * valueOf["m"] / (valueOf["s"] * valueOf["s"]);
    valueOf["J"] = valueOf["N"] * valueOf["m"];
    valueOf["W"] = valueOf["J"] * valueOf["s"];
    valueOf["V"] = valueOf["W"] * valueOf["A"];
    valueOf["Ohm"] = valueOf["V"] / valueOf["A"];
    valueOf["Pa"] = valueOf["N"] / (valueOf["m"] * valueOf["m"]);
    valueOf["bar"] = 100000 * valueOf["Pa"];
    valueOf["Liter"] = 0.001 * valueOf["m"] * valueOf["m"] * valueOf["m"];
    valueOf["Ar"] = 100 * valueOf["m"] * valueOf["m"];
    valueOf["°C"] = valueOf["Celsius"];
    valueOf["K"] = valueOf["Kelvin"];
    valueOf["dag"] = 10 * valueOf["g"];
    // console.log(valueOf);
    var result = valueOf[unitname];

    return result;
}

// *** output to TEX string ***//

function tree2TEX(tree) {
    var depth = 0;
    return recurse(tree.root);

    function recurse(node) {
        var number_of_childs = (node.children || []).length;
        // console.log('children=' + node.children);
        // console.log(depth + ' type ' + node.type + ' content ' + node.content + 'num_of_childs=' + number_of_childs);
        depth++;
        var res = [];
        for (var i = 0; i < number_of_childs; i++) {
            var child = tree.nodelist[node.children[i]];
            res[i] = recurse(child);
        }

        var done = false;
        if (number_of_childs === 0) {
            // leaf, num, text
            if (node.type.startsWith('greek')) {
                result = '\\' + node.content;
            } else {
                result = node.content;
            }
            done = true;
        }
        if (number_of_childs === 1) {
            if (node.type.startsWith('root')) {
                result = res[0];
                done = true;
            }
            if (node.type.startsWith('bracket')) {
                result = node.type.substring(8);
                var pos = ['(', '[', '{', '\\left(', '\\left[', '\\left\\{'].indexOf(result);
                if (pos === -1) {
                    var rightbra = 'no corresponding bracket found error';
                } else {
                    var rightbra = [')', ']', '}', '\\right)', '\\right]', '\\right\\}'][pos];
                }
                result += res[0];
                result += rightbra;
                done = true;
            }
            if (node.type.startsWith('sqrt')) {
                result = '\\sqrt';
                result += res[0];
                done = true;
            }
            if (node.type.startsWith('unit')) {
                result = '\\textcolor{';
                result += node.content;
                result += '}';
                result += res[0];
                done = true;
            }
            if (node.type.startsWith('fu-')) {
                result = '\\';
                result += node.type.substr(3);
                var child = tree.nodelist[node.children[0]];
                // \tanxy -> \tan xy
                var insert_space = true;
                if (child.type.startsWith('bracket')) {
                    insert_space = false
                };
                if (child.content.startsWith(' ')) {
                    insert_space = false
                };
                if (child.type.startsWith('greek')) {
                    insert_space = false
                };
                if (insert_space) {
                    result += ' ';
                }
                result += res[0];
                done = true;
            }
            if (!done) {
                result = res[0];
            }
        }
        if (number_of_childs >= 2) {
            if (node.type.startsWith('plusminus') || node.type.startsWith('timesdivided') || node.type.startsWith('*')) {
                result = res[0];
                result += node.content;
                result += res[1];
                if (node.type.startsWith('timesdivided')) {
                    // console.log('before ' + result);
                    var temp = result.replace(/\\cdot/g, '\\cdot ');
                    result = temp.replace(/\\cdot  /g, '\\cdot ');
                    // console.log('after  ' + result);
                }
                done = true;
            }
            if ((!done) && node.type.startsWith('frac')) {
                result = '\\frac';
                result += res[0];
                result += res[1];
                done = true;
            }
            if ((!done) && node.type.startsWith('sub')) {
                result = res[0];
                result += '_';
                result += res[1];
                done = true;
            }
            if ((!done) && node.type.startsWith('power')) {
                result = res[0];
                result += '^';
                result += res[1];
                done = true;
            }
            if ((!done) && node.type.startsWith('fu-') && node.content.startsWith('power')) {
                var fu = node.type.substr(3);
                result = '\\' + fu + '^';
                result += res[0];
                result += res[1];
                // console.log('fu-power: ' + result);
                done = true;
            }
            if ((!done) && node.type.startsWith('nthroot')) {
                result = '\\sqrt';
                result += res[0];
                result += res[1];
                done = true;
            }
            if ((!done) && node.type.startsWith('fu-log')) {
                result = '\\log_';
                result += res[0];
                result += res[1];
                done = true;
            }
            // if ((!done) && node.type.startsWith('fu-lim')) {
            if (node.type.startsWith('fu-lim')) {
                result = '\\lim_';
                result += res[0];
                result += res[1];
                // console.log('lim: ' + result);
                done = true;
            }
            if (node.type.startsWith('integral')) {
                result = '\\int_';
                result += res[0];
                result += '^';
                result += res[1];
                result += res[2];
                var r3 = res[3];
                if (typeof (r3) !== 'undefined') {
                    result += r3;
                }
                // console.log('integral=' + result);
                done = true;
            }
        }
        if (done === false) {
            // handle bracket childs (maybe 1 or 2 or even more)
            var pos = -1;
            var count = 0;
            var temp = node.content;
            // Do not change node.content. Use temp instead.
            do {
                pos = temp.indexOf('§');
                if (pos > -1) {
                    // console.log(node.id + ' ' + temp + ' ' + count + ' from ' + node.children);
                    var left = temp.substring(0, pos);
                    var right = temp.substring(pos + 1);
                    var middle = res[count];
                    // console.log(left + '::' + middle + '::' + right);
                    temp = left;
                    temp += middle;
                    temp += right;
                    count++;
                }
            } while (pos > -1)
            result = temp;
        }
        // console.log('result ' + result);
        depth--;
        // console.log(node.id + '-----------------------'.slice(0, 2 * depth) + result);
        // console.log('(' + depth + ') ' + result);
        return result;
    }
}

// output to canvas

function paint_tree(tree, canvas, message) {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffdf";
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.stroke;
    ctx.font = '12pt Consolas';
    paint_tree_recurse(tree.root, tree.nodelist, -9999, -9999, 0, 0, ctx, 1, tree);
    ctx.fillText(message, 20, 30);
};

function paint_tree_callback(currentNode, xa, ya, x, y, ctx, tree) {
    // console.log(currentNode.id + '::' + currentNode.children);
    // console.log(xa + ' ' + ya + ' ' + x + ' ' + y);
    if (xa > -9999) {
        //        var xf = 600;
        var xf = ctx.canvas.width / 2 - 100;
        var yf = 40;
        var xt = ctx.canvas.width / 2;
        var yt = 30;
        xxa = xa * xf + xt;
        yya = ya * yf + yt;
        xx = x * xf + xt;
        yy = y * yf + yt - 5;
        //console.log(xxa + ' ' + yya + ' ' + xx + ' ' + yy);
        ctx.beginPath();
        ctx.moveTo(xxa, yya);
        ctx.lineTo(xx, yy);
        ctx.stroke();
        ctx.fillStyle = "#5050ff";
        var curr = currentNode.type;
        if (curr.startsWith('bracket-')) {
            curr = curr.substring(8);
        }
        if (curr.startsWith('fu-')) {
            curr = curr.substring(3);
        }
        // if (curr == 'leaf') {
        //     curr = '';
        // }
        if (curr == 'plusminus') {
            curr = '+/-';
        }
        if (curr == 'number') {
            curr = 'num';
        }
        if (currentNode.isInUnit(tree)) {
            // curr += '(U)';
            ctx.fillStyle = "#e050e0";
        }
        ctx.fillText(curr, xx + 2, yy);
        ctx.fillStyle = "#ff5050";
        ctx.fillText(currentNode.content, xx + 2, yy + 15);
    }
};

function paint_tree_recurse(currentNode, nodelist, xa, ya, x, y, ctx, factor, tree) {
    paint_tree_callback(currentNode, xa, ya, x, y, ctx, tree);
    var xa = x;
    var ya = y;
    // factor = factor * 0.75;
    factor = factor * 0.7;
    var cnchl = currentNode.children.length;
    for (var i = 0, length = cnchl; i < length; i++) {
        paint_tree_recurse(nodelist[currentNode.children[i]], nodelist, xa, ya, xa + factor * (i - 0.5 * (cnchl - 1)), y + 1, ctx, factor, tree);
    }
};

function check_children(tree) {
    console.clear();
    tree.withEachNode(function (node) {
        console.log('node #' + node.id + ' ' + node.type + ' ' + node.content + ' parent=' + node.parent);
        if (node.type == 'free') {
            console.log('deleted');
        } else {
            for (var i = 0; i < node.children.length; i++) {
                var childindex = node.children[i];
                var child = tree.nodelist[childindex];
                console.log('    ' + childindex + ' ' + child.type + ' ' + child.content);
                var parent = child.parent;
                if (parent == node.id) {
                    // console.log('parent ok');
                } else {
                    console.log('parent link ERROR - parent=' + parent);
                }
            }
        }
    })
}