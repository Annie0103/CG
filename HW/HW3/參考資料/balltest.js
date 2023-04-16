/*var halfcirclevertices=[];
	let fan=30;
	let r=0.5;
	var latitudeBands = 30;
    var longitudeBands = 30;
	let t=((Math.PI)/(fan/2));	
	for(let i=0; i<=latitudeBands/2; i++){
		var theta = i * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
		
		for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
			//计算φ角度
               var phi = longNumber * 2 * Math.PI / longitudeBands;
               var sinPhi = Math.sin(phi);
               var cosPhi = Math.cos(phi);
			//计算顶点的x,y,z坐标
               var x = r * cosPhi * sinTheta;
               var y = r * cosTheta;
               var z = r * sinPhi * sinTheta;
			//贴图是矩形的，我们将贴图在X轴上按照经线划分，在Y轴上按照纬线划分，来计算顶点对应的贴图U，V坐标
               var u = longNumber / longitudeBands;
               var v = i / latitudeBands;
			
			
               //textureCoordData.push(u);
               //textureCoordData.push(v);
               //halfcirclevertices.push(u);
			   //halfcirclevertices.push(v);
			   halfcirclevertices.push(x);
               halfcirclevertices.push(y);
               halfcirclevertices.push(z);
			   
			   
           }
		
		//halfcirclevertices.push([0],[0],[0],
		//[r*(Math.cos(t*i))],[r*Math.sin(t*i)],[r*Math.PI],
		//[r*(Math.cos(t*(i+1)))],[r*Math.sin(t*(i+1))],[r*Math.PI]);//半圓 點
	}*/
	//let g = initVertexBufferForLaterUse(gl, halfcirclevertices, cubeNormals, null);
    //halfcircle.push(g);
	
	
	/*for(let i=0; i<(fan/2)*3; i++){
		halfcirclevertices.push([r*Math.sin(t)*Math.cos(1-t)],[r*Math.sin(-Math.PI+t)],[r*Math.sin(t)*Math.sin(1-t)],
		//[r*(Math.cos(t*i))],[r*Math.sin(t*i)],[],
		//[r*(Math.cos(t*(i+1)))],[r*Math.sin(t*(i+1))],[]
		);//半圓 點
	}*/
	
	
	
	
	
	/*let r=1;
	var SPHERE_DIV=90;
	//var SPHERE_l=90;
	var aj;var ai;
	var	sj;var si;
	var cj;var ci;var a;var b;var c;var ai1;var si1;var ci1;
	var halfcirclevertices=[];
    for (let j = 0; j <= SPHERE_DIV/2; j++){//SPHERE_DIV为经纬线数
		aj = j * Math.PI/SPHERE_DIV;
		sj = Math.sin(aj);
		cj = Math.cos(aj);
		for(i = 0; i <= SPHERE_DIV; i++){
			ai = i * 2 * Math.PI/SPHERE_DIV;
			si = Math.sin(ai);
			ci = Math.cos(ai);
			ai1 = i * 2 * Math.PI/SPHERE_DIV+1;
			si1 = Math.sin(ai);
			ci1 = Math.cos(ai);
			if(j != 0)
			{
				halfcirclevertices.push(si * sj);//point为顶点坐标
				halfcirclevertices.push(cj);//
				halfcirclevertices.push(ci * sj);//Y
			}
			if(j != (Math.PI/SPHERE_DIV-1))
			{
				halfcirclevertices.push(si * sj);//point为顶点坐标
				halfcirclevertices.push(cj);
				halfcirclevertices.push(ci * sj);
			}
			
		}
		a=aj;b=sj;c=cj;
	}
	
	
	var k1;var k2;
	var indices=[];
	for(let i=0;i<( Math.PI/SPHERE_DIV);++i){
		k1=i*(Math.PI/SPHERE_DIV+1);
		k2=k1+(Math.PI/SPHERE_DIV+1);
		for(int j = 0; j < sectorCount; ++j, ++k1, ++k2)
		{
			// 2 triangles per sector excluding first and last stacks
			// k1 => k2 => k1+1
			if(i != 0)
			{
				indices.push(k1);
				indices.push(k2);
				indices.push(k1 + 1);
			}
	
			// k1+1 => k2 => k2+1
			if(i != (Math.PI/SPHERE_DIV-1))
			{
				indices.push(k1 + 1);
				indices.push(k2);
				indices.push(k2 + 1);
			}
		}
	}
	
	*/
	
	
	
	
	
	
	
	
	
	
	/*var indexData = [];
        for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                /*indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);
 
                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);*
				halfcircle.push(first);
                halfcircle.push(second);
                halfcircle.push(first + 1);
				
                halfcircle.push(second);
                halfcircle.push(second + 1);
                halfcircle.push(first + 1);
            }
        }
	
	*/