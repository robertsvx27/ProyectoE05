// A 10x10 grid implemented with Javascript Array 
var rows = 10;
var cols = 10;
var grid = [];

var validFigures = 0;
var levelGoal = 0;


// game object 
function jewel(r, c, obj, src)
{
    return {
        r: r,
        c: c,
        src: src,
        locked: false,
        isInCombo: false,
        o: obj
    }
}

// Jewels used in Solar System JSaga
var jewelsType = [];


jewelsType[0] = "images/globe.png";
jewelsType[1] = "images/mars02.png";

jewelsType[2] = "images/676c25c0.png";
jewelsType[3] = "images/pluto-planet-clipart3.gif";
jewelsType[4] = "images/jupiter-planet-clipart12.gif";
jewelsType[5] = "images/Moon.png";
jewelsType[6] = "images/Neptune-icon-150x150.png";

// this function returs a random jewel.
function pickRandomJewel()

{
    var pickInt = Math.floor((Math.random() * 7));
    //console.log("Picked " + pickInt);
    return jewelsType[pickInt];
}


function _initGame() {

    // prepare grid - Simply and fun!
    for (var r = 0; r < rows; r++)
    {
        grid[r] = [];
        for (var c = 0; c < cols; c++) {
            grid[r][c] = new jewel(r, c, null, pickRandomJewel());
        }
    }
    _applyRectangleConstraint(1, 1, 1, 1);


    // initial coordinates
    var width = $('body').width();
    var height = $(document).height();

    console.log("Game width: " + width);
    console.log("Game height: " + height);


    var cellWidth = width / (cols + 1);
    var cellHeight = height / (rows + 1);
    var marginWidth = cellWidth / cols;
    var marginHeight = cellHeight / rows;

    console.log("Jewels width: " + cellWidth);
    console.log("Jewels height: " + cellHeight);




// draw the grid. 
    for (var r = 0; r < rows; r++)
    {
        for (var c = 0; c < cols; c++) {
            //console.log("add to: "  + r*cellHeight + ", " + c*cellWidth);
            var cell = $("<img class='jewel' id='jewel_" + r + "_" + c + "' r='" + r + "' c='" + c + "' ondrop='_onDrop(event)' ondragover='_onDragOverEnabled(event)'  src='" + grid[r][c].src + "' style='padding-right:20px;width:" + (cellWidth - 20) + "px;height:" + cellHeight + "px;position:absolute;top:" + r * cellHeight + "px;left:" + (c * cellWidth + marginWidth) + "px'/>");
            console.log(cell.toString());
            cell.attr("ondragstart", "_ondragstart(event)");
            $("body").append(cell);
            grid[r][c].o = cell;
        }
    }
}

function _ondragstart(a)
{
    console.log("Moving jewel: " + a.target.id);
    a.dataTransfer.setData("text/plain", a.target.id);
}
function _onDragOverEnabled(e)
{
    e.preventDefault();
    console.log("drag over " + e.target);
}

// apply grid constraint
function _applyRectangleConstraint(u, d, l, r)
{


    console.log("Locking cells");

    for (var i = 0; i < u; i++) {
        for (c = 0; c < cols; c++) {
            grid[i][c].locked = true;
            grid[i][c].src = "images/ico_briques.png";
        }
    }
    for (var i = 0; i < d; i++) {
        for (c = 0; c < cols; c++) {
            grid[(rows - i) - 1][c].locked = true;

            grid[(rows - i) - 1][c].src = "images/ico_briques.png";

        }

    }



    for (var i = 0; i < l; i++) {
        for (rX = 0; rX < rows; rX++) {
            grid[rX][i].locked = true;

            grid[rX][i].src = "images/ico_briques.png";

        }
    }
    for (var i = 0; i < r; i++) {
        for (rX = 0; rX < rows; rX++) {
            grid[rX][(cols - i) - 1].locked = true;

            grid[rX][(cols - i) - 1].src = "images/ico_briques.png";

        }
    }




}


