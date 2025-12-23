import type IRenderable from "../core/interfaces/IRenderable";
import { CallButton } from "./buttons/CallButon";
import { Lift } from "../core/Lift";

export class FloorBox implements IRenderable {
  // Implementation of FloorBox class
  private ctx: CanvasRenderingContext2D;
  private lift: Lift;
  private floorNumber: number;
  private x: number;
  private y: number;
  private UpButton: CallButton | null = null;
  private DownButton: CallButton | null = null;

  constructor(
    floorNumber: number,
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D,
    lift: Lift
  ) {
    this.floorNumber = floorNumber;
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.lift = lift;

    if (this.floorNumber !== this.lift.getNumberOfFloors() - 1)
      this.UpButton = new CallButton(
        this.floorNumber,
        "up",
        this.x + 150,
        this.y + 10,
        ctx,
        this.lift
      );
    if (this.floorNumber !== 0)
      this.DownButton = new CallButton(
        this.floorNumber,
        "down",
        this.x + 150,
        this.y + 40,
        ctx,
        this.lift
      );
  }

  public offLight() {
    this.DownButton?.setLit(false);
    this.UpButton?.setLit(false);
  }

  public render(): void {
    let floorWidth = 200;
    let floorHeight = 80;
    let floorTextX = this.x + 25;
    let floorTextY = this.y + 50;

    // ===== 1. Gradient Background for FloorBox =====
    const grad = this.ctx.createLinearGradient(
      this.x,
      this.y,
      this.x + floorWidth,
      this.y + floorHeight
    );
    grad.addColorStop(0, "#e0e0e0"); // lighter top-left
    grad.addColorStop(1, "#a0a0a0"); // darker bottom-right
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(this.x, this.y, floorWidth, floorHeight);

    // ===== 2. Floor Number =====
    this.ctx.fillStyle =
      this.lift.getPowerState() === "on" &&
      this.floorNumber === this.lift.getCurrentFloor()
        ? "#ffffff"
        : "#000000";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(`${this.floorNumber + 1}F`, floorTextX, floorTextY);

    // ===== 3. FloorBox border for depth =====
    this.ctx.strokeStyle = "#888"; // subtle border
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.x, this.y, floorWidth, floorHeight);

    // ===== 4. Call Buttons =====
    this.UpButton?.render();
    this.DownButton?.render();
  }
}
