      var texinputparent = H5P.jQuery('div.field.field-name-TEX_expression.text input').parent();
      // disabled: read-only
      texinputparent.append('<br><br><textarea id="html_output" rows="10" cols="150" disabled>output</textarea>');
      texinputparent.append('<br><p id="data_b64_click"></p>');
  // https://stackoverflow.com/questions/27541004/detect-paragraph-element-change-with-jquery 'change' doesn't work
  // data transfer with invisible HTML element. OMG!
  H5P.jQuery('#data_b64_click').on('click', function (ev) {
    var b64 = ev.target.innerHTML;
    console.log('data_b64_click: ' + b64);
    setValue(obj, 'data_b64', b64);
  });
  // texinput is updated by editor.js: showEditorResults
  var texinput = H5P.jQuery('div.field.field-name-TEX_expression.text input')[0];
  texinput.addEventListener('input', updateTexinputEventHandler);

  function updateTexinputEventHandler(event) {
    setValue(obj, 'TEX_expression', event.target.value);
    // obj.parent.params['TEX_expression'] = event.target.value;
    var msg;
    if (event.isTrusted) {
      msg = ' event caused by keyboard input';
      event.preventDefault();
      ('TEX_changed', event.target.value);
    } else {
      msg = ' event caused by JavaScript';
      // no editorAction ->  avoid infinite loop
    }
    console.log('TEX_expression changed: ' + event.target.value + msg);
  }

  // console.log('make data_b64_click invisible');
  H5P.jQuery('#data_b64_click').css('display', 'none');

function refreshResultField(latex, fApp) {
  latex = latex.replaceAll(H5Pbridge.config.unit_replacement, '\\unit{');
  var parts = H5Pbridge.separateInputfield(latex);
  var tex = parts.before + '{{result}}' + parts.after;
  var enc = H5Pbridge.encode(parts.tag);
  console.log(tex + ' enc=' + enc + ' -> ' + H5Pbridge.decode(enc));

  // H5P editor: send tex and enc using dispatchEvent and trigger('click')
  if (H5Pbridge.isH5P()) {
    var texinput = H5P.jQuery('div.field.field-name-TEX_expression.text input')[0];
    if (typeof texinput !== 'undefined') {
      // value of TEX_expression field is set to EditorResult
      texinput.value = tex;
      // trigger InputEvent. EventListener see formulaapplet-editor.js
      texinput.dispatchEvent(new InputEvent('input', {
        bubbles: true
      }))
    }
    var $b64 = H5P.jQuery('#data_b64_click');
    if ($b64.length > 0) {
      console.log('data_b64_click: set value=' + enc + ' and trigger click event ');
      $b64.text(enc);
      $b64.trigger("click");
    }
  }
}
