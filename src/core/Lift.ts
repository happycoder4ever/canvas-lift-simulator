import { patternedBrush } from "../render/StainlessSteelPattern";
import type IRenderable from "./interfaces/IRenderable";
import type IUpdatable from "./interfaces/IUpdatable";
import ControlPanel from "../ui/ControlPanel";
import Display from "../ui/Display";
import { Shaft } from "../ui/Shaft";

type LiftState = "idle" | "moving" | "doorOpening" | "doorClosing" | "waiting";
type DoorState = "open" | "closed" | "changing";
type ScheduleType = "null" | "call-up" | "call-down" | "go" | "error";
type PowerState = "on" | "off" | "starting" | "stopping";
type MoveDirection = "up" | "down" | "idle";
export interface LiftConfig {
  startingLatency: number;
  waitDuration: number;
  doorDuration: number;
  speedRate: number; // speed repsented percent per millisecond; 0.04 (moves 0.04% of the floor height per milliesecond, meaning 40% per second)
  numberofFloors: number;
  maxCapacity: number; // maximum capacity in kg
}
export class Lift implements IRenderable, IUpdatable {
  // basic configuration
  private config: LiftConfig;

  // current parameters
  private currentFloor: number = 0;
  private currentLoad: number = 0; // in kg
  private state: LiftState = "idle";
  private powerState: PowerState = "off";
  private doorState: DoorState = "closed";
  private moveDirection: MoveDirection = "idle";
  // tick timers
  private startTimer: number = 0;
  private waitTimer: number = 0;
  private doorTimer: number = 0;
  private moveTimer: number = 0;

  private scheduleList: ScheduleType[] = [];

  // working time
  private time: number = 0;

  private ctx: CanvasRenderingContext2D;
  private metalPattern: CanvasPattern | null = null;
  private powerButton: HTMLButtonElement;
  private controlPanel: ControlPanel;
  private display: Display;
  private shaft: Shaft;

