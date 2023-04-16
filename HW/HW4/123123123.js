var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_normalMatrix;
    varying vec3 v_Normal;
    varying vec3 v_PositionInWorld;
///////////////////////////////////////////////////////////
	varying vec2 v_TexCoord;
	attribute vec2 a_TexCoord;
/////////////////////////////////////////////////////
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
        v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
		v_TexCoord=a_TexCoord;
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
	////////////////////////////////////////////
	uniform float tex;
	uniform sampler2D u_Sampler0;
	uniform sampler2D u_Sampler1;
	uniform sampler2D u_Sampler2;
	varying vec2 v_TexCoord;
	///////////////////////////////////////////
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
	vec3 texColor2 = texture2D( u_Sampler2, v_TexCoord ).rgb;
	if(tex==1.0){
	
		texColor=texColor0;
	
		ambientLightColor = texColor;
		diffuseLightColor = texColor;
		//ambientLightColor = texColor*0.7+u_Color*0.3;
		//diffuseLightColor = texColor*0.7+u_Color*0.3;
	}
	else if(tex==2.0){
		texColor=texColor1;
	
		ambientLightColor = texColor;
		diffuseLightColor = texColor;
	}
	else if(tex==3.0){
		texColor=texColor2;
	
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

        gl_FragColor = vec4( ambient + diffuse + specular, 1.0 );
    }
`;


var VSHADER_SOURCE_ENVCUBE = `
  attribute vec4 a_Position;
  varying vec4 v_Position;
  void main() {
    v_Position = a_Position;
    gl_Position = a_Position;
  } 
