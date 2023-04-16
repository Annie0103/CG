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
	//------------------------------------
	attribute vec3 a_Tagent;
    attribute vec3 a_Bitagent;
	attribute float a_crossTexCoord;
	varying mat4 v_TBN;
/////////////////////////////////////////////////////////////////////
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
        v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
		v_TexCoord=a_TexCoord;
		
		//create TBN matrix 
        vec3 tagent = normalize(a_Tagent);
        vec3 bitagent = normalize(a_Bitagent);
        vec3 nVector;
        if( a_crossTexCoord > 0.0){
          nVector = cross(tagent, bitagent);
        } else{
          nVector = cross(bitagent, tagent);
        }
        v_TBN = mat4(tagent.x, tagent.y, tagent.z, 0.0, 
                           bitagent.x, bitagent.y, bitagent.z, 0.0,
                           nVector.x, nVector.y, nVector.z, 0.0, 
                           0.0, 0.0, 0.0, 1.0);
        
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
	uniform sampler2D u_Sampler3;
	uniform sampler2D u_Sampler4;
	uniform sampler2D u_Sampler5;
	uniform sampler2D u_Sampler6;
	uniform sampler2D u_Sampler7;
	varying vec2 v_TexCoord;
	//--------------------------------
	    uniform highp mat4 u_normalMatrix;
		uniform bool u_normalMode;
		varying mat4 v_TBN;
	
	//////////////////////////////////////////////////////////////
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
		vec3 texColor3 = texture2D( u_Sampler3, v_TexCoord ).rgb;
		vec3 texColor4 = texture2D( u_Sampler4, v_TexCoord ).rgb;
		if(tex==0.0){
		
			texColor=texColor0;
		
			ambientLightColor = texColor;
			diffuseLightColor = texColor;
		}
		else if(tex==1.0){
			texColor=texColor1;
		
			ambientLightColor = texColor;
			diffuseLightColor = texColor;
		}
		else if(tex==2.0){
			texColor=texColor2;
		
			ambientLightColor = texColor;
			diffuseLightColor = texColor;
		}	
		else if(tex==3.0){
			texColor=texColor3;
		
			ambientLightColor = texColor;
			diffuseLightColor = texColor;
		}
		else if(tex==4.0){
			texColor=texColor4;
		
			ambientLightColor = u_Color;
			diffuseLightColor = u_Color;
		}
		else{
			ambientLightColor = u_Color;
			diffuseLightColor = u_Color;
		}
	////////////////////////////////////////////////////////////////////////////////
 
        vec3 ambient = ambientLightColor * u_Ka;

        //vec3 normal = normalize(v_Normal);
		vec3 normal;
        if( u_normalMode ){
          //3D object's normal vector
          normal = normalize(v_Normal);
        }else{
        //normal vector from normal map
          vec3 nMapNormal = normalize( texColor * 2.0 - 1.0 );
          normal = normalize( vec3( u_normalMatrix * v_TBN * vec4( nMapNormal, 1.0) ) );
        }
		
		
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

var VSHADER_SOURCE_TEXTURE_ON_CUBE = `
  attribute vec4 a_Position;
  attribute vec4 a_Normal;
  uniform mat4 u_MvpMatrix;
  uniform mat4 u_modelMatrix;
  uniform mat4 u_normalMatrix;
  varying vec4 v_TexCoord;
  varying vec3 v_Normal;
  varying vec3 v_PositionInWorld;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_TexCoord = a_Position;
    v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
    v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
  } 
`;

var FSHADER_SOURCE_TEXTURE_ON_CUBE = `
  precision mediump float;
  varying vec4 v_TexCoord;
  uniform vec3 u_ViewPosition;
  uniform vec3 u_Color;
  uniform samplerCube u_envCubeMap;
  varying vec3 v_Normal;
  varying vec3 v_PositionInWorld;
  void main() {
    vec3 V = normalize(u_ViewPosition - v_PositionInWorld); 
    vec3 normal = normalize(v_Normal);
    vec3 R = reflect(-V, normal);
    gl_FragColor = vec4(0.78 * textureCube(u_envCubeMap, R).rgb + 0.3 * u_Color, 1.0);
  }
`; 
  
var VSHADER_SOURCE_refraction = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_normalMatrix;
    varying vec3 v_Normal;
    varying vec3 v_PositionInWorld;
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
        v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
    }    
