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
  public render(): void {
    // Implementation of render method
    // Left Panel Background
    this.ctx.fillStyle = "#2e2e4e";
    this.ctx.fillRect(0, 0, 300, 800); // Left panel

    for (let i = 0; i < this.lift.getNumberOfFloors(); i++) {
      this.floorBoxes[i].render();
    }

    // Draw a light emitting circle beside the current floor
    if(this.lift.getPowerState() === "on") {

      let currentFloor = this.lift.getCurrentFloor();
      let indicatorX = 30;
      let indicatorY = 740 - currentFloor * 100;
      // Light Emit Gradient according to blinking frame
  
      const gradient = this.ctx.createRadialGradient(
        indicatorX,
        indicatorY,
        2,
        indicatorX,
        indicatorY,
        15
      );
  
      // Smooth blinking effect
      const intensity =
        0.5 +
        0.5 *
          Math.sin(
            (this.currentLightBlinkingFrame / this.lightBlinkingPeriod) *
              2 *
              Math.PI
          );
      gradient.addColorStop(0, `rgba(255, 255, 0, ${intensity})`);
      gradient.addColorStop(1, "rgba(255, 255, 0, 0.0)");
  
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(indicatorX, indicatorY, 10, 0, Math.PI * 2);
      this.ctx.fill();
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
