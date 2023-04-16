var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_normalMatrix;
    varying vec3 v_Normal;
	//varying float transparent;
    varying vec3 v_PositionInWorld;
	///////////////////////////
	varying vec2 v_TexCoord;
	attribute vec2 a_TexCoord;
	/////////////////////////////
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
        v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
		
		v_TexCoord = a_TexCoord;
    }    
`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec3 u_LightPosition;
    uniform vec3 u_ViewPosition;
    uniform float u_Ka;
    uniform float u_Kd;
    uniform float u_Ks;
    uniform float u_shininess;
    uniform vec3 u_Color;
    varying vec3 v_Normal;
    varying vec3 v_PositionInWorld;
	uniform float transparent;
	/////////////////////////////////////////
	uniform sampler2D u_Sampler0;
	uniform sampler2D u_Sampler1;
	varying vec2 v_TexCoord;
	uniform float tex;
	////////////////////////////////////////
    void main(){
        // let ambient and diffuse color are u_Color 
        // (you can also input them from ouside and make them different)
        //vec3 ambientLightColor = u_Color;
        //vec3 diffuseLightColor = u_Color;
        // assume white specular light (you can also input it from ouside)
        vec3 specularLightColor = vec3(1.0, 1.0, 1.0);        

	////////////////////////////////////////////////////////////////////////////////
	vec3 ambientLightColor;
	vec3 diffuseLightColor;
	vec3 texColor;
	vec3 texColor0 = texture2D( u_Sampler0, v_TexCoord ).rgb;
	vec3 texColor1 = texture2D( u_Sampler1, v_TexCoord ).rgb;
	if(tex==1.0){
	
		texColor=texColor0;
	
		ambientLightColor = texColor*0.7+u_Color*0.3;
		diffuseLightColor = texColor*0.7+u_Color*0.3;
	}
	else if(tex==2.0){
		texColor=texColor1;
	
		ambientLightColor = texColor;
		diffuseLightColor = texColor;
	}
	else{
		ambientLightColor = u_Color;
		diffuseLightColor = u_Color;
	}
	////////////////////////////////////////////////////////////////////////////////
        vec3 ambient = ambientLightColor * u_Ka;

        vec3 normal = normalize(v_Normal);
        vec3 lightDirection = normalize(u_LightPosition - v_PositionInWorld);
        float nDotL = max(dot(lightDirection, normal), 0.0);
        vec3 diffuse = diffuseLightColor * u_Kd * nDotL;

        vec3 specular = vec3(0.0, 0.0, 0.0);
        if(nDotL > 0.0) {
            vec3 R = reflect(-lightDirection, normal);
            // V: the vector, point to viewer       
            vec3 V = normalize(u_ViewPosition - v_PositionInWorld); 
            float specAngle = clamp(dot(R, V), 0.0, 1.0);
            specular = u_Ks * pow(specAngle, u_shininess) * specularLightColor; 
        }

        gl_FragColor = vec4( ambient + diffuse + specular, transparent );
    }
`;

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
/////BEGIN:///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function initAttributeVariable(gl, a_attribute, buffer){
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initVertexBufferForLaterUse(gl, vertices, normals, texCoords){
  var nVertices = vertices.length / 3;

  var o = new Object();
  o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
  if( normals != null ) o.normalBuffer = initArrayBufferForLaterUse(gl, new Float32Array(normals), 3, gl.FLOAT);
  if( texCoords != null ) o.texCoordBuffer = initArrayBufferForLaterUse(gl, new Float32Array(texCoords), 2, gl.FLOAT);
  //you can have error check here
  o.numVertices = nVertices;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}
/////END://///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

///// normal vector calculation (for the cube)
function getNormalOnVertices(vertices){
  var normals = [];
  var nTriangles = vertices.length/9;
  for(let i=0; i < nTriangles; i ++ ){
      var idx = i * 9 + 0 * 3;
      var p0x = vertices[idx+0], p0y = vertices[idx+1], p0z = vertices[idx+2];
      idx = i * 9 + 1 * 3;
      var p1x = vertices[idx+0], p1y = vertices[idx+1], p1z = vertices[idx+2];
      idx = i * 9 + 2 * 3;
      var p2x = vertices[idx+0], p2y = vertices[idx+1], p2z = vertices[idx+2];

      var ux = p1x - p0x, uy = p1y - p0y, uz = p1z - p0z;
      var vx = p2x - p0x, vy = p2y - p0y, vz = p2z - p0z;

      var nx = uy*vz - uz*vy;
      var ny = uz*vx - ux*vz;
      var nz = ux*vy - uy*vx;

      var norm = Math.sqrt(nx*nx + ny*ny + nz*nz);
      nx = nx / norm;
      ny = ny / norm;
      nz = nz / norm;

      normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
  }
  return normals;
}