`;

var FSHADER_SOURCE_refraction = `
    precision mediump float;
    uniform vec3 u_ViewPosition;
    uniform samplerCube u_envCubeMap;
    varying vec3 v_Normal;
    varying vec3 v_PositionInWorld;
    void main(){
      float ratio = 1.00 / 1.1; //glass
      vec3 V = normalize(u_ViewPosition - v_PositionInWorld); 
      vec3 normal = normalize(v_Normal);
      vec3 R = refract(-V, normal, ratio);
      gl_FragColor = vec4(textureCube(u_envCubeMap, R).rgb, 1.0);
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

function initVertexBufferForLaterUse(gl, vertices, normals, texCoords, tagents, bitagents, crossTexCoords){
	var nVertices = vertices.length / 3;
	
	var o = new Object();
	o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
	if( normals != null ) o.normalBuffer = initArrayBufferForLaterUse(gl, new Float32Array(normals), 3, gl.FLOAT);
	if( texCoords != null ) o.texCoordBuffer = initArrayBufferForLaterUse(gl, new Float32Array(texCoords), 2, gl.FLOAT);
	
	if( tagents != null ) o.tagentsBuffer = initArrayBufferForLaterUse(gl, new Float32Array(tagents), 3, gl.FLOAT);
	if( bitagents != null ) o.bitagentsBuffer = initArrayBufferForLaterUse(gl, new Float32Array(bitagents), 3, gl.FLOAT);
	if( crossTexCoords != null ) o.crossTexCoordsBuffer = initArrayBufferForLaterUse(gl, new Float32Array(crossTexCoords), 1, gl.FLOAT);
	
	//you can have error check here
	o.numVertices = nVertices;
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	return o;
}
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
var objScale = 0.05;
var quadObj;
var cubeMapTex;
var leftright=0;
var frontback=0;

var objComponents = [];
var sea = [];
var astronaut = [];
var star = [];
var ship = [];
var moon = [];
var spaceship = [];
var sphere = [];
var shiba=[];
var cubeObj=[];

var textures = [];
var imgNames=["ship.2Surface_Color.jpg","Astronaut_BaseColornew.jpeg",
"plane.png","default_Base_Color.png","seanormalmap.jpg"];
var objCompImgIndex=["ship.2Surface_Color.jpg","Astronaut_BaseColornew.jpeg",
"plane.png","default_Base_Color.png","seanormalmap.jpg"];
var texCount = 0;
var numTextures = imgNames.length;

var offScreenWidth = 800, offScreenHeight = 800;

var fbo;
var rotateAngle = 0;
var rotateAngle1 = 0;
var movedist = 15;
var xr=[];yr=[];zr=[];var xx=0,yy=0,xxx=0,yyy=0;
var rt=0,updown=0;

var normalMode = true;
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
    //gl.useProgram(programEnvCube);
	programEnvCube.a_Position = gl.getAttribLocation(programEnvCube, 'a_Position'); 
    programEnvCube.u_envCubeMap = gl.getUniformLocation(programEnvCube, 'u_envCubeMap'); 
    programEnvCube.u_viewDirectionProjectionInverse = 
               gl.getUniformLocation(programEnvCube, 'u_viewDirectionProjectionInverse'); 

    quadObj = initVertexBufferForLaterUse(gl, quad);
	cubeMapTex = initCubeTexture("pos-x.png", "neg-x.png", "pos-y.png", "neg-y.png", 
                                  "pos-z.png", "neg-z.png", 2048, 2048)							  

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
	program.u_Sampler3 = gl.getUniformLocation(program, "u_Sampler3")
	program.u_Sampler4 = gl.getUniformLocation(program, "u_Sampler4")
	program.u_Sampler5 = gl.getUniformLocation(program, "u_Sampler5")
	program.u_Sampler6 = gl.getUniformLocation(program, "u_Sampler6")
	program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord'); 
	program.tex = gl.getUniformLocation(program, 'tex');

	program.u_normalMode = gl.getUniformLocation(program, 'u_normalMode');
	program.a_Tagent = gl.getAttribLocation(program, 'a_Tagent'); 
    program.a_Bitagent = gl.getAttribLocation(program, 'a_Bitagent'); 
	program.a_crossTexCoord = gl.getAttribLocation(program, 'a_crossTexCoord'); 	
	//-------------------------------------------------------------------	


	//dynamic reflection
	programTextureOnCube = compileShader(gl, VSHADER_SOURCE_TEXTURE_ON_CUBE, FSHADER_SOURCE_TEXTURE_ON_CUBE);
    programTextureOnCube.a_Position = gl.getAttribLocation(programTextureOnCube, 'a_Position'); 
    programTextureOnCube.a_Normal = gl.getAttribLocation(programTextureOnCube, 'a_Normal'); 
    programTextureOnCube.u_MvpMatrix = gl.getUniformLocation(programTextureOnCube, 'u_MvpMatrix'); 
    programTextureOnCube.u_modelMatrix = gl.getUniformLocation(programTextureOnCube, 'u_modelMatrix'); 
    programTextureOnCube.u_normalMatrix = gl.getUniformLocation(programTextureOnCube, 'u_normalMatrix');
    programTextureOnCube.u_ViewPosition = gl.getUniformLocation(programTextureOnCube, 'u_ViewPosition');
    programTextureOnCube.u_envCubeMap = gl.getUniformLocation(programTextureOnCube, 'u_envCubeMap'); 
    programTextureOnCube.u_Color = gl.getUniformLocation(programTextureOnCube, 'u_Color'); 
	
	
	//--refraction----------------------------------------------------------------
	refractionprogram = compileShader(gl, VSHADER_SOURCE_refraction, FSHADER_SOURCE_refraction);
    refractionprogram.a_Position = gl.getAttribLocation(refractionprogram, 'a_Position'); 
    refractionprogram.a_Normal = gl.getAttribLocation(refractionprogram, 'a_Normal'); 
    refractionprogram.u_MvpMatrix = gl.getUniformLocation(refractionprogram, 'u_MvpMatrix'); 
    refractionprogram.u_modelMatrix = gl.getUniformLocation(refractionprogram, 'u_modelMatrix'); 
    refractionprogram.u_normalMatrix = gl.getUniformLocation(refractionprogram, 'u_normalMatrix');
    refractionprogram.u_ViewPosition = gl.getUniformLocation(refractionprogram, 'u_ViewPosition');
    refractionprogram.u_envCubeMap = gl.getUniformLocation(refractionprogram, 'u_envCubeMap');

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
	
	
	response = await fetch('sea.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
		let tagentSpace = calculateTangentSpace(obj.geometries[i].data.position, 
                                            obj.geometries[i].data.texcoord);
		
		let o = initVertexBufferForLaterUse(gl, 
											obj.geometries[i].data.position,
											obj.geometries[i].data.normal, 
											obj.geometries[i].data.texcoord,
											tagentSpace.tagents,
											tagentSpace.bitagents,
											tagentSpace.crossTexCoords);
		sea.push(o);
    }
	response = await fetch('star.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      star.push(o);
    }

	response = await fetch('astronaut.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      astronaut.push(o);
    }
	response = await fetch('moon.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      moon.push(o);
    }
	response = await fetch('spaceship.obj.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      spaceship.push(o);
    }
	
	response = await fetch('sphere.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      sphere.push(o);
    }
	response = await fetch('shiba.obj');
	text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      shiba.push(o);
    }

	mvpMatrix = new Matrix4();
    modelMatrix = new Matrix4();
    normalMatrix = new Matrix4();
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	for( let i=0; i < imgNames.length; i ++ ){
      let image = new Image();
      image.onload = function(){initTexture(gl, image, imgNames[i]);};
      image.src = imgNames[i];
    }

	/////////////////////////////////////////////////////////////////////
	shadow = initFrameBuffer(gl);
	fbo = initFrameBufferForCubemapRendering(gl);
	/////////////////////////////////////////////////////////////////////
	drawcamera();

	canvas.onmousedown = function(ev){mouseDown(ev)};
    canvas.onmousemove = function(ev){mouseMove(ev)};
    canvas.onmouseup = function(ev){mouseUp(ev)};
	document.onkeydown = function(ev){keydown(ev)};

	var tick = function() {
      rotateAngle1 += 0.8;
      drawcamera();
      requestAnimationFrame(tick);
    }
    tick();
	var move = function() {
		
      movedist -= 0.01;
	  if(movedist<=-25)
	  {
		  movedist=20;

	  }	 
      drawcamera();
      requestAnimationFrame(move);
    }
    move();
	
	//random
	for (let i = 0; i < 50; i++) {	
		xr[i] = Math.random() * 50.0 - 25.0;		
		yr[i] = Math.random() * 20.0 - 6.0;		
		zr[i] = Math.random() * 60.0 - 25.0;
	};

}


