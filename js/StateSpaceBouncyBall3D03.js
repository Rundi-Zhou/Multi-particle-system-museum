var gl;
var g_canvas;

// conditionals
control0 = true;
control1 = false;
control2 = false;
control3 = false;
control4 = false;
control11 = true;
control12 = true;
control13 = true;
control14 = true;
var hasWall = true;
var hasBall = true;

worldBox = new VBObox1();
partBox1 = new VBObox2();
partBox2 = new VBObox3();
partBox3 = new VBObox4();
partBox4 = new VBObox5();
partBox11 = new VBObox11();
partBox12 = new VBObox12();
partBox13 = new VBObox13();
partBox14 = new VBObox14();

var g_timeStep = 1000.0/100.0;  // milliseconds
var g_timeStepMin = g_timeStep;
var g_timeStepMax = g_timeStep;
var g_stepCount = 0;

var g_last = Date.now();

// View & Projection
var eyeX = 0.0;
var eyeY = 5.5;
var eyeZ = 1.0;
var atX = 0.0;
var atY = 0;
var atZ = 0.8;
var theta = 0.0;  // turn camera horizontally to angle theta
var r = eyeY-atY;  // radius of camera cylinder
var tilt = 0.0;

var isClear = 1;
var runMode = 3;  // 0: reset; 1: pause; 2: step; 3: run

// Mouse click and drag
var isDrag=false;
var xMclik=0.0;
var yMclik=0.0;   
var xMdragTot=0;
var yMdragTot=0; 


function main() {
    g_canvas = document.getElementById('webgl');
    gl = g_canvas.getContext("webgl", { preserveDrawingBuffer: true});

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    worldBox.init(gl);
    partBox1.init(gl);
    partBox2.init(gl);
    partBox3.init(gl);
    partBox4.init(gl);
    partBox11.init(gl);
    partBox12.init(gl);
    partBox12.pSys.removeAddForce([F_FLOCK2, F_GRAV_E, F_DRAG]);
    partBox13.init(gl);
    partBox13.pSys.removeAddForce([F_TORNADO]); partBox13.pSys.removeAddWall([WTYPE_TORNADO]);
    partBox14.init(gl);


    // Event register
    window.addEventListener("mousedown", myMouseDown);
    window.addEventListener("mousemove", myMouseMove);
    window.addEventListener("mouseup", myMouseUp);
    window.addEventListener("keydown", myKeyDown, false);



    solverType = SOLV_EX_MIDPOINT
    var form = document.querySelector("form");
    var log = document.querySelector("#log");
    
    form.addEventListener("submit", function(event) {
      data = new FormData(form);
      output = "";
      for (const entry of data) {
        output = entry[1];
      };
      console.log(output);
      if (output == 'Euler') solverType = SOLV_EULER;
      else if (output == 'Implicit-Euler') solverType = SOLV_IM_EULER;
      else if (output == 'Explicit-Midpoint') solverType = SOLV_EX_MIDPOINT;
      else if (output == 'Iter-Implicit-Euler') solverType = SOLV_ITER_IM_EULER;
      else if (output == 'Iter-Implicit-Midpoint') solverType = SOLV_ITER_IM_MIDPOINT;
      else if (output == 'Adams-Bashforth') solverType = SOLV_ADAMS_BASHFORTH;
      else if (output == 'Velocity-Verlet') solverType = SOLV_VEL_VERLET;
      else if (output == 'Semi-Implicit') solverType = SOLV_ME;
      event.preventDefault();
    }, false);






    gl.clearColor(0.3, 0.3, 0.3, 1);
    gl.enable(gl.DEPTH_TEST); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable( gl.BLEND );
    gl.blendFunc( gl.SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA );

    vpMatrix = new Matrix4();

    var tick = function() {
        Kbouncy = document.getElementById('wallElasticity').value;
        springLen = document.getElementById('SpringLength').value;
        springStiffness = document.getElementById('SpringStiffness').value;
        springDamp = document.getElementById('springDamp').value;
        sprMass = document.getElementById('springBallMass').value;
        partBox2.pSys.partCount = document.getElementById('SpringBallNumber').value;
        g_timeStep = animate();
        drawResize();
        requestAnimationFrame(tick, g_canvas);
    };
    tick();
}


