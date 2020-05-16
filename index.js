// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composite = Matter.Composite,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  World = Matter.World,
  Constraint = Matter.Constraint,
  Body = Matter.Body,
  Bodies = Matter.Bodies,
  Vector = Matter.Vector,
  Events = Matter.Events;

// create an engine
var engine = Engine.create();


var context;
let running = false;
const oneDegree = 2*Math.PI/360;
let panX = 0, panY = 0, scaleFactor = 0.8;
let boxB, bucket;
let additionalDrawing = function(){};
let additionalStart = function(){}
let additionalObjects = [];
let isErasing = false;
let isDrawing = false;
let lines = []
const lineWidth = 14;

function level1(){
  bucket = createBucket({x: 420, y: 535})
  Events.on(engine, 'collisionStart', event => {
    const pairs = event.pairs;
    pairs.forEach( collision => {
      if( collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
        level2()
      }
    })
  })
  additionalDrawing = function(){
    let image = new Image();
    image.src='images/bucket.gif';
    context.drawImage(image, bucket.position.x-40, bucket.position.y-80)
  }
}
function level2(){
  cleanWorld();
  bucket = createBucket({x: 27, y: 499})

  additionalDrawing = function(){
    let image = new Image();
    image.src='images/bucket.gif';
    context.drawImage(image, bucket.position.x-40, bucket.position.y-80)
  }
  const bucketObstaclePosition = transformVector({x: 22, y: 402});
  const bucketObstacleEnd = transformVector({x: 130, y: 450})
  let bucketObstacle = addLine(bucketObstaclePosition, bucketObstacleEnd, 12);
  bucketObstacle.fillStyle = 'black'
  addBody(bucketObstacle)
  
  Events.on(engine, 'collisionStart', event => {
    const pairs = event.pairs;
    pairs.forEach( collision => {
      if( collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
        level3();
      }
    })
  })
}
function level3(){
  cleanWorld();
  bucket = createBucket({x: 420, y: 500});
  const initialPosition = {x: bucket.position.x, y: bucket.position.y};
  let moveBucket = 10;
  additionalDrawing = function(){
    let image = new Image();
    image.src='images/bucket.gif';
    if(bucket.position.x > 1000) moveBucket = -10
    if(bucket.position.x < 10) moveBucket = 10
    Body.translate(bucket, {x: moveBucket, y: 0})
    Body.setVelocity(bucket, {x: moveBucket, y: 0})
    context.drawImage(image, bucket.position.x-40, bucket.position.y-80)
  }
  additionalStart = function(){
    Body.setPosition(bucket, initialPosition)
    moveBucket = 10;
  }
}
function createBucket(position){
  position = transformVector(position);
  let leftWall = addLine({x: position.x-3, y: position.y-10},  {x: position.x+5, y: position.y+50}, 3)
  let floorBucket = addLine({x: position.x + 5, y: position.y+50}, {x: position.x + 60, y: position.y+50}, 3)

  let bucketSensor = Bodies.circle(floorBucket.position.x, floorBucket.position.y-15, 10, {isSensor: true, isStatic: true})

  let rightWall = addLine({x: position.x+60, y: position.y+50}, {x: position.x+68, y: position.y-10}, 3)
  let newBucket = Body.create({
    isStatic: true
  })
  Body.setParts(newBucket, [leftWall, floorBucket, bucketSensor, rightWall])
  newBucket.sensor = bucketSensor;
  World.add(engine.world, [newBucket])
  return newBucket;
}
function cleanWorld(){
  Events.off(engine, 'collisionStart')
  World.remove(engine.world, Composite.allBodies(engine.world));
  lines.length = 0;
  additionalObjects.length = 0;
}
function InitCanvas(){
    context = document.getElementById('pizarra').getContext("2d")
    let pizarra = document.getElementById('pizarra')
    let x = 0
    let y = 0

    const rect = pizarra.getBoundingClientRect();

    // Add the event listeners for mousedown, mousemove, and mouseup
    pizarra.addEventListener('mousedown', ev => {
      if(ev.button !== 0) isErasing=true
      else{
        x = transformX(ev.clientX);
        y = transformY(ev.clientY);
        isDrawing = true;
      }
      console.log('x: ' + ev.clientX + ' y: ' + ev.clientY)
    });
    
    pizarra.addEventListener('mousemove', ev => {
      if (isDrawing === true) {
        redrawLines(lines);
        const endX = transformX(ev.clientX);
        const endY = transformY(ev.clientY);
        let vectorStart = {x: x, y: y};
        let vectorEnd = {x: endX, y: endY};
        drawLine(x, y, endX, endY);
        if(checkNewPoint(vectorStart, vectorEnd)){
          let newLine = addLine(vectorStart, vectorEnd);
          newLine.lineIndex = lines.length-1;
          World.add(engine.world, [newLine])
          x = endX;
          y = endY;
        }
        // x = e.clientX - rect.left;
        // y = e.clientY - rect.top;
      }
      if(isErasing === true){
        const rectangle = Matter.Bodies.rectangle(transformX(ev.clientX), transformY(ev.clientY), 10,10)
        const matchedBody = Matter.Query.region(Composite.allBodies(engine.world), Matter.Bounds.create(rectangle.vertices))[0];
        if (matchedBody && matchedBody.lineIndex > -1) {World.remove(engine.world, matchedBody); delete lines[matchedBody.lineIndex];}
        redrawLines(lines)
      }
    });
    
    window.addEventListener('mouseup', ev => {
      if (isDrawing === true) {
        const endX = transformX(ev.clientX);
        const endY = transformY(ev.clientY);
        let vectorStart = {x: x, y: y};
        let vectorEnd = {x: endX, y: endY};
        let newLine = addLine(vectorStart, vectorEnd)
        newLine.lineIndex = lines.length-1;
        World.add(engine.world, [newLine])
        // newRectangle.friction = 0;
        x = endX;
        y = endY;
        isDrawing = false;
      }
      if (isErasing === true){
        isErasing = false;
      }
    });

    window.addEventListener('keydown', (ev) => {
      if(ev.key === 'ArrowRight'){
        panX+=10
      }
      if(ev.key === 'ArrowLeft'){
        panX-=10
      }
      if(ev.key === 'ArrowUp'){
        scaleFactor-=0.05
      }
      if(ev.key === 'ArrowDown'){
        scaleFactor+=0.05
      }
      
      addPlayerAndStart();
    })
/*     window.addEventListener('auxclick', (ev) => {
      isErasing = true;
    }) */
    window.addEventListener('contextmenu', ev => {
      ev.preventDefault();
    })
  }