function change(vpMatrix,flag){
	
	gl.clearColor(0.8,0.8,0.0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	let mdlMatrix = new Matrix4(); //model matrix of objects	
	
	let mm=[];
	function pushMatrix(){
		mm.push(new Matrix4(mdlMatrix));
	}
	function popMatrix(){
		mdlMatrix = mm.pop();
	}

	//sea
	pushMatrix();
	mdlMatrix.translate(0.0,-5.0,0.0);
	mdlMatrix.scale(0.1,0.08,0.1);
	draw(sea,mdlMatrix,0.3,0.5,0.8,0.0,4.0,flag,vpMatrix);
	popMatrix();
	
	//moon
	pushMatrix();
	mdlMatrix.translate(0.0,1.0,-5.0);
	mdlMatrix.scale(0.025,0.025,0.025);
	mdlMatrix.rotate(90,0.3,1.0,0.0);
	draw(moon,mdlMatrix,0.9,0.7,0.0,1.0,-1.0,flag,vpMatrix);
	popMatrix();
	
	//moon1
	pushMatrix();
	mdlMatrix.translate(-3.7,-1.0,5.0);
	mdlMatrix.scale(0.009,0.009,0.009);
	mdlMatrix.rotate(90,0.3,1.0,0.0);
	draw(moon,mdlMatrix,1.0,1.0,1.0,1.0,-1.0,flag,vpMatrix);
	popMatrix();
	
	//柴犬
	pushMatrix();
	mdlMatrix.translate(-3.5,1.8,6.0);
	mdlMatrix.scale(100.0,100.0,100.0);
	draw(shiba,mdlMatrix,0.9,0.7,0.0,1.0,3.0,flag,vpMatrix);
	popMatrix();
	
	//star
	pushMatrix();
	for(let i=0;i<25;i++){		
		pushMatrix();	
		mdlMatrix.translate(xr[i],yr[i],zr[i]);	
		mdlMatrix.rotate(rotateAngle1,1.0,1.0,1.0);
		
		mdlMatrix.scale(0.25,0.25,0.25);
		draw(star,mdlMatrix,1.0,1.0,0.0,1.0,-1.0,flag,vpMatrix);
		popMatrix();
	}
	popMatrix();
	pushMatrix();
	for(let i=25;i<50;i++){		
		pushMatrix();	
		mdlMatrix.translate(xr[i],yr[i],zr[i]);
		mdlMatrix.translate(0.0,movedist,0.0);	
		
		mdlMatrix.rotate(rotateAngle1,1.0,1.0,1.0);
		
		mdlMatrix.scale(0.25,0.25,0.25);
		draw(star,mdlMatrix,1.0,0.8,0.8,1.0,-1.0,flag,vpMatrix);
		popMatrix();
	}
	popMatrix();
	
	//astronaut
	if(normalMode){
		//var firstrotataeX=angleX;firstrotataeY=angleY;
		pushMatrix();
		mdlMatrix.translate(0.0,1.0,2.0);
		mdlMatrix.translate(0.0,updown,0.0);
		mdlMatrix.translate(rt,0.0,0.0);
		mdlMatrix.translate(0.0,0.0,frontback);
		
		mdlMatrix.translate(cameraX1,0.0,0.0);
		mdlMatrix.translate(0.0,0.0,cameraZ1);
		mdlMatrix.rotate(xxx, 0, 1, 0);//for mouse rotation
		mdlMatrix.rotate(yyy, 1, 0, 0);//for mouse rotation
		
		
		mdlMatrix.scale(50.0,50.0,50.0);
		draw(astronaut,mdlMatrix,0.9,0.7,0.0,1.0,1.0,flag,vpMatrix);
		popMatrix();
	}
	else{
		var firstrotataeX=angleX;firstrotataeY=angleY;
		pushMatrix();
		mdlMatrix.translate(0.0,2.05,0.0);
		mdlMatrix.translate(0.0,updown,0.0);
		mdlMatrix.translate(cameraX1,0.0,0.0);
		mdlMatrix.translate(0.0,0.0,cameraZ1);
	
		mdlMatrix.rotate(firstrotataeX, 0, 1, 0);//for mouse rotation
		mdlMatrix.rotate(firstrotataeY, 1, 0, 0);//for mouse rotation
		mdlMatrix.scale(50.0,50.0,50.0);
		draw(astronaut,mdlMatrix,0.9,0.7,0.0,1.0,1.0,flag,vpMatrix);
		popMatrix();	
	}
	
	//spaceship
	pushMatrix();

	mdlMatrix.translate(0.09,5.982,-4.0);
	mdlMatrix.scale(0.8,0.8,0.8);
	mdlMatrix.rotate(1,0.1,0.0,0.1);
	draw(spaceship,mdlMatrix,0.9,0.7,0.0,1.0,2.0,flag,vpMatrix);
	popMatrix();
	
		
	//light
	pushMatrix();
	mdlMatrix.translate(0, 10, 10);
	mdlMatrix.scale(0.25,0.25,0.25);
	draw(sphere,mdlMatrix,1.0,1.0,1.0,1.0,-1.0,flag,vpMatrix);
	popMatrix();
		
}

var cameraX = 0, cameraY = 0, cameraZ = 10;
var cameraX1 = 0, cameraY1 = 3.1, cameraZ1 = 2;
var cameraDirX = 1, cameraDirY = 0, cameraDirZ = 1;
var cameraDirX1 = 1, cameraDirY1 = 0, cameraDirZ1 = 10;
function draw(ob, mdlMatrix, colorR, colorG, colorB, normal, tex, f, vpMatrix, mvpFromLight){	
		gl.useProgram(program);
		modelMatrix.setIdentity();
		modelMatrix.multiply(mdlMatrix);
		mvpMatrix.set(vpMatrix);

		mvpMatrix.multiply(modelMatrix);
	
		//normal matrix
		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();	
		
		gl.uniform3f(program.u_LightPosition, 0, 10, 10);

		if(normalMode){
			gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
		}
		else{
			gl.uniform3f(program.u_ViewPosition, cameraX1, cameraY1, cameraZ1);
		
		}
		gl.uniform1f(program.u_Ka, 0.4);
		gl.uniform1f(program.u_Kd, 0.8);
		gl.uniform1f(program.u_Ks, 1.0);
		gl.uniform1f(program.u_shininess, 20.0);
		gl.uniform3f(program.u_Color, colorR, colorG, colorB);
		gl.uniform1f(program.u_normalMode, normal);
		gl.uniform1f(program.tex, tex);
	//*********************************************************************************/////
				
		gl.activeTexture(gl.TEXTURE1);		
		gl.uniform1i(program.u_Sampler1, 1);
		gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[1]]);
				
		gl.activeTexture(gl.TEXTURE2);		
		gl.uniform1i(program.u_Sampler2, 2);
		gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[2]]);
		
		gl.activeTexture(gl.TEXTURE3);
		gl.uniform1i(program.u_Sampler3, 3);
		gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[3]]);	
		
		gl.activeTexture(gl.TEXTURE4);
		gl.uniform1i(program.u_Sampler4, 4);
		gl.bindTexture(gl.TEXTURE_2D, textures[objCompImgIndex[4]]);	

		gl.activeTexture(gl.TEXTURE5);		
		gl.uniform1i(program.u_Sampler5, 5);
		gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
		
	//********************************************************************************/////
	
		gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
		gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
		gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);
	
		for( let i=0; i < ob.length; i ++ ){
			initAttributeVariable(gl, program.a_Position, ob[i].vertexBuffer);
			initAttributeVariable(gl, program.a_Normal, ob[i].normalBuffer);
			if(tex>=0.0){
				initAttributeVariable(gl, program.a_TexCoord, ob[i].texCoordBuffer);
			}
			if(normal==0){
				initAttributeVariable(gl, program.a_Tagent, ob[i].tagentsBuffer);
				initAttributeVariable(gl, program.a_Bitagent, ob[i].bitagentsBuffer);
				initAttributeVariable(gl, program.a_crossTexCoord, ob[i].crossTexCoordsBuffer);
			}
			gl.drawArrays(gl.TRIANGLES, 0, ob[i].numVertices);
		}
}
function drawEnvMap(){
	if(normalMode){
		let rotateMatrix = new Matrix4();
		rotateMatrix.setRotate(yy, 1, 0, 0);//for mouse rotation
		rotateMatrix.rotate(xx, 0, 1, 0);//for mouse rotation
		
		var viewDir= new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
		var newViewDir = rotateMatrix.multiplyVector3(viewDir);
		var vpFromCamera = new Matrix4();
		vpFromCamera.setPerspective(70, 1, 1, 100);
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
	else{
		let rotateMatrix = new Matrix4();
		rotateMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
		rotateMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation
		
		var viewDir= new Vector3([cameraDirX1, cameraDirY1, cameraDirZ1]);
		var newViewDir = rotateMatrix.multiplyVector3(viewDir);
		var vpFromCamera = new Matrix4();
		vpFromCamera.setPerspective(60, 1, 1, 15);
		var viewMatrixRotationOnly = new Matrix4();
		viewMatrixRotationOnly.lookAt(cameraX1, cameraY1, cameraZ1, 
										cameraX1 + newViewDir.elements[0], 
										cameraY1 + newViewDir.elements[1], 
										cameraZ1 + newViewDir.elements[2], 
										0, 1, 0);
		//viewMatrixRotationOnly.lookAt(cameraX, cameraY, cameraZ,0,0,0,0,1,0);
		viewMatrixRotationOnly.elements[12] = 0; //ignore translation
		viewMatrixRotationOnly.elements[13] = 0;
		viewMatrixRotationOnly.elements[14] = 0;
		vpFromCamera.multiply(viewMatrixRotationOnly);
		var vpFromCameraInverse = vpFromCamera.invert();
		
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
}
//dynamic reflection++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function renderCubeMap(camX, camY, camZ)
{
	//camera 6 direction to render 6 cubemap faces
	var ENV_CUBE_LOOK_DIR = [
		[1.0, 0.0, 0.0],
		[-1.0, 0.0, 0.0],
		[0.0, 1.0, 0.0],
		[0.0, -1.0, 0.0],
		[0.0, 0.0, 1.0],
		[0.0, 0.0, -1.0]
	];
	
	//camera 6 look up vector to render 6 cubemap faces
	var ENV_CUBE_LOOK_UP = [
		[0.0, -1.0, 0.0],
		[0.0, -1.0, 0.0],
		[0.0, 0.0, 1.0],
		[0.0, 0.0, -1.0],
		[0.0, -1.0, 0.0],
		[0.0, -1.0, 0.0]
	];
	
	gl.useProgram(program);
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.viewport(0, 0, canvas.width, canvas.width);
	gl.clearColor(0.4, 0.4, 0.4,1);
	
	for (var side = 0; side < 6;side++){
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
								gl.TEXTURE_CUBE_MAP_POSITIVE_X+side, fbo.texture, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		let vpMatrix = new Matrix4();
		vpMatrix.setPerspective(90, 1, 1, 100);
		vpMatrix.lookAt(camX, camY, camZ,   
						camX + ENV_CUBE_LOOK_DIR[side][0], 
						camY + ENV_CUBE_LOOK_DIR[side][1],
						camZ + ENV_CUBE_LOOK_DIR[side][2], 
						ENV_CUBE_LOOK_UP[side][0],
						ENV_CUBE_LOOK_UP[side][1],
						ENV_CUBE_LOOK_UP[side][2]);

		change(vpMatrix,1.0);
	
		//Draw the reflective cube
		gl.useProgram(refractionprogram);
		gl.depthFunc(gl.LESS);
		var projMatrix = new Matrix4();
		projMatrix.setPerspective(70, 1, 1, 100);
		var modelMatrix = new Matrix4();
		modelMatrix.setScale(0.8, 0.8, 0.8);
		modelMatrix.translate(5.0, 2.0, 8.0);
		modelMatrix.rotate(rotateAngle1*0.5, 1, 1, 1); //make the cube rotate
		//mvp: projection * view * model matrix  
		var mvpMatrix = new Matrix4();
		mvpMatrix.multiply(vpMatrix).multiply(modelMatrix);
		
		//normal matrix
		var normalMatrix = new Matrix4();
		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();
		
		gl.uniform3f(refractionprogram.u_ViewPosition, cameraX, cameraY, cameraZ);
		gl.uniform1i(refractionprogram.u_envCubeMap, 0);
		
		gl.activeTexture(gl.TEXTURE7);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTex);
		
		gl.uniformMatrix4fv(refractionprogram.u_MvpMatrix, false, mvpMatrix.elements);
		gl.uniformMatrix4fv(refractionprogram.u_modelMatrix, false, modelMatrix.elements);
		gl.uniformMatrix4fv(refractionprogram.u_normalMatrix, false, normalMatrix.elements);
		
		for( let i=0; i < cubeObj.length; i ++ ){
			initAttributeVariable(gl, refractionprogram.a_Position, cubeObj[i].vertexBuffer);
			initAttributeVariable(gl, refractionprogram.a_Normal, cubeObj[i].normalBuffer);
			gl.drawArrays(gl.TRIANGLES, 0, cubeObj[i].numVertices);
		}
	
	
		var vpFromCameraInverse = vpMatrix.invert();
	
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
  
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

}
function drawObjectWithDynamicReflection(obj, modelMatrix, vpMatrix, colorR, colorG, colorB){
	if(normalMode){
		gl.useProgram(programTextureOnCube);
		let mvpMatrix = new Matrix4();
		let normalMatrix = new Matrix4();
		mvpMatrix.set(vpMatrix);
		mvpMatrix.multiply(modelMatrix);
		
		//normal matrix
		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();
		
		gl.uniform3f(programTextureOnCube.u_ViewPosition, cameraX, cameraY, cameraZ);
		gl.uniform3f(programTextureOnCube.u_Color, colorR, colorG, colorB);
		
		gl.uniformMatrix4fv(programTextureOnCube.u_MvpMatrix, false, mvpMatrix.elements);
		gl.uniformMatrix4fv(programTextureOnCube.u_modelMatrix, false, modelMatrix.elements);
		gl.uniformMatrix4fv(programTextureOnCube.u_normalMatrix, false, normalMatrix.elements);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, fbo.texture);
		gl.uniform1i(programTextureOnCube.u_envCubeMap, 0);
		
		for( let i=0; i < obj.length; i ++ ){
			initAttributeVariable(gl, programTextureOnCube.a_Position, obj[i].vertexBuffer);
			initAttributeVariable(gl, programTextureOnCube.a_Normal, obj[i].normalBuffer);
			gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
		}
	}
	else{
		gl.useProgram(programTextureOnCube);
		let mvpMatrix = new Matrix4();
		let normalMatrix = new Matrix4();
		mvpMatrix.set(vpMatrix);
		mvpMatrix.multiply(modelMatrix);
		
		//normal matrix
		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();
		
		gl.uniform3f(programTextureOnCube.u_ViewPosition, cameraX1, cameraY1, cameraZ1);
		gl.uniform3f(programTextureOnCube.u_Color, colorR, colorG, colorB);
		
		gl.uniformMatrix4fv(programTextureOnCube.u_MvpMatrix, false, mvpMatrix.elements);
		gl.uniformMatrix4fv(programTextureOnCube.u_modelMatrix, false, modelMatrix.elements);
		gl.uniformMatrix4fv(programTextureOnCube.u_normalMatrix, false, normalMatrix.elements);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, fbo.texture);
		gl.uniform1i(programTextureOnCube.u_envCubeMap, 0);
		
		for( let i=0; i < obj.length; i ++ ){
			initAttributeVariable(gl, programTextureOnCube.a_Position, obj[i].vertexBuffer);
			initAttributeVariable(gl, programTextureOnCube.a_Normal, obj[i].normalBuffer);
			gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
		}
	}
}
function initFrameBufferForCubemapRendering(gl){
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	
	// 6 2D textures
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	for (let i = 0; i < 6; i++) {
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 
					gl.RGBA, offScreenWidth, offScreenHeight, 0, gl.RGBA, 
					gl.UNSIGNED_BYTE, null);
	}
	
	//create and setup a render buffer as the depth buffer
	var depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 
							offScreenWidth, offScreenHeight);
	
	//create and setup framebuffer: linke the depth buffer to it (no color buffer here)
	var frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
								gl.RENDERBUFFER, depthBuffer);
	
	frameBuffer.texture = texture;
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	return frameBuffer;
}

