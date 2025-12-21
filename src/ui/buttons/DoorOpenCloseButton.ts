import ControlButton from "./ControlButton.js";
class DoorOpenCloseButton extends ControlButton {
  private isOpenButton: boolean;
  constructor(
    isOpenButton: boolean,
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D
  ) {
    const label = isOpenButton ? "[ ]" : "][";
    super(x, y, 50, 50, label, ctx);
    this.isOpenButton = isOpenButton;
  }
}

export default DoorOpenCloseButton;
