import { Lift } from "./Lift";

const canvas = document.getElementById("main") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const lift = new Lift(5, ctx!);
lift.start();