function animate() {
    var now = Date.now();	
    var elapsed = now - g_last;	
    g_last = now;
    g_stepCount = (g_stepCount +1)%1000;
    if (elapsed < g_timeStepMin) g_timeStepMin = elapsed;
    else if (elapsed > g_timeStepMax) g_timeStepMax = elapsed;
    return elapsed;
}


function drawResize(){
    var nuCanvas = document.getElementById('webgl');	// get current canvas
    var nuGl = getWebGLContext(nuCanvas);
    
    nuCanvas.width = innerWidth - 16;
    nuCanvas.height = innerHeight*3/4 - 16;

    drawAll(nuGl);
}


function drawAll() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 3D view setup
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); 
	ratio = gl.drawingBufferWidth/gl.drawingBufferHeight;
	vpMatrix.setPerspective(40, ratio, 1, 100);
    // modelMatrix.setOrtho(-Math.tan(20/180*Math.PI)*33/ratio, Math.tan(20/180*Math.PI)*33/ratio, -Math.tan(20/180*Math.PI)*33, Math.tan(20/180*Math.PI)*33, 1.0, 33.0);  // left, right, bottom, top, near, far
    vpMatrix.lookAt(eyeX,eyeY,eyeZ, atX,atY,atZ, 0.0, 0.0, 1.0);
    
    if (control0){
        worldBox.switchToMe();
        worldBox.adjust();
        worldBox.draw();   
    }
    if (control1){  // bouncy ball
        partBox1.switchToMe();
        partBox1.adjust();
        partBox1.draw();  
    }
    if (control2){  // spring snake
        partBox2.switchToMe();
        partBox2.adjust();
        partBox2.draw();     
    }
    if (control3){  // spring tetrahedron
        partBox3.switchToMe();
        partBox3.adjust();
        partBox3.draw();     
    }
    if (control4){  // fire
        partBox4.switchToMe();
        partBox4.adjust();
        partBox4.draw();     
    }
    if (control11){ 
        partBox11.switchToMe();
        partBox11.adjust();
        partBox11.draw();     
    }
    if (control12){ 
        partBox12.switchToMe();
        partBox12.adjust();
        partBox12.draw();     
    }
    if (control13){ 
        partBox13.switchToMe();
        partBox13.adjust();
        partBox13.draw();     
    }
    if (control14){ 
        partBox14.switchToMe();
        partBox14.adjust();
        partBox14.draw();     
    }
}


//=================Make objects=====================
function makeGroundGrid() {
	var xcount = 100;
	var ycount = 100;
	var xymax	= 50.0;
	var xColr = new Float32Array([1.0, 1.0, 0.3, 0.5]);
	var yColr = new Float32Array([0.3, 1.0, 1.0, 0.5]);

	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						
	var xgap = xymax/(xcount-1);
	var ygap = xymax/(ycount-1);

	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {
			gndVerts[j  ] = -xymax + (v  )*xgap;
			gndVerts[j+1] = -xymax;	
			gndVerts[j+2] = 0.0;
			gndVerts[j+3] = 1.0;
		}
		else {
			gndVerts[j  ] = -xymax + (v-1)*xgap;
			gndVerts[j+1] = xymax;
			gndVerts[j+2] = 0.0;
			gndVerts[j+3] = 1.0;
		}
		gndVerts[j+4] = xColr[0];
		gndVerts[j+5] = xColr[1];
        gndVerts[j+6] = xColr[2];
		gndVerts[j+7] = xColr[3];
	}

	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {
			gndVerts[j  ] = -xymax;
			gndVerts[j+1] = -xymax + (v  )*ygap;
			gndVerts[j+2] = 0.0;
			gndVerts[j+3] = 1.0;
		}
		else {
			gndVerts[j  ] = xymax;
			gndVerts[j+1] = -xymax + (v-1)*ygap;
			gndVerts[j+2] = 0.0;
			gndVerts[j+3] = 1.0;
		}
		gndVerts[j+4] = yColr[0];
		gndVerts[j+5] = yColr[1];
        gndVerts[j+6] = yColr[2];
		gndVerts[j+7] = yColr[3];
	}
}