function _onDrop(e)
{

    // only for firefox!
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
        console.log("firefox compatibility");
        e.preventDefault();
    }

    console.log("ondrop" + e);

    var src = e.dataTransfer.getData("text");

    var sr = src.split("_")[1];
    var sc = src.split("_")[2];

    var dst = e.target.id;

    var dr = dst.split("_")[1];
    var dc = dst.split("_")[2];


    // check distance (max 1)
    var ddx = Math.abs(parseInt(sr) - parseInt(dr));
    var ddy = Math.abs(parseInt(sc) - parseInt(dc));

    if (ddx > 1 || ddy > 1)
    {
        console.log("invalid! distance > 1");
        return;
    }





    console.log("swap " + sr + "," + sc + " to " + dr + "," + dc);

    // execute swap

    var tmp = grid[sr][sc].src;
    grid[sr][sc].src = grid[dr][dc].src;
    grid[sr][sc].o.attr("src", grid[sr][sc].src);
    grid[dr][dc].src = tmp;
    grid[dr][dc].o.attr("src", grid[dr][dc].src);



    // search for combo
    _checkAndDestroy();

}

// check and destroy combination 
function _checkAndDestroy()
{



    /**
     HORIZONTAL COMBO  
     **/


    for (var r = 0; r < rows; r++)
    {


        var prevCell = null;
        var figureLen = 0;
        var figureStart = null;
        var figureStop = null;

        for (var c = 0; c < cols; c++)
        {

            // bypass locked and jewels that partecipate to combo. 
            //The next cell will become first cell of combo.   
            if (grid[r][c].locked || grid[r][c].isInCombo)
            {
                figureStart = null;
                figureStop = null;
                prevCell = null;
                figureLen = 1;
                continue;
            }

            // first cell of combo!
            if (prevCell == null)
            {
                //console.log("FirstCell: " + r + "," + c);
                prevCell = grid[r][c].src;
                figureStart = c;
                figureLen = 1;
                figureStop = null;
                continue;
            } else
            {
                //second or more cell of combo.
                var curCell = grid[r][c].src;
                // if current cell is not equals to prev cell then current cell become new first cell!
                if (!(prevCell == curCell))
                {
                    //console.log("New FirstCell: " + r + "," + c);
                    prevCell = grid[r][c].src;
                    figureStart = c;
                    figureStop = null;
                    figureLen = 1;
                    continue;
                } else
                {
                    // if current cell is equal to prevcell than combo lenght is increased
                    // Due to combo, current combo will be destroyed at the end of this procedure.
                    // Then, the next cell will become new first cell
                    figureLen += 1;
                    if (figureLen == 3)
                    {
                        validFigures += 1;
                        figureStop = c;
                        console.log("Combo from " + figureStart + " to " + figureStop + "!");
                        for (var ci = figureStart; ci <= figureStop; ci++)
                        {

                            grid[r][ci].isInCombo = true;
                            grid[r][ci].src = null;
                            //grid[r][ci].o.attr("src","");

                        }
                        prevCell = null;
                        figureStart = null;
                        figureStop = null;
                        figureLen = 1;
                        continue;
                    }
                }
            }

        }
    }


    /**
     VERTICAL COMBO!
     **/


    for (var c = 0; c < cols; c++)
    {


        var prevCell = null;
        var figureLen = 0;
        var figureStart = null;
        var figureStop = null;

        for (var r = 0; r < rows; r++)
        {

            // bypass locked and jewels that partecipate to combo. 
            //The next cell will become first cell of combo.   
            if (grid[r][c].locked || grid[r][c].isInCombo)
            {
                figureStart = null;
                figureStop = null;
                prevCell = null;
                figureLen = 1;
                continue;
            }

            // first cell of combo!
            if (prevCell == null)
            {
                //console.log("FirstCell: " + r + "," + c);
                prevCell = grid[r][c].src;
                figureStart = r;
                figureLen = 1;
                figureStop = null;
                continue;
            } else
            {
                //second or more cell of combo.
                var curCell = grid[r][c].src;
                // if current cell is not equals to prev cell then current cell become new first cell!
                if (!(prevCell == curCell))
                {
                    //console.log("New FirstCell: " + r + "," + c);
                    prevCell = grid[r][c].src;
                    figureStart = r;
                    figureStop = null;
                    figureLen = 1;
                    continue;
                } else
                {
                    // if current cell is equal to prevcell than combo lenght is increased
                    // Due to combo, current combo will be destroyed at the end of this procedure.
                    // Then, the next cell will become new first cell
                    figureLen += 1;
                    if (figureLen == 3)
                    {
                        validFigures += 1;
                        figureStop = r;
                        console.log("Combo from " + figureStart + " to " + figureStop + "!");
                        for (var ci = figureStart; ci <= figureStop; ci++)
                        {

                            grid[ci][c].isInCombo = true;
                            grid[ci][c].src = null;
                            //grid[ci][c].o.attr("src","");

                        }
                        prevCell = null;
                        figureStart = null;
                        figureStop = null;
                        figureLen = 1;
                        continue;
                    }
                }
            }

        }
    }


    // if there is combo then execute destroy

    var isCombo = false;
    for (var r = 0; r < rows; r++)
        for (var c = 0; c < cols; c++)
            if (grid[r][c].isInCombo)
            {
                console.log("There are a combo");
                isCombo = true;
            }

    if (isCombo)
        _executeDestroy();
    else
        console.log("NO COMBO");



}


