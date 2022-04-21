import { prototypes, utils, constants, visual, arenaInfo } from "/game";
export function findClosestBuildSpaceLooselySpaced(location) {
  let gameObjects = utils.getObjectsByPrototype(prototypes.GameObject);

  //get objects within range of the location of 10 spaces
  let gameObjectsInRange = utils.findInRange(location, gameObjects, 10);
  let locationsAssesed = [];
  let structureVacinityLocations = [];

  //initialize matrix of locations and mark each location type
  for (let i = 0; i <= 20; i++) {
    for (let j = 0; j <= 20; j++) {
      if (
        location.x - 10 + i < 0 ||
        location.x - 10 + i > 100 ||
        location.y - 10 + j < 0 ||
        location.y - 10 + j > 100
      ) {
        //we exclude all out of boundry locations
      } else {
        //if the location is within the game boundries we will first check its terrain type
        let loc = {};
        loc.x = location.x - 10 + i;
        loc.y = location.y - 10 + j;
        loc.terrain = utils.getTerrainAt(loc);
        //do the initial passable check to see if the terrain is not a wall
        if (loc.terrain == constants.TERRAIN_WALL) {
          loc.isPassable = false;
          loc.locationStatus = "UNUSABLE_WALL_LOCATION";
          loc.occupation = "Wall";
        } else if (loc.terrain == constants.TERRAIN_SWAMP) {
          loc.isPassable = true;
          loc.locationStatus = "USABLE_SWAMP";
          loc.occupation = "Empty";
        } else {
          loc.isPassable = true;
          loc.locationStatus = "USABLE";
          loc.occupation = "Empty";
        }
        //check if any of the gameobjects are on this location
        for (let obj of gameObjectsInRange) {
          let objType = obj.constructor.name;
          let objTypeLowerCase = objType.toLowerCase();
          if (loc.x == obj.x && loc.y == obj.y) {
            //check if the object is a structure or source
            if (
              objTypeLowerCase.includes("structure") ||
              objTypeLowerCase.includes("source")
            ) {
              //if the game object is a rampart
              if (objTypeLowerCase.includes("rampart")) {
                loc.occupation = objType;
                loc.isPassable = true;
                loc.locationStatus = "UNUSABLE_OCCUPIED_BY_OBJECT";
              } else {
                loc.occupation = objType;
                loc.isPassable = false;
                loc.locationStatus = "UNUSABLE_OCCUPIED_BY_OBJECT";
                loc.locationVacinityId = String(loc.x) + ":" + String(loc.y);
                //if its an impassable structure then get vacinity locations all around it.
                structureVacinityLocations.push(loc);
              }
            } //else the object is not a structure
            else {
              loc.occupation = objType;
              loc.isPassable = false;
              loc.locationStatus = "UNUSABLE_OCCUPIED_BY_OBJECT";
            }
          }
        }
        locationsAssesed.push(loc);
      }
    }
  }
  //filter out all duplicate vacinity locations
  let uniqueStructureVacinityLocations = [
    ...new Map(
      structureVacinityLocations.map((item) => [
        item["locationVacinityId"],
        item,
      ])
    ).values(),
  ];

  let usableVacinityLocations = uniqueStructureVacinityLocations.filter(
    (loc) => loc == "USABLE" || loc == "USABLE_SWAMP"
  );

  console.log("vacinity locations: ", usableVacinityLocations);
}