function makeAxis(){
    axisVerts = new Float32Array([
        0.0,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3, 1.0,
        100.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3, 1.0,
		 
        0.0,  0.0,  0.0, 1.0,       0.3,  1.0,  0.3, 1.0,
        0.0,  100.3,  0.0, 1.0,		0.3,  1.0,  0.3, 1.0,

        0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  1.0, 1.0,
        0.0,  0.0,  100.3, 1.0,		0.3,  0.3,  1.0, 1.0
    ]);
}


function makeCube(){
    cubeVerts = new Float32Array([
        0.0, 0.0, 0.0, 1.0, 1.0, 0.3, 0.3, 0.1,
        0.0, 1.0, 0.0, 1.0, 1.0, 0.3, 0.3, 0.1,
        1.0, 1.0, 0.0, 1.0, 1.0, 0.3, 0.3, 0.1,
        1.0, 0.0, 0.0, 1.0, 1.0, 0.3, 0.3, 0.1
    ]);
}


function makeSpring(){
    var rTube = 0.001;  // radius of the tube we bent to form a torus
    var rBend = 0.1;  // radius of the circle made by tube

    var tubeRings = 23;
    var ringSides = 13;

    var thetaStep = 2*Math.PI/tubeRings;
    var phiHalfStep = Math.PI/ringSides;

    var totCirc = 3;  // How many circles of torus
    var unitHeight = 0.2;  // height of each circle along z axis

    sprVerts = new Float32Array(floatsPerVertex * (2*ringSides*tubeRings) * totCirc);

    for (h = 0,j=0; h < totCirc; h++){

        for(s=0; s<tubeRings; s++) {		// for each 'ring' of the torus:

            for(v=0; v< 2*ringSides; v++, j+=floatsPerVertex) {	// for each vertex in this segment:

                if(v%2==0)	{
                    sprVerts[j  ] = (rBend + rTube*Math.cos((v)*phiHalfStep)) * Math.cos((s)*thetaStep);
                    sprVerts[j+1] = (rBend + rTube*Math.cos((v)*phiHalfStep)) * Math.sin((s)*thetaStep);
                    sprVerts[j+2] = (unitHeight * h) + (s * (unitHeight+rTube*Math.sin((v)*phiHalfStep))/tubeRings);
                    sprVerts[j+3] = 1.0;
                }
                else {
                    sprVerts[j  ] = (rBend + rTube * Math.cos((v-1)*phiHalfStep)) * Math.cos((s+1) * thetaStep);
                    sprVerts[j+1] = (rBend + rTube * Math.cos((v-1)*phiHalfStep)) * Math.sin((s+1)*thetaStep);
                    sprVerts[j+2] = (unitHeight * h) + (s * (unitHeight+rTube*Math.sin((v)*phiHalfStep))/tubeRings);
                    sprVerts[j+3] = 1.0;
                }
                if(v==0 && s!=0) {
                    sprVerts[j+4] = 0.0;
                    sprVerts[j+5] = 0.0;		
                    sprVerts[j+6] = 0.2;		
                }
                else {
                    sprVerts[j+4] = 0;
                    sprVerts[j+5] = 0;
                    sprVerts[j+6] = 0.7;
                }
            }
        }
    }
    startPoint = [sprVerts[0], sprVerts[1], sprVerts[2]];
    endPoint = [sprVerts[sprVerts.length-7], sprVerts[sprVerts.length-6], sprVerts[sprVerts.length-5]];
}