var mouseLastX, mouseLastY;
var mouseDragging = false;
var angleX = 0, angleY = 0;
var gl, canvas;
var mvpMatrix;
var modelMatrix;
var normalMatrix;
var nVertex;
var cameraX = 3, cameraY = 3, cameraZ = 7;
var mario = [];
var sonic = [];
var tree=[];
var grass=[];
var cube = [];
var water = [];
var lightlocation = [];
var halfcircle=[];
var legjoint=[];//圓形關節
var triangle=[];
var leglong1_1=[];//圓柱體腿
var legstitch1=[];//圓錐刺

var moveDistance = 0;
var rotateAngle = 0;
var move = 0;
var updown = 0;

var textures = {};
var imgNames=["model.nut0.png","texture.png"];
var objCompImgIndex=["model.nut0.png","texture.png"];
var texCount = 0;
var numTextures = imgNames.length;

async function main(){
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    gl.useProgram(program);

    program.a_Position = gl.getAttribLocation(program, 'a_Position'); 
    program.a_Normal = gl.getAttribLocation(program, 'a_Normal'); 
    program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix'); 
    program.u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix'); 
    program.u_normalMatrix = gl.getUniformLocation(program, 'u_normalMatrix');
    program.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
    program.u_ViewPosition = gl.getUniformLocation(program, 'u_ViewPosition');
    program.u_Ka = gl.getUniformLocation(program, 'u_Ka'); 
    program.u_Kd = gl.getUniformLocation(program, 'u_Kd');
    program.u_Ks = gl.getUniformLocation(program, 'u_Ks');
    program.u_shininess = gl.getUniformLocation(program, 'u_shininess');
    program.u_Color = gl.getUniformLocation(program, 'u_Color'); 
	program.transparent = gl.getUniformLocation(program, 'transparent'); 
	
	////////////////////////////////////////////////////////////////////////////////
	program.u_Sampler0 = gl.getUniformLocation(program, "u_Sampler0")
	program.u_Sampler0 = gl.getUniformLocation(program, "u_Sampler1")
	program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord'); 
	program.tex = gl.getUniformLocation(program, 'tex');
	///////////////////////////////////////////////////////////////////////////////
	
    /////3D model fox
    response = await fetch('low-poly-fox-by-pixelmannen.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      mario.push(o);
    }

    /////3D model dog
    response = await fetch('untitled-scene.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      sonic.push(o);
    }
	
	//tree
	response = await fetch('untitled.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      tree.push(o);
    }
	
	response = await fetch('dense-grass.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      grass.push(o);
    }
	
    ////cube
	
    //TODO-1: create vertices for the cube whose edge length is 2.0 (or 1.0 is also fine)
    //F: Face, T: Triangle
    cubeVertices = [
            1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, //front
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, //right
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, //up
            -1.0, -1.0, 1.0,-1.0, 1.0, 1.0,  -1.0, -1.0, -1.0,  -1.0, 1.0, -1.0,-1.0, -1.0, -1.0, -1.0, 1.0, 1.0, //left
            -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, //bottom
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 //back
        ]
	
	//F1_T1_X,  F1_T1_Y,  F1_T1_Z,  F1_T2_X,  F1_T2_Y,  F1_T2_Z,   //this row for the face z = 1.0
    //F2_T1_X,  F2_T1_Y,  F2_T1_Z,  F2_T2_X,  F2_T2_Y,  F2_T2_Z,   //this row for the face x = 1.0
    //F3_T1_X,  F3_T1_Y,  F3_T1_Z,  F3_T2_X,  F3_T2_Y,  F3_T2_Z,   //this row for the face y = 1.0
    //F4_T1_X,  F4_T1_Y,  F4_T1_Z,  F4_T2_X,  F4_T2_Y,  F4_T2_Z,   //this row for the face x = -1.0
    //F5_T1_X,  F5_T1_Y,  F5_T1_Z,  F5_T2_X,  F5_T2_Y,  F5_T2_Z,   //this row for the face y = -1.0
    //F6_T1_X,  F6_T1_Y,  F6_T1_Z,  F6_T2_X,  F6_T2_Y,  F6_T2_Z,   //this row for the face z = -1.0
                  

    cubeNormals = getNormalOnVertices(cubeVertices);
    let o = initVertexBufferForLaterUse(gl, cubeVertices, cubeNormals, null);
    cube.push(o);
	water.push(o);
	lightlocation.push(o);
	
	//halfball
	
	var halfcirclevertices=[];
	let fan=30;
	let r=0.5;
	var latitudeBands = 30;//緯線
    var longitudeBands = 30;//經線	
	for(let q=/*longitudeBands*/1;q<=longitudeBands;q++){
		for(let i=0; i<=latitudeBands/2; i++){//高緯到低緯
			var theta = i * Math.PI / latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);
			
			var theta1 = (i+1) * Math.PI / latitudeBands;
			var sinTheta1 = Math.sin(theta1);
			var cosTheta1 = Math.cos(theta1);
			
			var phi = q * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			
			var x = r * cosPhi * sinTheta;
			var y = r * cosTheta;
			var z = r * sinPhi * sinTheta;
			
			var phi1 = (q+1) * 2 * Math.PI / longitudeBands;
			var sinPhi1 = Math.sin(phi1);
			var cosPhi1 = Math.cos(phi1);
			
			var phi2 = (q-1) * 2 * Math.PI / longitudeBands;
			var sinPhi2 = Math.sin(phi2);
			var cosPhi2 = Math.cos(phi2);
			
			var x1 = r * cosPhi1 * sinTheta1;//又下
			var y1 = r * cosTheta1;
			var z1 = r * sinPhi1 * sinTheta1;
			
			var x2 = r * cosPhi2 * sinTheta;//左上
			var y2 = r * cosTheta;
			var z2 = r * sinPhi2 * sinTheta;
			
			var x3 = r * cosPhi * sinTheta1;//自己下
			var y3 = r * cosTheta1;
			var z3 = r * sinPhi * sinTheta1;
						
			//左
			halfcirclevertices.push(x2);
			halfcirclevertices.push(y2);
			halfcirclevertices.push(z2);
			halfcirclevertices.push(x);
			halfcirclevertices.push(y);
			halfcirclevertices.push(z);
			
			halfcirclevertices.push(x3);
			halfcirclevertices.push(y3);
			halfcirclevertices.push(z3);
				
			//右
			halfcirclevertices.push(x1);
			halfcirclevertices.push(y1);
			halfcirclevertices.push(z1);
			
			halfcirclevertices.push(x3);
			halfcirclevertices.push(y3);
			halfcirclevertices.push(z3);
			
			halfcirclevertices.push(x);
			halfcirclevertices.push(y);
			halfcirclevertices.push(z);				
		}
	}
	head=getNormalOnVertices(halfcirclevertices);
	let g = initVertexBufferForLaterUse(gl, halfcirclevertices, head, null);
    halfcircle.push(g);
	//半圓結束
	
	//圓形關節
	var circlevertices=[];
	for(let q=0;q<longitudeBands;q++){
		for(let i=0; i<latitudeBands; i++){//高緯到低緯
			var theta = i * Math.PI / latitudeBands;
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);
			
			var theta1 = (i+1) * Math.PI / latitudeBands;
			var sinTheta1 = Math.sin(theta1);
			var cosTheta1 = Math.cos(theta1);
		
			var phi = q * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			
			var x = r * cosPhi * sinTheta;
			var y = r * cosTheta;
			var z = r * sinPhi * sinTheta;
			
			var phi1 = (q+1) * 2 * Math.PI / longitudeBands;
			var sinPhi1 = Math.sin(phi1);
			var cosPhi1 = Math.cos(phi1);
			
			var phi2 = (q-1) * 2 * Math.PI / longitudeBands;
			var sinPhi2 = Math.sin(phi2);
			var cosPhi2 = Math.cos(phi2);
			
			var x1 = r * cosPhi1 * sinTheta1;//又下
			var y1 = r * cosTheta1;
			var z1 = r * sinPhi1 * sinTheta1;
			
			var x2 = r * cosPhi2 * sinTheta;//左上
			var y2 = r * cosTheta;
			var z2 = r * sinPhi2 * sinTheta;
			
			var x3 = r * cosPhi * sinTheta1;//自己下
			var y3 = r * cosTheta1;
			var z3 = r * sinPhi * sinTheta1;
						
			//左
			circlevertices.push(x2);
			circlevertices.push(y2);
			circlevertices.push(z2);
			circlevertices.push(x);
			circlevertices.push(y);
			circlevertices.push(z);
			
			circlevertices.push(x3);
			circlevertices.push(y3);
			circlevertices.push(z3);
				
			//右
			circlevertices.push(x1);
			circlevertices.push(y1);
			circlevertices.push(z1);
			
			circlevertices.push(x3);
			circlevertices.push(y3);
			circlevertices.push(z3);
			
			circlevertices.push(x);
			circlevertices.push(y);
			circlevertices.push(z);				
		}
	}
	joint=getNormalOnVertices(circlevertices);
	let p = initVertexBufferForLaterUse(gl, circlevertices, joint, null);
    legjoint.push(p);
	//圓型結束
	//leg
	
	//triangle
	var trianglevertices=[];
	
	trianglevertices.push([1],[0],[0],[0],[1],[0],[0],[0],[1],
	[0],[0],[1],[0],[1],[0],[-1],[0],[0],
	[-1],[0],[0],[0],[1],[0],[0],[0],[-1],
	[0],[0],[-1],[0],[1],[0],[1],[0],[0]
	
	);
	
	horn=getNormalOnVertices(trianglevertices);
	let h = initVertexBufferForLaterUse(gl, trianglevertices, horn, null);
    triangle.push(h);
	
	legmarker(gl);
	stitchmarker(gl);
	
	mvpMatrix = new Matrix4();
    modelMatrix = new Matrix4();
    normalMatrix = new Matrix4();

    gl.enable(gl.DEPTH_TEST);



