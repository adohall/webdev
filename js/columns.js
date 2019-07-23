// ### COLUMNS ###
// for older browsers, e.g. IE9-, Firefox 34-, Safari 7.0-, which don't support column formation via CSS;
// if browser doesn't understand CSS 'columnCount' property (determined in utilities.js), enable column formation via js instead:

// distribute child nodes of designated element evenly, into the designated number of columns
function doColumns(element,colNum) {
	"use strict";
	// clear float after element
	element.className += ' c-aft';
	// find child nodes of designated element
	var nodes = [];
	for (var k=element.children.length; k--;){
		// Skip comment nodes on IE8
		if (element.children[k].nodeType !== 8) {
			nodes.unshift(element.children[k]);
		}
	}
	// divide the number of child nodes by 'colNum', then round this up
	var nodesPerCol = Math.ceil(nodes.length/colNum);
	// determine the appropriate width for the columns (50%, 33% etc)
	var colWidth = Math.floor(100/colNum) - 1/100 + '%';
	// loop through 'colNum' (the number of columns), -
	var nodeCount = 0;
	for (var i=0; i<colNum; i++) {
		// create a column, give it the width determined above, and float it left
		var newCol = document.createElement('div');
		newCol.style.width = colWidth;
		newCol.className = 'f-l';
		// insert the column within the designated element,
		element.appendChild(newCol);
		// then append the appropriate number ('nodesPerCol') of child nodes to the column;
		// note 1: after each loop through a column's nodes, we need to start at NEXT item in 'nodes' array, not first
		// note 2: total number of nodes may not be exactly divisible by the number of columns,
		// hence the need to test for the existence of nodes[nodeCount+j] (in last column);
		for (var j=0; j<nodesPerCol; j++) {
			if (nodes[nodeCount+j]) {
				newCol.appendChild(nodes[nodeCount+j]);
			}
		}
		nodeCount += nodesPerCol;
	}
}


// find each element with class="col-x", extract the number from the class,
// then create that number of columns inside the element
var elements = document.querySelectorAll('[class*="col-"]');
for (var i = 0; i < elements.length; i++) {
	var el = elements[i];
	var num = parseInt(el.className.split('col-')[1]);
	doColumns(el,num);
}