function makeSphere() {
    var slices =12;		
    var sliceVerts	= 21;

    var topColr = new Float32Array([0.0, 0.5, 0.0, 1.0]);
    var botColr = new Float32Array([0.0, 0.7, 0.0, 1.0]);
    var errColr = new Float32Array([0.0, 0.5, 0.0, 1.0]);
    var sliceAngle = Math.PI/slices;	

    sphVerts = new Float32Array(((slices*2*sliceVerts)-2) * floatsPerVertex);
                                
    var cosBot = 0.0;				
    var sinBot = 0.0;				
    var cosTop = 0.0;			
    var sinTop = 0.0;
    var j = 0;					
    var isFirstSlice = 1;		
    var isLastSlice = 0;		
    for(s=0; s<slices; s++) {	
        if(s==0) {
            isFirstSlice = 1;		
            cosBot =  0.0; 		
            sinBot = -1.0;		
        }
        else {					
            isFirstSlice = 0;	
            cosBot = cosTop;
            sinBot = sinTop;
        }						
        cosTop = Math.cos((-Math.PI/2) +(s+1)*sliceAngle); 
        sinTop = Math.sin((-Math.PI/2) +(s+1)*sliceAngle);
        if(s==slices-1) isLastSlice=1;
        for(v=isFirstSlice;    v< 2*sliceVerts-isLastSlice;   v++,j+=floatsPerVertex)
        {					
            if(v%2 ==0) { 
                sphVerts[j  ] = cosBot * Math.cos(Math.PI * v/sliceVerts);	
                sphVerts[j+1] = cosBot * Math.sin(Math.PI * v/sliceVerts);	
                sphVerts[j+2] = sinBot;																			// z
                sphVerts[j+3] = 1.0;																				// w.				
            }
            else {	
                sphVerts[j  ] = cosTop * Math.cos(Math.PI * (v-1)/sliceVerts); 
                sphVerts[j+1] = cosTop * Math.sin(Math.PI * (v-1)/sliceVerts);
                sphVerts[j+2] = sinTop;		
                sphVerts[j+3] = 1.0;	
            }
            if(v==0) { 	
                sphVerts[j+4]=errColr[0]; 
                sphVerts[j+5]=errColr[1]; 
                sphVerts[j+6]=errColr[2];
                sphVerts[j+7]=errColr[3];				
                }
            else if(isFirstSlice==1) {	
                sphVerts[j+4]=botColr[0]; 
                sphVerts[j+5]=botColr[1]; 
                sphVerts[j+6]=botColr[2];	
                sphVerts[j+7]=errColr[3];				
                }
            else if(isLastSlice==1) {
                sphVerts[j+4]=topColr[0]; 
                sphVerts[j+5]=topColr[1]; 
                sphVerts[j+6]=topColr[2];	
                sphVerts[j+7]=topColr[3];	
            }
            else {	
                sphVerts[j+4]= j/5000; 
                sphVerts[j+5]= 1-j/5000;	
                sphVerts[j+6]= 1-j/5000;	
                sphVerts[j+7]= 1.0;	
            }
        }
    }
}   


function drawBall(modelMatrix, u_ModelMatrix){

    if (runMode > 1){
        if (runMode == 2) runMode = 1;  // do one step
        // 1) DotFinder(): Find s0Dot from s0 & f0. 
        pSys.applyAllForces(pSys.S0, pSys.F0);
        pSys.dotMaker(pSys.S0dot, pSys.S0, g_timeStep);

        //2) Solver(): Find s1 from s0 & s0dot
        pSys.solver(g_timeStep, pSys.S0, pSys.S0dot, pSys.S1);

        // 3) Apply all constraints
        pSys.doConstraints(pSys.S1, pSys.S0, pSys.C0);
    
        // 4) Render
        pSys.drawMe(pSys.S0, modelMatrix, u_ModelMatrix);

        // 5) Swap
        [pSys.S0, pSys.S1] = pSys.stateVecSwap(pSys.S0, pSys.S1);
    }
    else{  // paused. Only draw current state
        pSys.drawMe(pSys.S0, modelMatrix, u_ModelMatrix);
    }
}


function drawGroundGrid(modelMatrix, u_ModelMatrix){  
    modelMatrix.scale( 0.1, 0.1, 0.1);	
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.LINES, gndStart/7, gndVerts.length/7);
}


function drawAxis(modelMatrix, u_ModelMatrix){
	modelMatrix.scale(0.1, 0.1, 0.1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.LINES, axisStart/floatsPerVertex, axisVerts.length/floatsPerVertex);
}


