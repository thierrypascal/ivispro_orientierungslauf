//global function to allow to reorder selection
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

//imports
import './algTeilnehmerzahl.js';
// import './demografischeTeilnehmerzahl.js';
// import './teilnahmenProPersonLinie.js';