// execute the destroy fo cell
function _executeDestroy()
{


    for (var r = 0; r < rows - 1; r++)
        for (var c = 0; c < cols - 1; c++)
            if (grid[r][c].isInCombo)  // this is an empty cell
            {

                grid[r][c].o.animate({
                    opacity: 0
                }, 500);

            }

    $(":animated").promise().done(function () {

        _executeDestroyMemory();


    });


}



function _executeDestroyMemory() {
    // move empty cells to top 
    for (var r = 0; r < rows - 1; r++)
    {
        for (var c = 0; c < cols - 1; c++)
        {

            if (grid[r][c].isInCombo)  // this is an empty cell
            {

                grid[r][c].o.attr("src", "")

                // disable cell from combo. 
                //(The cell at the end of this routine will be on the top)

                grid[r][c].isInCombo = false;

                for (var sr = r; sr >= 0; sr--)
                {
                    if (sr == 0)
                        break; // cannot shift. this is the first rows
                    if (grid[sr - 1][c].locked)
                        break; // cannot shift. my top is locked

                    // shift cell
                    var tmp = grid[sr][c].src;
                    grid[sr][c].src = grid[sr - 1][c].src;
                    grid[sr - 1][c].src = tmp;

                }

            }

        }

    }





    console.log("End of movement");

    //redrawing the grid
    // and setup respaw			 					

    //Reset all cell
    for (var r = 0; r < rows - 1; r++)
    {
        for (var c = 0; c < cols - 1; c++)
        {
            grid[r][c].o.attr("src", grid[r][c].src);
            grid[r][c].o.css("opacity", "1");
            grid[r][c].isInCombo = false;
            if (grid[r][c].src == null)
                grid[r][c].respawn = true;
            // if respawn is needed
            if (grid[r][c].respawn == true)
            {

                grid[r][c].o.off("ondragover");
                grid[r][c].o.off("ondrop");
                grid[r][c].o.off("ondragstart");


                grid[r][c].respawn = false; // respawned!
                console.log("Respawning " + r + "," + c);
                grid[r][c].src = pickRandomJewel();
                grid[r][c].locked = false;
                grid[r][c].o.attr("src", grid[r][c].src);
                grid[r][c].o.attr("ondragstart", "_ondragstart(event)");
                grid[r][c].o.attr("ondrop", "_onDrop(event)");
                grid[r][c].o.attr("ondragover", "_onDragOverEnabled(event)");
                //grid[r][c].o.css("opacity","0.3");
                //grid[r][c].o.css("background-color","red");
            }
        }
    }



    console.log("Combo resetted and rewpawned");

    // check for other combos
    _checkAndDestroy();

} 