function drawCube(modelMatrix, u_ModelMatrix){
    

        modelMatrix.rotate(90, 1.0, 0.0, 0.0); // rotate ball axis

        // back
        pushMatrix(modelMatrix);
        modelMatrix.scale(2.0, 1.8, 2.0);
        modelMatrix.translate(-0.5, 0.0, 0.5);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawArrays(gl.LINE_LOOP, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);

        // right
        //modelMatrix = popMatrix();
        //pushMatrix(modelMatrix);
        //modelMatrix.scale(2.0, 2.0, 1.0);
        //modelMatrix.translate(-1.0, 0.0, 0.4);
        modelMatrix.rotate(90.0, 0.0, 1.0, 0.0);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawArrays(gl.LINE_LOOP, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);

        // left
        //modelMatrix = popMatrix();
        //pushMatrix(modelMatrix);
        //modelMatrix.scale(1.0, 1.8, 5.0);
        modelMatrix.translate(1.0, 0.0, 1.0);
        modelMatrix.rotate(90.0, 0.0, 1.0, 0.0);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawArrays(gl.LINE_LOOP, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);

        // up
        modelMatrix = popMatrix();
        modelMatrix.scale(2.0,1.8,2.0);
        //modelMatrix.scale(2.0, 1.8, 5.0);
        modelMatrix.translate(0.5, 0.0, 0.5);
        modelMatrix.rotate(90.0, 0.0, 1.0, 0.0);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawArrays(gl.LINE_LOOP, cubeStart/floatsPerVertex, cubeVerts.length/floatsPerVertex);   
    
}


function drawSpring(pSys, modelMatrix, u_ModelMatrix){

    if (runMode > 1){
        if (runMode == 2) runMode = 1;  // do one step

        // 1) DotFinder(): Find s0Dot from s0 & f0. 
        pSys.applyAllForces(pSys.S0, pSys.F0);
        pSys.dotMaker(pSys.S0dot, pSys.S0, g_timeStep);

        //2) Solver(): Find s1 from s0 & s0dot
        pSys.solver(g_timeStep, pSys.S0, pSys.S0dot, pSys.S1);

        // 3) Apply all constraints
        pSys.doConstraints(pSys.S1, pSys.S0, pSys.C0);
    
        // 4) Render
        partBox2.isPoint = 0;
        pSys.drawMe(pSys.S0, modelMatrix, u_ModelMatrix, gl.LINE_LOOP);
        partBox2.isPoint = 1; // Points
        gl.drawArrays(gl.POINTS, 0, pSys.partCount);

        // 5) Swap
        [pSys.S0, pSys.S1] = pSys.stateVecSwap(pSys.S0, pSys.S1);
    }
    else{  // paused. Only draw current state
        pSys.drawMe(pSys.S0, modelMatrix, u_ModelMatrix, gl.LINES);
    }
}




function drawSpring2(pSys, modelMatrix, u_ModelMatrix){

    if (runMode > 1){
        if (runMode == 2) runMode = 1;  // do one step

        // 1) DotFinder(): Find s0Dot from s0 & f0. 
        pSys.applyAllForces(pSys.S0, pSys.F0);
        pSys.dotMaker(pSys.S0dot, pSys.S0, g_timeStep);

        //2) Solver(): Find s1 from s0 & s0dot
        pSys.solver(g_timeStep, pSys.S0, pSys.S0dot, pSys.S1);

        // 3) Apply all constraints
        pSys.doConstraints(pSys.S1, pSys.S0, pSys.C0);
    
        // 4) Render
        partBox11.isPoint = 0;
        pSys.drawMe(pSys.S0, modelMatrix, u_ModelMatrix, gl.LINE_LOOP);
        partBox11.isPoint = 1; // Points
        gl.drawArrays(gl.POINTS, 0, pSys.partCount);

        // 5) Swap
        [pSys.S0, pSys.S1] = pSys.stateVecSwap(pSys.S0, pSys.S1);
    }
    else{  // paused. Only draw current state
        pSys.drawMe(pSys.S0, modelMatrix, u_ModelMatrix, gl.LINES);
    }
}





function drawSphere(modelMatrix, u_ModelMatrix){
    if (hasBall){
        modelMatrix.translate(pBallCenter[0], pBallCenter[1], pBallCenter[2]);
        modelMatrix.scale(pBallRadius, pBallRadius, pBallRadius);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawArrays(gl.TRIANGLE_STRIP, sphStart/floatsPerVertex, sphVerts.length/floatsPerVertex);
    }
}


