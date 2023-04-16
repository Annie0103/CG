var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_modelMatrix;
        void main(){
            gl_Position = u_modelMatrix * a_Position;
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
//繼承-旋轉在push前 slidecontainer1
function createProgram(gl, vertexShader, fragmentShader){
    //create the program and attach the shaders
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //if success, return the program. if not, log the program info, and delete it.
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        return program;
    }
    alert(gl.getProgramInfoLog(program) + "");
    gl.deleteProgram(program);
}

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

function initArrayBuffer( gl, data, num, type, attribute){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create the buffere object");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), attribute);

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

var transformMat = new Matrix4();
var matStack = [];
var u_modelMatrix;
function pushMatrix(){
    matStack.push(new Matrix4(transformMat));
}
function popMatrix(){
    transformMat = matStack.pop();
}
//variables for tx, red,green and yellow arms angle 
var tx = 0;
var ty = 0;
var leg1__1=0;var leg2__1=0;var leg3__1=0;var leg4__1=0;
var leg1__2=0;var leg2__2=0;var leg3__2=0;var leg4__2=0;
var leg1__3=0;var leg2__3=0;var leg3__3=0;var leg4__3=0;


function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    redraw(gl); //call redarw here to show the initial image

    //setup the call back function of tx Sliders
    var txSlider = document.getElementById("Translate-X");
    txSlider.oninput = function() {
        tx = this.value / 100.0; //convert sliders value to -1 to +1
        redraw(gl);
    }
	var tySlider = document.getElementById("Translate-Y");
    tySlider.oninput = function() {
        ty = this.value / 100.0; //convert sliders value to -1 to +1
        redraw(gl);
    }
	var leg1_1 = document.getElementById("Leg1-1");
    leg1_1.oninput = function() {
        leg1__1 = this.value;
        redraw(gl);
    }
	var leg1_2 = document.getElementById("Leg1-2");
    leg1_2.oninput = function() {
        leg1__2 = this.value;
        redraw(gl);
    }
	var leg1_3 = document.getElementById("Leg1-3");
    leg1_3.oninput = function() {
        leg1__3 = this.value;
        redraw(gl);
    }
	var leg2_1 = document.getElementById("Leg2-1");
    leg2_1.oninput = function() {
        leg2__1 = this.value;
        redraw(gl);
    }
	var leg2_2 = document.getElementById("Leg2-2");
    leg2_2.oninput = function() {
        leg2__2 = this.value;
        redraw(gl);
    }
	var leg2_3 = document.getElementById("Leg2-3");
    leg2_3.oninput = function() {
        leg2__3 = this.value;
        redraw(gl);
    }
	var leg3_1 = document.getElementById("Leg3-1");
    leg3_1.oninput = function() {
        leg3__1 = this.value;
        redraw(gl);
    }
	var leg3_2 = document.getElementById("Leg3-2");
    leg3_2.oninput = function() {
        leg3__2 = this.value;
        redraw(gl);
    }
	var leg3_3 = document.getElementById("Leg3-3");
    leg3_3.oninput = function() {
        leg3__3 = this.value;
        redraw(gl);
    }
	var leg4_1 = document.getElementById("Leg4-1");
    leg4_1.oninput = function() {
        leg4__1 = this.value;
        redraw(gl);
    }
	var leg4_2 = document.getElementById("Leg4-2");
    leg4_2.oninput = function() {
        leg4__2 = this.value;
        redraw(gl);
    }
	var leg4_3 = document.getElementById("Leg4-3");
    leg4_3.oninput = function() {
        leg4__3 = this.value;
        redraw(gl);
    }

 
}
var position=0;
var ro1=0;
var ro2=0;
var rot=0;
var l1=0
var l2=0
var l3=0;
//做水母
function legmaker(gl,position,ro1,ro2,rot,l1,l2,l3){
	rectVertices = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5]; //長方點
	var circlevertices=[];
	var halfcirclevertices=[];
	var trianglevertices=[];
	
	let fan=24;
	let r=0.5;
	let k=((2*Math.PI)/fan);
	for(let j=0 ; j<fan; j++){
		circlevertices.push([0],[0],
		[r*(Math.cos(k*j))],[r*Math.sin(k*j)],
		[r*(Math.cos(k*(j+1)))],[r*(Math.sin(k*(j+1)))]);//圓 點
	}
	
	let t=((Math.PI)/(fan/2));
	for(let i=0; i<fan/2; i++){
		halfcirclevertices.push([0],[0],
		[r*(Math.cos(t*i))],[r*Math.sin(t*i)],
		[r*(Math.cos(t*(i+1)))],[r*Math.sin(t*(i+1))]);//半圓 點
	}
	
	trianglevertices=[0.5,0,-0.5,0,0,-(1*Math.sqrt(3))/2];//三角 點
    
	
	var redColor = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0];//三角color
    
	var greenColor=[];
	for(let g=0;g<(fan/2)*3;g++){
		greenColor.push([0.0],[1.0],[0.8]);
	}
    var blueColor = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0 ];//長方形color
   
	var yellowColor=[];
	for(let y=0;y<fan*3;y++){
		yellowColor.push([1.0],[1.0],[0.0]);
	}
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	pushMatrix();
	transformMat.translate(position,-0.05,0.0);
	
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	
	transformMat.rotate(ro1, 0.0, 0.0, 1.0);
	transformMat.rotate(l1, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//-------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//--------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	transformMat.rotate(ro2, 0.0, 0.0, 1.0);
	transformMat.rotate(l2, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//------------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------------
	popMatrix();
	buffert = initArrayBuffer(gl, new Float32Array(trianglevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(redColor), 3, gl.FLOAT, 'a_Color');
	//畫三角
	transformMat.translate(-0.0,-0.06,0.0);
	transformMat.rotate(rot,0.0,0.0,1.0);
	transformMat.rotate(l3, 0.0, 0.0, 1.0);
	transformMat.scale(0.2,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,trianglevertices.length/2);
}
//Call this funtion when we have to update the screen (eg. user input happens)
function redraw(gl)
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    u_modelMatrix = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'u_modelMatrix');
    
    rectVertices = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5]; //長方點
	var circlevertices=[];
	var halfcirclevertices=[];
	var trianglevertices=[];
	
	let fan=24;
	let r=0.5;
	let k=((2*Math.PI)/fan);
	for(let j=0 ; j<fan; j++){
		circlevertices.push([0],[0],
		[r*(Math.cos(k*j))],[r*Math.sin(k*j)],
		[r*(Math.cos(k*(j+1)))],[r*(Math.sin(k*(j+1)))]);//圓 點
	}
	
	let t=((Math.PI)/(fan/2));
	for(let i=0; i<fan/2; i++){
		halfcirclevertices.push([0],[0],
		[r*(Math.cos(t*i))],[r*Math.sin(t*i)],
		[r*(Math.cos(t*(i+1)))],[r*Math.sin(t*(i+1))]);//半圓 點
	}
	
	trianglevertices=[0.5,0,-0.5,0,0,-(1*Math.sqrt(3))/2];//三角 點
    
	
	var redColor = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0];//三角color
    
	var greenColor=[];
	for(let g=0;g<(fan/2)*3;g++){
		greenColor.push([0.0],[1.0],[0.8]);
	}
    var blueColor = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0 ];//長方形color
   
	var yellowColor=[];
	for(let y=0;y<fan*3;y++){
		yellowColor.push([1.0],[1.0],[0.0]);
	}
	var eyecolor=[];
	for(let e=0;e<fan*3;e++){
		eyecolor.push([0.0],[0.0],[0.0]);
	}
	var eyevertices=[];
	var b=0.7;
	for(let ev=0;ev<fan*3;ev++){
		eyevertices.push([0],[0],
		[b*(Math.cos(k*ev))],[r*Math.sin(k*ev)],
		[b*(Math.cos(k*(ev+1)))],[r*(Math.sin(k*(ev+1)))]);//圓 點
	}

    transformMat.setIdentity();
    transformMat.translate(tx, 0.0 , 0.0);
	transformMat.translate(0.0, ty , 0.0);
	
	//head------------------------------------------------
	bufferhc = initArrayBuffer(gl, new Float32Array(halfcirclevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(greenColor), 3, gl.FLOAT, 'a_Color');
	
	transformMat.translate(0.0,0.3,0.0);
	pushMatrix();
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,halfcirclevertices.length/2);//畫半圓
	
	bufferc = initArrayBuffer(gl, new Float32Array(eyevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(eyecolor), 3, gl.FLOAT, 'a_Color');
	pushMatrix();
	transformMat.translate(-0.2,0.2,0.0);
	transformMat.scale(0.1,0.1,0.0);
	transformMat.rotate(20,0.0,0.0,1.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,eyevertices.length/2);//畫左眼
	popMatrix();
	transformMat.translate(0.2,0.2,0.0);
	transformMat.scale(0.1,0.1,0.0);
	transformMat.rotate(-20,0.0,0.0,1.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,eyevertices.length/2);//畫右眼
	
	//leg1-------------------------------------------------------------------
	legmaker(gl,-0.45,-20,40,-40,leg1__1,leg1__2,leg1__3);
	/*popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	pushMatrix();
	transformMat.translate(-0.45,-0.05,0.0);
	
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	
	transformMat.rotate(-20, 0.0, 0.0, 1.0);
	transformMat.rotate(leg1__1, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//-------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//--------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	transformMat.rotate(40, 0.0, 0.0, 1.0);
	transformMat.rotate(leg1__2, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//------------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------------
	popMatrix();
	buffert = initArrayBuffer(gl, new Float32Array(trianglevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(redColor), 3, gl.FLOAT, 'a_Color');
	//畫三角
	transformMat.translate(-0.0,-0.06,0.0);
	transformMat.rotate(-40,0.0,0.0,1.0);
	transformMat.rotate(leg1__3, 0.0, 0.0, 1.0);
	transformMat.scale(0.2,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,trianglevertices.length/2);
	*/
	////leg2-----------------------------------------------------
	legmaker(gl,-0.15,-10,20,20,leg2__1,leg2__2,leg2__3);
	/*popMatrix();
	
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	pushMatrix();
	transformMat.translate(-0.15,-0.05,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	transformMat.rotate(-10, 0.0, 0.0, 1.0);
	transformMat.rotate(leg2__1, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//-------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//--------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	transformMat.rotate(20, 0.0, 0.0, 1.0);
	transformMat.rotate(leg2__2, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//------------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------------
	popMatrix();
	buffert = initArrayBuffer(gl, new Float32Array(trianglevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(redColor), 3, gl.FLOAT, 'a_Color');
	//畫三角
	transformMat.translate(0.0,-0.06,0.0);
	transformMat.rotate(20,0.0,0.0,1.0);
	transformMat.rotate(-leg2__3, 0.0, 0.0, 1.0);
	transformMat.scale(0.2,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,trianglevertices.length/2);
	*/
	
	//leg3-------------------------------------------------------------------------
	legmaker(gl,0.15,15,-20,-25,leg3__1,leg3__2,leg3__3);
	/*
	popMatrix();
	
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	pushMatrix();
	transformMat.translate(0.15,-0.05,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	transformMat.rotate(15, 0.0, 0.0, 1.0);
	transformMat.rotate(leg3__1, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//-------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//--------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	transformMat.rotate(-20, 0.0, 0.0, 1.0);
	transformMat.rotate(leg3__2, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//------------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------------
	popMatrix();
	buffert = initArrayBuffer(gl, new Float32Array(trianglevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(redColor), 3, gl.FLOAT, 'a_Color');
	//畫三角
	transformMat.translate(-0.0,-0.06,0.0);
	transformMat.rotate(-25,0.0,0.0,1.0);
	transformMat.rotate(leg3__3, 0.0, 0.0, 1.0);
	transformMat.scale(0.2,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,trianglevertices.length/2);
	*/
	//leg4---------------------------------------------------------------
	legmaker(gl,0.45,20,-40,40,leg4__1,leg4__2,leg4__3);
	/*
	popMatrix();
	
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	pushMatrix();
	transformMat.translate(0.45,-0.05,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	transformMat.rotate(20, 0.0, 0.0, 1.0);
	transformMat.rotate(leg4__1, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//-------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//--------------------------------------------------------------
	popMatrix();
	bufferre = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');//gl.TRIANGLE_STRIP
	buffer1 = initArrayBuffer(gl, new Float32Array(blueColor), 3, gl.FLOAT, 'a_Color');
	transformMat.rotate(-40, 0.0, 0.0, 1.0);
	transformMat.rotate(leg4__2, 0.0, 0.0, 1.0);
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the blue one
	//------------------------------------------------------------------
	popMatrix();
	bufferc = initArrayBuffer(gl, new Float32Array(circlevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
	transformMat.translate(0.0,-0.2,0.0);
	pushMatrix();
	transformMat.scale(0.1,0.1,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,circlevertices.length/2);//畫圓
	//-------------------------------------------------------------------
	popMatrix();
	buffert = initArrayBuffer(gl, new Float32Array(trianglevertices), 2, gl.FLOAT, 'a_Position');//gl.TRINGLES
	buffer1 = initArrayBuffer(gl, new Float32Array(redColor), 3, gl.FLOAT, 'a_Color');
	//畫三角
	transformMat.translate(0.0,-0.06,0.0);
	transformMat.rotate(40,0.0,0.0,1.0);
	transformMat.rotate(leg4__3, 0.0, 0.0, 1.0);
	transformMat.scale(0.2,0.3,0.0);
	gl.uniformMatrix4fv(u_modelMatrix,false,transformMat.elements);
	gl.drawArrays(gl.TRIANGLES,0,trianglevertices.length/2);
	*/
}
