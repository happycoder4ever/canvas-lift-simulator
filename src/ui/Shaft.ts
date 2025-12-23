import type IRenderable from "../core/interfaces/IRenderable.js";
import type IUpdatable from "../core/interfaces/IUpdatable.js";
import { Lift } from "../core/Lift.js";
import { FloorBox } from "./FloorBox.js";

export class Shaft implements IRenderable, IUpdatable {
  private ctx: CanvasRenderingContext2D;
  private lift: Lift;
  private floorBoxes: FloorBox[] = [];
  private lightBlinkingPeriod: number = 1000; // in ms
  private currentLightBlinkingFrame: number = 0;

  constructor(ctx: CanvasRenderingContext2D, lift: Lift) {
    this.ctx = ctx;
    this.lift = lift;
    // Create FloorBoxes according to the number of floors in the lift
    for (let i = 0; i < this.lift.getNumberOfFloors(); i++) {
      const floorBox = new FloorBox(i, 50, 700 - i * 100, this.ctx, lift);
      this.floorBoxes.push(floorBox);
    }
  }

  public offLight(floorNumber: number) {
    this.floorBoxes[floorNumber].offLight();
  }
  public render(): void {
    // Implementation of render method
    // Left Panel Background
    this.ctx.fillStyle = "#2e2e4e";
    this.ctx.fillRect(0, 0, 300, 800); // Left panel

    for (let i = 0; i < this.lift.getNumberOfFloors(); i++) {
      this.floorBoxes[i].render();
    }

    // Draw a mini cabin beside the current floor
    if (this.lift.getPowerState() === "on") {
      const currentFloor = this.lift.getCurrentFloor();

      // Base X/Y for cabin
      const cabinX = 20;
      let cabinY = 740 - currentFloor * 100; // floor spacing

      // Smooth movement when lift is moving
      if (this.lift.getState() === "moving") {
        const progressPixels = (this.lift.getMoveProgress() / 100) * 100;
        cabinY +=
          this.lift.getMoveDirection() === "up"
            ? -progressPixels
            : progressPixels;
      }

      // Cabin dimensions
      const cabinWidth = 20;
      const cabinHeight = 40;

      // Draw cabin body
      this.ctx.fillStyle = "#555"; // dark gray metal
      this.ctx.fillRect(
        cabinX,
        cabinY - cabinHeight / 2,
        cabinWidth,
        cabinHeight
      );

      // Draw doors
      // Compute doorProgress for rendering
      let doorProgress = this.lift.getDoorProgress() / 100; // 0 → 1

      // Keep doors fully open if state is 'waiting' or already open
      if (this.lift.getDoorState() === "open") {
        doorProgress = 1; // fully open
      }

      // Invert progress if doors are closing
      if (this.lift.getState() === "doorClosing") {
        doorProgress = 1 - doorProgress;
      }

      const halfWidth = cabinWidth / 2;

      // Left door slides left from center
      const leftDoorX = cabinX;
      const leftDoorWidth = halfWidth * (1 - doorProgress);

      // Right door slides right from center
      const rightDoorX = cabinX + halfWidth + doorProgress * halfWidth;
      const rightDoorWidth = halfWidth * (1 - doorProgress);

      this.ctx.fillStyle = "#ccc"; // lighter for doors

      // Draw left door
      this.ctx.fillRect(
        leftDoorX,
        cabinY - cabinHeight / 2,
        leftDoorWidth,
        cabinHeight
      );

      // Draw right door
      this.ctx.fillRect(
        rightDoorX,
        cabinY - cabinHeight / 2,
        rightDoorWidth,
        cabinHeight
      );

      // Thin center line to visualize doors
      this.ctx.strokeStyle = "#555";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(cabinX + halfWidth, cabinY - cabinHeight / 2);
      this.ctx.lineTo(cabinX + halfWidth, cabinY + cabinHeight / 2);
      this.ctx.stroke();

      // Optional outline
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(
        cabinX,
        cabinY - cabinHeight / 2,
        cabinWidth,
        cabinHeight
      );
    }
  }
  public update(deltaTime: number): void {
    // Change blinking period due to the lift state
    this.lightBlinkingPeriod = this.lift.getState() === "idle" ? 2000 : 500;

    // Implementation of update method
    this.currentLightBlinkingFrame += deltaTime;
    if (this.currentLightBlinkingFrame >= this.lightBlinkingPeriod) {
      this.currentLightBlinkingFrame = 0;
    }
  }
}
