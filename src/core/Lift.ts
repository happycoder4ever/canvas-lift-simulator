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

  private currentFloor: number = 0;
  private currentLoad: number = 0;
  private state: LiftState = "idle";
  private powerState: PowerState = "off";
  private doorState: DoorState = "closed";
  private moveDirection: MoveDirection = "idle";

  private startTimer: number = 0;
  private waitTimer: number = 0;
  private doorTimer: number = 0;
  private moveProgress: number = 0;

  private scheduleList: ScheduleType[] = [];

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
      for (const button of this.controlPanel["floorButtons"]) {
        if (button.contains(mouseX, mouseY)) button.onClick();
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

  private loop(time: number): void {
    const deltaTime = time - this.time;
    this.update(deltaTime);
    this.render();
    this.time = time;
    if (this.powerState !== "off") requestAnimationFrame(this.loop);
  }

  public render(): void {
    this.ctx.clearRect(0, 0, 800, 800);
    this.shaft.render();
    this.ctx.fillStyle = this.metalPattern!;
    this.ctx.fillRect(300, 0, 500, 800);
    this.display.render();
    this.controlPanel.render();

    const gradient = this.ctx.createLinearGradient(300, 0, 800, 0);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.0)");
    gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.2)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.2)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(300, 0, 500, 800);

    this.ctx.fillStyle = "#000000";
    this.ctx.font = "12pt Arial";
    this.ctx.fillText(this.doorState, 400, 10);
  }

  private needToStop() {
    switch (this.moveDirection) {
      case "up":
        if (this.currentFloor === this.getNumberOfFloors() - 1) return true;
        if (
          this.scheduleList[this.currentFloor] === "go" ||
          this.scheduleList[this.currentFloor] === "call-up"
        )
          return true;
        break;
      case "down":
        if (this.currentFloor === 0) return true;
        if (
          this.scheduleList[this.currentFloor] === "go" ||
          this.scheduleList[this.currentFloor] === "call-down"
        )
          return true;
        break;
      default:
        break;
    }
    return false;
  }

  private needToMoveOn() {
    switch (this.moveDirection) {
      case "up":
        for (let fr = this.currentFloor; fr < this.getNumberOfFloors(); fr++) {
          if (
            this.scheduleList[fr] === "go" ||
            this.scheduleList[fr] === "call-up"
          )
            return true;
          let lastCall = true;
          if (this.scheduleList[fr] === "call-down") {
            for (let frup = fr + 1; frup < this.getNumberOfFloors(); frup++) {
              if (
                this.scheduleList[frup] === "go" &&
                this.scheduleList[frup] === "call-up"
              ) {
                lastCall = false;
                break;
              }
            }
            if (lastCall) return true;
          }
        }
        return false;
      case "down":
        for (let fr = this.currentFloor; fr >= 0; fr--) {
          if (
            this.scheduleList[fr] === "go" ||
            this.scheduleList[fr] === "call-down"
          )
            return true;
          let lastCall = true;
          if (this.scheduleList[fr] === "call-up") {
            for (let frup = fr - 1; frup >= 0; frup--) {
              if (
                this.scheduleList[frup] === "go" &&
                this.scheduleList[frup] === "call-down"
              ) {
                lastCall = false;
                break;
              }
            }
            if (lastCall) return true;
          }
        }
        return false;
    }
  }

  private offLight() {
    this.shaft.offLight(this.currentFloor);
    this.controlPanel.offLight(this.currentFloor);
  }

  public update(deltaTime: number): void {
    if (this.powerState === "starting") {
      this.startTimer += deltaTime;
      if (this.startTimer >= this.config.startingLatency) {
        this.powerState = "on";
        this.powerButton.disabled = false;
        this.powerButton.textContent = "Stop";
        this.startTimer = 0;
      } else return;
    }
    if (this.powerState === "stopping") {
      this.startTimer += deltaTime;
      if (this.startTimer >= this.config.startingLatency) {
        this.powerState = "off";
        this.powerButton.disabled = false;
        this.powerButton.textContent = "Start";
        this.startTimer = 0;
      } else return;
    }

    if (this.powerState === "off") return;

    switch (this.state) {
      case "idle":
        // idle occurs only if doors are closed
        let hasCall = false;
        for (let i = 0; i < this.config.numberofFloors; i++) {
          if (this.scheduleList[i] !== "null") {
            hasCall = true;
            this.moveDirection = i < this.currentFloor ? "down" : "up";
            break;
          }
        }
        if (hasCall && this.doorState === "closed") {
          this.state = "moving";
          this.moveProgress = 0;
          this.doorTimer = 0;
        }
        break;

      case "moving":
        this.moveProgress += this.config.speedRate * deltaTime;
        if (this.moveProgress < 100) break;
        switch (this.moveDirection) {
          case "up":
            this.currentFloor = Math.min(
              this.currentFloor + 1,
              this.getNumberOfFloors() - 1
            );
            if (this.needToStop()) {
              this.state = "doorOpening";
              this.doorState = "changing";
              this.doorTimer = 0;
              this.offLight();
            }
            this.moveProgress = 0;
            break;
          case "down":
            this.currentFloor = Math.max(this.currentFloor - 1, 0);
            if (this.needToStop()) {
              this.state = "doorOpening";
              this.doorState = "changing"
              this.doorTimer = 0;
              this.offLight();
            }
            this.moveProgress = 0;
            break;
          default:
            this.state = "idle";
            this.moveProgress = 0;
            break;
        }
        break;

      case "doorOpening":
        this.doorTimer += deltaTime;
        if (this.doorTimer >= this.config.doorDuration) {
          this.doorState = "open";
          if (this.scheduleList[this.currentFloor] !== "null")
            this.scheduleList[this.currentFloor] = "null";
          this.waitTimer = 0;
          this.doorTimer = 0;
          this.state = "waiting"; // doors stay open during waiting
        }
        break;

      case "waiting":
        this.waitTimer += deltaTime;
        if (this.waitTimer >= this.config.waitDuration) {
          // after waiting, doors close before going idle or moving
          this.state = "doorClosing";
          this.doorState = "changing"
          this.doorTimer = 0;
          this.waitTimer = 0;
        }
        break;

      case "doorClosing":
        this.doorTimer += deltaTime;
        if (this.doorTimer >= this.config.doorDuration) {
          this.doorState = "closed";
          if (this.needToMoveOn()) {
            this.state = "moving";
            this.moveProgress = 0;
          } else {
            this.state = "idle"; // idle only after doors fully closed
            this.moveDirection = "idle";
          }
          this.doorTimer = 0;
        }
        break;
    }

    this.shaft.update(deltaTime);
    this.controlPanel.update(deltaTime);
    this.display.update(deltaTime);
  }

  public start(): void {
    this.powerButton.textContent = "Starting...";
    this.powerButton.disabled = true;
    this.powerState = "starting";
    this.startTimer = 0;
    requestAnimationFrame(this.loop);
  }

  public stop(): void {
    this.powerButton.textContent = "Stopping...";
    this.powerButton.disabled = true;
    this.powerState = "stopping";
    this.startTimer = 0;
  }
}
