<?php 
  $title='Development';
  $liblist = "['translate', 'gf09css']";
?>
<?php include_once( 'header.php' ); ?>
<link href="css/table.css" rel="stylesheet">
<!-- <script>
 document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    initTranslation();
  }
}         
</script> -->
<script>
function init(){
  initTranslation();
}
</script>

<body>
    <h1><?php echo $title; ?></h1>
    <p><a href='tex_parser.php'>TEX Parser</a></p>
    <p><a href='editable_in_static_MQ.php'>editable_in_static_MQ.php</a></p>
    <p><a href='mathquill2tex2parser.php'>MathQuill <-> TEX -> Parser</a></p>
    <p><a href='mathquill2tex2tree.php'>MathQuill <-> TEX -> Tree</a> and tree2TEX check</p>
    <p><a href='mathquill2tex2parser_no_feedback.php'>MathQuill -> TEX (without feedback) -> Parser </a></p>
    <hr>
    <p><a href='../tests/tests.php'>Tests</a> </p>
    <p><a href='../other/other.php'>Other solutions</a> KAS, Algebrite, MathQuill</p>
    </hr>
</body>

</html>