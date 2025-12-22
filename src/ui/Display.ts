import type IRenderable from "../core/interfaces/IRenderable";
import type IUpdatable from "../core/interfaces/IUpdatable";
import { Lift } from "../core/Lift.js";
class Display implements IRenderable, IUpdatable {
  private ctx: CanvasRenderingContext2D;
  private lift: Lift;
  private x: number;
  private y: number;
  constructor(x: number, y: number, ctx: CanvasRenderingContext2D, lift: Lift) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.lift = lift;
  }

  public render(): void {
    // Implementation of render method
    let displayLEDX = this.x + 10;
    let displayLEDY = this.y + 10;
    console.log(`${displayLEDX}, ${displayLEDY}`);

    let displayWidth = 200;
    let displayHeight = 100;
    let displayLEDWidth = 180;
    let displayLEDHeight = 80;
    // Draw Static Objects
    // Draw Display Frame

    this.ctx.fillStyle = "#c0c0c0";
    this.ctx.fillRect(this.x, this.y, displayWidth, displayHeight);

    // Draw Display LED Screen
    this.ctx.fillStyle =
      this.lift.getPowerState() === "off" ? "#404040" : "#2020ff";
    this.ctx.fillRect(
      displayLEDX,
      displayLEDY,
      displayLEDWidth,
      displayLEDHeight
    );
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom";
    if (this.lift.getPowerState() === "starting") {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "25px Arial";
      this.ctx.fillText("Starting...", displayLEDX + 45, displayLEDY + 50);
      for (let i = 0; i < this.lift.getPowerProgress(); i++) {
        let x = displayLEDX + 30 + i * (10 + 2);
        let y = displayLEDY + 60;
        let w = 10;
        let h = 5;
        this.ctx.fillRect(x, y, w, h);
      }
    } else if (this.lift.getPowerState() === "stopping") {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "25px Arial";
      this.ctx.fillText("Stopping...", displayLEDX + 45, displayLEDY + 50);
      for (let i = 0; i < this.lift.getPowerProgress(); i++) {
        let x = displayLEDX + 30 + i * (10 + 2);
        let y = displayLEDY + 60;
        let w = 10;
        let h = 5;
        this.ctx.fillRect(x, y, w, h);
      }
    } else if (this.lift.getPowerState() === "on") {
      // Print information on the LED Screen
      // (1) Up/Down Arrows
      this.ctx.fillStyle =
        this.lift.getState() === "up" ? "#ffffff" : "#80808099";
      // Up arrow
      this.ctx.beginPath();
      this.ctx.moveTo(displayLEDX + 30, displayLEDY + 10);
      this.ctx.lineTo(displayLEDX + 50, displayLEDY + 40);
      this.ctx.lineTo(displayLEDX + 30, displayLEDY + 30);
      this.ctx.lineTo(displayLEDX + 10, displayLEDY + 40);
      this.ctx.closePath();
      this.ctx.fill();
      // Down arrow under the up arrow
      this.ctx.fillStyle =
        this.lift.getState() === "down" ? "#ffffff" : "#80808099";
      this.ctx.beginPath();
      this.ctx.moveTo(displayLEDX + 30, displayLEDY + 55);
      this.ctx.lineTo(displayLEDX + 50, displayLEDY + 45);
      this.ctx.lineTo(displayLEDX + 30, displayLEDY + 75);
      this.ctx.lineTo(displayLEDX + 10, displayLEDY + 45);
      this.ctx.closePath();
      this.ctx.fill();

      // (2) Current Floor Number
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "60px Arial";
      this.ctx.fillText(
        (this.lift.getCurrentFloor() + 1).toString(),
        displayLEDX + 60,
        displayLEDY + 75
      );

      // (3) Maximum Capacity
      this.ctx.font = "12px Arial";
      this.ctx.fillText(
        `MAX: ${this.lift.getMaxCapacity()}kg`,
        displayLEDX + 110,
        displayLEDY + 55
      );

      // (4) Current Load
      this.ctx.fillText(
        `  LD: ${this.lift.getCurrentLoad()}kg`,
        displayLEDX + 110,
        displayLEDY + 70
      );
    }

    // Draw Shadow for Display
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    // Bottom shadow
    this.ctx.fillRect(this.x + 2, this.y + displayHeight + 2, displayWidth, 2);
    // right shadow
    this.ctx.fillRect(
      this.x + displayWidth + 2,
      this.y + 2,
      2,
      displayHeight + 2
    );

    // Inner shadow falling on the LED screen
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    // Top shadow
    this.ctx.fillRect(displayLEDX, displayLEDY, displayLEDWidth, 2);
    // Left shadow
    this.ctx.fillRect(displayLEDX, displayLEDY, 2, displayLEDHeight);
  }

  public update(deltaTime: number): void {
    // Implementation of update method
  }
}

export default Display;
