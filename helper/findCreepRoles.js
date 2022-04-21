import { prototypes, utils, constants, visual } from "/game";

const creepList = {};

//this function will be specifically to return an object that contains all of the creeps in their respective roles.
export function findCreeps(myCreepsList, mySpawn) {
  //filter out all creeps that are busy spawning
  let mySpawnedCreepsList = myCreepsList.filter(
    (creep) => (creep.x == mySpawn.x && creep.y == mySpawn.y) == false
  );

  //find all of the basic harvester creeps.
  let basicHarvesters = mySpawnedCreepsList.filter(
    (creep) => creep.role == "basicHarvester"
  );
  creepList.basicHarvesters = basicHarvesters;

  return creepList;
}