//dynamic reflection++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

///////////////////////////////////////////////////////////////////////////////////////////////

function drawcamera(){

	if(normalMode){
		//gl.useProgram(shadowProgram);
		//gl.bindFramebuffer(gl.FRAMEBUFFER, shadow);
		gl.viewport(0, 0, offScreenWidth, offScreenHeight);
		gl.clearColor(0.0, 0.0, 0.0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		
		renderCubeMap(0, 1, 15);	
		//gl.bindFramebuffer(gl.FRAMEBUFFER, shadow);
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clearColor(0.4,0.4,0.4,1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		
		let rotateMatrix = new Matrix4();
		rotateMatrix.setRotate(yy, 1, 0, 0);//for mouse rotation
		rotateMatrix.rotate(xx, 0, 1, 0);//for mouse rotation
		var viewDir= new Vector3([cameraDirX, cameraDirY, cameraDirZ]);
		var newViewDir = rotateMatrix.multiplyVector3(viewDir);
		let vpMatrix = new Matrix4();
			
		vpMatrix.setPerspective(70, 1, 1, 100);
		vpMatrix.lookAt(cameraX, cameraY, cameraZ,   
						cameraX + newViewDir.elements[0], 
						cameraY + newViewDir.elements[1],
						cameraZ + newViewDir.elements[2], 
						0, 1, 0);

		change(vpMatrix,1.0);
		
		//the sphere
		let mdlMatrix = new Matrix4();
		mdlMatrix.setScale(0.5, 0.5, 0.5);
		mdlMatrix.translate(0.0, 5.0, 30.0);
		
		//Draw the reflective cube
		gl.useProgram(refractionprogram);
		gl.depthFunc(gl.LESS);

		var projMatrix = new Matrix4();
		projMatrix.setPerspective(70, 1, 1, 100);
		var modelMatrix = new Matrix4();
		modelMatrix.setScale(0.8, 0.8, 0.8);
		modelMatrix.translate(8.0, 2.0, 9.0);
		modelMatrix.rotate(rotateAngle1*0.5, 1, 1, 1); //make the cube rotate
		//mvp: projection * view * model matrix  
		var mvpMatrix = new Matrix4();
		//mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
		mvpMatrix.multiply(vpMatrix).multiply(modelMatrix);
		
		//normal matrix
		var normalMatrix = new Matrix4();
		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();
		
		gl.uniform3f(refractionprogram.u_ViewPosition, cameraX, cameraY, cameraZ);
		gl.uniform1i(refractionprogram.u_envCubeMap, 0);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTex);
		
		gl.uniformMatrix4fv(refractionprogram.u_MvpMatrix, false, mvpMatrix.elements);
		gl.uniformMatrix4fv(refractionprogram.u_modelMatrix, false, modelMatrix.elements);
		gl.uniformMatrix4fv(refractionprogram.u_normalMatrix, false, normalMatrix.elements);
		
		for( let i=0; i < cubeObj.length; i ++ ){
			initAttributeVariable(gl, refractionprogram.a_Position, cubeObj[i].vertexBuffer);
			initAttributeVariable(gl, refractionprogram.a_Normal, cubeObj[i].normalBuffer);
			gl.drawArrays(gl.TRIANGLES, 0, cubeObj[i].numVertices);
		}
		drawEnvMap();
		drawObjectWithDynamicReflection(sphere, mdlMatrix, vpMatrix, 0.95, 0.85, 0.4);
	
	}
	else{
		gl.viewport(0, 0, offScreenWidth, offScreenHeight);
		gl.clearColor(0.0, 0.0, 0.0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		
		renderCubeMap(0, 1, 15);	
	
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clearColor(0.4,0.4,0.4,1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		
		let rotateMatrix = new Matrix4();
		rotateMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
		rotateMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation
		var viewDir= new Vector3([cameraDirX1, cameraDirY1, cameraDirZ1]);
		var newViewDir = rotateMatrix.multiplyVector3(viewDir);
		let vpMatrix = new Matrix4();
			
		vpMatrix.setPerspective(70, 1, 2.05, 100);
		vpMatrix.lookAt(cameraX1, cameraY1, cameraZ1,   
						cameraX1 + newViewDir.elements[0], 
						cameraY1 + newViewDir.elements[1],
						cameraZ1 + newViewDir.elements[2], 
						0, 1, 0);
	
		change(vpMatrix,1.0/*,newViewDir*/);
		
		//the sphere
		let mdlMatrix = new Matrix4();
		mdlMatrix.setScale(0.5, 0.5, 0.5);
		mdlMatrix.translate(0.0, 5.0, 30.0);
		
		//Draw the reflective cube
		gl.useProgram(refractionprogram);
		gl.depthFunc(gl.LESS);

		var projMatrix = new Matrix4();
		projMatrix.setPerspective(70, 1, 1, 100);
		var modelMatrix = new Matrix4();
		modelMatrix.setScale(0.8, 0.8, 0.8);
		modelMatrix.translate(8.0, 2.0, 9.0);
		modelMatrix.rotate(rotateAngle1*0.5, 1, 1, 1); //make the cube rotate
		//mvp: projection * view * model matrix  
		var mvpMatrix = new Matrix4();
		mvpMatrix.multiply(vpMatrix).multiply(modelMatrix);
		
		//normal matrix
		var normalMatrix = new Matrix4();
		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();
		
		gl.uniform3f(refractionprogram.u_ViewPosition, cameraX1, cameraY1, cameraZ1);
		gl.uniform1i(refractionprogram.u_envCubeMap, 0);
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTex);
		
		gl.uniformMatrix4fv(refractionprogram.u_MvpMatrix, false, mvpMatrix.elements);
		gl.uniformMatrix4fv(refractionprogram.u_modelMatrix, false, modelMatrix.elements);
		gl.uniformMatrix4fv(refractionprogram.u_normalMatrix, false, normalMatrix.elements);
		
		for( let i=0; i < cubeObj.length; i ++ ){
			initAttributeVariable(gl, refractionprogram.a_Position, cubeObj[i].vertexBuffer);
			initAttributeVariable(gl, refractionprogram.a_Normal, cubeObj[i].normalBuffer);
			gl.drawArrays(gl.TRIANGLES, 0, cubeObj[i].numVertices);
		}
		drawEnvMap();
		drawObjectWithDynamicReflection(sphere, mdlMatrix, vpMatrix, 0.95, 0.85, 0.4);	
	}
}

function initFrameBuffer(gl){
  //create and set up a texture object as the color buffer
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 800, 800,
					0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	
	
	//create and setup a render buffer as the depth buffer
	var depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 
							800, 800);
	
	//create and setup framebuffer: linke the color and depth buffer to it
	var frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
								gl.TEXTURE_2D, texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
								gl.RENDERBUFFER, depthBuffer);
	frameBuffer.texture = texture;
	return frameBuffer;
}

