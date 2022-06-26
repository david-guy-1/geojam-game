var imgStrings = {};

export function drawLine(context, x0, y0, x1, y1, color = "black", width = 1) {
    //	////console.log(x0, y0, x1, y1)
    context.strokeStyle = (color == undefined ? "black" : color);
    context.lineWidth = (width == undefined ? 1 : width);
    context.beginPath();
    context.stroke();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
}

//draws a circle with the given coordinates (as center) and color
export function drawCircle(context, x, y, r, color = "black", width = 1, fill=false, transparency=1) {
    //////console.log(x,y,r)
    
    context.lineWidth = (width == undefined ? 1 : width);
    context.beginPath();
    context.arc(x, y, r, 0 * Math.PI, 2 * Math.PI);
    if(fill){
	
		context.globalAlpha = transparency;	
		context.fillStyle = (color == undefined ? "black" : color);
		context.fill();
		context.globalAlpha = 1;
	} else {
		context.strokeStyle = (color == undefined ? "black" : color);
		context.stroke();
	}
}


//draws a rectangle with the given coordinates and color
export function drawRectangle(context, tlx, tly, brx, bry, color = "black", width = 1, fill = false,  transparency=1) {
	if(fill){
		context.globalAlpha = transparency;
		context.fillStyle = (color == undefined ? "black" : color);
    	context.fillRect(tlx, tly, brx - tlx, bry - tly);
		context.globalAlpha = 1;
	}
    else{
		context.lineWidth = (width == undefined ? 1 : width);
		context.strokeStyle = (color == undefined ? "black" : color);
		context.beginPath();
		context.rect(tlx, tly, brx - tlx, bry - tly);
		context.stroke();
	}
}
// uses width and height instead of bottom right coordinates
export function drawRectangle2(context, tlx, tly, width, height, color = "black", widthA = 1, fill = false,  transparency=1){
	drawRectangle(context, tlx, tly, tlx+width, tly+height, color, widthA, fill,  transparency)
	
}

export function drawText(context, text_, x, y, width =undefined, color = "black", size = 20) {
    context.font = size + "px Arial";
	context.fillStyle = color
	if(width == undefined){
		context.fillText(text_, x,y);
	} else{
		context.fillText(text_, x,y,width);
	}
}

// see drawRectangle
export function drawEllipse(context, posx, posy, brx, bry ,color="black", transparency=1){
	drawEllipse2(context, posx, posy, brx-posx, bry-posy ,color, transparency)
}

export function drawEllipse2(context, posx, posy, width, height ,color="black", transparency=1){
	context.beginPath();
	context.fillStyle=color
    context.globalAlpha = transparency;
	context.ellipse(posx, posy, width, height,0, 0, 2 * Math.PI);
	context.fill();
    context.globalAlpha = 1;
}

