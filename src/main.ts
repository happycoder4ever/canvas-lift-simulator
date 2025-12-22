import { Lift } from "./core/Lift";

const canvas = document.getElementById("main") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const lift = new Lift( 5, canvas!, ctx!);
lift.start();
