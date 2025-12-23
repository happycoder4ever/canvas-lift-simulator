import type IRenderable from "../core/interfaces/IRenderable";
import type IUpdatable from "../core/interfaces/IUpdatable";
import { Lift } from "../core/Lift.js";
class Display implements IRenderable, IUpdatable {
  private ctx: CanvasRenderingContext2D;
  private lift: Lift;
  private x: number;
  private y: number;
  private blinkTimer = 0;
  private blinkVisible = true;

  constructor(x: number, y: number, ctx: CanvasRenderingContext2D, lift: Lift) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.lift = lift;
  }

  public render(): void {
    const displayWidth = 200;
    const displayHeight = 100;
    const displayLEDX = this.x + 10;
    const displayLEDY = this.y + 10;
    const displayLEDWidth = 180;
    const displayLEDHeight = 80;

    // ---------- LED Screen Gradient ----------
    const ledGradient = this.ctx.createLinearGradient(
      displayLEDX,
      displayLEDY,
      displayLEDX,
      displayLEDY + displayLEDHeight
    );
    if (this.lift.getPowerState() === "off") {
      ledGradient.addColorStop(0, "#404040");
      ledGradient.addColorStop(1, "#303030");
    } else {
      ledGradient.addColorStop(0, "#1010ff");
      ledGradient.addColorStop(1, "#2020ff");
    }
    this.ctx.fillStyle = ledGradient;
    this.ctx.fillRect(
      displayLEDX,
      displayLEDY,
      displayLEDWidth,
      displayLEDHeight
    );

    // ---------- Glass Reflection ----------
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.fillRect(
      displayLEDX,
      displayLEDY,
      displayLEDWidth,
      displayLEDHeight / 3
    );

    // ---------- Inner LED Shadow ----------
    this.ctx.fillStyle = "rgba(0,0,0,0.3)";
    this.ctx.fillRect(displayLEDX, displayLEDY, displayLEDWidth, 2); // top
    this.ctx.fillRect(displayLEDX, displayLEDY, 2, displayLEDHeight); // left

    // ---------- Render Based on Power State ----------
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom";

    const renderProgressBars = () => {
      for (let i = 0; i < this.lift.getPowerProgress(); i++) {
        const x = displayLEDX + 30 + i * (10 + 2);
        const y = displayLEDY + 60;
        const w = 10;
        const h = 5;
        this.ctx.fillRect(x, y, w, h);
      }
    };

    if (this.lift.getPowerState() === "starting") {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "25px Arial";
      this.ctx.shadowColor = "#00f";
      this.ctx.shadowBlur = 8;
      this.ctx.fillText("Starting...", displayLEDX + 45, displayLEDY + 50);
      this.ctx.shadowBlur = 0;
      renderProgressBars();
    } else if (this.lift.getPowerState() === "stopping") {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "25px Arial";
      this.ctx.shadowColor = "#00f";
      this.ctx.shadowBlur = 8;
      this.ctx.fillText("Stopping...", displayLEDX + 45, displayLEDY + 50);
      this.ctx.shadowBlur = 0;
      renderProgressBars();
    } else if (this.lift.getPowerState() === "on") {
      const alpha = Math.abs(Math.sin(Date.now() / 250)); // smooth blink

      // ---------- Up Arrow ----------
      this.ctx.fillStyle =
        this.lift.getState() === "moving" &&
        this.lift.getMoveDirection() === "up"
          ? `rgba(255,255,255,${alpha})`
          : "#80808099";
      this.ctx.beginPath();
      this.ctx.moveTo(displayLEDX + 30, displayLEDY + 10);
      this.ctx.lineTo(displayLEDX + 50, displayLEDY + 40);
      this.ctx.lineTo(displayLEDX + 30, displayLEDY + 30);
      this.ctx.lineTo(displayLEDX + 10, displayLEDY + 40);
      this.ctx.closePath();
      this.ctx.shadowColor = "#00f";
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // ---------- Down Arrow ----------
      this.ctx.fillStyle =
        this.lift.getState() === "moving" &&
        this.lift.getMoveDirection() === "down"
          ? `rgba(255,255,255,${alpha})`
          : "#80808099";
      this.ctx.beginPath();
      this.ctx.moveTo(displayLEDX + 30, displayLEDY + 55);
      this.ctx.lineTo(displayLEDX + 50, displayLEDY + 45);
      this.ctx.lineTo(displayLEDX + 30, displayLEDY + 75);
      this.ctx.lineTo(displayLEDX + 10, displayLEDY + 45);
      this.ctx.closePath();
      this.ctx.shadowColor = "#00f";
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // ---------- Current Floor ----------
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "60px Arial";
      this.ctx.shadowColor = "#00f";
      this.ctx.shadowBlur = 10;
      this.ctx.fillText(
        (this.lift.getCurrentFloor() + 1).toString(),
        displayLEDX + 60,
        displayLEDY + 75
      );
      this.ctx.shadowBlur = 0;

      this.ctx.font = "12px Arial";
      // ---------- Maximum Capacity ----------
      this.ctx.fillText(
        `MAX: ${this.lift.getMaxCapacity()}kg`,
        displayLEDX + 110,
        displayLEDY + 75
      );

      // ---------- Optional Scanlines ----------
      this.ctx.fillStyle = "rgba(255,255,255,0.02)";
      for (let i = 0; i < displayLEDHeight; i += 2) {
        this.ctx.fillRect(displayLEDX, displayLEDY + i, displayLEDWidth, 1);
      }
    }
  }

  public update(deltaTime: number): void {
    // Blink arrows every 500ms
    this.blinkTimer += deltaTime;
    if (this.blinkTimer >= 500) {
      this.blinkVisible = !this.blinkVisible;
      this.blinkTimer = 0;
    }
  }
}

export default Display;