//****************************************************************************
function calculateTangentSpace(position, texcoord){
  //iterate through all triangles
  let tagents = [];
  let bitagents = [];
  let crossTexCoords = [];
  for( let i = 0; i < position.length/9; i++ ){
    let v00 = position[i*9 + 0];
    let v01 = position[i*9 + 1];
    let v02 = position[i*9 + 2];
    let v10 = position[i*9 + 3];
    let v11 = position[i*9 + 4];
    let v12 = position[i*9 + 5];
    let v20 = position[i*9 + 6];
    let v21 = position[i*9 + 7];
    let v22 = position[i*9 + 8];
    let uv00 = texcoord[i*6 + 0];
    let uv01 = texcoord[i*6 + 1];
    let uv10 = texcoord[i*6 + 2];
    let uv11 = texcoord[i*6 + 3];
    let uv20 = texcoord[i*6 + 4];
    let uv21 = texcoord[i*6 + 5];

    let deltaPos10 = v10 - v00;
    let deltaPos11 = v11 - v01;
    let deltaPos12 = v12 - v02;
    let deltaPos20 = v20 - v00;
    let deltaPos21 = v21 - v01;
    let deltaPos22 = v22 - v02;

    let deltaUV10 = uv10 - uv00;
    let deltaUV11 = uv11 - uv01;
    let deltaUV20 = uv20 - uv00;
    let deltaUV21 = uv21 - uv01;

    let r = 1.0 / (deltaUV10 * deltaUV21 - deltaUV11 * deltaUV20);
    for( let j=0; j< 3; j++ ){
      crossTexCoords.push( (deltaUV10 * deltaUV21 - deltaUV11 * deltaUV20) );
    }
    let tangentX = (deltaPos10 * deltaUV21 - deltaPos20 * deltaUV11)*r;
    let tangentY = (deltaPos11 * deltaUV21 - deltaPos21 * deltaUV11)*r;
    let tangentZ = (deltaPos12 * deltaUV21 - deltaPos22 * deltaUV11)*r;
    for( let j = 0; j < 3; j++ ){
      tagents.push(tangentX);
      tagents.push(tangentY);
      tagents.push(tangentZ);
    }
    let bitangentX = (deltaPos20 * deltaUV10 - deltaPos10 * deltaUV20)*r;
    let bitangentY = (deltaPos21 * deltaUV10 - deltaPos11 * deltaUV20)*r;
    let bitangentZ = (deltaPos22 * deltaUV10 - deltaPos12 * deltaUV20)*r;
    for( let j = 0; j < 3; j++ ){
      bitagents.push(bitangentX);
      bitagents.push(bitangentY);
      bitagents.push(bitangentZ);
    }
  }
  let obj = {};
  obj['tagents'] = tagents;
  obj['bitagents'] = bitagents;
  obj['crossTexCoords'] = crossTexCoords;
  return obj;
}
//****************************************************************************

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
	
		if(!normalMode){
			angleX += dx; //yes, x for y, y for x, this is right
			angleY += dy;
		}
		else{
			xx += dx; //yes, x for y, y for x, this is right
			yy += dy;
		}
		
		
    }
    mouseLastX = x;
    mouseLastY = y;

	drawcamera();
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
		if(normalMode){
			cameraZ -= (newViewDir.elements[2] * 0.1);
		}
		else{
			cameraZ1 += (newViewDir.elements[2] * 0.1);
		}
	}
	else if(ev.key == 's'){ 
		if(normalMode){
			cameraZ += (newViewDir.elements[2] * 0.1);
		}
		else{
			cameraZ1 -= (newViewDir.elements[2] * 0.1);
		}
	}
	else if(ev.key=='a'){
		if(normalMode){
			cameraX -= (newViewDir.elements[0] * 0.1);
		}
		else{
			cameraX1 += (newViewDir.elements[0] * 0.1);
		}
	}
	else if(ev.key=='d'){
		if(normalMode){
			cameraX += (newViewDir.elements[0] * 0.1);
		}
		else{
			cameraX1 -= (newViewDir.elements[0] * 0.1);
		}
	}

	else if(ev.key=='i'){
		if(!normalMode){
			cameraY1 += (newViewDir.elements[0] * 0.1);
			updown+=0.1;
		}
		else{
			cameraY += (newViewDir.elements[0] * 0.1);
		}	
	}
	else if(ev.key=='k'){
		if(!normalMode){
			cameraY1 -= (newViewDir.elements[0] * 0.1);
			updown-=0.1;
		}	
		else{
			cameraY -= (newViewDir.elements[0] * 0.1);
		}		
	}
	else if(ev.key=='z'){
		normalMode = !normalMode;
		xxx=angleX;yyy=angleY;
	}
	
	drawcamera();
}

function initCubeTexture(posXName, negXName, posYName, negYName, 
                         posZName, negZName, imgWidth, imgHeight)
{
  var texture1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture1);

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
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture1);
      gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    };
    image.src = fName;
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  return texture1;
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
  if( texCount == numTextures)drawcamera();//change();////i already load all the textures so i draw 
}