////////////////////////////////////////////////////////////////////////////image

	for( let i=0; i < imgNames.length; i ++ ){
      let image = new Image();
      image.onload = function(){initTexture(gl, image, imgNames[i]);};
      image.src = imgNames[i];
    }

///////////////////////////////////////////////////////////////////////////

    draw();//draw it once before mouse move

    canvas.onmousedown = function(ev){mouseDown(ev)};
    canvas.onmousemove = function(ev){mouseMove(ev)};
    canvas.onmouseup = function(ev){mouseUp(ev)};
	canvas.addEventListener('wheel',wh );
	
    var slider1 = document.getElementById("move1");
    slider1.oninput = function() {
        moveDistance = this.value/60.0
        draw();
    }

    var slider2 = document.getElementById("rotate");
    slider2.oninput = function() {
        rotateAngle = this.value 
        draw();
    }
	
	var slider3 = document.getElementById("move2");
    slider3.oninput = function() {
        move = this.value 
        draw();
    }
	
	var slider4 = document.getElementById("move3");
    slider4.oninput = function() {
        updown = this.value 
        draw();
    }
}

function legmarker(gl){
	var leglongvertices=[];
	let r=0.05;
	let fan=90;
	let angle=(Math.PI)*2/fan;
	for(let i=0;i<fan;i++){
		var x1=r*Math.cos(angle*i); var y1=r*Math.sin(angle*i); var z1=1; var z0=0;
		var x2=r*Math.cos(angle*(i+1)); var y2=r*Math.sin(angle*(i+1)); 
		//up to down
		
		leglongvertices.push(x1);
		leglongvertices.push(z0);
		leglongvertices.push(y1);
		
		leglongvertices.push(x1);		
		leglongvertices.push(z1);
		leglongvertices.push(y1);
		
		leglongvertices.push(x2);	
		leglongvertices.push(z1);
		leglongvertices.push(y2);
				
		//down to up
		
		leglongvertices.push(x2);		
		leglongvertices.push(z0);
		leglongvertices.push(y2);
		
		leglongvertices.push(x1);
		leglongvertices.push(z0);
		leglongvertices.push(y1);
		
		leglongvertices.push(x2);	
		leglongvertices.push(z1);
		leglongvertices.push(y2);
		
	}
	leg=getNormalOnVertices(leglongvertices);
	
	let g = initVertexBufferForLaterUse(gl, leglongvertices, leg, null);
    leglong1_1.push(g);
	
}
function stitchmarker(gl){
	var stitchvertices=[];
	let r=0.05;
	let fan=60;
	let angle=(Math.PI)*2/fan;
	for(let i=0;i<fan;i++){
		var x=r*Math.cos(angle*i); var y=r*Math.sin(angle*i); var z=1;var z1=0;
		var x2=r*Math.cos(angle*(i+1)); var y2=r*Math.sin(angle*(i+1)); 
			
		stitchvertices.push(x2);
		stitchvertices.push(z);
		stitchvertices.push(y2);
		
		stitchvertices.push(z1);
		stitchvertices.push(z1);
		stitchvertices.push(z1);
		
		stitchvertices.push(x);
		stitchvertices.push(z);
		stitchvertices.push(y);
	
	}
	stitch=getNormalOnVertices(stitchvertices);
	let g = initVertexBufferForLaterUse(gl, stitchvertices, stitch, null);
    legstitch1.push(g);	
}
/////Call drawOneObject() here to draw all object one by one 
////   (setup the model matrix and color to draw)
function draw(){
    gl.clearColor(0.8,0.8,1.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let mdlMatrix = new Matrix4(); //model matrix of objects	
	let light=new Matrix4();
	
	let stitch1=new Matrix4();
	let mm=[];
	function pushMatrix(){
		mm.push(new Matrix4(mdlMatrix));
	}
	function popMatrix(){
		mdlMatrix = mm.pop();
	}
	
	light.translate(0.0,5.0,3.0);
	light.scale(0.5,0.5,0.5);  
    drawOneObject(legjoint, light, 1.0, 1.0, 1.0, 1.0);
	
	//mdlMatrix.setIdentity();
	//地
	mdlMatrix.translate(0.0,0.7,0.0);
	pushMatrix();
	mdlMatrix.translate(0.0,-0.35,0.0);
	mdlMatrix.scale(1.2,0.08,1.2);
	drawOneObject(cube, mdlMatrix, 0.4, 0.7, 0.4, 1.0, 0.0);
	
	popMatrix();
	pushMatrix();
	//狐狸
	mdlMatrix.translate(0.0,-0.28,0.0);
	//mdlMatrix.translate(0,0,moveDistance);
	mdlMatrix.scale(0.006,0.006,0.006);
    drawOneObject(mario, mdlMatrix, 0.9, 0.5, 0.5, 1.0, 2.0);
	
	popMatrix();
	pushMatrix();
	
	//狗
	mdlMatrix.rotate(rotateAngle,0,1,0);
	mdlMatrix.translate(0.5,-0.27,0.5);
	mdlMatrix.scale(0.025,0.025,0.025);  
    drawOneObject(sonic, mdlMatrix, 1.0, 1.0, 1.0, 1.0, 1.0);
	
	popMatrix();
	pushMatrix();
	
	//樹
	
	mdlMatrix.translate(-2.2,0.13,-0.8);
	mdlMatrix.scale(0.005,0.005,0.005);  
    drawOneObject(tree, mdlMatrix, 0.7, 0.9, 0.3, 1.0, 0.0);
	
	popMatrix();
	pushMatrix();
	//草

	mdlMatrix.translate(0.0,-0.33,0.0);
	mdlMatrix.scale(0.006,0.003,0.006);  
    drawOneObject(grass, mdlMatrix, 0.3, 0.8, 0.4, 1.0, 0.0);
	
	popMatrix();
	pushMatrix();
	//水
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.depthMask(false);
	
	mdlMatrix.translate(0.0,-1.331,0.0);
	mdlMatrix.scale(1.2,0.9,1.2);
    drawOneObject(water, mdlMatrix, 0.0, 0.5, 0.5, 0.4, 0.0);
	gl.depthMask(true);
	
	popMatrix();
	//mdlMatrix.translate(0.0,-0.15,0.0);
	mdlMatrix.scale(0.7,0.7,0.7);  
	mdlMatrix.rotate(rotateAngle,0,1,0);
	pushMatrix();
	
	popMatrix();
	//水母頭
	mdlMatrix.translate(0.0,-1.5,0.0);
	mdlMatrix.translate(0,0,moveDistance);
	mdlMatrix.translate(move/50,0,0);
	mdlMatrix.translate(0,updown/120,0);
	mdlMatrix.rotate(moveDistance*25,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.7,0.7,0.7);  
    drawOneObject(halfcircle, mdlMatrix, 1.0, 0.6, 0.6, 0.4,0.0);
	
	//horn
	mdlMatrix.translate(0.0,0.5,0.0);
	//mdlMatrix.translate(0,0,moveDistance);
	//mdlMatrix.translate(move/50,0,0);
	mdlMatrix.scale(0.05,0.15,0.05);  
	
	drawOneObject(triangle, mdlMatrix, 0.0, 1.0, 1.0, 0.8, 0.0);
	
	popMatrix();
	pushMatrix();//empty
	
	//水母腳1
	
	mdlMatrix.translate(0.1,-0.15,0.0);
	//mdlMatrix.translate(0,0,moveDistance*0.9);
	mdlMatrix.rotate(10,0,0,1);
	
	///////////mdlMatrix.rotate(updown/10,0,0,-1);
	
	mdlMatrix.rotate(moveDistance*20,1,0,0);
	mdlMatrix.rotate(move/4,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5);  
    drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6,0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.023,0.0);
	mdlMatrix.rotate(moveDistance*30,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	
	/////////mdlMatrix.rotate(updown/5,0,0,1);
	
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6,0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.22,0.0);
	
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5); 
	drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.025,0.0);
	mdlMatrix.rotate(moveDistance*40,1,0,0);
	mdlMatrix.rotate(move,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.13,0.0);
	mdlMatrix.scale(0.63,0.1,0.63);  
	drawOneObject(legstitch1, mdlMatrix, 0.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	pushMatrix();//empty
	//水母腳2
	mdlMatrix.translate(-0.1,-0.15,0.0);
	//mdlMatrix.translate(0,0,moveDistance*0.9);
	mdlMatrix.rotate(10,0,0,-1);
	mdlMatrix.rotate(moveDistance*20,1,0,0);
	mdlMatrix.rotate(move/4,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5);  
    drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.023,0.0);
	mdlMatrix.rotate(moveDistance*30,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.22,0.0);
	pushMatrix();
	mdlMatrix.scale(0.5,0.2,0.5); 
	drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.025,0.0);
	mdlMatrix.rotate(moveDistance*40,1,0,0);
	mdlMatrix.rotate(move,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.13,0.0);
	mdlMatrix.scale(0.63,0.1,0.63);  
	drawOneObject(legstitch1, mdlMatrix, 0.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	pushMatrix();//empty
	
	//水母腳3
	mdlMatrix.translate(0.0,-0.15,0.1);
	//mdlMatrix.translate(0,0,moveDistance*0.9);
	mdlMatrix.rotate(10,-1,0,0);
	mdlMatrix.rotate(moveDistance*20,1,0,0);
	mdlMatrix.rotate(move/4,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5);  
    drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.023,0.0);
	mdlMatrix.rotate(moveDistance*30,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.22,0.0);
	pushMatrix();
	mdlMatrix.scale(0.5,0.2,0.5); 
	drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.025,0.0);
	mdlMatrix.rotate(moveDistance*40,1,0,0);
	mdlMatrix.rotate(move,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.13,0.0);
	mdlMatrix.scale(0.63,0.1,0.63);  
	drawOneObject(legstitch1, mdlMatrix, 1.0, 1.0, 0.0, 0.6, 0.0);
	popMatrix();
	
	pushMatrix();//empty
	
	//水母腳4
	mdlMatrix.translate(0.0,-0.15,-0.1);
	//mdlMatrix.translate(0,0,moveDistance*0.9);
	mdlMatrix.rotate(10,1,0,0);
	mdlMatrix.rotate(moveDistance*20,1,0,0);
	mdlMatrix.rotate(move/4,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5);  
    drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.023,0.0);
	mdlMatrix.rotate(moveDistance*30,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.22,0.0);
	pushMatrix();
	mdlMatrix.scale(0.5,0.2,0.5); 
	drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.025,0.0);
	mdlMatrix.rotate(moveDistance*40,1,0,0);
	mdlMatrix.rotate(move,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	
	popMatrix();
	mdlMatrix.translate(0.0,-0.13,0.0);
	
	mdlMatrix.scale(0.63,0.1,0.63);  
	drawOneObject(legstitch1, mdlMatrix, 1.0, 1.0, 0.0, 0.6, 0.0);
	popMatrix();
	
	pushMatrix();//empty
	
	//-----------------------------------------水母二
	popMatrix();
	mdlMatrix.translate(-0.1,-0.5,0.4);
	mdlMatrix.scale(0.5,0.5,0.5);  
	//mdlMatrix.rotate(rotateAngle,0,1,0);
	pushMatrix();
	//水母頭
	mdlMatrix.translate(1.0,0.0,0.0);
	mdlMatrix.translate(0,0,moveDistance);
	mdlMatrix.translate(move/100,0,0);
	pushMatrix();
	mdlMatrix.scale(0.7,0.7,0.7);  
    drawOneObject(halfcircle, mdlMatrix, 1.0, 0.6, 0.6, 0.4, 0.0);
	
		//horn
	mdlMatrix.translate(0.1,0.5,0.0);
	pushMatrix();
	mdlMatrix.rotate(10,0,0,-1);
	mdlMatrix.translate(0.0,-0.03,0.0);
	//mdlMatrix.translate(0,0,moveDistance);
	//mdlMatrix.translate(move/50,0,0);
	mdlMatrix.scale(0.05,0.2,0.05);  
	
	drawOneObject(triangle, mdlMatrix, 1.0, 1.0, 0.0, 0.8, 0.0);
	
	popMatrix();
	mdlMatrix.rotate(10,0,0,1);
	mdlMatrix.translate(-0.2,0.0,0.0);
	mdlMatrix.scale(0.05,0.2,0.05);  
	
	drawOneObject(triangle, mdlMatrix, 1.0, 1.0, 0.0, 0.8, 0.0);
	//horn end
	
	
	popMatrix();
	pushMatrix();//empty
	
	//水母腳1
	
	mdlMatrix.translate(0.1,-0.15,0.0);
	mdlMatrix.rotate(10,0,0,1);
	mdlMatrix.rotate(moveDistance*20,1,0,0);
	mdlMatrix.rotate(move/4,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5);  
    drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.023,0.0);
	mdlMatrix.rotate(moveDistance*30,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.22,0.0);
	
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5); 
	drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.025,0.0);
	mdlMatrix.rotate(moveDistance*40,1,0,0);
	mdlMatrix.rotate(move,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.13,0.0);
	mdlMatrix.scale(0.63,0.1,0.63);  
	drawOneObject(legstitch1, mdlMatrix, 0.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	pushMatrix();//empty
	//水母腳2
	mdlMatrix.translate(-0.1,-0.15,0.0);
	//mdlMatrix.translate(0,0,moveDistance*0.9);
	mdlMatrix.rotate(10,0,0,-1);
	mdlMatrix.rotate(moveDistance*20,1,0,0);
	mdlMatrix.rotate(move/4,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5);  
    drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.023,0.0);
	mdlMatrix.rotate(moveDistance*30,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.22,0.0);
	pushMatrix();
	mdlMatrix.scale(0.5,0.2,0.5); 
	drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.025,0.0);
	mdlMatrix.rotate(moveDistance*40,1,0,0);
	mdlMatrix.rotate(move,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.13,0.0);
	mdlMatrix.scale(0.63,0.1,0.63);  
	drawOneObject(legstitch1, mdlMatrix, 0.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	pushMatrix();//empty
	
	//水母腳3
	mdlMatrix.translate(0.0,-0.15,0.1);
	//mdlMatrix.translate(0,0,moveDistance*0.9);
	mdlMatrix.rotate(10,-1,0,0);
	mdlMatrix.rotate(moveDistance*20,1,0,0);
	mdlMatrix.rotate(move/4,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5);  
    drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.023,0.0);
	mdlMatrix.rotate(moveDistance*30,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.22,0.0);
	pushMatrix();
	mdlMatrix.scale(0.5,0.2,0.5); 
	drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.025,0.0);
	mdlMatrix.rotate(moveDistance*40,1,0,0);
	mdlMatrix.rotate(move,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.13,0.0);
	mdlMatrix.scale(0.63,0.1,0.63);  
	drawOneObject(legstitch1, mdlMatrix, 1.0, 1.0, 0.0, 0.6, 0.0);
	popMatrix();
	
	pushMatrix();//empty
	
	//水母腳4
	mdlMatrix.translate(0.0,-0.15,-0.1);
	//mdlMatrix.translate(0,0,moveDistance*0.9);
	mdlMatrix.rotate(10,1,0,0);
	mdlMatrix.rotate(moveDistance*20,1,0,0);
	mdlMatrix.rotate(move/4,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.5,0.2,0.5);  
    drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.023,0.0);
	mdlMatrix.rotate(moveDistance*30,1,0,0);
	mdlMatrix.rotate(move/2,0,0,-1);
	pushMatrix();
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	popMatrix();
	
	mdlMatrix.translate(0.0,-0.22,0.0);
	pushMatrix();
	mdlMatrix.scale(0.5,0.2,0.5); 
	drawOneObject(leglong1_1, mdlMatrix, 1.0, 0.6, 0.6, 0.6, 0.0);
	popMatrix();
	mdlMatrix.translate(0.0,-0.025,0.0);
	mdlMatrix.rotate(moveDistance*40,1,0,0);
	mdlMatrix.rotate(move,0,0,-1);
	pushMatrix();
	
	mdlMatrix.scale(0.063,0.063,0.063);  
    drawOneObject(legjoint, mdlMatrix, 1.0, 1.0, 1.0, 0.6, 0.0);
	
	popMatrix();
	mdlMatrix.translate(0.0,-0.13,0.0);
	
	mdlMatrix.scale(0.63,0.1,0.63);  
	drawOneObject(legstitch1, mdlMatrix, 1.0, 1.0, 0.0, 0.6, 0.0);
	popMatrix();
	
	pushMatrix();//empty
	
}                        
//obj: the object components
//mdlMatrix: the model matrix without mouse rotation
//colorR, G, B: object color
function drawOneObject(obj, mdlMatrix, colorR, colorG, colorB,trans,tex){
    //model Matrix (part of the mvp matrix)
    modelMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
    modelMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation   
	modelMatrix.translate( 0, 0.4, 0);
	modelMatrix.scale(currentAngle, currentAngle ,currentAngle );
	modelMatrix.multiply(mdlMatrix);
    //mvp: projection * view * model matrix  
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(cameraX+2, cameraY-1.5, cameraZ+0.5, 0, 0, 0, 0, 1, 0);//lookat(鏡頭位置, 世界中心位置, 觀看角度)
    mvpMatrix.multiply(modelMatrix);

    //normal matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniform3f(program.u_LightPosition, 0, 5, 3);
    gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
    gl.uniform1f(program.u_Ka, 0.25);
    gl.uniform1f(program.u_Kd, 0.95);
    gl.uniform1f(program.u_Ks, 1.0);
    gl.uniform1f(program.u_shininess, 10.0);
    gl.uniform3f(program.u_Color, colorR, colorG, colorB);
	gl.uniform1f(program.transparent, trans);
	gl.uniform1f(program.tex, tex);
////////////////////////////////////////////////////////////////////////////////
	gl.uniform1i(program.u_Sampler0, 0);
	gl.activeTexture(gl.TEXTURE0);			
	gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[0]]);
	
	gl.uniform1i(program.u_Sampler0, 1);
	gl.activeTexture(gl.TEXTURE1);		
	gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[1]]);