function drawSphere2(modelMatrix, u_ModelMatrix){
    modelMatrix.translate(2.0,0.0,1.0);
        //modelMatrix.scale(pBallRadius, pBallRadius, pBallRadius);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.LINE_LOOP, sphStart/floatsPerVertex, sphVerts.length/floatsPerVertex);
    
}

function drawCylinder(modelMatrix, u_ModelMatrix){
    modelMatrix.scale(1, 1, 0.9);
    modelMatrix.translate(-2.0,0.0,1.0);
    //modelMatrix.scale(1, 1, 0.8);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.LINES, cylStart/floatsPerVertex, cylVerts.length/floatsPerVertex);
}


//====================Control========================
function myKeyDown(ev) {
    switch(ev.code){
		case "ArrowLeft":
            // camera move left
            eyeX += 0.1*Math.cos(theta*Math.PI/180);
            eyeY += 0.1*Math.sin(theta*Math.PI/180);
            atX += 0.1*Math.cos(theta*Math.PI/180);
            atY += 0.1*Math.sin(theta*Math.PI/180);
            break;

        case "ArrowRight":
            // camera move right
            eyeX -= 0.1*Math.cos(theta*Math.PI/180);
            eyeY -= 0.1*Math.sin(theta*Math.PI/180);
            atX -= 0.1*Math.cos(theta*Math.PI/180);
            atY -= 0.1*Math.sin(theta*Math.PI/180);
            break;

        case "ArrowUp":
            atZ += 0.1;
            eyeZ += 0.1;
            break;
        
        case "ArrowDown":
            atZ -= 0.1;
            eyeZ -= 0.1;
            break;

        case "Equal":
            // camera move foward
            eyeX += 0.1*Math.sin(theta*Math.PI/180);
            atX += 0.1*Math.sin(theta*Math.PI/180); 
            eyeY -= 0.1*Math.cos(theta*Math.PI/180);
            atY -= 0.1*Math.cos(theta*Math.PI/180);
            var tan = (atZ - eyeZ) / (atY - eyeY);
            eyeZ -= 0.1*Math.cos(theta*Math.PI/180) * tan;
            atZ -= 0.1*Math.cos(theta*Math.PI/180) * tan;
            break;
        
        case "Minus":
            // camera move backward
            eyeX -= 0.1*Math.sin(theta*Math.PI/180);
            atX -= 0.1*Math.sin(theta*Math.PI/180); 
            eyeY += 0.1*Math.cos(theta*Math.PI/180);
            atY += 0.1*Math.cos(theta*Math.PI/180);
            var tan = (atZ - eyeZ) / (atY - eyeY);
            eyeZ += 0.1*Math.cos(theta*Math.PI/180) * tan;
            atZ += 0.1*Math.cos(theta*Math.PI/180) * tan;
            break;

        case "KeyW":
            // camera move up
            atZ += 0.1;  // tilt
            break;

        case "KeyS":
            // camera move down
			atZ -= 0.1;  // tilt
            break;

        case "KeyA":
            // camera look left
            theta += 2;
            atX = eyeX + r*Math.sin(theta*Math.PI/180);
            atY = eyeY - r*Math.cos(theta*Math.PI/180);
            break;

        case "KeyD":
            // camera look right
            theta -= 2;
            atX = eyeX + r*Math.sin(theta*Math.PI/180);
            atY = eyeY - r*Math.cos(theta*Math.PI/180);
            break;

        case "KeyR":
            // boost velocity only.
            var pSys = partBox1.pSys;
            for (var i = 0; i < pSys.partCount; i++){
                if (pSys.S0[i * PART_MAXVAR + PART_XVEL] > 0.0){
                    pSys.S0[i * PART_MAXVAR + PART_XVEL] += (Math.random()+1) * 2;
                }else{
                    pSys.S0[i * PART_MAXVAR + PART_XVEL] -= (Math.random()+1) * 2;
                }
                if (pSys.S0[i * PART_MAXVAR + PART_YVEL] > 0.0){
                    pSys.S0[i * PART_MAXVAR + PART_YVEL] += (Math.random()+1) * 2;  // Also g_drag should be applied??
                }else{
                    pSys.S0[i * PART_MAXVAR + PART_YVEL] -= (Math.random()+1) * 2;
                }
                if (pSys.S0[i * PART_MAXVAR + PART_ZVEL] > 0.0){
                    pSys.S0[i * PART_MAXVAR + PART_ZVEL] += (Math.random()+1) * 5;
                }else{
                    pSys.S0[i * PART_MAXVAR + PART_ZVEL] -= (Math.random()+1) * 5;
                }
            }
            break;
        
        case "KeyP":
            if (runMode == 3) runMode = 1;
            else runMode = 3;
            break;

        case "Space":
            runMode = 2;
            break;

        default:
            break;
	}
}

