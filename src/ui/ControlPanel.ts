import type IRenderable from "../core/interfaces/IRenderable";
import type IUpdatable from "../core/interfaces/IUpdatable";
import FloorButton from "./buttons/FloorButton";
import DoorOpenCloseButton from "./buttons/DoorOpenCloseButton";
import { Lift } from "../core/Lift.js";
class ControlPanel implements IRenderable, IUpdatable {
  // Implementation of ControlPanel class
  private ctx: CanvasRenderingContext2D;
  private floorButtons: FloorButton[] = [];
  private openDoorButton: DoorOpenCloseButton;
  private closeDoorButton: DoorOpenCloseButton;
  private lift: Lift;
  constructor(ctx: CanvasRenderingContext2D, lift: Lift) {
    this.ctx = ctx;
    this.lift = lift;
    // Create floor buttons for 5 floors in a column down-up as an example
    for (let i = 0; i < this.lift.getNumberOfFloors(); i++) {
      const button = new FloorButton(
        i,
        `${i + 1}`,
        530,
        600 - i * 60,
        this.ctx,
        lift
      );

      this.floorButtons.push(button);
    }

    this.openDoorButton = new DoorOpenCloseButton(
      true,
      480,
      660,
      this.ctx,
      lift
    );

    this.closeDoorButton = new DoorOpenCloseButton(
      false,
      580,
      660,
      this.ctx,
      lift
    );
  }

  public offLight(floorNumber: number) {
    this.floorButtons[floorNumber]?.setLit(false);
  }
  public render(): void {
    for (const [index, button] of this.floorButtons.entries()) {
      // Only turn on if schedule exists and the button is not already lit
      if (this.lift.getSchedule(index) !== "null" && !button.getLit()) {
        button.setLit(true);
      }

      // Do NOT forcibly turn off here — rely on offLight() to handle that
      button.render();
    }

    this.openDoorButton.render();
    this.closeDoorButton.render();
  }

  public update(deltaTime: number): void {
    // Implementation of update method
  }
}

export default ControlPanel;
