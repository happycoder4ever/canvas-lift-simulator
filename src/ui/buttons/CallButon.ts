import type IRenderable from "../../core/interfaces/IRenderable";
import { Lift } from "../../core/Lift";

export class CallButton implements IRenderable {
  // Implementation of CallButton class
  private ctx: CanvasRenderingContext2D;
  private floorNumber: number;
  private x: number;
  private y: number;
  private direction: "up" | "down";
  private isLit: boolean = false;
  private lift: Lift;

  constructor(
    floorNumber: number,
    direction: "up" | "down",
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D,
    lift: Lift
  ) {
    this.ctx = ctx;
    this.lift = lift;
    this.floorNumber = floorNumber;
    this.direction = direction;
    this.x = x;
    this.y = y;
  }

  public contains(mx: number, my: number): boolean {
    let x1, y1, x2, y2, x3, y3;

    if (this.direction === "up") {
      // Up arrow
      x1 = this.x + 10;
      y1 = this.y + 5;
      x2 = this.x + 20;
      y2 = this.y + 25;
      x3 = this.x;
      y3 = this.y + 25;
    } else {
      // Down arrow
      x1 = this.x + 10;
      y1 = this.y + 25;
      x2 = this.x + 20;
      y2 = this.y + 5;
      x3 = this.x;
      y3 = this.y + 5;
    }

    const area = (
      ax: number,
      ay: number,
      bx: number,
      by: number,
      cx: number,
      cy: number
    ) => Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2);

    const areaABC = area(x1, y1, x2, y2, x3, y3);
    const areaPAB = area(mx, my, x1, y1, x2, y2);
    const areaPBC = area(mx, my, x2, y2, x3, y3);
    const areaPCA = area(mx, my, x3, y3, x1, y1);

    return Math.abs(areaABC - (areaPAB + areaPBC + areaPCA)) < 1e-6;
  }

  public onClick() {
    if (this.lift.getPowerState() !== "on") return;
    this.isLit = true;
    console.log(`Request call-${this.direction} from ${this.floorNumber + 1}F`);
    this.lift.addToSchedule(this.floorNumber, `call-${this.direction}`);
  }

  public setLit(isLit: boolean) {
    this.isLit = isLit;
  }

  public render(): void {
    this.ctx.fillStyle = this.isLit ? "#ffffff" : "#808080";

    if (this.direction === "up") {
      // Up arrow
      this.ctx.beginPath();
      this.ctx.moveTo(this.x + 10, this.y + 5);
      this.ctx.lineTo(this.x + 20, this.y + 25);
      this.ctx.lineTo(this.x, this.y + 25);
      this.ctx.closePath();
      this.ctx.fill();
    } else {
      // Down arrow
      this.ctx.beginPath();
      this.ctx.moveTo(this.x + 10, this.y + 25);
      this.ctx.lineTo(this.x + 20, this.y + 5);
      this.ctx.lineTo(this.x, this.y + 5);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
}