// create a renderer
// var render = Render.create({
//     element: pizarra,
//     engine: engine
// });

// // create two boxes and a ground
// var boxB = Bodies.rectangle(50, 50, 80, 20, {friction: 0.0005});

// // add all of the bodies to the world
// World.add(engine.world, [boxB]);

// run the engine

// run the renderer
// Render.run(render);

function render() {
  window.requestAnimationFrame(render);
  if(isDrawing === false){
    var bucketDraw = [boxB] 
    //bucketDraw = Composite.allBodies(engine.world);


    context.fillStyle = '#fff';
    context.fillRect(0, 0, pizarra.width, pizarra.height);
    redrawLines(lines)

    context.save();
    context.translate(panX,panY);
    context.scale(scaleFactor,scaleFactor);
    additionalDrawing();
    drawVertices(bucketDraw);
    drawVertices(additionalObjects);
    context.restore();

  }
}
function drawVertices(bodies){
  for (var i = 0; i < bodies.length; i ++) {
    context.beginPath();
      var vertices = bodies[i].vertices;
      context.fillStyle = bodies[i].fillStyle;
      context.moveTo(vertices[0].x, vertices[0].y);

      for (var j = 1; j < vertices.length; j ++ ) {
          context.lineTo(vertices[j].x, vertices[j].y);
      }

      context.lineTo(vertices[0].x, vertices[0].y);
      context.closePath();
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = '#999';
      context.stroke();
  }
}
function addBody(body){
  additionalObjects.push(body)
  World.add(engine.world, [body])
}
function addPlayerAndStart(){
  if (typeof boxB !== typeof undefined ) World.remove(engine.world,[boxB])
      boxB = Bodies.rectangle(50, 50, 40, 20, {friction: 0, inertia: 5, mass: 0.02, restitution:0, chamfer: {radius: 10}, airFriction: 0});
      World.add(engine.world, [boxB]);
      boxB.friction = 0;
      boxB.fillStyle = "#0af"
      Matter.Body.rotate(boxB, 28*oneDegree)
      Matter.Body.setVelocity(boxB, {x: 5, y: 8})
      additionalStart();
      if(running === false){
        running = true;
        Engine.run(engine);
        engine.timing.timeScale = 0.5;
        engine.world.gravity.y = 5;
        engine.enableSleeping = true
        level1();
        render()
      }
}
function drawLine( x1, y1, x2, y2, color = 'red') {
        context.save();
        context.translate(panX,panY);
        context.scale(scaleFactor,scaleFactor);
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 14;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
        context.restore();
}
function addLine(vectorStart, vectorEnd, weight = lineWidth){
  if(weight === lineWidth) lines.push({startX: vectorStart.x, startY: vectorStart.y, endX: vectorEnd.x, endY: vectorEnd.y})
  redrawLines(lines);
  let angle = getAngle(vectorStart, vectorEnd);
  let middlePoint = getMiddlePoint(vectorStart, vectorEnd)
  let newRectangle = Bodies.rectangle(middlePoint.x, middlePoint.y, calcDistance(vectorStart, vectorEnd), weight, {isStatic: true, friction: 0} )
  newRectangle.collisionFilter.group = -1;
  Matter.Body.rotate(newRectangle, getAngle(vectorStart, vectorEnd));
  newRectangle.drawXY = vectorStart
  return newRectangle;
}

