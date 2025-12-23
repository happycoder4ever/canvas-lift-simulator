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
    const shaftWidth = 300;
    const shaftHeight = 800;

    // ===== 1. Gradient Shaft Background =====
    const gradient = this.ctx.createLinearGradient(0, 0, 0, shaftHeight);
    gradient.addColorStop(0, "#1a1a3b"); // dark top
    gradient.addColorStop(1, "#2e2e4e"); // lighter bottom
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, shaftWidth, shaftHeight);

    // ===== 2. Shaft Rails =====

    // ===== 3. Floor Separation Lines =====

    // ===== 4. Optional metallic texture =====
    this.ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * shaftWidth;
      const y = Math.random() * shaftHeight;
      this.ctx.fillRect(x, y, 1, 1);
    }

    // ===== 5. Floor Boxes =====
    for (let i = 0; i < this.lift.getNumberOfFloors(); i++) {
      this.floorBoxes[i].render();
    }

    // ===== 6. Mini Cabin =====
    // ===== 1. Cabin position setup for rails alignment =====
    const cabinX = 20;
    const cabinWidth = 20;
    const railPadding = 5;
    const railTop = 0;
    const railBottom = shaftHeight;

    // ===== 2. Draw rails (always visible) =====
    this.ctx.strokeStyle = "#444";
    this.ctx.lineWidth = 2;

    // Left rail
    this.ctx.beginPath();
    this.ctx.moveTo(cabinX - railPadding, railTop);
    this.ctx.lineTo(cabinX - railPadding, railBottom);
    this.ctx.stroke();

    // Right rail
    this.ctx.beginPath();
    this.ctx.moveTo(cabinX + cabinWidth + railPadding, railTop);
    this.ctx.lineTo(cabinX + cabinWidth + railPadding, railBottom);
    this.ctx.stroke();

    // ===== 3. Draw mini-cabin only if powered on =====
    if (this.lift.getPowerState() === "on") {
      const currentFloor = this.lift.getCurrentFloor();
      let cabinY = 740 - currentFloor * 100;

      // Smooth movement
      if (this.lift.getState() === "moving") {
        const progressPixels = (this.lift.getMoveProgress() / 100) * 100;
        cabinY +=
          this.lift.getMoveDirection() === "up"
            ? -progressPixels
            : progressPixels;
      }

      const cabinHeight = 40;

      // Gradient body for 3D effect
      const cabinGradient = this.ctx.createLinearGradient(
        cabinX,
        cabinY - cabinHeight / 2,
        cabinX + cabinWidth,
        cabinY + cabinHeight / 2
      );
      cabinGradient.addColorStop(0, "#666");
      cabinGradient.addColorStop(1, "#333");
      this.ctx.fillStyle = cabinGradient;
      this.ctx.fillRect(
        cabinX,
        cabinY - cabinHeight / 2,
        cabinWidth,
        cabinHeight
      );

      // Doors
      let doorProgress = this.lift.getDoorProgress() / 100;
      if (this.lift.getDoorState() === "open") doorProgress = 1;
      if (this.lift.getState() === "doorClosing")
        doorProgress = 1 - doorProgress;

      const halfWidth = cabinWidth / 2;
      const leftDoorX = cabinX;
      const leftDoorWidth = halfWidth * (1 - doorProgress);
      const rightDoorX = cabinX + halfWidth + doorProgress * halfWidth;
      const rightDoorWidth = halfWidth * (1 - doorProgress);

      // Left door gradient
      const leftDoorGradient = this.ctx.createLinearGradient(
        leftDoorX,
        cabinY - cabinHeight / 2,
        leftDoorX + leftDoorWidth,
        cabinY + cabinHeight / 2
      );
      leftDoorGradient.addColorStop(0, "#ccc");
      leftDoorGradient.addColorStop(1, "#999");
      this.ctx.fillStyle = leftDoorGradient;
      this.ctx.fillRect(
        leftDoorX,
        cabinY - cabinHeight / 2,
        leftDoorWidth,
        cabinHeight
      );

      // Right door gradient
      const rightDoorGradient = this.ctx.createLinearGradient(
        rightDoorX,
        cabinY - cabinHeight / 2,
        rightDoorX + rightDoorWidth,
        cabinY + cabinHeight / 2
      );
      rightDoorGradient.addColorStop(0, "#ccc");
      rightDoorGradient.addColorStop(1, "#999");
      this.ctx.fillStyle = rightDoorGradient;
      this.ctx.fillRect(
        rightDoorX,
        cabinY - cabinHeight / 2,
        rightDoorWidth,
        cabinHeight
      );

      // Glass panels
      this.ctx.fillStyle = "rgba(0,0,0,0.3)";
      this.ctx.fillRect(leftDoorX + 2, cabinY - 10, leftDoorWidth - 4, 20);
      this.ctx.fillRect(rightDoorX + 2, cabinY - 10, rightDoorWidth - 4, 20);

      // Top light when moving
      if (this.lift.getState() === "moving") {
        this.ctx.fillStyle = "yellow";
        this.ctx.beginPath();
        this.ctx.arc(
          cabinX + cabinWidth / 2,
          cabinY - cabinHeight / 2 - 3,
          2,
          0,
          2 * Math.PI
        );
        this.ctx.fill();
      }

      // Outline
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 1;
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