////////////////////////////////////////////////////////////////////////////////

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);

    for( let i=0; i < obj.length; i ++ ){
      initAttributeVariable(gl, program.a_Position, obj[i].vertexBuffer);
      initAttributeVariable(gl, program.a_Normal, obj[i].normalBuffer);
	  if(tex>=1.0){
	  initAttributeVariable(gl, program.a_TexCoord, obj[i].texCoordBuffer);
      }
      gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
    }
}

function parseOBJ(text) {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
  ];

  // same order as `f` indices
  let webglVertexData = [
    [],   // positions
    [],   // texcoords
    [],   // normals
  ];

  const materialLibs = [];
  const geometries = [];
  let geometry;
  let groups = ['default'];
  let material = 'default';
  let object = 'default';

  const noop = () => {};

  function newGeometry() {
    // If there is an existing geometry and it's
    // not empty then start a new one.
    if (geometry && geometry.data.position.length) {
      geometry = undefined;
    }
  }

  function setGeometry() {
    if (!geometry) {
      const position = [];
      const texcoord = [];
      const normal = [];
      webglVertexData = [
        position,
        texcoord,
        normal,
      ];
      geometry = {
        object,
        groups,
        material,
        data: {
          position,
          texcoord,
          normal,
        },
      };
      geometries.push(geometry);
    }
  }

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      // should check for missing v and extra w?
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      setGeometry();
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
    s: noop,    // smoothing group
    mtllib(parts, unparsedArgs) {
      // the spec says there can be multiple filenames here
      // but many exist with spaces in a single filename
      materialLibs.push(unparsedArgs);
    },
    usemtl(parts, unparsedArgs) {
      material = unparsedArgs;
      newGeometry();
    },
    g(parts) {
      groups = parts;
      newGeometry();
    },
    o(parts, unparsedArgs) {
      object = unparsedArgs;
      newGeometry();
    },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }

  // remove any arrays that have no entries.
  for (const geometry of geometries) {
    geometry.data = Object.fromEntries(
        Object.entries(geometry.data).filter(([, array]) => array.length > 0));
  }

  return {
    geometries,
    materialLibs,
  };
}

