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
let lineFriction = 0;
let startPos;

class Game {
  constructor(){
    this.levels = [level1, level2, level3];
    this.currentLevel = null;
    this.levelCounter = 0;
  }
  nextLevel(){
    //splashScreen();
    this.levelCounter++;
    this.currentLevel = levels[levelCounter]
    cleanWorld();
    loadLevel(this.currentLevel)
  }
  loadLevel(level){
    level(nextLevel)
  }
}
class Level {
  constructor(callNextLevel){
    this.nextLevel = callNextLevel;
    this.bucket = null;
    this.collisionCheck = null;
  }
}
class Portal {
  constructor(portalEnter, portalExit){
    this.entryPortal = this.createPortal(portalEnter, 180*oneDegree)
    this.exitPortal = this.createPortal(portalExit, 90*oneDegree)
    this.entryPortal.position = portalEnter
    this.exitPortal.position = portalExit
  }
  createPortal(position, angle){
    // const radius = 40
    // let circleX = position.x + radius
    // let circleY = position.y + radius
    let positionEnd = {x: position.x + 50, y: position.y}
    return rectangleXY(position, positionEnd, 50, {isStatic: true, isSensor: true, fillStyle:"purple", angle: angle})
  }
  teleport(body, type){
    if(type === 'entry') this.teleportToExit(body)
    if(type === 'exit') this.teleportToEntry(body)
  }
  teleportToExit(body){
    let rotationAngle = this.entryPortal.angle - this.exitPortal.angle;
    let rotateVelocity = Vector.rotate(body.velocity, rotationAngle)
    console.log(rotationAngle)
    Body.setVelocity(body, rotateVelocity)
    Body.setPosition(body, this.exitPortal.position)
  }
  teleportToEntry(body){
    // let rotationAngle = this.entryPortal.angle - this.exitPortal.angle;
    // console.log('velocity')
    // console.log(body.velocity)
    // let rotateVelocity = Vector.rotate(body.velocity, rotationAngle)
    // console.log('rotateVelocity')
    // console.log(rotateVelocity)
    // Body.setVelocity(body, rotateVelocity)
    // Body.setPosition(body, this.entryPortal.position)
  }

}
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
    Body.setVelocity(bucket, {x: moveBucket, y: 0})
    Body.translate(bucket, {x: moveBucket, y: 0})
    context.drawImage(image, bucket.position.x-40, bucket.position.y-80)
  }
  additionalStart = function(){
    Body.setPosition(bucket, initialPosition)
    moveBucket = 10;
  }
  collisionCheck = function(collision){
    if( collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
      level4();
    }
  }
  loadCollision(collisionCheck)
}
function level4(){
  cleanWorld();
  bucket = createBucket({x: 795, y: 155})
  Body.rotate(bucket,-oneDegree*28);
  const trampolineStart = transformVector({x: 400, y:550})
  const trampolineEnd = transformVector({x: 540, y: 550})
  let trampoline = rectangleXY(trampolineStart, trampolineEnd, 15, {isStatic: true, fillStyle: 'white', restitution: 3, chamfer: {radius: 8}, render: {visible: false}})
  
  const obstacle1Position = transformVector({x: 161, y: 341});
  const obstacle1End = transformVector({x: 50, y: 441})
  let obstacle1 = rectangleXY(obstacle1Position, obstacle1End, 16, {isStatic: true, fillStyle: 'black'});
  const obstacle1StartPosition = {x: obstacle1.position.x, y: obstacle1.position.y}
  let moveObstacle1 = {x: -10, y: 10}
  addBody(obstacle1)
  addBody(trampoline)
  additionalDrawing = function(){
    let image = new Image();
    image.src='images/bucket.gif';
    let trampolineImage = new Image();
    trampolineImage.src = 'images/trampoline.png'
    context.translate(bucket.position.x, bucket.position.y)
    context.rotate(-oneDegree*28)
    context.translate(-bucket.position.x, -bucket.position.y)
    context.drawImage(image, bucket.position.x-40, bucket.position.y-80)
    context.translate(bucket.position.x, bucket.position.y)
    context.rotate(oneDegree*28)
    context.translate(-bucket.position.x, -bucket.position.y)
    context.drawImage(trampolineImage, trampolineStart.x-10, trampolineEnd.y-30, 200, 100)
    Body.translate(obstacle1, moveObstacle1)
    Body.setVelocity(obstacle1, moveObstacle1)
    if(obstacle1.position.x < 30 || obstacle1.position.y <= 0){
      moveObstacle1 = Vector.mult(moveObstacle1, -1)
    }
  }
  additionalStart = function(){
    Body.setPosition(obstacle1, obstacle1StartPosition);
    moveObstacle1 = {x: -10, y: 10};
  }
  collisionCheck = function(collision){
    if( collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
      level5();
    }
  }
  loadCollision(collisionCheck)
  // lineFriction = 0.3
  startPos = {x: 55, y: 208}

}
function level5(){
  cleanWorld();
  portalEnter = transformVector({x: 135, y: 583})
  portalExit = transformVector({x: 800, y: 160})
  let portal = new Portal(portalEnter, portalExit)
  addBody(portal.entryPortal)
  addBody(portal.exitPortal)
  bucket = createBucket({x: 624, y:201})
  let orc = Bodies.rectangle(bucket.position.x, bucket.position.y-120, 80, 110, {mass: 0.001, render: {visible: false}, chamfer: {radius: 20}})
  // orc.collisionFilter.group = -1  
  const orcPos = orc.position
  addBody(orc)
  let diagonalObstacle = rectangleXY({x: 300, y: 300}, {x: 500, y: 500}, 18, {isStatic: true, fillStyle: 'black'})
  const obstaclePosition = {x: diagonalObstacle.position.x, y: diagonalObstacle.position.y};
  let moveObstacle = {x: 10, y: 10};
  addBody(diagonalObstacle)
  additionalDrawing = additionalDrawing = function(){
    let image = new Image();
    image.src='images/bucket.gif';
    let orcImage = new Image();
    orcImage.src='images/orc.gif'
    context.drawImage(image, bucket.position.x-40, bucket.position.y-80)
    context.drawImage(orcImage, orc.position.x-130, orc.position.y-100)
    Body.setVelocity(diagonalObstacle, moveObstacle)
    Body.translate(diagonalObstacle, moveObstacle)
    if(diagonalObstacle.position.y <= 50 || diagonalObstacle.position.y > 700){
      moveObstacle = Vector.mult(moveObstacle, -1)
    }
  }
  additionalStart = function(){
    World.remove(engine.world, [orc])
    orc = Bodies.rectangle(bucket.position.x, bucket.position.y-120, 80, 110, {mass: 0.001, render: {visible: false}, chamfer: {radius: 20}})
    moveObstacle = {x: 10, y: 10}
    Body.setPosition(diagonalObstacle, obstaclePosition)
    // orc.collisionFilter.group = -1  
    addBody(orc)
  }
  startPos = false;
  collisionCheck = function(collision){
    if(collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
      console.log('you won!!')
    }
    if(collision.bodyA === portal.entryPortal){
      portal.teleport(collision.bodyB, 'entry')
    }
    if(collision.bodyB === portal.entryPortal){
      portal.teleport(collision.bodyA, 'entry')
    }
    if(collision.bodyA === portal.entryPortal){
      portal.teleport(collision.bodyB, 'exit')
    }
    if(collision.bodyB === portal.entryPortal){
      portal.teleport(collision.bodyA, 'exit')
    }
  }
  loadCollision(collisionCheck)

}
function createBucket(position){
  position = transformVector(position);
  let leftWall = addLine({x: position.x-12, y: position.y-15},  {x: position.x+5, y: position.y+50}, 3)
  let floorBucket = addLine({x: position.x-4, y: position.y+50}, {x: position.x + 50, y: position.y+50}, 3)

  let bucketSensor = Bodies.circle(floorBucket.position.x, floorBucket.position.y-15, 10, {isSensor: true, isStatic: true})

  let rightWall = addLine({x: position.x+45, y: position.y+50}, {x: position.x+58, y: position.y-15}, 3)
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
function loadCollision(collisionChecker){
  Events.on(engine, 'collisionStart', event => {
    const pairs = event.pairs;
    pairs.forEach( collision => {collisionChecker(collision)} )
  })
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
      addPlayerAndStart();
    })
