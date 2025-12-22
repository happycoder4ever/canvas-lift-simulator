import type IRenderable from "../core/interfaces/IRenderable";
import type IUpdatable from "../core/interfaces/IUpdatable";

class Display implements IRenderable, IUpdatable {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  public render(): void {
    // Implementation of render method
    let displayX = 450;
    let displayY = 50;
    let displayLEDX = displayX + 10;
    let displayLEDY = displayY + 10;
    let displayWidth = 200;
    let displayHeight = 100;
    let displayLEDWidth = 180;
    let displayLEDHeight = 80;
    // Draw Static Objects
    // Draw Display Frame

    this.ctx.fillStyle = "#c0c0c0";
    this.ctx.fillRect(displayX, displayY, displayWidth, displayHeight);

    // Draw Display LED Screen
    this.ctx.fillStyle = "#2020ff";
    this.ctx.fillRect(
      displayLEDX,
      displayLEDY,
      displayLEDWidth,
      displayLEDHeight
    );

    // Print information on the LED Screen
    // (1) Up/Down Arrows
    this.ctx.fillStyle = "#ffffff";
    // Up arrow
    this.ctx.beginPath();
    this.ctx.moveTo(displayLEDX + 30, displayLEDY + 10);
    this.ctx.lineTo(displayLEDX + 50, displayLEDY + 40);
    this.ctx.lineTo(displayLEDX + 30, displayLEDY + 30);
    this.ctx.lineTo(displayLEDX + 10, displayLEDY + 40);
    this.ctx.closePath();
    this.ctx.fill();
    // Down arrow under the up arrow
    this.ctx.fillStyle = "#a0a0a0";
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
    this.ctx.fillText("3", displayLEDX + 75, displayLEDY + 50);

    // (3) Maximum Capacity
    this.ctx.font = "12px Arial";
    this.ctx.fillText("MAX: 450kg", displayLEDX + 140, displayLEDY + 55);
    this.ctx.fillText(" LD: 150kg", displayLEDX + 140, displayLEDY + 70);

    // Draw Shadow for Display
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    // Bottom shadow
    this.ctx.fillRect(
      displayX + 2,
      displayY + displayHeight + 2,
      displayWidth,
      2
    );
    // right shadow
    this.ctx.fillRect(
      displayX + displayWidth + 2,
      displayY + 2,
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