  constructor(
    config: LiftConfig,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    button: HTMLButtonElement
  ) {
    this.config = config;
    this.ctx = ctx;
    this.powerButton = button;
    button.textContent = "Start";
    button.addEventListener("click", () => {
      if (this.powerState === "off") this.start();
      if (this.powerState === "on") this.stop();
    });

    this.metalPattern = patternedBrush()(this.ctx);
    this.display = new Display(450, 50, this.ctx, this);
    this.controlPanel = new ControlPanel(this.ctx, this);
    this.shaft = new Shaft(this.ctx, this);

    for (let i = 0; i < this.config.numberofFloors; i++)
      this.scheduleList.push("null");

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

      for (const floorBox of this.shaft["floorBoxes"]) {
        if (floorBox["UpButton"]?.contains(mouseX, mouseY))
          floorBox["UpButton"]?.onClick();
        else if (floorBox["DownButton"]?.contains(mouseX, mouseY))
          floorBox["DownButton"]?.onClick();
      }
    });
    this.render();
  }

  public getState(): LiftState {
    return this.state;
  }

  public getCurrentFloor(): number {
    // Implementation to get the current floor
    return this.currentFloor; // Placeholder
  }

  public getMaxCapacity(): number {
    return this.config.maxCapacity;
  }

  public getCurrentLoad(): number {
    return this.currentLoad;
  }

  public getNumberOfFloors(): number {
    return this.config.numberofFloors;
  }

  public getPowerState(): PowerState {
    return this.powerState;
  }

  public getPowerProgress(): number {
    return (this.startTimer / this.config.waitDuration) * 10;
  }

  public getDoorState(): DoorState {
    return this.doorState;
  }

  public getMoveProgress(): number {
    return this.moveTimer;
  }

  public getMoveDirection(): MoveDirection {
    return this.moveDirection;
  }
  public getDoorProgress(): number {
    return (this.doorTimer / this.config.doorDuration) * 100;
  }

  public getSchedule(floor: number): ScheduleType {
    if (floor >= 0 && floor < this.config.numberofFloors)
      return this.scheduleList[floor];
    return "error";
  }

  public addToSchedule(floor: number, schedule: ScheduleType): void {
    if (floor >= 0 && floor < this.config.numberofFloors) {
      if (schedule === "go") this.scheduleList[floor] = "go";
      else if (this.scheduleList[floor] === "go") return;
    }
  }

  private loop(time: number): void {
    // Implementation of the loop method
    const deltaTime = time - this.time;
    this.update(deltaTime);
    this.render();
    this.time = time;
    if (this.powerState !== "off") requestAnimationFrame(this.loop);
  }

  public render(): void {
    // Implementation of the render method
    // Use static 800x800 dimensions for prototyping
    // 1. Clear the canvas or set up the drawing context
    this.ctx.clearRect(0, 0, 800, 800);

    // 2. Draw static elements (e.g., left panel of floor boxes, and right panel background)
    this.shaft.render();

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
    // for smooth starting / stopping
    if (this.powerState === "starting") {
      this.startTimer += deltaTime;
      if (this.startTimer >= this.config.startingLatency) {
        this.powerState = "on";
        console.log(`Power is on`);
        this.powerButton.disabled = false;
        this.powerButton.textContent = "Stop";
        this.startTimer = 0;
      } else return;
    }
    if (this.powerState === "stopping") {
      this.startTimer += deltaTime;
      if (this.startTimer >= this.config.startingLatency) {
        this.powerState = "off";
        console.log(`Power is off`);
        this.powerButton.disabled = false;
        this.powerButton.textContent = "Start";
        this.startTimer = 0;
      } else return;
    }

    if (this.powerState === "off") return;

    switch (this.state) {
      case "idle":
        if (this.scheduleList[this.currentFloor] !== "null") {
          this.state = "doorOpening";
          if (this.scheduleList[this.currentFloor] === "call-up")
            this.moveDirection = "up";
          else if (this.scheduleList[this.currentFloor] === "call-down")
            this.moveDirection = "down";
          this.doorTimer = 0;
          break;
        }
        let hasCall = false;
        for (let i = 0; i < this.config.numberofFloors; i++) {
          if (this.scheduleList[i] !== "null") {
            hasCall = true;
            if (i < this.currentFloor) this.moveDirection = "down";
            else if (i > this.currentFloor) this.moveDirection = "up";
            break;
          }
        }
        if (hasCall) {
          if (this.doorState === "closed") this.state = "moving";
          else this.state = "doorClosing";
          this.doorTimer = 0;
        }
        break;
      case "moving":
        this.moveTimer += this.config.speedRate * deltaTime;
        switch (this.moveDirection) {
          case "up":
            if (this.moveTimer < 100) break;
            if (this.currentFloor < this.getNumberOfFloors() - 1) {
              if (this.scheduleList[this.currentFloor + 1] === "null") {
                this.moveTimer = 0;
              } else {
                this.state = "doorOpening";
              }
              this.currentFloor += 1;
            } else {
              this.state = "doorOpening";
              this.doorTimer = 0;
              this.currentFloor = this.getCurrentFloor() - 1;
              this.moveDirection = "idle";
            }
            break;
          case "down":
            if (this.moveTimer < 100) break;
            if (this.currentFloor > 0) {
              if (this.scheduleList[this.currentFloor - 1] === "null") {
                this.moveTimer = 0;
              } else {
                this.state = "doorOpening";
                this.doorTimer = 0;
              }
              this.currentFloor -= 1;
            } else {
              this.state = "doorOpening";
              this.doorTimer = 0;
              this.currentFloor = 0;
              this.moveDirection = "idle";
            }
            break;
          default:
            break;
        }
        break;
      case "doorClosing":
        if (this.doorState !== "closed") {
          this.doorTimer += deltaTime;
          this.doorState = "changing";
          if (this.doorTimer >= this.config.doorDuration) {
            this.doorState = "closed";
            if (this.moveDirection !== "idle") {
              this.state = "moving";
              this.moveTimer = 0;
            } else this.state = "idle";
          }
        }
        break;
      case "doorOpening":
        if (this.doorState !== "open") {
          this.doorTimer += deltaTime;
          if (this.doorTimer >= this.config.doorDuration) {
            this.doorState = "open";
            this.state = "waiting";
            this.waitTimer = 0;
          }
        }
        break;
      case "waiting":
        this.waitTimer += deltaTime;
        if (this.waitTimer < this.config.waitDuration) break;
        if (this.doorState === "open") {
          this.state = "doorClosing";
          this.doorTimer = 0;
        } else if (this.doorState === "closed") {
          if (this.moveDirection !== "idle") {
            this.state = "moving";
            this.moveTimer = 0;
          } else this.state = "idle";
        }

        break;
    }
    // Implementation of the update method
    this.shaft.update(deltaTime);
    this.controlPanel.update(deltaTime);
    this.display.update(deltaTime);
  }
  public start(): void {
    console.log("Starting...");
    this.powerButton.textContent = "Starting...";
    this.powerButton.disabled = true;

    this.powerState = "starting";
    this.startTimer = 0;

    requestAnimationFrame(this.loop);
  }

  public stop(): void {
    console.log("Stopping...");
    this.powerButton.textContent = "Stopping...";
    this.powerButton.disabled = true;

    this.powerState = "stopping";
    this.startTimer = 0;
  }
}
