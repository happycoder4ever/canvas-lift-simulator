import { patternedBrush } from "./render/StainlessSteelPattern";
import type IRenderable from "./core/interfaces/IRenderable";
import type IUpdatable from "./core/interfaces/IUpdatable";
import FloorButton from "./ui/buttons/FloorButton";
import DoorOpenCloseButton from "./ui/buttons/DoorOpenCloseButton";
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
    let displayX = 450;
    let displayY = 50;
    let displayLEDX = displayX + 10;
    let displayLEDY = displayY + 10;
    let displayWidth = 200;
    let displayHeight = 100;
    let displayLEDWidth = 180;
    let displayLEDHeight = 80;
    // Draw Static Objects
    // Draw Display Frame

    this.ctx.fillStyle = "#c0c0c0";
    this.ctx.fillRect(displayX, displayY, displayWidth, displayHeight);

    // Draw Display LED Screen
    this.ctx.fillStyle = "#2020ff";
    this.ctx.fillRect(
      displayLEDX,
      displayLEDY,
      displayLEDWidth,
      displayLEDHeight
    );

    // Draw Shadow for Display
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    // Bottom shadow
    this.ctx.fillRect(
      displayX + 2,
      displayY + displayHeight + 2,
      displayWidth,
      2
    );
    // right shadow
    this.ctx.fillRect(
      displayX + displayWidth + 2,
      displayY + 2,
      2,
      displayHeight + 2
    );

    // Inner shadow falling on the LED screen
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    // Top shadow
    this.ctx.fillRect(displayLEDX, displayLEDY, displayLEDWidth, 2);
    // Left shadow
    this.ctx.fillRect(displayLEDX, displayLEDY, 2, displayLEDHeight);

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
export class Lift implements IRenderable, IUpdatable {
  private numberofFloors: number;
  private time: number = 0;
  private ctx: CanvasRenderingContext2D;
  private metalPattern: CanvasPattern | null = null;

  private controlPanel: ControlPanel;

  constructor(floors: number = 5, ctx: CanvasRenderingContext2D) {
    this.numberofFloors = floors;
    this.ctx = ctx;
    this.metalPattern = patternedBrush()(this.ctx);
    this.controlPanel = new ControlPanel(this.ctx);
    this.loop = this.loop.bind(this);
  }

  private loop(time: number): void {
    // Implementation of the loop method
    const deltaTime = time - this.time;
    this.update(deltaTime);
    this.render();
    this.time = time;
    requestAnimationFrame(this.loop);
  }

  public render(): void {
    // Implementation of the render method
    // Use static 800x800 dimensions for prototyping
    // 1. Clear the canvas or set up the drawing context
    this.ctx.clearRect(0, 0, 800, 800);

    // 2. Draw static elements (e.g., left panel of floor boxes, and right panel background)
    // Left Panel Background
    this.ctx.fillStyle = "#2e2e4e";
    this.ctx.fillRect(0, 0, 300, 800); // Left panel

    for (let i = 0; i < this.numberofFloors; i++) {
      let floorX = 50;
      let floorY = 700 - i * 100;
      let floorWidth = 200;
      let floorHeight = 80;
      let floorTextX = floorX + 35;
      let floorTextY = floorY + 50;
      let floorButtonUpX = floorX + 150;
      let floorButtonUpY = floorY + 10;
      let floorButtonDownX = floorX + 150;
      let floorButtonDownY = floorY + 40;
      // Draw Floor Box
      this.ctx.fillStyle = "#c0c0c0";
      this.ctx.fillRect(floorX, floorY, floorWidth, floorHeight);
      this.ctx.fillStyle = "#000000";
      this.ctx.font = "30px Arial";
      this.ctx.fillText(`${i + 1}F`, floorTextX, floorTextY);

      // Draw Call Buttons for each floor, Up and Down
      this.ctx.fillStyle = "#808080";
      // Up arrow
      this.ctx.beginPath();
      this.ctx.moveTo(floorButtonUpX + 10, floorButtonUpY + 5);
      this.ctx.lineTo(floorButtonUpX + 20, floorButtonUpY + 25);
      this.ctx.lineTo(floorButtonUpX, floorButtonUpY + 25);
      this.ctx.closePath();
      this.ctx.fill();
      // Down arrow
      this.ctx.beginPath();
      this.ctx.moveTo(floorButtonDownX + 10, floorButtonDownY + 25);
      this.ctx.lineTo(floorButtonDownX + 20, floorButtonDownY + 5);
      this.ctx.lineTo(floorButtonDownX, floorButtonDownY + 5);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Right Panel Background with Metal Pattern
    this.ctx.fillStyle = this.metalPattern!;
    this.ctx.fillRect(300, 0, 500, 800); // Right panel

    // 2.1 Render ControlPanel
    this.controlPanel.render();

    // Specular highlight on the right panel
    const gradient = this.ctx.createLinearGradient(300, 0, 800, 0);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.0)");
    gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.2)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.2)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(300, 0, 500, 800);

    // 3. Draw dynamic elements (e.g., cabin indicator on the left, and the display on the right)
    console.log("Lift rendered");
  }
  public update(deltaTime: number): void {
    console.log(`Lift updated with deltaTime: ${deltaTime}`);
  }
  public start(): void {
    requestAnimationFrame(this.loop);
  }

  public stop(): void {
    // Implementation to stop the loop if needed
  }
}
