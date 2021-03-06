<?php $title = 'Sample Tasks';
$header = '<span class="tr de samples">Beispiele parsen</span><span class="tr en samples">Parse examples</span>';
$liblist = "'hammer decode translate prepare_page mathquill tex_parser tree_canvas mathquillcss gf09css vkbd vkbdcss'";
$prefix = "../";
include_once $prefix . 'header.php';
?>

<script>
var single_step = false;

function init(){
  try{
    console.log(document.getElementById('output_1').innerHTML);
    console.log('output_1 exists');
  } catch {
    console.log('no output_1');
  }
    // console.log('init... (empty)');
  tree_canv = document.getElementById('treecanvas');
   waitfor_hammer( function(){
    makeDraggable(tree_canv);
  });
  $(function () {
      $('#step').on('click', function () {
        single_step = true;
        console.log('single_step=' + single_step);
        parsetree_counter.setCounter(0);
        $( '#treecanvas' ).off('click');
        $( '#treecanvas' ).click( function(event){
          canvasclick_singlestep();
        });
      });
      $('#quick').on('click', function () {
        single_step = false;
        console.log('single_step=' + single_step);
        // one step
        $( '#treecanvas' ).off('click');
        $( '#treecanvas' ).click( function(event){
          canvasclick_quick();
        });
      });
   });
    // waitfor_mathquill_and_if_ready_then_do(function () {
    //     local_prepare_page();
    // });
 }

function editHandlerDebug(mf_latex_for_parser){
    console.log('editHandlerDebug ' + mf_latex_for_parser);
    myTree = new fa_tree();
    myTree.leaf.content = mf_latex_for_parser;
    document.getElementById('output_2').innerHTML = mf_latex_for_parser + '<br>';
    parsetree_counter.setCounter(0);
    paint_tree(myTree, tree_canv, 'start of parsing');
    // console.log('single_step=' + single_step);
    if(! single_step){
      canvasclick_quick();
    }
}


</script>

<!-- </head> -->

<!-- <body> -->
<h1><?php echo $header; ?></h1>
<p id="parsemode_select">
  <input type="radio" name="parsemode" class="problemeditor parsemode" id="quick" checked></input>
  <label for="quick">Quick</label>
  <br>
  <input type="radio" name="parsemode" class="problemeditor parsemode" id="step"></input>
  <label for="step">Step by step</label>
</P>
<p id='output_1'>output_1</p>
<p id='output_2'>output_2</p>
<hr>
<p class="formula_applet" id="no_res">\int^x_{3} t^2\ \mathrm{dt} = \frac{x^3}{3} - 9</p> Integral.<br />
<p class="formula_applet" id="no_bnd">\int_2^5\ {\sin} x\ \mathrm{d}x</p><br>
<p class="formula_applet" id="no_xay">sin^2 \alpha + cos^2\alpha = 1</p> No result field {{...}} necessary.<br />
<p class="formula_applet" id="inv862a" mode=physics>3,5 \unit{kWh} = {{result}} \unit{MJ}</p> (12,6MJ)<br />
<p class="formula_applet" id="definition_set" def="x > 0">\frac{\sqrt{x^3}}{\sqrt{x}} = {{result}}</p><span class='padding'><span class='tr en oneone'>One variable, one definition set.</span><span class='tr de oneone'>Eine Variable, eine Definitionsmenge.</span></span><br />
<!-- <p class="formula_applet" id="definition_set_more_than_numofvar" def="x > 0 && y < 5">\frac{\sqrt{x^3}}{\sqrt{x}} = {{result}}</p><span class='padding'><span class='tr en moredef'>Number of definition sets exceeds number of variables.</span><span class='tr de moredef'>Mehr Definitionsmengen als Variablen.</span></span><br /> -->
<!-- <p class="formula_applet" id="definition_set_less_than_numofvar" def="x > 0">\frac{\sqrt{x^3}}{\sqrt{x}} + y \cdot z = {{result}}</p><span class='padding'><span class='tr en morevars'>Number of variables exceeds number of definition sets.</span><span class='tr de morevars'>Mehr Variablen als Definitionsmengen.</span></span><br /> -->
<p class="formula_applet" id="light-house" data-b64='gOmkT'>s=\sqrt{ h^2 + {{result}} }</p><br />
<!-- <p class="formula_applet" id="binom_01">(2u + 7v)^2 = {{result}}</p><br /> -->
<p class="formula_applet" id="binom_02">(2u + 7v)^2 = 4u^2 + 28uv + {{result}}</p><br />
<p class="formula_applet" id="fraction">\frac{13t^2 - 5t}{t} = {{result}}</p><br />
<p class="formula_applet" id="multof_x" data-b64="N2gMy">17x+4x={{result}}</p><br />
<p class="formula_applet" id="CheckIfEqual">{{result}} = 0</p><br />
<!-- <p class="formula_applet" id="CheckIfTrue">{{result}}</p><br /> -->
<hr>

<canvas id="treecanvas" width="1200" height="600" style="
border: 1px solid #000000;
position: fixed;
right: 30px;
top: 30px;
transform: scale(1.05);
background-color: #ffffdf !important;">
</canvas>

<?php include_once ($prefix . 'version.php');?>
<?php include_once ($prefix . 'uses.php');?>
<?php include_once ($prefix . 'footer.php');?>