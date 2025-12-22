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
  private UpButton: CallButton;
  private DownButton: CallButton;

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

    this.UpButton = new CallButton(
      this.floorNumber,
      "up",
      this.x + 150,
      this.y + 10,
      ctx,
      this.lift
    );
    this.DownButton = new CallButton(
      this.floorNumber,
      "down",
      this.x + 150,
      this.y + 40,
      ctx,
      this.lift
    );
  }

  public render(): void {
    let floorWidth = 200;
    let floorHeight = 80;
    let floorTextX = this.x + 35;
    let floorTextY = this.y + 50;
    // Draw Floor Box
    this.ctx.fillStyle = "#c0c0c0";
    this.ctx.fillRect(this.x, this.y, floorWidth, floorHeight);
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(`${this.floorNumber + 1}F`, floorTextX, floorTextY);

    // Draw Call Buttons for each floor, Up and Down
    this.UpButton.render();
    this.DownButton.render();
  }
}
