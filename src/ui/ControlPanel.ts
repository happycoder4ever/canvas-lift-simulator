import type IRenderable from "../core/interfaces/IRenderable.js";
import type IUpdatable from "../core/interfaces/IUpdatable.js";
import FloorButton from "./buttons/FloorButton.js";
import DoorOpenCloseButton from "./buttons/DoorOpenCloseButton.js";
class ControlPanel implements IRenderable, IUpdatable {
  // Implementation of ControlPanel class
  private ctx: CanvasRenderingContext2D;
  private floorButtons: FloorButton[] = [];
  private openDoorButton: DoorOpenCloseButton;
  private closeDoorButton: DoorOpenCloseButton;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    // Create floor buttons for 5 floors in a column down-up as an example
    for (let i = 0; i < 5; i++) {
      const button = new FloorButton(
        i,
        `${i + 1}`,
        550,
        600 - i * 60,
        this.ctx
      );
      this.floorButtons.push(button);
    }

    this.openDoorButton = new DoorOpenCloseButton(true, 500, 660, this.ctx);
    this.closeDoorButton = new DoorOpenCloseButton(false, 600, 660, this.ctx);
  }
  public render(): void {
    // Implementation of render method
    
    // Render Floor Buttons
    for (const button of this.floorButtons) {
      button.render();
    }
    // Render Door Open/Close Buttons
    this.openDoorButton.render();
    this.closeDoorButton.render();
  }

  public update(deltaTime: number): void {
    // Implementation of update method
  }
}

export default ControlPanel;