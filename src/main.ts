import { Lift, type LiftConfig } from "./core/Lift";

const canvas = document.getElementById("main") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const powerButton = document.getElementById("power") as HTMLButtonElement;

const config: LiftConfig = {
  startingLatency: 3000,
  waitDuration: 3000,
  doorDuration: 2000,
  speedRate: 0.05,
  numberofFloors: 5,
  maxCapacity: 450,
};

new Lift(config, canvas!, ctx!, powerButton);
