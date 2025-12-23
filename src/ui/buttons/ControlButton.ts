import type IRenderable from "../../core/interfaces/IRenderable";
import { Lift } from "../../core/Lift";
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
  public contains(mx: number, my: number): boolean {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    const dx = mx - cx;
    const dy = my - cy;

    return dx * dx + dy * dy <= r * r;
  }

  public setLit(lit: boolean): void {
    this.isLit = lit;
  }

  public getLit(): boolean {
    return this.isLit;
  }

  public render(): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width / 2;

    // ===== 0. Shadow behind button =====
    this.ctx.fillStyle = "rgba(0,0,0,0.2)";
    this.ctx.beginPath();
    this.ctx.arc(cx, cy + 2, r, 0, Math.PI * 2);
    this.ctx.fill();

    // ===== 1. Flat metallic button face (always neutral) =====
    const grad = this.ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    grad.addColorStop(0, "#f0f0f0");
    grad.addColorStop(0.5, "#999999");
    grad.addColorStop(1, "#666666");
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();

    // ===== 2. Outer ring for lit effect =====
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = this.isLit
      ? "rgba(255,255,180,0.9)"
      : "rgba(0,0,0,0.3)";
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    this.ctx.stroke();

    // ===== 3. Engraved / glowing label =====
    this.ctx.fillStyle = this.isLit ? "#ffffaa" : "#111";
    this.ctx.font = `${r * 0.8}px Arial bold`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(this.label, cx, cy);

    // ===== 4. Optional small top highlight =====
    this.ctx.fillStyle = "rgba(255,255,255,0.15)";
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy - r / 2, r / 2, r / 5, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
export default ControlButton;
