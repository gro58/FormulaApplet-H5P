// script definitions see package.json

/* eslint-disable no-undef */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
// import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';
import {
	terser
} from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';

const production = process.env.PRODUCTION === "true";
console.log("PRODUCTION", production, "(env: " + process.env.PRODUCTION + ")");

const serveWanted = process.env.SERVE === "true";

const h5pCopy = process.env.H5PCOPY === "true";
const h5pBase = "../h5p/development/H5P.FormulaApplet-0.14/";
const h5pScriptsFolder = h5pBase + "scripts/";
const h5pStylesFolder = h5pBase + "styles/";
const h5pEditorBase = "../h5p/development/H5PEditor.FormulaAppletEditor-0.14/"
const h5pEditorScriptsFolder = h5pEditorBase + "scripts/";
const h5pEditorStylesFolder = h5pEditorBase + "styles/";

function getH5Ppath(plugin, extension) {
	if (plugin === "h5p") {
		if (extension === "js") return h5pScriptsFolder;
		else return h5pStylesFolder;
	} else if (plugin === "h5pEditor") {
		if (extension === "js") return h5pEditorScriptsFolder;
		else return h5pEditorStylesFolder;
	}
	throw Error("Unmatched");
}

function getCopyTargets(filename) {
	let targets = [];
	for (let plugin of ["h5p", "h5pEditor"]) {
		let extension;
		if (filename.endsWith(".js")) extension = "js";
		else if (filename.endsWith(".css")) extension = "css";
		else throw Error("Invalid extension");
		targets.push({
			src: `./public/${ filename }`,
			dest: getH5Ppath(plugin, extension)
		});
		if (!production && extension === "js") {
			targets.push({
				src: `./public/${ filename.replace('.js', '.js.map') }`,
				dest: getH5Ppath(plugin, extension)
			});
		}
	}
	console.log(targets);
	return targets;
}

function resolveAfter2Seconds(x) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(x);
		}, 2000);
	});
}

async function myTest() {
	console.log('before await');
	var y = await resolveAfter2Seconds('after 2 seconds');
	console.log(y);
}

myTest();
console.log('after start of myTest');

export default [{
	input: 'src/main.js',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'H5Pbridge',
		file: 'public/build/bundle.js'
	},
	plugins: [
		replace({
			'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
			'__h5p__': (!!h5pCopy).toString(),
			preventAssignment: true
		}),
		json(),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/'),
			mainFields: ['main', 'module']
		}),
		// myTest(),
		builtins(),
		commonjs({
			preferBuiltins: false
		}),
		production && babel({
			babelHelpers: 'bundled'
		}),

		serveWanted && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when serving

		// enable/disable livereload here AND AT IMPORTS by uncommenting/commenting
		// !production && livereload("public", {
		// 	port: 5001
		// }),

		// If we're building for production, minify
		production && terser(),

		h5pCopy && copy({
			targets: getCopyTargets("build/bundle.js")
				.concat(getCopyTargets("css/gf09.css"))
				.concat(getCopyTargets("css/table.css"))
				.concat(getCopyTargets("css/virtualKeyboard.css"))
				.concat(getCopyTargets("MathQuill/mathquill.css")),
			hook: "writeBundle"
		})
	]
}];

function serve() {
	console.log("(run public) -> serving...");
	let started = false;

	return {
		//writeBundle calls script 'npm run public', see package.json
		writeBundle() {
			if (!started) {
				started = true;
				require('child_process').spawn('npm', ['run', 'public', '--', '--dev'], {
					env: process.env,
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}