function myMouseDown(ev) {  
    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left;
    var yp = g_canvas.height - (ev.clientY - rect.top);
    // webgl(CVV) coords
    var x = (xp - g_canvas.width/2) / (g_canvas.width/2);
    var y = (yp - g_canvas.height/2) / (g_canvas.height/2);
    isDrag = true;
    xMclik = x;	
    yMclik = y;


}

function myMouseMove(ev){
    if(isDrag==false) return;	

    var rect = ev.target.getBoundingClientRect();	
    var xp = ev.clientX - rect.left;							
    var yp = g_canvas.height - (ev.clientY - rect.top);
    
    var x = (xp - g_canvas.width/2) / (g_canvas.width/2);	
    var y = (yp - g_canvas.height/2) / (g_canvas.height/2);
 
    xMdragTot = (x - xMclik);
    yMdragTot = (y - yMclik);

    pBallCenter[0] -= (x - xMclik);
    pBallCenter[2] += (y - yMclik);
    
    xMclik = x;
    yMclik = y;
}

function myMouseUp(ev) {
    var rect = ev.target.getBoundingClientRect();	
    var xp = ev.clientX - rect.left;							
    var yp = g_canvas.height - (ev.clientY - rect.top);

    var x = (xp - g_canvas.width/2) /	(g_canvas.width/2);		
    var y = (yp - g_canvas.height/2) / (g_canvas.height/2);

    isDrag = false;	
    // xMdragTot -= (x - xMclik);
    // yMdragTot += (y - yMclik);
    // console.log('upppppppp:', xMdragTot);
}


function WallsOn(){
    if(hasWall==true){
        hasWall=false;
    }else{
        hasWall=true;
    }
    partBox1.pSys.removeAddWall([WTYPE_XWALL_LO, WTYPE_XWALL_HI, WTYPE_YWALL_LO, WTYPE_YWALL_HI,  WTYPE_ZWALL_LO, WTYPE_ZWALL_HI]);
    partBox2.pSys.removeAddWall([WTYPE_XWALL_LO, WTYPE_XWALL_HI, WTYPE_YWALL_LO, WTYPE_YWALL_HI,  WTYPE_ZWALL_LO, WTYPE_ZWALL_HI]);
    partBox3.pSys.removeAddWall([WTYPE_XWALL_LO, WTYPE_XWALL_HI, WTYPE_YWALL_LO, WTYPE_YWALL_HI,  WTYPE_ZWALL_LO, WTYPE_ZWALL_HI]);
    partBox4.pSys.removeAddWall([WTYPE_XWALL_LO, WTYPE_XWALL_HI, WTYPE_YWALL_LO, WTYPE_YWALL_HI,  WTYPE_ZWALL_LO, WTYPE_ZWALL_HI]);
}

function BallOn(){
    if(hasBall==true){
        hasBall=false;
    }else{
        hasBall=true;
    }
    partBox1.pSys.removeAddWall([WTYPE_PBALL]);
    partBox2.pSys.removeAddWall([WTYPE_PBALL]);
    partBox3.pSys.removeAddWall([WTYPE_PBALL]);
    partBox4.pSys.removeAddWall([WTYPE_PBALL]);
}


function BallsOn(){
    control1= !control1;
}

function BoidOn(){
    partBox1.pSys.removeAddForce([F_FLOCK, F_GRAV_E, F_DRAG]);
}

function TornadoOn(){
    partBox1.pSys.removeAddForce([F_TORNADO]); partBox1.pSys.removeAddWall([WTYPE_TORNADO]);
}

function WindOn(){
    partBox1.pSys.removeAddForce([F_WIND]);
}

