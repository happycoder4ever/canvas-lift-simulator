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
  speedRate: number;
  numberofFloors: number;
  maxCapacity: number;
}

export class Lift implements IRenderable, IUpdatable {
  private config: LiftConfig;

  private currentFloor = 0;
  private currentLoad = 0;

  private state: LiftState = "idle";
  private powerState: PowerState = "off";
  private doorState: DoorState = "closed";
  private moveDirection: MoveDirection = "idle";

  private startTimer = 0;
  private waitTimer = 0;
  private doorTimer = 0;
  private moveProgress = 0;
  private time = 0;

  private scheduleList: ScheduleType[] = [];

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
      else if (this.powerState === "on") this.stop();
    });

    this.metalPattern = patternedBrush()(this.ctx);

    this.display = new Display(450, 50, this.ctx, this);
    this.controlPanel = new ControlPanel(this.ctx, this);
    this.shaft = new Shaft(this.ctx, this);

    for (let i = 0; i < this.config.numberofFloors; i++) {
      this.scheduleList.push("null");
    }

    this.loop = this.loop.bind(this);

    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      for (const btn of this.controlPanel["floorButtons"]) {
        if (btn.contains(x, y)) btn.onClick();
      }

      if (this.controlPanel["openDoorButton"].contains(x, y))
        this.controlPanel["openDoorButton"].onClick();
      else if (this.controlPanel["closeDoorButton"].contains(x, y))
        this.controlPanel["closeDoorButton"].onClick();

      for (const fb of this.shaft["floorBoxes"]) {
        if (fb["UpButton"]?.contains(x, y)) fb["UpButton"]?.onClick();
        else if (fb["DownButton"]?.contains(x, y)) fb["DownButton"]?.onClick();
      }
    });

    this.render();
  }

  /* ===========================
     PURE HELPERS
     =========================== */

  private needToMoveOn(): boolean {
    for (let i = 0; i < this.scheduleList.length; i++) {
      if (this.scheduleList[i] !== "null") return true;
    }
    return false;
  }

  private needToStop(): boolean {
    const s = this.scheduleList[this.currentFloor];
    if (s === "go") return true;
    if (s === "call-up" || s === "call-down") return true; // stop for any call on current floor
    return false;
  }

  private chooseNextDirection(): MoveDirection {
    const current = this.currentFloor;
    const floors = this.scheduleList;
    const top = this.getNumberOfFloors() - 1;

    if (this.moveDirection === "up") {
      // any scheduled floors above?
      for (let i = current + 1; i <= top; i++) {
        if (floors[i] !== "null") return "up";
      }
      // if none above, check floors below
      for (let i = current - 1; i >= 0; i--) {
        if (floors[i] !== "null") return "down";
      }
    } else if (this.moveDirection === "down") {
      // any scheduled floors below?
      for (let i = current - 1; i >= 0; i--) {
        if (floors[i] !== "null") return "down";
      }
      // if none below, check floors above
      for (let i = current + 1; i <= top; i++) {
        if (floors[i] !== "null") return "up";
      }
    } else {
      // idle → pick nearest
      let nearest: number | null = null;
      let minDist = Infinity;
      for (let i = 0; i <= top; i++) {
        if (floors[i] !== "null") {
          const d = Math.abs(i - current);
          if (d < minDist) {
            minDist = d;
            nearest = i;
          }
        }
      }
      if (nearest === null) return "idle";
      return nearest > current ? "up" : "down";
    }

    return "idle";
  }
  // Check if there are any requests in the current moving direction
  private hasRequestsInCurrentDirection(): boolean {
    return this.hasRequestsInDirection(this.moveDirection);
  }

  // Check for requests in a given direction, including opposite-type calls along the path
  private hasRequestsInDirection(direction: MoveDirection): boolean {
    const current = this.currentFloor;

    if (direction === "up") {
      for (let i = current + 1; i < this.scheduleList.length; i++) {
        const s = this.scheduleList[i];
        if (s !== "null") return true;
      }
    } else if (direction === "down") {
      for (let i = current - 1; i >= 0; i--) {
        const s = this.scheduleList[i];
        if (s !== "null") return true;
      }
    }

    return false;
  }

  private offLight() {
    this.shaft.offLight(this.currentFloor);
    this.controlPanel.offLight(this.currentFloor);
  }

  /* ===========================
     MAIN LOOP
     =========================== */

  private loop(time: number) {
    const dt = time - this.time;
    this.time = time;

    this.update(dt);
    this.render();

    if (this.powerState !== "off") {
      requestAnimationFrame(this.loop);
    }
  }

  /* ===========================
     UPDATE
     =========================== */

  public update(deltaTime: number): void {
    if (this.powerState === "starting" || this.powerState === "stopping") {
      this.startTimer += deltaTime;
      if (this.startTimer >= this.config.startingLatency) {
        this.powerState = this.powerState === "starting" ? "on" : "off";
        this.powerButton.textContent =
          this.powerState === "on" ? "Stop" : "Start";
        this.powerButton.disabled = false;
        this.startTimer = 0;
      }
      return;
    }

    if (this.powerState === "off") return;

    switch (this.state) {
      case "idle":
        if (this.needToMoveOn() && this.doorState === "closed") {
          this.moveDirection = this.chooseNextDirection();
          if (this.moveDirection !== "idle") {
            this.state = "moving";
            this.moveProgress = 0;
          }
        }
        break;

      case "moving":
        if (this.moveDirection === "idle") {
          this.state = "idle";
          break;
        }

        // Handle building boundaries
        if (
          (this.moveDirection === "down" && this.currentFloor === 0) ||
          (this.moveDirection === "up" &&
            this.currentFloor === this.getNumberOfFloors() - 1)
        ) {
          this.scheduleList[this.currentFloor] = "null";
          this.offLight();

          this.state = "doorOpening";
          this.doorState = "changing";
          this.doorTimer = 0;
          this.moveProgress = 0;
          break;
        }

        // Move progress
        this.moveProgress += this.config.speedRate * deltaTime;
        if (this.moveProgress < 100) break;

        // ARRIVAL: increment/decrement floor
        this.currentFloor =
          this.moveDirection === "up"
            ? Math.min(this.currentFloor + 1, this.getNumberOfFloors() - 1)
            : Math.max(this.currentFloor - 1, 0);
        this.moveProgress = 0;

        // STOP at floor if needed
        if (this.needToStop()) {
          this.offLight();
          this.scheduleList[this.currentFloor] = "null";

          this.state = "doorOpening";
          this.doorState = "changing";
          this.doorTimer = 0;
          break; // do not check direction now
        }

        // Determine if we should continue in current direction
        const hasRequestsAhead = this.hasRequestsInCurrentDirection();

        if (!hasRequestsAhead) {
          const opposite = this.moveDirection === "up" ? "down" : "up";
          const hasRequestsOpposite = this.hasRequestsInDirection(opposite);

          if (hasRequestsOpposite) {
            this.moveDirection = opposite;
          } else {
            this.moveDirection = "idle";
            this.state = "idle";
          }
        }
        break;

      case "doorOpening":
        this.doorTimer += deltaTime;
        if (this.doorTimer >= this.config.doorDuration) {
          this.doorState = "open";
          this.state = "waiting";
          this.waitTimer = 0;
          this.doorTimer = 0;
        }
        break;

      case "waiting":
        this.waitTimer += deltaTime;
        if (this.waitTimer >= this.config.waitDuration) {
          this.state = "doorClosing";
          this.doorState = "changing";
          this.doorTimer = 0;
        }
        break;

      case "doorClosing":
        this.doorTimer += deltaTime;
        if (this.doorTimer >= this.config.doorDuration) {
          this.doorState = "closed";
          this.doorTimer = 0;

          if (this.needToMoveOn()) {
            this.moveDirection = this.chooseNextDirection();
            this.state = "moving";
            this.moveProgress = 0;
          } else {
            this.state = "idle";
            this.moveDirection = "idle";
          }
        }
        break;
    }

    this.shaft.update(deltaTime);
    this.controlPanel.update(deltaTime);
    this.display.update(deltaTime);
  }

  /* ===========================
     RENDER
     =========================== */

  public render(): void {
    this.ctx.clearRect(0, 0, 800, 800);
    this.shaft.render();

    this.ctx.fillStyle = this.metalPattern!;
    this.ctx.fillRect(300, 0, 500, 800);

    this.display.render();
    this.controlPanel.render();
  }

  public getState(): LiftState {
    return this.state;
  }

  public getCurrentFloor(): number {
    return this.currentFloor;
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
    return this.moveProgress;
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
      else this.scheduleList[floor] = schedule;
    }
  }

  /* ===========================
     POWER
     =========================== */

  public start(): void {
    this.powerState = "starting";
    this.powerButton.textContent = "Starting...";
    this.powerButton.disabled = true;
    this.startTimer = 0;
    requestAnimationFrame(this.loop);
  }

  public stop(): void {
    this.powerState = "stopping";
    this.powerButton.textContent = "Stopping...";
    this.powerButton.disabled = true;
    this.startTimer = 0;
  }
}