`;

var FSHADER_SOURCE_ENVCUBE = `
  precision mediump float;
  uniform samplerCube u_envCubeMap;
  uniform mat4 u_viewDirectionProjectionInverse;
  varying vec4 v_Position;
  void main() {
    vec4 t = u_viewDirectionProjectionInverse * v_Position;
    gl_FragColor = textureCube(u_envCubeMap, normalize(t.xyz / t.w));
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

var mouseLastX, mouseLastY;
var mouseDragging = false;
var angleX = 0, angleY = 0;
var gl, canvas;
var mvpMatrix;
var modelMatrix;
var normalMatrix;
var nVertex;
var cameraX = 0, cameraY = 0, cameraZ = 7;
var objScale = 0.05;
var objComponents = [];
var fox = [];
var ground = [];
var cameraDirX = 0, cameraDirY = 0, cameraDirZ = 1;
var cubeObj = [];
var quadObj;
var cubeMapTex;
var leftright=0;
var snowflake=[];
var seagull=[];

var textures = [];
var imgNames=["Winter in forest at the seashore.jpg","birdTpose2.png","texture.png"];
var objCompImgIndex=["Winter in forest at the seashore.jpg","birdTpose2.png","texture.png"];
var texCount = 0;
var numTextures = imgNames.length;


var offScreenWidth = 256, offScreenHeight = 256;
var fbo;
var rotateAngle = 0;
async function main(){
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }
	var quad = new Float32Array(
      [
        -1, -1, 1,
         1, -1, 1,
        -1,  1, 1,
        -1,  1, 1,
         1, -1, 1,
         1,  1, 1
      ]); //just a quad

    programEnvCube = compileShader(gl, VSHADER_SOURCE_ENVCUBE, FSHADER_SOURCE_ENVCUBE);
    gl.useProgram(programEnvCube);
	programEnvCube.a_Position = gl.getAttribLocation(programEnvCube, 'a_Position'); 
    programEnvCube.u_envCubeMap = gl.getUniformLocation(programEnvCube, 'u_envCubeMap'); 
    programEnvCube.u_viewDirectionProjectionInverse = 
               gl.getUniformLocation(programEnvCube, 'u_viewDirectionProjectionInverse'); 

    quadObj = initVertexBufferForLaterUse(gl, quad);
	cubeMapTex = initCubeTexture("pos-x.jpg", "neg-x.jpg", "pos-y.jpg", "neg-y.jpg", 
                                  "pos-z.jpg", "neg-z.jpg", 512, 512)


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
	
	////////////////////////////////////////////////////////////////////////////////
	program.transparent = gl.getUniformLocation(program, 'transparent'); 
	program.u_Sampler0 = gl.getUniformLocation(program, "u_Sampler0")
	program.u_Sampler1 = gl.getUniformLocation(program, "u_Sampler1")
	program.u_Sampler2 = gl.getUniformLocation(program, "u_Sampler2")
	program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord'); 
	program.tex = gl.getUniformLocation(program, 'tex');
	///////////////////////////////////////////////////////////////////////////
	response = await fetch('low-poly-fox-by-pixelmannen.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      fox.push(o);
    }

	//response = await fetch('s2p3-ricardo-bird.obj');
    response = await fetch('bird.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      objComponents.push(o);
    }
	
	response = await fetch('bird-revamp.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      seagull.push(o);
    }

	response = await fetch('cube.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      cubeObj.push(o);
    }

	response = await fetch('snow-flake.obj');
    //response = await fetch('sonic.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      snowflake.push(o);
    }


    mvpMatrix = new Matrix4();
    modelMatrix = new Matrix4();
    normalMatrix = new Matrix4();

    gl.enable(gl.DEPTH_TEST);

    //draw();//draw it once before mouse move
	////////////////////////////////////////////////////////////////////////////image

	for( let i=0; i < imgNames.length; i ++ ){
      let image = new Image();
      image.onload = function(){initTexture(gl, image, imgNames[i]);};
      image.src = imgNames[i];
    }

	////////////////////////////////監視器///////////////////////////////////////////
	/*
	var imagecamera = new Image();
    imagecamera.onload = function(){initTexture(gl, imagecamera, "cameraTex");};
    imagecamera.src = "marioD.jpg";*/
	//fbo = initFrameBuffer(gl);
	/////////////////////////////////////////////////////////////////////
	
	change();
	/////////////////////////////////////////////////////

	canvas.onmousedown = function(ev){mouseDown(ev)};
    canvas.onmousemove = function(ev){mouseMove(ev)};
    canvas.onmouseup = function(ev){mouseUp(ev)};
	document.onkeydown = function(ev){keydown(ev)};
	

}
function change(){
	gl.clearColor(0.8,0.8,1.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	let mdlMatrix = new Matrix4(); //model matrix of objects	
	
	let mm=[];
	function pushMatrix(){
		mm.push(new Matrix4(mdlMatrix));
	}
	function popMatrix(){
		mdlMatrix = mm.pop();
	}
	//drawOffScreen();
	mdlMatrix.translate(0.0,-2.1,0.0);
	mdlMatrix.translate(leftright,0.0,0.0);
	pushMatrix();
	mdlMatrix.translate(0.0,1.902,1.1);
	mdlMatrix.scale(2.0,2.0,2.0);
	mdlMatrix.rotate(270,0.0,1.0,0.0);
    draw(objComponents,mdlMatrix,1.0,0.0,1.0,1.0,2.0);

	popMatrix();
	pushMatrix();
	mdlMatrix.translate(0.0,0.0,0.0);
	mdlMatrix.scale(0.03,0.03,0.03);
	draw(fox,mdlMatrix,1.0,0.0,0.0,1.0,3.0);

	popMatrix();
	pushMatrix();
	mdlMatrix.translate(0.0,-0.05,0.0);
	mdlMatrix.scale(5.0,0.05,5.0);
	draw(cubeObj,mdlMatrix,1.0,1.0,1.0,1.0,1.0);

	popMatrix();
	pushMatrix();
	mdlMatrix.translate(2.0,2.0,0.0);
	mdlMatrix.rotate(90,1.0,0.0,1.0);
	draw(snowflake,mdlMatrix,1.0,1.0,1.0,1.0,0.0);

	popMatrix();
	pushMatrix();
	mdlMatrix.translate(-2.0,2.0,0.0);
	mdlMatrix.rotate(90,1.0,0.0,0.0);
	mdlMatrix.scale(1.0,0.05,1.0);
	draw(cubeObj,mdlMatrix,0.9,0.9,0.9,1.0,0.0);//監視器

}
function draw(ob, mdlMatrix, colorR, colorG, colorB,trans ,tex){
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	//gl.clearColor(0.4, 0.4, 0.4, 1);
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	
	let rotateMatrix = new Matrix4();
	rotateMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
	rotateMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation
	var viewDir= new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
	var newViewDir = rotateMatrix.multiplyVector3(viewDir);
	
	var vpFromCamera = new Matrix4();
	vpFromCamera.setPerspective(60, 1, 1, 100);
	var viewMatrixRotationOnly = new Matrix4();
	viewMatrixRotationOnly.lookAt(cameraX, cameraY, cameraZ, 
								cameraX + newViewDir.elements[0], 
								cameraY + newViewDir.elements[1], 
								cameraZ + newViewDir.elements[2], 
								0, 1, 0);
	viewMatrixRotationOnly.elements[12] = 0; //ignore translation
	viewMatrixRotationOnly.elements[13] = 0;
	viewMatrixRotationOnly.elements[14] = 0;
	vpFromCamera.multiply(viewMatrixRotationOnly);
	var vpFromCameraInverse = vpFromCamera.invert();

	
	//////////////////////////////////////////////////////////////////////////
	//gl.clearColor(0,0,1,1);
    gl.useProgram(program);
    //model Matrix (part of the mvp matrix)

	modelMatrix.setIdentity();
	//modelMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
    //modelMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation*/   
    //modelMatrix.setScale(objScale, objScale, objScale);
	//modelMatrix.rotate(90,0,1,0);
	// modelMatrix.translate(0.0, 0.0, -1.0);
    // modelMatrix.scale(1.0, 0.5, 2.0);
    //mvp: projection * view * model matrix  
    modelMatrix.multiply(mdlMatrix);
	mvpMatrix.setPerspective(60, 1, 1, 100);
    //mvpMatrix.lookAt(cameraX, cameraY, cameraZ, 0, 0, 0, 0, 1, 0);
    mvpMatrix.lookAt(cameraX, cameraY, cameraZ, 
								cameraX + newViewDir.elements[0], 
								cameraY + newViewDir.elements[1], 
								cameraZ + newViewDir.elements[2], 
								0, 1, 0);
	mvpMatrix.multiply(modelMatrix);

    //normal matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
	
	
    gl.uniform3f(program.u_LightPosition, 0, 0, 3);
    gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
    gl.uniform1f(program.u_Ka, 0.2);
    gl.uniform1f(program.u_Kd, 0.7);
    gl.uniform1f(program.u_Ks, 1.0);
    gl.uniform1f(program.u_shininess, 50.0);
    gl.uniform3f(program.u_Color, colorR, colorG, colorB);
	gl.uniform1f(program.transparent, trans);
	gl.uniform1f(program.tex, tex);
////////////////////////////////////////////////////////////////////////////////
	
	gl.activeTexture(gl.TEXTURE1);		
	gl.uniform1i(program.u_Sampler0, 1);
	gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[0]]);
	
	
	gl.activeTexture(gl.TEXTURE2);		
	gl.uniform1i(program.u_Sampler1, 2);
	gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[1]]);
	
	
	gl.activeTexture(gl.TEXTURE3);		
	gl.uniform1i(program.u_Sampler2, 3);
	gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[2]]);
