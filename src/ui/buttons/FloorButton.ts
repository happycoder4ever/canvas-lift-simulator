import ControlButton from "./ControlButton";
class FloorButton extends ControlButton {
  private floorId: number;

  constructor(
    floorId: number,
    floorLabel: string,
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D
  ) {
    super(x, y, 50, 50, floorLabel, ctx);
    this.floorId = floorId;
  }

  public push(): void {
    // Implementation of push method
  }

  public onClick(): void {
    this.setLit(true);
    console.log(`Floor ${this.floorId} selected`);
  }
}
export default FloorButton;