/*     window.addEventListener('auxclick', (ev) => {
      isErasing = true;
    }) */
    window.addEventListener('contextmenu', ev => {
      ev.preventDefault();
    })
  }

function render() {
  window.requestAnimationFrame(render);
  if(isDrawing === false){
    var bucketDraw = [boxB] 
    // bucketDraw = Composite.allBodies(engine.world);


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
    if(!bodies[i].render.visible) continue
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
function addPlayerAndStart(position = {x: 50, y: 50}, velocity = {x: 5, y:8}, rotation = 28*oneDegree){
  position = startPos || position;
  if (typeof boxB !== typeof undefined ) World.remove(engine.world,[boxB])
      boxB = Bodies.rectangle(position.x, position.y, 40, 20, {friction: 0, inertia: 5, mass: 0.02, restitution:0, chamfer: {radius: 10}, airFriction: 0});
      World.add(engine.world, [boxB]);
      boxB.friction = 0;
      boxB.fillStyle = "#0af"
      Matter.Body.rotate(boxB, rotation)
      Matter.Body.setVelocity(boxB, velocity)
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
  let newRectangle = Bodies.rectangle(middlePoint.x, middlePoint.y, calcDistance(vectorStart, vectorEnd), weight, {isStatic: true, friction: lineFriction} )
  newRectangle.collisionFilter.group = -1;
  Matter.Body.rotate(newRectangle, getAngle(vectorStart, vectorEnd));
  newRectangle.drawXY = vectorStart
  return newRectangle;
}

function rectangleXY(vectorStart, vectorEnd, weight, constraints){
  let angle = getAngle(vectorStart, vectorEnd);
  let middlePoint = getMiddlePoint(vectorStart, vectorEnd)
  let newRectangle = Bodies.rectangle(middlePoint.x, middlePoint.y, calcDistance(vectorStart, vectorEnd), weight, constraints )
  Matter.Body.rotate(newRectangle, getAngle(vectorStart, vectorEnd));
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
  const sign = (vector1.x - vector2.x)/Math.abs(vector1.x - vector2.x) || 1;
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