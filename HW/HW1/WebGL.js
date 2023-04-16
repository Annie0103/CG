//This tempalte is just for your reference
//You do not have to follow this template 
//You are very welcome to write your program from scratch

//shader
var VSHADER_SOURCE = `
		//precision mediump float;
		attribute vec4 a_Color;
		attribute vec4 a_Position;
		varying vec4 v_Color;
		void main(){
			gl_Position = a_Position;
			gl_PointSize = 4.0;
			v_Color = a_Color;
		}
    `;

var FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
    `;



var shapeFlag = 'p'; //p: point, h: hori line: v: verti line, t: triangle, q: square, c: circle
var colorFlag = 'r'; //r g b 
var g_points = [];
var g_horiLines = [];
var g_vertiLines = [];
var g_triangles = [];
var g_squares = [];
var g_circles = [];


//var ... of course you may need more variables



function compileShader(gl, vShaderText, fShaderText){
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText)
    gl.shaderSource(fragmentShader, fShaderText)
    //compile vertex shader
    gl.compileShader(vertexShader)
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('vertex shader ereror');
        var message = gl.getShaderInfoLog(vertexShader); 
        console.log(message);//print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader)
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('fragment shader ereror');
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message);//print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    //var gl = canvas.getContext('webgl') || canvas.getContext('exprimental-webgl') ;
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    // compile shader and use program
	let renderProgram = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
 
    gl.useProgram(renderProgram);

   
	/*var pointbuffer = gl.createBuffer();
	var horibuffer = gl.createBuffer();
	var vertibuffer = gl.createBuffer();
	var trianglebuffer = gl.createBuffer();
	var squarebuffer = gl.createBuffer();
	var circlebuffer = gl.createBuffer();*/

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // mouse and key event...
    canvas.onmousedown = 
	function(ev){
		click(ev, gl, canvas, renderProgram)
		};
    document.onkeydown = function(ev){keydown(ev)};
}


function keydown(ev){ //you may want to define more arguments for this function
    //implment keydown event here

    if(ev.key == 'r'){ //an example for user press 'r'... 
        //......  
		colorFlag='r';
    }
	else if(ev.key == 'g'){ //an example for user press 'r'... 
        //......  
		colorFlag='g';
    }
	else if(ev.key == 'b'){ //an example for user press 'r'... 
        //......  
		colorFlag='b';
    }
	else{
	}
	
	if(ev.key == 'p'){ //an example for user press 'r'... 
        //......  
		shapeFlag='p';
    }
	else if(ev.key == 'h'){ //an example for user press 'r'... 
        //......  
		shapeFlag='h';
    }
	else if(ev.key == 'v'){ //an example for user press 'r'... 
        //......  
		shapeFlag='v';
    }
	else if(ev.key == 't'){ //an example for user press 'r'... 
        //......  
		shapeFlag='t';
    }
	else if(ev.key == 'q'){ //an example for user press 'r'... 
        //......  
		shapeFlag='q';
    }
	else if(ev.key == 'c'){ //an example for user press 'r'... 
        //......  
		shapeFlag='c';
    }
	else{}
}

function click(ev, gl, canvas, program){ //you may want to define more arguments for this function
    //mouse click: recall our quiz1 in calss
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
    y = (canvas.width/2 - (y - rect.top))/(canvas.height/2);

    //you might want to do something here

	//x = ((ev.clientX-8)/200)-1;
    //y = -[((ev.clientY-8)/200)-1];

	var g_color = [];
	
	if(colorFlag=='r'){
		//g_colors.push([1.0,0.0,0.0, 1.0]);
		g_color[0]=1.0;
		g_color[1]=0.0;
		g_color[2]=0.0;
	}
	else if(colorFlag=='g'){
		//g_colors.push([0.0,1.0,0.0, 1.0]);
		g_color[0]=0.0;
		g_color[1]=1.0;
		g_color[2]=0.0;
	}
	else if(colorFlag=='b'){
		//g_colors.push([0.0,0.0,1.0, 1.0]);
		g_color[0]=0.0;
		g_color[1]=0.0;
		g_color[2]=1.0;
	}
	else{
		g_color[0]=g_color[0];
		g_color[1]=g_color[1];
		g_color[2]=g_color[2];
	}
	
	if(shapeFlag=='p'){
		
		g_points.push([x], [y],[ g_color[0]],[g_color[1]],[g_color[2]]);
		//g_points.push([x,y, g_color[0],g_color[1],g_color[2]]);
		console.log(x);
		console.log(y);
		console.log(g_color[0]);
		console.log(g_color[1]);
		console.log(g_color[2]);
		
		
		let count=(g_points.length)/5;
		
		if(count>5){
			for(let i=0;i<(count-5)*5;i++){
				g_points.shift();
			}
		}
	}
	else if(shapeFlag=='t'){
		
		g_triangles.push([x], [y+0.03], [g_color[0]],[g_color[1]],[g_color[2]]
		,[x-(5/400*Math.sqrt(3))],[y-0.01],[g_color[0]],[g_color[1]],[g_color[2]]
		,[x+(5/400*Math.sqrt(3))],[y-0.01],[g_color[0]],[g_color[1]],[g_color[2]
		]);
	
		let count=(g_triangles.length)/5;
		
		if(count>15){
			for(let i=0;i<(count-15)*5;i++){
				g_triangles.shift();
			}
		}
	}
	else if(shapeFlag=='h'){
		g_horiLines.push([x-2.0],[y],[g_color[0]],[g_color[1]],[g_color[2]],
		[x+2.0],[y],[g_color[0]],[g_color[1]],[g_color[2]]);
		
		let count=(g_horiLines.length)/5;
		
		if(count>10){
			for(let i=0;i<(count-10)*5;i++){
				g_horiLines.shift();
			}
		}
	}
	else if(shapeFlag=='v'){
		g_vertiLines.push([x],[y-2.0],[g_color[0]],[g_color[1]],[g_color[2]],
		[x],[y+2.0],[g_color[0]],[g_color[1]],[g_color[2]]);
		
		let count=(g_vertiLines.length)/5;
		
		if(count>10){
			for(let i=0;i<(count-10)*5;i++){
				g_vertiLines.shift();
			}
		}
	}
	else if(shapeFlag=='q'){
		g_squares.push([x-0.06],[y+0.06],[g_color[0]],[g_color[1]],[g_color[2]],
		[x+0.06],[y+0.06],[g_color[0]],[g_color[1]],[g_color[2]],
		[x-0.06],[y-0.06],[g_color[0]],[g_color[1]],[g_color[2]],
		[x+0.06],[y+0.06],[g_color[0]],[g_color[1]],[g_color[2]],
		[x-0.06],[y-0.06],[g_color[0]],[g_color[1]],[g_color[2]],
		[x+0.06],[y-0.06],[g_color[0]],[g_color[1]],[g_color[2]]
		);
		
		let count=(g_squares.length)/5;
		
		if(count>30){
			for(let i=0;i<(count-30)*5;i++){
				g_squares.shift();
			}
		}
	}
	else if(shapeFlag=='c'){
		let r=0.06;
		let fan=24;
		let k=((2*Math.PI)/fan);
		
		for(let j=0;j<fan;j++){
			g_circles.push([x],[y],[g_color[0]],[g_color[1]],[g_color[2]]);
			g_circles.push([(x+r*(Math.cos(k*j)))],[(y+r*(Math.sin(k*j)))],[g_color[0]],[g_color[1]],[g_color[2]]);		
			g_circles.push([(x+r*(Math.cos(k*(j+1))))],[(y+r*(Math.sin(k*(j+1))))],[g_color[0]],[g_color[1]],[g_color[2]]);			
		}
		
		
		let count=(g_circles.length)/5;
		
		if(count>(fan*5*3)){
			for(let i=0;i<(count-(fan*5*3))*5;i++){
				g_circles.shift();
			}
		}
	}
	/*switch(shapeFlag){
		case 'p':
		mode=gl.POINTS;
		g_points.push([x, y, g_color[0],g_color[1],g_color[2]]);
		gl.bindBuffer(gl.ARRAY_BUFFER, pointbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, g_points, gl.STATIC_DRAW);
		
		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
		gl.enableVertexAttribArray(a_Position);
		
		gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
		gl.enableVertexAttribArray(a_Color);
		
		count=1;

		break;
		
		case 'h':
		mode=gl.LINES;
		g_horiLines.push([x,y, g_color[0],g_color[1],g_color[2]]);
		gl.bindBuffer(gl.ARRAY_BUFFER, horibuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g_horiLines), gl.STATIC_DRAW);
		break;
		
		case 'v':
		mode=gl.LINES;
		g_vertiLines.push([x, y, g_color[0],g_color[1],g_color[2]]);
		gl.bindBuffer(gl.ARRAY_BUFFER, vertibuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g_vertiLines), gl.STATIC_DRAW);
		break;
		
		case 't':
		mode=gl.TRIANGLES;
		g_triangles.push([x, y+0.01, g_color[0],g_color[1],g_color[2]
		,x-(3/400*Math.sqrt(3)),y-0.005,g_color[0],g_color[1],g_color[2]
		,x+(3/400*Math.sqrt(3)),y-0.005,g_color[0],g_color[1],g_color[2]
		]);
		gl.bindBuffer(gl.ARRAY_BUFFER, trianglebuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g_triangles), gl.STATIC_DRAW);	
		break;
		
		case 'q':
		mode=gl.TRIANGLE_STRIP;
		g_squares.push([x, y, g_color[0],g_color[1],g_color[2]]);
		gl.bindBuffer(gl.ARRAY_BUFFER, squarebuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g_squares), gl.STATIC_DRAW);
		break;
		
		case 'c':
		mode=gl.TRIANGLE_STRIP;
		g_circles.push([x, y, g_color[0],g_color[1],g_color[2]]);
		gl.bindBuffer(gl.ARRAY_BUFFER, ciclebuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g_circles), gl.STATIC_DRAW);
		break;
		
	}*/
		
	
	
    //self-define draw() function
    //I suggest that you can clear the canvas
    //and redraw whole frame(canvas) after any mouse click
    draw(gl,program);
}


function draw(gl,program){ //you may want to define more arguments for this function
    //redraw whole canvas here
    //Note: you are only allowed to same shapes of this frame by single gl.drawArrays() call
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	
	if((g_points.length)!=0){
	var pointbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,pointbuffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g_points),gl.STATIC_DRAW);
	var FSIZE = new Float32Array(g_points).BYTES_PER_ELEMENT;
	
	var a_position=gl.getAttribLocation(program,'a_Position');
	
	gl.vertexAttribPointer(a_position,2,gl.FLOAT,false,FSIZE*5,0);
	gl.enableVertexAttribArray(a_position);
	
	var a_color = gl.getAttribLocation(program,'a_Color');
	gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
	gl.enableVertexAttribArray(a_color);
	
	let count=(g_points.length)/5;
	
	gl.drawArrays(gl.POINTS, 0,count);
	}
	
	
	if((g_triangles.length)!=0){
		var trianglebuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,trianglebuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g_triangles),gl.STATIC_DRAW);
		var FSIZE = new Float32Array(g_triangles).BYTES_PER_ELEMENT;
		
		var a_position=gl.getAttribLocation(program,'a_Position');
		gl.vertexAttribPointer(a_position,2,gl.FLOAT,false,FSIZE*5,0);
		gl.enableVertexAttribArray(a_position);
		
		var a_color = gl.getAttribLocation(program,'a_Color');
		gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
		gl.enableVertexAttribArray(a_color);
		
		let count=(g_triangles.length)/5;
		
		gl.drawArrays(gl.TRIANGLES, 0,count);
	}
	
	if((g_horiLines.length)!=0){
		var horibuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,horibuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g_horiLines),gl.STATIC_DRAW);
		var FSIZE = new Float32Array(g_horiLines).BYTES_PER_ELEMENT;
		
		var a_position=gl.getAttribLocation(program,'a_Position');
		gl.vertexAttribPointer(a_position,2,gl.FLOAT,false,FSIZE*5,0);
		gl.enableVertexAttribArray(a_position);
		
		var a_color = gl.getAttribLocation(program,'a_Color');
		gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
		gl.enableVertexAttribArray(a_color);
		
		let count=(g_horiLines.length)/5;
		
		gl.drawArrays(gl.LINES, 0,count);
	}
	if((g_vertiLines.length)!=0){
		var vertibuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,vertibuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g_vertiLines),gl.STATIC_DRAW);
		var FSIZE = new Float32Array(g_vertiLines).BYTES_PER_ELEMENT;
		
		var a_position=gl.getAttribLocation(program,'a_Position');
		gl.vertexAttribPointer(a_position,2,gl.FLOAT,false,FSIZE*5,0);
		gl.enableVertexAttribArray(a_position);
		
		var a_color = gl.getAttribLocation(program,'a_Color');
		gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
		gl.enableVertexAttribArray(a_color);
		
		let count=(g_vertiLines.length)/5;
		
		gl.drawArrays(gl.LINES, 0,count);
	}
	
	if((g_squares.length)!=0){
		var squarebuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,squarebuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g_squares),gl.STATIC_DRAW);
		var FSIZE = new Float32Array(g_squares).BYTES_PER_ELEMENT;
		
		var a_position=gl.getAttribLocation(program,'a_Position');
		gl.vertexAttribPointer(a_position,2,gl.FLOAT,false,FSIZE*5,0);
		gl.enableVertexAttribArray(a_position);
		
		var a_color = gl.getAttribLocation(program,'a_Color');
		gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
		gl.enableVertexAttribArray(a_color);
		
		let count=(g_squares.length)/5;
		
		gl.drawArrays(gl.TRIANGLES, 0,count);
	}
	
	if((g_circles.length)!=0){
		var circlebuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,circlebuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g_circles),gl.STATIC_DRAW);
		var FSIZE = new Float32Array(g_circles).BYTES_PER_ELEMENT;
		
		var a_position=gl.getAttribLocation(program,'a_Position');
		gl.vertexAttribPointer(a_position,2,gl.FLOAT,false,FSIZE*5,0);
		gl.enableVertexAttribArray(a_position);
		
		var a_color = gl.getAttribLocation(program,'a_Color');
		gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE*5, FSIZE*2);
		gl.enableVertexAttribArray(a_color);
		
		let count=(g_circles.length)/5;
		
		gl.drawArrays(gl.TRIANGLES, 0,count);
	}

	for(let i=0;i<g_points.length;i++){
		console.log(g_points.length);
		console.log(g_points[i]);
		
	}
	console.log(a_position);
		console.log(a_color);

}