function FireOn(){
    control4 = !control4;
}
var isgravOn=false;
function SGravOn(){
    isgravOn = !isgravOn;
    partBox2.pSys.removeAddForce([F_DRAG, F_GRAV_E]); partBox3.pSys.removeAddForce([F_DRAG, F_GRAV_E]);
    partBox11.pSys.removeAddForce([F_DRAG, F_GRAV_E]);
}

function SpringLineOn(){
    control2 = !control2;
}

function HeadFixed(){
    isFixed = !isFixed;
}

function SpringTetraOn(){
    control3 = !control3;
}



function makeCylinder() {
    //==============================================================================
    // Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
    // 'stepped spiral' design described in notes.
    // Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
    //
     var ctrColr = new Float32Array([1.0, 0.0, 1.0]);	// dark gray
     var topColr = new Float32Array([1.0, 0.0, 1.0]);	// light green
     var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
     var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
     var botRadius = 1.0;		// radius of bottom of cylinder (top always 1.0)
     var floatsPerVertex = 8;
     // Create a (global) array to hold this cylinder's vertices;
     cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
                                            // # of vertices * # of elements needed to store them. 
    
        // Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
        // v counts vertices: j counts array elements (vertices * elements per vertex)
        for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
            // skip the first vertex--not needed.
            if(v%2==0)
            {				// put even# vertices at center of cylinder's top cap:
                cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
                cylVerts[j+1] = 0.0;	
                cylVerts[j+2] = 1.0; 
                cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
                cylVerts[j+4]=ctrColr[0]; 
                cylVerts[j+5]=ctrColr[1]; 
                cylVerts[j+6]=ctrColr[2];
                cylVerts[j+7] = 1.0;
            }
            else { 	// put odd# vertices around the top cap's outer edge;
                            // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                            // 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
                cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
                //	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
                //	 can simplify cos(2*PI * (v-1)/(2*capVerts))
                cylVerts[j+2] = 1.0;	// z
                cylVerts[j+3] = 1.0;	// w.
                // r,g,b = topColr[]
                cylVerts[j+4]=topColr[0]; 
                cylVerts[j+5]=topColr[1]; 
                cylVerts[j+6]=topColr[2];	
                cylVerts[j+7] = 1.0;	
            }
        }
        // Create the cylinder side walls, made of 2*capVerts vertices.
        // v counts vertices within the wall; j continues to count array elements
        for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
            if(v%2==0)	// position all even# vertices along top cap:
            {		
                    cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
                    cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
                    cylVerts[j+2] = 1.0;	// z
                    cylVerts[j+3] = 1.0;	// w.
                    // r,g,b = topColr[]
                    cylVerts[j+4]=topColr[0]; 
                    cylVerts[j+5]=topColr[1]; 
                    cylVerts[j+6]=topColr[2];	
                    cylVerts[j+7] = 1.0;
            }
            else		// position all odd# vertices along the bottom cap:
            {
                    cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
                    cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
                    cylVerts[j+2] =-1.0;	// z
                    cylVerts[j+3] = 1.0;	// w.
                    // r,g,b = topColr[]
                    cylVerts[j+4]=botColr[0]; 
                    cylVerts[j+5]=botColr[1]; 
                    cylVerts[j+6]=botColr[2];	
                    cylVerts[j+7] = 1.0;
    
            }
        }
        // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
        // v counts the vertices in the cap; j continues to count array elements
        for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
            if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
                cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
                cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
                cylVerts[j+2] =-1.0;	// z
                cylVerts[j+3] = 1.0;	// w.
                // r,g,b = topColr[]
                cylVerts[j+4]=botColr[0]; 
                cylVerts[j+5]=botColr[1]; 
                cylVerts[j+6]=botColr[2];	
                cylVerts[j+7] = 1.0;
            }
            else {				// position odd#'d vertices at center of the bottom cap:
                cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
                cylVerts[j+1] = 0.0;	
                cylVerts[j+2] =-1.0; 
                cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
                cylVerts[j+4]=botColr[0]; 
                cylVerts[j+5]=botColr[1]; 
                cylVerts[j+6]=botColr[2];
                cylVerts[j+7] = 1.0;
            }
        }
    }