import { prototypes, utils, constants } from "/game";
import { spawnCreep } from "./spawning_Logic";
import { findCreeps as findCreepRoles } from "./helper/findCreepRoles";
import { creepLogic as harvesterCreepLogic } from "./CreepRoleLogic/basicHarvester";
import { findClosestBuildSpaceLooselySpaced } from "./helper/findBuildSpace";

//var spawnModule = require("./spawning_Logic");
export function loop() {
  //testing code returns
  let timeTakenByFunction = utils.getCpuTime();
  let allCreeps = utils.getObjectsByPrototype(prototypes.Creep);
  let myCreeps = allCreeps.filter((creep) => creep.my);
  let EnemyCreeps = allCreeps.filter((creep) => creep.my);
  let allSpawns = utils.getObjectsByPrototype(prototypes.StructureSpawn);
  let mySpawn = allSpawns.find((spawn) => spawn.my);
  let MySpawnEnergy = mySpawn.store[constants.RESOURCE_ENERGY];
  let enemySpawn = allSpawns.filter((spawn) => spawn.my);
  let allSources = utils.getObjectsByPrototype(prototypes.Source);
  let mySource;

  console.log("cpu time at start: ", timeTakenByFunction);
  //get source near me if there are sources
  if (allSources.length > 0) {
    mySource = utils.findClosestByPath(mySpawn, allSources);
  }

  //get my creep lists in their respective roles
  const creepRoleList = findCreepRoles(myCreeps, mySpawn);

  if (
    mySpawn &&
    !mySpawn.spawning &&
    creepRoleList.basicHarvesters.length <= 1
  ) {
    spawnCreep(mySpawn, MySpawnEnergy, "basicHarvester");
  }

  //give orders to eco creeps
  //basic harvester orders
  if (creepRoleList.basicHarvesters.length > 0) {
    harvesterCreepLogic(creepRoleList.basicHarvesters, mySource, mySpawn);
  }
  timeTakenByFunction = utils.getCpuTime() - timeTakenByFunction;
  console.log("cpu time after creeps spawn and orders ", timeTakenByFunction);
  findClosestBuildSpaceLooselySpaced(mySource);
  timeTakenByFunction = utils.getCpuTime() - timeTakenByFunction;
  console.log("cpu time after find building ", timeTakenByFunction);
}