function checkNewPoint(vector1,vector2){
  return Math.abs(getAngle(vector1, vector2))>5*oneDegree && calcDistance(vector1, vector2) > 30
}

function redrawLines(lines){
  let canvas = document.getElementById('pizarra');
  context.clearRect(0,0,canvas.width,canvas.height);
  lines.forEach( (line) => {
    drawLine(line.startX, line.startY, line.endX, line.endY)
  })
}
function calcDistance(vector1, vector2){
    return Math.sqrt( (vector1.x - vector2.x)**2 + (vector1.y - vector2.y)**2 )
}
function getAngle(vector1, vector2){
  const sign = (vector1.x - vector2.x)/Math.abs(vector1.x - vector2.x);
  return Math.asin( sign * (vector1.y - vector2.y) / calcDistance(vector1, vector2))
}
function getMiddlePoint(vector1, vector2){
  return Vector.add(vector1, Vector.mult( Vector.sub(vector2, vector1), 0.5))
}
function transformX(x){
  return (x-panX)/scaleFactor
}
function transformY(y){
  return (y-panY)/scaleFactor
}
function transformVector(vector){
  return {x: transformX(vector.x), y: transformY(vector.y)}
}

/*
          let newRectangle = Bodies.rectangle(x, y, calcDistance({x: x, y: y}, {x: endX, y: endY}), 14, {isStatic: true, friction: 0} )
          newRectangle.lineIndex = lines.length-1;
          newRectangle.collisionFilter.group = -1;
          Matter.Body.rotate(newRectangle, getAngle({x: x, y: y}, {x: endX, y: endY}));
          let substract = newRectangle.bounds.min;
          if( x > endX ){
            substract.x = newRectangle.bounds.max.x-14;         
          }
          if( y > endY ){
            substract.y = newRectangle.bounds.max.y-14;
          }
          Matter.Body.translate(newRectangle, Vector.sub(newRectangle.position, substract))
          World.add(engine.world, [newRectangle])
          */