////////////////////////////////////////////////////////////////////////////////

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for( let i=0; i < ob.length; i ++ ){
      initAttributeVariable(gl, program.a_Position, ob[i].vertexBuffer);
      initAttributeVariable(gl, program.a_Normal, ob[i].normalBuffer);
	  if(tex>=1.0){
	  initAttributeVariable(gl, program.a_TexCoord, ob[i].texCoordBuffer);
      }
      gl.drawArrays(gl.TRIANGLES, 0, ob[i].numVertices);
    }
	
	/////////////////////////////////////////////////////////////////////////////////
	
	gl.useProgram(programEnvCube);
    gl.depthFunc(gl.LEQUAL);
    gl.uniformMatrix4fv(programEnvCube.u_viewDirectionProjectionInverse, 
                      false, vpFromCameraInverse.elements);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTex);
    gl.uniform1i(programEnvCube.u_envCubeMap, 0);
    initAttributeVariable(gl, programEnvCube.a_Position, quadObj.vertexBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, quadObj.numVertices);
}

///////////////////////////////監視器////////////////////////////////////////////////////////////////
/*
function drawcamera(){
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.viewport(0, 0, offScreenWidth, offScreenHeight);
  drawOffScreen();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  drawOnScreen();
}

function drawOffScreen(){
  gl.clearColor(1.0, 0.8, 0.2, 1.0);

  //model Matrix (part of the mvp matrix)
  modelMatrix.setRotate(rotateAngle, 0, 1, 0);
  modelMatrix.scale(objScale, objScale, objScale);
  //mvp: projection * view * model matrix  
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(cameraX, cameraY, cameraZ, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);

  //normal matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();

  gl.uniform3f(program.u_LightPosition, 0, 0, 3);
  gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
  gl.uniform1f(program.u_Ka, 0.2);
  gl.uniform1f(program.u_Kd, 0.7);
  gl.uniform1f(program.u_Ks, 1.0);
  gl.uniform1f(program.u_shininess, 10.0);
  gl.uniform1i(program.u_Sampler0, 0);

  gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures["cameraTex"]);

  for( let i=0; i < marioObj.length; i ++ ){
    initAttributeVariable(gl, program.a_Position, marioObj[i].vertexBuffer);
    initAttributeVariable(gl, program.a_TexCoord, marioObj[i].texCoordBuffer);
    initAttributeVariable(gl, program.a_Normal, marioObj[i].normalBuffer);
    gl.drawArrays(gl.TRIANGLES, 0, marioObj[i].numVertices);
  }
}

function drawOnScreen(){
    gl.clearColor(0,0,0,1);

    //model Matrix (part of the mvp matrix)
    modelMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
    modelMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation
    modelMatrix.scale(1.0, 1.0, 1.0);
    //mvp: projection * view * model matrix  
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(cameraX, cameraY, cameraZ, 0, 0, 0, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);

    //normal matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniform3f(program.u_LightPosition, 0, 0, 3);
    gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
    gl.uniform1f(program.u_Ka, 0.2);
    gl.uniform1f(program.u_Kd, 0.7);
    gl.uniform1f(program.u_Ks, 1.0);
    gl.uniform1f(program.u_shininess, 10.0);
    gl.uniform1i(program.u_Sampler0, 0);

    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture);

    for( let i=0; i < cubeObj.length; i ++ ){
      initAttributeVariable(gl, program.a_Position, cubeObj[i].vertexBuffer);
      initAttributeVariable(gl, program.a_TexCoord, cubeObj[i].texCoordBuffer);
      initAttributeVariable(gl, program.a_Normal, cubeObj[i].normalBuffer);
      gl.drawArrays(gl.TRIANGLES, 0, cubeObj[i].numVertices);
    }
}
*/
function initFrameBuffer(gl){
  //create and set up a texture object as the color buffer
  var texture1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, offScreenWidth, offScreenHeight,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  

  //create and setup a render buffer as the depth buffer
  var depthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 
                          offScreenWidth, offScreenHeight);

  //create and setup framebuffer: linke the color and depth buffer to it
  var frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
                            gl.TEXTURE_2D, texture1, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                              gl.RENDERBUFFER, depthBuffer);
  frameBuffer.texture = texture1;
  return frameBuffer;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
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

    //draw1();
	//draw();
	change();
}


