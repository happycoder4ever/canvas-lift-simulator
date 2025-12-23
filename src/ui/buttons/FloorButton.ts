import ControlButton from "./ControlButton";
import { Lift } from "../../core/Lift";
class FloorButton extends ControlButton {
  private floorId: number;
  private lift: Lift;

  constructor(
    floorId: number,
    floorLabel: string,
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D,
    lift: Lift
  ) {
    super(x, y, 50, 50, floorLabel, ctx);
    this.floorId = floorId;
    this.lift = lift;
  }

  public push(): void {
    // Implementation of push method
  }

  public onClick(): void {
    if (this.lift.getPowerState() !== "on") return;
    this.setLit(true);

    this.lift.addToSchedule(this.floorId, "go");
  }
}
export default FloorButton;
