import type IRenderable from "../../core/interfaces/IRenderable";
class ControlButton implements IRenderable {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private label: string;
  private isLit: boolean = false;

  private ctx: CanvasRenderingContext2D;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    ctx: CanvasRenderingContext2D
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.label = label;
  }

  public setLit(lit: boolean): void {
    this.isLit = lit;
  }

  public render(): void {
    // Implementation of render method
    // Draw button background circles
    // 0. shadow
    this.ctx.fillStyle = this.isLit
      ? "rgba(0, 0, 0, 0.2)"
      : "rgba(0, 0, 0, 0.5)";
    this.ctx.beginPath();
    this.ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2 + 2,
      this.width / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    // 1. base circle
    this.ctx.fillStyle = "#404040";
    this.ctx.beginPath();
    this.ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // 2. thin light ring
    this.ctx.strokeStyle = this.isLit ? "#ffffff" : "#c0c0c0";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2 - 1,
      0,
      Math.PI * 2
    );
    this.ctx.stroke();

    // 3. inner surface
    this.ctx.fillStyle = this.isLit ? "#c0c0c0" : "#e0e0e0";
    this.ctx.beginPath();
    this.ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2 - 3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw label
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.font = "24px Arial bold";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      this.label,
      this.x + this.width / 2 + 1,
      this.y + this.height / 2 + 1
    );

    this.ctx.fillStyle = this.isLit ? "#e2e2bcff" : "#404040";
    this.ctx.strokeStyle = this.isLit ? "#f0f0f0ff" : "#202020";
    this.ctx.fillText(
      this.label,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }
}
export default ControlButton;
