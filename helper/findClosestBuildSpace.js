import { prototypes, utils, constants, visual, arenaInfo } from "/game";

//this will find the closest build space within a 15 by 15 block from the location specified.
//this function will ensure that there is no structures or sources adjacent to the location and also that it doesnt block a pathway.
export function findClosestBuildSpaceLooselySpaced(location) {
  let listUsablePosition = [];
  let locations = [];
  let locationX = Number(location.x);
  let locationY = Number(location.y);
  let gameObjects = utils.getObjectsByPrototype(prototypes.GameObject);
  for (let obj of gameObjects) {
    console.log(
      "object type: ",
      obj.constructor.name,
      "at x:",
      obj.x,
      " y:",
      obj.y,
      " is Structure: ",
      obj.constructor.name.includes("Structure")
    );
  }
  //initialize matrix with no location weightings at all
  console.log(
    "location to work with coordinates x: ",
    locationX,
    "y: ",
    locationY
  );

  //we are making a matrix in a 30*30
  for (let i = 0; i <= 30; i++) {
    let tempArrayPositive = [];
    let tempArrayNegative = [];
    for (let j = 0; j <= 30; j++) {
      //initialize matrix with all locations in a 30*30 grid around the target and define out of bounds as out of bounds!
      if (
        locationX + i - 15 > 100 ||
        locationX + i - 15 < 0 ||
        locationY + j - 15 > 100 ||
        locationY + j - 15 < 0
      ) {
        let locationPos = {
          x: locationX + i - 15,
          y: locationY + j - 15,
          locationStatus: "UNUSABLE_OUT_OF_BOUNDS",
          locationPassable: false,
        };
        tempArrayPositive.push(locationPos);
      } else {
        let locationPos = {
          x: locationX + i - 15,
          y: locationY + j - 15,
          locationStatus: "USABLE",
          locationPassable: true,
        };
        tempArrayPositive.push(locationPos);
      }
    }
    locations.push(tempArrayPositive);
  }

  //flatten the 2d matrix into 1d
  let locations1D = [].concat(...locations);

  console.log("locations array length = ", locations1D.length);

  //initialize structure, construction site and sources array to be used to filter out 3*3 area around them to ensure no strucures are in direct contact.
  let existingConstructionSites = utils.getObjectsByPrototype(
    prototypes.ConstructionSite
  );
  let existingStructures = utils.getObjectsByPrototype(prototypes.Structure);

  let sources = utils.getObjectsByPrototype(prototypes.Source);
  //combine structures and construction site arrray
  let totalExistingConstructs = existingStructures.concat(
    existingConstructionSites,
    sources
  );

  //check if the buildings are within range of the location specified
  let constructsInRange = utils.findInRange(
    location,
    totalExistingConstructs,
    15
  );

  //get all existing creeps within range of the location
  let existingCreeps = utils.getObjectsByPrototype(prototypes.Creep);

  let creepsInRange = utils.findInRange(location, existingCreeps, 15);

  console.log("length of constructs in range is: ", constructsInRange.length);

  const vacinityLocations = [];
  //load buildings in range of the location into the locations1D array and mark them as unusable, and the areas around them as USABLE_IN_STRUCTURE_VACINITY
  for (const loc of locations1D) {
    for (const con of constructsInRange) {
      if (loc.x == con.x && loc.y == con.y) {
        //check if the structure type is rampart
        if (con instanceof prototypes.StructureRampart) {
          loc.locationStatus = "UNUSABLE_STRUCTURE_LOCATION";
          loc.locationPassable = true;
        } else {
          loc.locationStatus = "UNUSABLE_STRUCTURE_LOCATION";
          loc.locationPassable = false;
        }

        for (let i = 0; i <= 2; i++) {
          for (let j = 0; j <= 2; j++) {
            let tempVacinityLocation = {};
            tempVacinityLocation.id =
              String(con.x - 1 + i) + ":" + String(con.y - 1 + j);
            tempVacinityLocation.x = con.x - 1 + i;
            tempVacinityLocation.y = con.y - 1 + j;
            tempVacinityLocation.locationStatus =
              "UNUSABLE_STRUCTURE_VACINITY_LOCATION";
            tempVacinityLocation.locationPassable = true;
            //check if the vacinity location is not equal to the structure location
            if (
              tempVacinityLocation.x == con.x &&
              tempVacinityLocation.y == con.y
            ) {
            } else {
              //push all vacinity locations to array to be compared later on.
              vacinityLocations.push(tempVacinityLocation);
            }
          }
        }
      }
    }
  }

  //mark all locations with creeps on them
  for (const loc of locations1D) {
    for (const creep of creepsInRange) {
      if (loc.x == creep.x && loc.y == creep.y) {
        loc.locationStatus = "UNUSABLE_CREEP_LOCATION";
        loc.locationPassable = false;
      }
    }
  }

  let structureTerrainTiles = locations1D.filter(
    (loc) => loc.locationStatus == "UNUSABLE_STRUCTURE_LOCATION"
  );
  console.log(
    "the amount of unusable structure terrain tiles are: ",
    structureTerrainTiles.length
  );
  //filter out all duplicate vacinity locations
  let unique_VacinityLocationsArray_Map = vacinityLocations.map((item) => [
    item["id"],
    item,
  ]);

  let unique_VacinityLocationsArray_NewMap = new Map(
    unique_VacinityLocationsArray_Map
  );

  let unique_VacinityLocationsArray_Array = [
    ...unique_VacinityLocationsArray_NewMap.values(),
  ];

  //filter out building locations and out of bounds
  const locationsFilterOutOfBounds = locations1D.filter(
    (loc) => loc.locationStatus != "UNUSABLE_OUT_OF_BOUNDS"
  );

  //get all the creeps in the range of the location
  let allCreeps = utils.getObjectsByPrototype(prototypes.Creep);
  let allCreepsInRange = utils.findInRange(location, allCreeps, 15);
  //mark all Creep Locations

  //analyse terrain for walls and swamp
  for (let loc of locationsFilterOutOfBounds) {
    let locTerrain = utils.getTerrainAt(loc);
    if (locTerrain == constants.TERRAIN_WALL) {
      loc.locationStatus = "UNUSABLE_WALL_LOCATION";
      loc.locationPassable = false;
      loc.terrainType = constants.TERRAIN_WALL;
    } else if (
      locTerrain == constants.TERRAIN_SWAMP &&
      loc.locationStatus == "USABLE"
    ) {
      loc.locationStatus = "USABLE_SWAMP";
      loc.locationPassable = true;
      loc.terrainType = constants.TERRAIN_SWAMP;
    } else {
      loc.terrainType = locTerrain;
    }
  }

  //mark all location areas in structure vacinities where the location is usable
  for (let loc of locationsFilterOutOfBounds) {
    for (let vac of unique_VacinityLocationsArray_Array) {
      if (
        loc.x == vac.x &&
        loc.y == vac.y &&
        (location.locationStatus == "USABLE" ||
          locations.locationStatus == "USABLE_SWAMP")
      ) {
        loc.locationStatus = "UNUSABLE_STRUCTURE_VACINITY";
      }
    }
  }

  //filter for all applicable building locations but this does not take into account bottlenecks yet
  let buildingLocationsBeforeBottlenNeck = locationsFilterOutOfBounds.filter(
    (loc) =>
      loc.locationStatus == "USABLE" || loc.locationStatus == "USABLE_SWAMP"
  );
}
