import { patternedBrush } from "../render/StainlessSteelPattern";
import type IRenderable from "./interfaces/IRenderable";
import type IUpdatable from "./interfaces/IUpdatable";
import ControlPanel from "../ui/ControlPanel";
import Display from "../ui/Display";

export class Lift implements IRenderable, IUpdatable {
  private numberofFloors: number;
  private time: number = 0;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private metalPattern: CanvasPattern | null = null;

  private controlPanel: ControlPanel;
  private display: Display;

  constructor(
    floors: number,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    this.canvas = canvas;
    this.numberofFloors = floors;
    this.ctx = ctx;
    this.metalPattern = patternedBrush()(this.ctx);
    this.display = new Display(this.ctx);
    this.controlPanel = new ControlPanel(this.ctx);
    this.loop = this.loop.bind(this);

    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      // Check if any control panel buttons are clicked
      for (const button of this.controlPanel["floorButtons"]) {
        if (button.contains(mouseX, mouseY)) {
          button.onClick();
        }
      }
      if (this.controlPanel["openDoorButton"].contains(mouseX, mouseY)) {
        this.controlPanel["openDoorButton"].onClick();
      } else if (
        this.controlPanel["closeDoorButton"].contains(mouseX, mouseY)
      ) {
        this.controlPanel["closeDoorButton"].onClick();
      }
    });
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

    // 2.1 Render Display & ControlPanel
    this.display.render();
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
  }
  public update(deltaTime: number): void {
    // Implementation of the update method
  }
  public start(): void {
    requestAnimationFrame(this.loop);
  }

  public stop(): void {
    // Implementation to stop the loop if needed
  }
}
