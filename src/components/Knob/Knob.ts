import { Component } from '../../core/Component';
import './Knob.css';

export interface KnobProps {
  /** Initial value (0-100) */
  value?: number;
  /** Label text */
  label?: string;
  /** Callback when value changes */
  onChange?: (value: number) => void;
}

export class Knob extends Component<KnobProps> {
  private currentValue: number;
  private isDragging = false;
  private startY = 0;
  private startValue = 0;
  private knobEl: HTMLElement | null = null;
  private track: HTMLElement | null = null;
  private ledsContainer: HTMLElement | null = null;

  constructor(props: KnobProps = {}) {
    super(props);
    this.currentValue = props.value ?? 50;
  }

  render(): string {
    const { label = 'VOLUME' } = this.props;

    // Generate LED indicators (11 LEDs for the value display)
    const leds = Array.from(
      { length: 11 },
      (_, i) => `<div class="kwami-knob-led" data-led-index="${i}"></div>`
    ).join('');

    return `
   <div class="kwami-knob-container" data-kwami-id="${this.id}">
    <div class="kwami-knob-outer">
     <div class="kwami-knob-bezel" aria-hidden="true"></div>
     <div class="kwami-knob-track-ring" aria-hidden="true"></div>
     <div class="kwami-knob-leds" aria-hidden="true">
      ${leds}
     </div>
     <div class="kwami-knob" data-value="${this.currentValue}">
      <div class="kwami-knob-edge" aria-hidden="true"></div>
      <div class="kwami-knob-face" aria-hidden="true"></div>
      <div class="kwami-knob-grooves" aria-hidden="true">
       <div class="kwami-knob-groove kwami-knob-groove-1"></div>
       <div class="kwami-knob-groove kwami-knob-groove-2"></div>
       <div class="kwami-knob-groove kwami-knob-groove-3"></div>
       <div class="kwami-knob-groove kwami-knob-groove-4"></div>
      </div>
      <div class="kwami-knob-cap" aria-hidden="true"></div>
      <div class="kwami-knob-track">
       <div class="kwami-knob-indicator"></div>
      </div>
     </div>
    </div>
    <span class="kwami-knob-label">${label}</span>
   </div>
        `;
  }

  protected onHydrate(): void {
    if (!this.element) return;

    this.knobEl = this.element.querySelector('.kwami-knob');
    this.track = this.element.querySelector('.kwami-knob-track');
    this.ledsContainer = this.element.querySelector('.kwami-knob-leds');

    if (!this.knobEl) return;

    this.setupEventListeners();
    this.updateKnob(this.currentValue);
  }

  private setupEventListeners(): void {
    if (!this.knobEl) return;

    // Mouse events
    this.addListener(this.knobEl, 'mousedown', (e) => {
      this.handleStart((e as MouseEvent).clientY);
      e.preventDefault();
    });

    const mouseMoveHandler = (e: Event) => {
      this.handleMove((e as MouseEvent).clientY);
    };
    document.addEventListener('mousemove', mouseMoveHandler);

    const mouseUpHandler = () => {
      this.handleEnd();
    };
    document.addEventListener('mouseup', mouseUpHandler);

    // Touch support
    this.addListener(this.knobEl, 'touchstart', (e) => {
      const touch = (e as TouchEvent).touches[0];
      if (touch) {
        this.handleStart(touch.clientY);
        e.preventDefault();
      }
    });

    const touchMoveHandler = (e: Event) => {
      const touch = (e as TouchEvent).touches[0];
      if (touch) {
        this.handleMove(touch.clientY);
      }
    };
    document.addEventListener('touchmove', touchMoveHandler);

    document.addEventListener('touchend', () => this.handleEnd());

    // Mouse wheel support
    this.addListener(this.knobEl, 'wheel', (e) => {
      e.preventDefault();
      const delta = (e as WheelEvent).deltaY > 0 ? -2 : 2;
      this.updateKnob(this.currentValue + delta);
    });
  }

  private handleStart(clientY: number): void {
    this.isDragging = true;
    this.startY = clientY;
    this.startValue = this.currentValue;
    this.knobEl?.classList.add('grabbing');
  }

  private handleMove(clientY: number): void {
    if (!this.isDragging) return;

    const deltaY = this.startY - clientY;
    const sensitivity = 0.5;
    const newValue = this.startValue + deltaY * sensitivity;
    this.updateKnob(newValue);
  }

  private handleEnd(): void {
    this.isDragging = false;
    this.knobEl?.classList.remove('grabbing');
  }

  private updateLeds(value: number): void {
    if (!this.ledsContainer) return;

    const leds = this.ledsContainer.querySelectorAll('.kwami-knob-led');
    const activeLeds = Math.round((value / 100) * 11);
    
    // Get current theme accents
    const rootStyles = getComputedStyle(document.documentElement);
    const accents: string[] = [];
    for (let i = 1; i <= 5; i++) {
        const color = rootStyles.getPropertyValue(`--kwami-accent-${i}`).trim();
        if (color) accents.push(color);
        else break;
    }

    leds.forEach((led, index) => {
      const ledEl = led as HTMLElement;
      if (index < activeLeds) {
        ledEl.classList.add('active');
        
        // Calculate color for this LED position
        if (accents.length > 0) {
            const color = this.getInterpolatedColor(index, 11, accents);
            ledEl.style.setProperty('--led-color', color);
        }
      } else {
        ledEl.classList.remove('active');
        ledEl.style.removeProperty('--led-color');
      }
    });
  }

  private getInterpolatedColor(index: number, total: number, colors: string[]): string {
    if (colors.length === 0) return 'var(--kwami-accent)';
    if (colors.length === 1) return colors[0];
    
    const percentage = index / (total - 1);
    const segmentSize = 1 / (colors.length - 1);
    const segmentIndex = Math.min(Math.floor(percentage / segmentSize), colors.length - 2);
    const segmentPercentage = (percentage - (segmentIndex * segmentSize)) / segmentSize;
    
    return `color-mix(in srgb, ${colors[segmentIndex+1]} ${segmentPercentage * 100}%, ${colors[segmentIndex]})`;
  }

  private updateKnob(value: number): void {
    this.currentValue = Math.max(0, Math.min(100, value));
    const rotation = (this.currentValue / 100) * 270 - 135; // -135 to 135 degrees

    if (this.track) {
      this.track.style.transform = `rotate(${rotation}deg)`;
    }

    if (this.knobEl) {
      this.knobEl.style.setProperty('--knob-value', this.currentValue.toFixed(2));
      
      // Also update indicator color based on value
      const rootStyles = getComputedStyle(document.documentElement);
      const accents: string[] = [];
      for (let i = 1; i <= 5; i++) {
          const color = rootStyles.getPropertyValue(`--kwami-accent-${i}`).trim();
          if (color) accents.push(color);
          else break;
      }
      
      if (accents.length > 0) {
          const indicatorColor = this.getInterpolatedColor(this.currentValue, 101, accents);
          this.knobEl.style.setProperty('--indicator-color', indicatorColor);
      }
    }

    this.knobEl?.setAttribute('data-value', this.currentValue.toString());
    this.updateLeds(this.currentValue);

    // Dispatch event
    this.element?.dispatchEvent(
      new CustomEvent('knobchange', {
        detail: { value: Math.round(this.currentValue) },
        bubbles: true,
      })
    );

    if (this.props.onChange) {
      this.props.onChange(Math.round(this.currentValue));
    }
  }

  /** Get the current value */
  getValue(): number {
    return Math.round(this.currentValue);
  }

  /** Set the value programmatically */
  setValue(value: number): void {
    this.updateKnob(value);
  }
}
