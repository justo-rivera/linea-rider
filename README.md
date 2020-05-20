# linea-rider

## Description
Draw lines for your character to slide through and complete each level tasks (get into a bucket, do a certain amount of flips..)  


## MVP (DOM - CANVAS)
MVP: level 1 - sliding through lines should work and it should detect when you get into the bucket  

Deliverables: deadly obstacles (spikes), moving obstacles, multiple goals, adding coins that add up to the score  


## Backlog


## Data structure
Level class: contains all the initial obstacle data and the position of the bucket/goal  
Player class: state of the player in the world (position, angle, ...)  
Game class: keeps the score and transitions between splashscreen/levels  


## States y States Transitions

- splashScreen: instructions on how the lines work  
- gameScreen: display each level's goals, render the level, check if completed, go to next level  
- gameoverScreen: score and option to restart
- winScreen 


## Task
Getting the player to slide through the drawn lines  
Detecting when the player gets inside a bucket  
Adding obstacles  
Detecting flips that add to the score / might be a goal for the level  
Adding deadly obstacles  
Adding coins to increase score  
Adding moving obstacles  


## Links


### Trello
https://trello.com/b/RiFaAXuc/linea-rider


### Git
URls for the project repo and deploy
[Link Repo](http://github.com)
[Link Deploy](http://github.com)


### Slides
URls for the project presentation (slides)
https://docs.google.com/presentation/d/1xSSSlNTbQ9m9aQI65Eulr4z8bXa6mz1WhLmi0j13t4E/edit?usp=sharing