function keydown(ev){ 
  //implment keydown event here
  let rotateMatrix = new Matrix4();
  //rotateMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
  //rotateMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation
  rotateMatrix.setIdentity();
  var viewDir= new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
  var newViewDir = rotateMatrix.multiplyVector3(viewDir);

  if(ev.key == 'w'){ 
      cameraX += (newViewDir.elements[0] * 0.1);
      cameraY += (newViewDir.elements[1] * 0.1);
      cameraZ += (newViewDir.elements[2] * 0.1);
  }
  else if(ev.key == 's'){ 
    cameraX -= (newViewDir.elements[0] * 0.1);
    cameraY -= (newViewDir.elements[1] * 0.1);
    cameraZ -= (newViewDir.elements[2] * 0.1);
  }
  else if(ev.key=='a'){
	  leftright-=0.1;
  }
  else if(ev.key=='d'){
	  leftright+=0.1;
  }
	//draw1();
	//draw();
	change();
}

function initCubeTexture(posXName, negXName, posYName, negYName, 
                         posZName, negZName, imgWidth, imgHeight)
{
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      fName: posXName,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      fName: negXName,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      fName: posYName,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      fName: negYName,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      fName: posZName,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      fName: negZName,
    },
  ];
  faceInfos.forEach((faceInfo) => {
    const {target, fName} = faceInfo;
    // setup each face so it's immediately renderable
    gl.texImage2D(target, 0, gl.RGBA, imgWidth, imgHeight, 0, 
                  gl.RGBA, gl.UNSIGNED_BYTE, null);

    var image = new Image();
    image.onload = function(){
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    };
    image.src = fName;
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  return texture;
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
  if( texCount == numTextures)change();//i already load all the textures so i draw 
}
/*function draw1(){
	
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.4, 0.4, 0.4, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  
  let rotateMatrix = new Matrix4();
  rotateMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
  rotateMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation
  var viewDir= new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
  var newViewDir = rotateMatrix.multiplyVector3(viewDir);

  var vpFromCamera = new Matrix4();
  vpFromCamera.setPerspective(60, 1, 1, 15);
  var viewMatrixRotationOnly = new Matrix4();
  viewMatrixRotationOnly.lookAt(cameraX, cameraY, cameraZ, 
                                cameraX + newViewDir.elements[0], 
                                cameraY + newViewDir.elements[1], 
                                cameraZ + newViewDir.elements[2], 
                                0, 1, 0);
  viewMatrixRotationOnly.elements[12] = 0; //ignore translation
  viewMatrixRotationOnly.elements[13] = 0;
  viewMatrixRotationOnly.elements[14] = 0;
  vpFromCamera.multiply(viewMatrixRotationOnly);
  var vpFromCameraInverse = vpFromCamera.invert();
	//draw(objComponents);
	//draw(fox);
	
  //quad
  gl.useProgram(programEnvCube);
  gl.depthFunc(gl.LEQUAL);
  gl.uniformMatrix4fv(programEnvCube.u_viewDirectionProjectionInverse, 
                      false, vpFromCameraInverse.elements);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTex);
  gl.uniform1i(programEnvCube.u_envCubeMap, 0);
  initAttributeVariable(gl, programEnvCube.a_Position, quadObj.vertexBuffer);
  gl.drawArrays(gl.TRIANGLES, 0, quadObj.numVertices);
  
}*/