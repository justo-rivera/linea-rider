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
let clickedErase = false;
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
let splashScreen = true;
let isGameOver = false;


let bucketImage = new Image();
bucketImage.src='images/bucket.gif';
let orcImage = new Image();
orcImage.src='images/orc.png'
let trampolineImage = new Image();
trampolineImage.src = 'images/trampoline.png'
let leverOnImage = new Image();
leverOnImage.src = 'images/on.png'
let leverOffImage = new Image();
leverOffImage.src = 'images/off.png'
let splashImage = new Image();
splashImage.src = 'images/splashgif.gif'

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
    // this.entryPortal.position = portalEnter
    // this.exitPortal.position = portalExit
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
function level0(){
  let pizarra = document.getElementById('pizarra');
  pizarra.hidden = true
  context = document.getElementById('pizarra').getContext("2d")
  //context.drawImage(splashImage, 0, 0)
  window.setTimeout(function(){
    document.getElementById('bodyy').removeChild(document.getElementById('splash'))
    pizarra.hidden = false/*
    context.font = "20px Nunito";
    context.fillText("The player will slide through the lines you draw to get into the bucket!", 200, 240, 600)
    context.fillText("Left click to draw lines, right click to erase", 250, 290);
    window.addEventListener('keydown', (ev) => {*/
      if(splashScreen)      InitCanvas();
      addPlayerAndStart();
    //})
  }, 4200)
}
function level1(){
  bucket = createBucket({x: 420, y: 535});
  additionalDrawing = function(){
    context.drawImage(bucketImage, bucket.position.x-40, bucket.position.y-80);
  }
  collisionCheck = function(collision){
      if( collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
        nextLevel(level2);
      }
  }
  loadCollision(collisionCheck);
}
function level2(){
  cleanWorld();
  bucket = createBucket({x: 27, y: 499})

  const bucketObstaclePosition = transformVector({x: 22, y: 402});
  const bucketObstacleEnd = transformVector({x: 130, y: 450})
  let bucketObstacle = addLine(bucketObstaclePosition, bucketObstacleEnd, 12);
  bucketObstacle.fillStyle = 'black'
  addBody(bucketObstacle)
  
  additionalDrawing = function(){
    context.drawImage(bucketImage, bucket.position.x-40, bucket.position.y-80)
  }
  collisionChecker = function(collision){
      if( collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
        nextLevel(level3);
      }
    }
  loadCollision(collisionChecker)
}
function level3(){
  cleanWorld();
  bucket = createBucket({x: 420, y: 500});
  const bucketPosition = {x: bucket.position.x, y: bucket.position.y}

  let moveBucketVector = {x: 7, y: 0};

  additionalStart = function(){
    moveBucketVector = {x: 7, y: 0};
    Body.setPosition(bucket, bucketPosition)
  }
  additionalDrawing = function(){
    
    if(bucket.position.x > 1000) moveBucketVector.x = -7
    if(bucket.position.x < 10) moveBucketVector.x = 7
    moveStaticObject(bucket, moveBucketVector)
    
    context.drawImage(bucketImage, bucket.position.x-40, bucket.position.y-80)

  }
  collisionCheck = function(collision){
    if( collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
      nextLevel(level4);
    }
  }
  loadCollision(collisionCheck)
}
function level4(){
  startPos = {x: 55, y: 208}
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
    
    tiltCanvas(bucket.position, -oneDegree*28)
    context.drawImage(bucketImage, bucket.position.x-40, bucket.position.y-80)
    tiltCanvas(bucket.position, oneDegree*28)

    context.drawImage(trampolineImage, trampolineStart.x-10, trampolineEnd.y-30, 200, 100)

    moveStaticObject(obstacle1, moveObstacle1)

    if(obstacle1.position.x < 30 || obstacle1.position.y <= 0){
      moveObstacle1 = Vector.mult(moveObstacle1, -1)
    }
    if(boxB.velocity.y > 100){
      Body.setVelocity(boxB, {x: boxB.velocity.x, y: boxB.velocity.y*0.5});
    }
  }
  additionalStart = function(){
    Body.setPosition(obstacle1, obstacle1StartPosition);
    moveObstacle1 = {x: -10, y: 10};
  }
  collisionCheck = function(collision){
    if( collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
      nextLevel(level5);
    }
  }
  loadCollision(collisionCheck)
}
function level5(){
  startPos = {x: 200, y: 208}
  cleanWorld();

  portalEnter = transformVector({x: 135, y: 583})
  portalExit = transformVector({x: 800, y: 160})
  let portal = new Portal(portalEnter, portalExit)
  addBody(portal.entryPortal)
  addBody(portal.exitPortal)

  bucket = createBucket({x: 624, y:201})
  let orc = Bodies.rectangle(bucket.position.x, bucket.position.y-120, 80, 55, {mass: 0.001, render: {visible: false}, fillStyle: 'transparent', chamfer: {radius: 20}})
  let orc2 = Bodies.rectangle(orc.position.x+10, orc.position.y-55, 80, 55, {mass: 0.001, render: {visible: false}, fillStyle: 'transparent', chamfer: {radius: 20}})
  addBody(orc)
  addBody(orc2)
  
  const orcPos = orc.position

  let diagonalObstacle = rectangleXY({x: 300, y: 300}, {x: 500, y: 500}, 18, {isStatic: true, fillStyle: 'black'})
  const obstaclePosition = {x: diagonalObstacle.position.x, y: diagonalObstacle.position.y};

  addBody(diagonalObstacle)

  let moveObstacleVector = {x: 10, y: 10};

  additionalDrawing = function(){

    context.drawImage(bucketImage, bucket.position.x-40, bucket.position.y-80)
    context.drawImage(orcImage, orc.position.x-43, orc.position.y-30, 85,60)
    context.drawImage(orcImage, orc2.position.x-43, orc2.position.y-30, 85,60)
    const prevFill = context.fillStyle;
    context.font = "30px Nunito";
    context.fillStyle = "purple";
    context.fillText("ENTER", portal.entryPortal.position.x-35, portal.entryPortal.position.y-40)
    context.fillText("EXIT", portal.exitPortal.position.x-35, portal.exitPortal.position.y-40)
    context.fillStyle = prevFill;
    
    
    moveStaticObject(diagonalObstacle, moveObstacleVector)

    if(diagonalObstacle.position.y <= 50 || diagonalObstacle.position.y > 700){
      moveObstacleVector = Vector.mult(moveObstacleVector, -1)
    }

  }
  additionalStart = function(){

    World.remove(engine.world, [orc, orc2])

    orc = Bodies.rectangle(bucket.position.x, bucket.position.y-120, 80, 55, {mass: 0.001, render: {visible: false}, fillStyle: 'transparent', chamfer: {radius: 20}})
    addBody(orc)

    orc2 = Bodies.rectangle(orc.position.x+10, orc.position.y-55, 80, 55, {mass: 0.001, render: {visible: false}, fillStyle: 'transparent', chamfer: {radius: 20}})
    addBody(orc2)

    moveObstacleVector = {x: 10, y: 10}
    Body.setPosition(diagonalObstacle, obstaclePosition)
    
  }

  collisionCheck = function(collision){
    if(collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
      nextLevel(level6)
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

function level6(){
    startPos = false
    cleanWorld();
    bucket = createBucket({x: 200, y:551})
    let spinningObstacle = rectangleXY({x: 300, y: 300}, {x: 400, y: 500}, 24, {isStatic: true, fillStyle: 'black'})
    const obstacleInitPos = {...spinningObstacle.position}
    const angleInit = spinningObstacle.angle;
    addBody(spinningObstacle)
    let spinningObstacle2 = rectangleXY({x: 300, y: 300}, {x: 400, y: 500}, 24, {isStatic: true, fillStyle: 'black'})
    const obstacleInitPos2 = {...spinningObstacle2.position}
    const angleInit2 = spinningObstacle2.angle;
    addBody(spinningObstacle2)

    let bouncyWalls = createWalls();
    addBody(bouncyWalls[0])
    addBody(bouncyWalls[1])
    addBody(bouncyWalls[2])
    addBody(bouncyWalls[3])

    let lever = rectangleXY({x: 900, y: 500}, {x: 950, y: 500}, 40, {fillStyle: 'transparent', isSensor: true, isStatic: true, render: {visible: false}});
    lever.on = false;
    addBody(lever)
    let bucketObstacle = Bodies.rectangle(bucket.position.x, bucket.position.y-60, 120, 10, {isStatic: true, fillStyle: 'black', render: {visible: true}})
    addBody(bucketObstacle)

    moveVector = {x: -10, y: 5};
    spinAngle = 8*oneDegree;
    moveVector2 = {x: -10, y: -5};
    spinAngle2 = -8*oneDegree;
    additionalDrawing = function(){

      context.drawImage(bucketImage, bucket.position.x-40, bucket.position.y-80)

      if(lever.on){
        context.drawImage(leverOnImage, lever.position.x-30, lever.position.y-18, 55, 40)
      }
      else{
        context.drawImage(leverOffImage, lever.position.x-30, lever.position.y-18, 55, 40)
      }

      if(checkWalls(spinningObstacle).x){
        moveVector.x *= -1
        spinAngle *= -1
      }
      if(checkWalls(spinningObstacle2).x){
        moveVector2.x *= -1
        spinAngle2 *= -1
      }
      if(checkWalls(spinningObstacle).y){
        moveVector.y *= -1
        spinAngle *= -1
      }
      if(checkWalls(spinningObstacle2).y){
        moveVector2.y *= -1
        spinAngle2 *= -1
      }

      spinObject(spinningObstacle, spinAngle)
      spinObject(spinningObstacle2, spinAngle2)
      moveStaticObject(spinningObstacle, moveVector)
      moveStaticObject(spinningObstacle2, moveVector2)

    }
    additionalStart = function(){
      Body.setPosition(spinningObstacle, obstacleInitPos)
      Body.setPosition(spinningObstacle2, obstacleInitPos2)
      Body.setAngle(spinningObstacle, angleInit)
      Body.setAngle(spinningObstacle2, angleInit2)
      Body.setVelocity(spinningObstacle, 0)
      Body.setVelocity(spinningObstacle2, 0)
      Body.setAngularVelocity(spinningObstacle, 0)
      Body.setAngularVelocity(spinningObstacle2, 0)
      if(lever.on){
        lever.on = false;
        World.remove(engine.world, bucketObstacle)
        bucketObstacle = Bodies.rectangle(bucket.position.x, bucket.position.y-60, 120, 10, {isStatic: true, fillStyle: 'black', render: {visible: true}})
        addBody(bucketObstacle)
      }
      moveVector = {x: -10, y: 5};
      spinAngle = 8*oneDegree;
      moveVector2 = {x: -10, y: -5};
      spinAngle2 = -8*oneDegree;
    }
    let collisionEndChecker = function(collision){
      if(collision.bodyA === lever && collision.bodyB === boxB){
        if(lever.on){
          lever.on = false;
          bucketObstacle.render.visible = true
          addBody(bucketObstacle);
        }
        else{
          lever.on = true;
          bucketObstacle.render.visible = false
          World.remove(engine.world, [bucketObstacle])
        }
      }
      if(collision.bodyA === boxB && collision.bodyB === lever){
        if(lever.on){
          lever.on = false;
          bucketObstacle.render.visible = true
          addBody(bucketObstacle);
        }
        else{
          lever.on = true;
          bucketObstacle.render.visible = false
          World.remove(engine.world, bucketObstacle)
        }
      }
      if(collision.bodyA === bucket.sensor || collision.bodyB === bucket.sensor){
        gameOver();
      }
    }
    loadEndCollision(collisionEndChecker)
}
function gameOver(){
  isGameOver = true;
  window.setTimeout(() => {
  cleanWorld();
  context.fillStyle = '#fff';
  context.fillRect(0, 0, pizarra.width, pizarra.height);
  context.fillStyle = '#000'
  context.fillText("Wow! You made it", 240, 300)
  }, 2500)
}
function nextLevel(levelFunc){
  let slideOut = window.setInterval(()=>{scaleFactor*=0.9; panX+=2/scaleFactor;panY+=2/scaleFactor},50)
  window.setTimeout(()=>{clearInterval(slideOut);scaleFactor=0.8;panX=0;panY=0;levelFunc()}, 2000)
}
function createBucket(position){
  position = transformVector(position);
  let leftWall = addLine({x: position.x-12, y: position.y-18},  {x: position.x+5, y: position.y+50}, 2)
  let floorBucket = addLine({x: position.x-4, y: position.y+50}, {x: position.x + 50, y: position.y+50}, 2)

  let bucketSensor = Bodies.circle(floorBucket.position.x, floorBucket.position.y-15, 10, {isSensor: true, isStatic: true})

  let rightWall = addLine({x: position.x+45, y: position.y+50}, {x: position.x+58, y: position.y-18}, 2)

  let newBucket = Body.create({
    isStatic: true
  })

  Body.setParts(newBucket, [leftWall, floorBucket, bucketSensor, rightWall])
  newBucket.sensor = bucketSensor;
  World.add(engine.world, [newBucket])
  return newBucket;
}
function checkWalls(object){
  let collisionX = object.bounds.min.x > transformX(pizarra.width) || object.bounds.min.x < 0 || object.bounds.max.x > transformX(pizarra.width) || object.bounds.max.x < 0;
  let collisionY = object.bounds.min.y > transformY(pizarra.height) || object.bounds.min.y < 0 || object.bounds.max.y > transformY(pizarra.height) || object.bounds.max.y < 0;
  return {x: collisionX, y: collisionY}
}
function createWalls(){
  const width = transformX(pizarra.width)
  const height = transformY(pizarra.height)
  let leftWall = rectangleXY({x: 0, y:0}, {x: 0, y: height}, 18, {fillStyle: "pink", isStatic: true, restitution: 1})
  let bottomWall = rectangleXY({x: 0, y: height}, {x: width, y: height}, 18, {fillStyle: "pink", isStatic: true, restitution: 1})
  let rightWall = rectangleXY({x: width, y: height}, {x: width, y: 0}, 18, {fillStyle: "pink", isStatic: true, restitution: 1})
  let topWall = rectangleXY({x: width, y: 0}, {x: 0, y: 0}, 18, {fillStyle: "pink", isStatic: true, restitution: 1})
  return [leftWall, bottomWall, rightWall, topWall]
}
function cleanWorld(){
  Events.off(engine, 'collisionStart')
  World.remove(engine.world, Composite.allBodies(engine.world));
  lines.length = 0;
  additionalObjects.length = 0;
  addPlayerAndStart()
}
function loadCollision(collisionChecker){
  Events.on(engine, 'collisionStart', event => {
    const pairs = event.pairs;
    pairs.forEach( collision => {collisionChecker(collision)} )
  })
}
function loadEndCollision(collisionEndChecker){
  Events.on(engine, 'collisionEnd', event => {
    const pairs = event.pairs;
    pairs.forEach( collision => {collisionEndChecker(collision)} )
  })
}
function tiltCanvas(position, angle){
  context.translate(position.x, position.y)
  context.rotate(angle)
  context.translate(-position.x, -position.y)
}
function InitCanvas(){
    splashScreen = false;
    context = document.getElementById('pizarra').getContext("2d")
    let pizarra = document.getElementById('pizarra')
    let x = 0
    let y = 0

    const rect = pizarra.getBoundingClientRect();
    
    pizarra.addEventListener('mousedown', ev => {
      if(ev.button !== 0) isErasing=true
      else{
        x = transformX(ev.clientX - rect.left);
        y = transformY(ev.clientY - rect.top);
        isDrawing = true;
      }
      console.log('x: ' + ev.clientX + ' y: ' + ev.clientY)
    });
    
    pizarra.addEventListener('mousemove', ev => {
      if (isDrawing === true) {
        redrawLines(lines);
        context.save();
        context.translate(panX,panY);
        context.scale(scaleFactor,scaleFactor);
        additionalDrawing();
        drawVertices(additionalObjects);
        context.restore();
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
      }
      if(isErasing === true){
        const rectangle = Matter.Bodies.rectangle(transformX(ev.clientX - rect.left), transformY(ev.clientY - rect.top), 10,10)
        const matchedBody = Matter.Query.region(Composite.allBodies(engine.world), Matter.Bounds.create(rectangle.vertices))[0];
        if (matchedBody && matchedBody.lineIndex > -1) {
          World.remove(engine.world, matchedBody);
          delete lines[matchedBody.lineIndex];
        }
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
      if (isErasing === true && !clickedErase){
        isErasing = false;
      }
    })

    // window.addEventListener('keydown', (ev) => {
    //   if(splashScreen)      InitCanvas();
    //   addPlayerAndStart();
    // })
    
    window.addEventListener('contextmenu', ev => {
      ev.preventDefault();
    })
  }

function render() {
  if(!isGameOver){
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
function moveStaticObject(object, vector){
  Body.setVelocity(object, vector)
  Body.translate(object, vector)
}
function spinObject(object, angle){
  Body.setAngle(object, object.angle + angle)
  Body.setAngularVelocity(object, angle)
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
