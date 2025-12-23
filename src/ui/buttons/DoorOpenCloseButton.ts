import ControlButton from "./ControlButton.js";
import { Lift } from "../../core/Lift";
class DoorOpenCloseButton extends ControlButton {
  private isOpenButton: boolean;
  private lift: Lift;
  constructor(
    isOpenButton: boolean,
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D,
    lift: Lift
  ) {
    const label = isOpenButton ? "[ ]" : "][";
    super(x, y, 50, 50, label, ctx);
    this.isOpenButton = isOpenButton;
    this.lift = lift;
  }
  public onClick(): void {
    if (this.lift.getPowerState() !== "on") return;
    console.log(this.isOpenButton ? "Door open" : "Door close");
    this.setLit(true);
  }
}

export default DoorOpenCloseButton;