function mouseDown(ev){ 
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if( rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom){
        mouseLastX = x;
        mouseLastY = y;
        mouseDragging = true;
    }
}

function mouseUp(ev){ 
    mouseDragging = false;
}

function mouseMove(ev){ 
    var x = ev.clientX;
    var y = ev.clientY;
    if( mouseDragging ){
        var factor = 100/canvas.height; //100 determine the spped you rotate the object
        var dx = factor * (x - mouseLastX);
        var dy = factor * (y - mouseLastY);

        angleX += dx; //yes, x for y, y for x, this is right
        angleY += dy;
    }
    mouseLastX = x;
    mouseLastY = y;

    draw();
}
function wh(e) {
    console.log(e);
    if (e.wheelDelta) {
        //除了firfox瀏覽器，別的瀏覽器的處理
        changeZ(e.wheelDelta / 120, e);
    } else if (e.detail) {
        //firefox瀏覽器的測試
        if (e.detail === -3) {
            changeZ(-1, e);
        } else if (e.detail === 3) {
            changeZ(1, e);
        } else {
            console.log("鼠標滾輪事件改了？", e);
        }
    }
	draw();
}
//var currentAngle = [0.0,0.0,10.0];
var currentAngle = 1;
function changeZ(index) {
    console.log(currentAngle);
    currentAngle = Math.max(Math.min(currentAngle += index/5,20.0),0.5);
}

function initTexture(gl, img, imgName){
  var tex = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.bindTexture(gl.TEXTURE_2D, tex);

  // Set the parameters so we can render any size image.
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  textures[imgName] = tex;

  texCount++;//how many texture i already setup
  if( texCount == numTextures)draw();//i already load all the textures so i draw 
}