import { Component } from '../../core/Component';
import { Button, ButtonVariant } from './Button';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { adjustBrightness } from '../../utils/color';
import './ButtonConfigurator.css';

export interface ButtonConfiguration {
  label: string;
  variant: ButtonVariant;
  size: 'sm' | 'md' | 'lg';
  bezel: {
    color: string;
    radius: number;
    padding: number;
    shadowDepth: number;
  };
  face: {
    color: string;
    radius: number;
    depth: number;
    brightness: number;
  };
  highlight: {
    color: string;
    opacity: number;
    height: number;
  };
  text: {
    color: string;
    size: number;
    spacing: number;
    weight: number;
  };
}

export interface ButtonConfiguratorProps {
  /** Initial configuration */
  initialConfig?: Partial<ButtonConfiguration>;
  /** Callback when configuration changes */
  onChange?: (config: ButtonConfiguration) => void;
  /** Whether to show controls (true) or just the preview (false) */
  showControls?: boolean;
}

const DEFAULT_CONFIG: ButtonConfiguration = {
  label: 'CLICK',
  variant: 'primary',
  size: 'md',
  bezel: { color: '#d0d0d0', radius: 14, padding: 6, shadowDepth: 50 },
  face: { color: '#e8e8e8', radius: 10, depth: 50, brightness: 50 },
  highlight: { color: '#ffffff', opacity: 40, height: 50 },
  text: { color: '#555555', size: 12, spacing: 2, weight: 600 },
};

type ConfigPart = 'colors' | 'bezel' | 'face' | 'highlight' | 'text';

export class ButtonConfigurator extends Component<ButtonConfiguratorProps> {
  private config: ButtonConfiguration;
  private button: Button | null = null;

  // DOM references
  private bezelEl: HTMLElement | null = null;
  private faceEl: HTMLElement | null = null;
  private highlightEl: HTMLElement | null = null;
  private textEl: HTMLElement | null = null;

  // Color pickers
  private colorPickers: Map<string, ColorPicker> = new Map();

  constructor(props: ButtonConfiguratorProps = {}) {
    super(props);
    this.config = { ...DEFAULT_CONFIG, ...props.initialConfig };
  }

  render(): string {
    const { showControls = true } = this.props;
    this.button = new Button({
      label: this.config.label,
      variant: this.config.variant,
      size: this.config.size,
    });

    const controlsHtml = showControls ? this.renderControls() : '';

    return `
 <div class="kwami-button-configurator" data-kwami-id="${this.id}">
  <div class="kwami-button-configurator-preview">
  ${this.renderVariantSelector()}
  <div class="kwami-button-configurator-stage">
   <div class="kwami-button-configurator-container">
   ${this.button.render()}
   </div>
  </div>
  </div>
  ${controlsHtml}
 </div>
      `;
  }

  private renderVariantSelector(): string {
    const { variant } = this.config;
    const variants: { value: ButtonVariant; label: string; icon: string }[] = [
      { value: 'primary', label: 'Primary', icon: 'solar:star-bold' },
      { value: 'secondary', label: 'Secondary', icon: 'solar:widget-bold' },
      { value: 'danger', label: 'Danger', icon: 'solar:danger-triangle-bold' },
      { value: 'mini', label: 'Mini', icon: 'solar:minimize-square-bold' },
    ];

    return `
 <div class="kwami-button-configurator-variant-bar">
  ${variants
    .map(
      (v) => `
  <button 
   class="kwami-cfg-variant-btn ${variant === v.value ? 'active' : ''}" 
   data-variant="${v.value}"
   title="${v.label}"
  >
   <iconify-icon icon="${v.icon}" width="16" height="16"></iconify-icon>
   <span class="kwami-cfg-variant-label">${v.label}</span>
  </button>
   `
    )
    .join('')}
 </div>
      `;
  }

  private renderControls(): string {
    return `
 <div class="kwami-button-configurator-controls">
  <!-- Part Selector Tabs -->
  <div class="kwami-button-configurator-parts">
  <button class="kwami-button-configurator-part-btn active" data-part="colors" title="Colors (all button colors)">
   <span class="part-icon">◆</span>
   <span class="part-label">Colors</span>
  </button>
  <button class="kwami-button-configurator-part-btn" data-part="bezel" title="Bezel (outer frame)">
   <span class="part-icon">◰</span>
   <span class="part-label">Bezel</span>
  </button>
  <button class="kwami-button-configurator-part-btn" data-part="face" title="Face (button surface)">
   <span class="part-icon">▣</span>
   <span class="part-label">Face</span>
  </button>
  <button class="kwami-button-configurator-part-btn" data-part="highlight" title="Highlight (shine effect)">
   <span class="part-icon">◐</span>
   <span class="part-label">Shine</span>
  </button>
  <button class="kwami-button-configurator-part-btn" data-part="text" title="Text (label)">
   <span class="part-icon">T</span>
   <span class="part-label">Text</span>
  </button>
  </div>

  <!-- Control Panels -->
  <div class="kwami-button-configurator-panels">
  ${this.renderColorsPanel()}
  ${this.renderBezelPanel()}
  ${this.renderFacePanel()}
  ${this.renderHighlightPanel()}
  ${this.renderTextPanel()}
  </div>
  
  <!-- Configurator Actions -->
  <div class="kwami-button-configurator-actions">
  <button class="kwami-cfg-reset-btn" title="Reset all styles to defaults">
   <iconify-icon icon="solar:restart-bold" width="14" height="14"></iconify-icon>
   <span>Reset Defaults</span>
  </button>
  </div>
 </div>
      `;
  }

  private renderColorsPanel(): string {
    const { size } = this.config;
    return `
 <div class="kwami-button-configurator-panel active" data-panel="colors">
  <div class="kwami-cfg-colors-grid">
  <div class="kwami-cfg-color-item">
   <label class="kwami-cfg-color-label">Bezel</label>
   <div class="kwami-cfg-color" data-color-target="bezel"></div>
  </div>
  <div class="kwami-cfg-color-item">
   <label class="kwami-cfg-color-label">Face</label>
   <div class="kwami-cfg-color" data-color-target="face"></div>
  </div>
  <div class="kwami-cfg-color-item">
   <label class="kwami-cfg-color-label">Highlight</label>
   <div class="kwami-cfg-color" data-color-target="highlight"></div>
  </div>
  <div class="kwami-cfg-color-item">
   <label class="kwami-cfg-color-label">Text</label>
   <div class="kwami-cfg-color" data-color-target="text"></div>
  </div>
  </div>
  <div class="kwami-cfg-row kwami-cfg-row--spaced">
  <label class="kwami-cfg-label">Size</label>
  <div class="kwami-cfg-select-wrap">
   <select class="kwami-cfg-select" data-prop="size">
  <option value="sm" ${size === 'sm' ? 'selected' : ''}>Small</option>
  <option value="md" ${size === 'md' ? 'selected' : ''}>Medium</option>
  <option value="lg" ${size === 'lg' ? 'selected' : ''}>Large</option>
   </select>
  </div>
  </div>
 </div>
      `;
  }

  private renderBezelPanel(): string {
    const { bezel } = this.config;
    return `
 <div class="kwami-button-configurator-panel" data-panel="bezel">
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Border Radius</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="bezel-radius" min="0" max="30" value="${bezel.radius}" />
   <span class="kwami-cfg-value">${bezel.radius}px</span>
  </div>
  </div>
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Padding</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="bezel-padding" min="2" max="16" value="${bezel.padding}" />
   <span class="kwami-cfg-value">${bezel.padding}px</span>
  </div>
  </div>
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Shadow Depth</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="bezel-shadow" min="0" max="100" value="${bezel.shadowDepth}" />
   <span class="kwami-cfg-value">${bezel.shadowDepth}%</span>
  </div>
  </div>
 </div>
      `;
  }

  private renderFacePanel(): string {
    const { face } = this.config;
    return `
 <div class="kwami-button-configurator-panel" data-panel="face">
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Border Radius</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="face-radius" min="0" max="24" value="${face.radius}" />
   <span class="kwami-cfg-value">${face.radius}px</span>
  </div>
  </div>
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">3D Depth</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="face-depth" min="0" max="100" value="${face.depth}" />
   <span class="kwami-cfg-value">${face.depth}%</span>
  </div>
  </div>
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Brightness</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="face-brightness" min="0" max="100" value="${face.brightness}" />
   <span class="kwami-cfg-value">${face.brightness}%</span>
  </div>
  </div>
 </div>
      `;
  }

  private renderHighlightPanel(): string {
    const { highlight } = this.config;
    return `
 <div class="kwami-button-configurator-panel" data-panel="highlight">
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Intensity</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="highlight-opacity" min="0" max="100" value="${highlight.opacity}" />
   <span class="kwami-cfg-value">${highlight.opacity}%</span>
  </div>
  </div>
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Coverage</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="highlight-height" min="20" max="80" value="${highlight.height}" />
   <span class="kwami-cfg-value">${highlight.height}%</span>
  </div>
  </div>
 </div>
      `;
  }

  private renderTextPanel(): string {
    const { text, label } = this.config;
    return `
 <div class="kwami-button-configurator-panel" data-panel="text">
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Content</label>
  <input type="text" class="kwami-cfg-input" data-prop="text-content" value="${label}" maxlength="20" />
  </div>
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Font Size</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="text-size" min="8" max="18" value="${text.size}" step="1" />
   <span class="kwami-cfg-value">${text.size}px</span>
  </div>
  </div>
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Letter Spacing</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="text-spacing" min="0" max="8" value="${text.spacing}" step="0.5" />
   <span class="kwami-cfg-value">${text.spacing}px</span>
  </div>
  </div>
  <div class="kwami-cfg-row">
  <label class="kwami-cfg-label">Weight</label>
  <div class="kwami-cfg-slider-wrap">
   <input type="range" class="kwami-cfg-slider" data-prop="text-weight" min="400" max="800" value="${text.weight}" step="100" />
   <span class="kwami-cfg-value">${text.weight}</span>
  </div>
  </div>
 </div>
      `;
  }

  protected onHydrate(): void {
    if (!this.element) return;

    // Get button elements
    this.bezelEl = this.element.querySelector('.kwami-button-bezel');
    this.faceEl = this.element.querySelector('.kwami-button-face');
    this.highlightEl = this.element.querySelector('.kwami-button-highlight');
    this.textEl = this.element.querySelector('.kwami-button-text');

    // Hydrate the button
    if (this.button && this.bezelEl) {
      this.button.hydrate(this.bezelEl);
    }

    // Setup variant selector at the top
    this.setupVariantSelector();

    // Setup color pickers
    this.setupColorPickers();

    // Setup part selector tabs
    this.setupPartSelector();

    // Setup sliders
    this.setupSliders();

    // Setup text input
    this.setupTextInput();

    // Setup style controls (size selector in colors panel)
    this.setupStyleControls();

    // Setup actions
    this.setupActions();

    // Initial highlight
    this.highlightPart('colors');
  }

  private setupActions(): void {
    if (!this.element) return;

    const resetBtn = this.element.querySelector('.kwami-cfg-reset-btn');
    if (resetBtn) {
      this.addListener(resetBtn, 'click', () => {
        this.reset();
      });
    }
  }

  private setupVariantSelector(): void {
    if (!this.element) return;

    const variantBtns = this.element.querySelectorAll('.kwami-cfg-variant-btn');

    variantBtns.forEach((btn) => {
      this.addListener(btn, 'click', () => {
        const variant = btn.getAttribute('data-variant') as ButtonVariant;

        // Update active state
        variantBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Update config and button
        this.config.variant = variant;
        this.updateButtonVariant(variant);
        this.emitChange();
      });
    });
  }

  private setupColorPickers(): void {
    if (!this.element) return;

    const colorTargets = ['bezel', 'face', 'highlight', 'text'] as const;

    colorTargets.forEach((target) => {
      const container = this.element?.querySelector(`[data-color-target="${target}"]`);
      if (!container) return;

      const colorValue = this.getColorForTarget(target);
      const picker = new ColorPicker({
        defaultColor: colorValue,
        popupDirection: 'up',
        onChange: (color) => this.handleColorChange(target, color),
      });

      container.innerHTML = picker.render();
      const pickerEl = container.querySelector('.kwami-colorpicker');
      if (pickerEl) {
        picker.hydrate(pickerEl as HTMLElement);
        this.colorPickers.set(target, picker);
      }
    });
  }

  private getColorForTarget(target: string): string {
    switch (target) {
      case 'bezel':
        return this.config.bezel.color;
      case 'face':
        return this.config.face.color;
      case 'highlight':
        return this.config.highlight.color;
      case 'text':
        return this.config.text.color;
      default:
        return '#ffffff';
    }
  }

  private handleColorChange(target: string, color: string): void {
    switch (target) {
      case 'bezel':
        this.config.bezel.color = color;
        if (this.bezelEl) {
          const lighter = adjustBrightness(color, 20);
          const darker = adjustBrightness(color, -20);
          this.bezelEl.style.background = `linear-gradient(145deg, ${lighter} 0%, ${color} 50%, ${darker} 100%)`;
        }
        break;
      case 'face':
        this.config.face.color = color;
        if (this.faceEl) {
          const highlight = adjustBrightness(color, 30);
          const midLight = adjustBrightness(color, 15);
          const midDark = adjustBrightness(color, -10);
          const shadow = adjustBrightness(color, -25);
          this.faceEl.style.background = `linear-gradient(160deg, ${highlight} 0%, ${midLight} 20%, ${color} 50%, ${midDark} 80%, ${shadow} 100%)`;
        }
        break;
      case 'highlight':
        this.config.highlight.color = color;
        if (this.highlightEl) {
          this.highlightEl.style.background = `linear-gradient(180deg, ${color}66 0%, ${color}1a 50%, transparent 100%)`;
        }
        break;
      case 'text':
        this.config.text.color = color;
        if (this.textEl) {
          this.textEl.style.color = color;
          this.textEl.style.textShadow = 'none';
        }
        break;
    }
    this.emitChange();
  }

  private setupPartSelector(): void {
    if (!this.element) return;

    const partBtns = this.element.querySelectorAll('.kwami-button-configurator-part-btn');
    const panels = this.element.querySelectorAll('.kwami-button-configurator-panel');

    partBtns.forEach((btn) => {
      this.addListener(btn, 'click', () => {
        const part = btn.getAttribute('data-part') as ConfigPart;

        partBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        panels.forEach((p) => {
          p.classList.toggle('active', p.getAttribute('data-panel') === part);
        });

        this.highlightPart(part);
      });
    });
  }

  private highlightPart(part: string): void {
    this.bezelEl?.classList.remove('kwami-cfg-editing');
    this.faceEl?.classList.remove('kwami-cfg-editing');
    this.highlightEl?.classList.remove('kwami-cfg-editing');
    this.textEl?.classList.remove('kwami-cfg-editing');

    switch (part) {
      case 'colors':
        /* No specific highlight for colors panel */ break;
      case 'bezel':
        this.bezelEl?.classList.add('kwami-cfg-editing');
        break;
      case 'face':
        this.faceEl?.classList.add('kwami-cfg-editing');
        break;
      case 'highlight':
        this.highlightEl?.classList.add('kwami-cfg-editing');
        break;
      case 'text':
        this.textEl?.classList.add('kwami-cfg-editing');
        break;
    }
  }

  private setupSliders(): void {
    if (!this.element) return;

    const sliders = this.element.querySelectorAll('.kwami-cfg-slider');

    sliders.forEach((slider) => {
      const input = slider as HTMLInputElement;
      const prop = input.getAttribute('data-prop');
      const valueSpan = input.parentElement?.querySelector('.kwami-cfg-value');

      this.addListener(input, 'input', () => {
        const val = parseFloat(input.value);
        this.handleSliderChange(prop, val, valueSpan as HTMLElement | null);
      });
    });
  }

  private handleSliderChange(
    prop: string | null,
    val: number,
    valueSpan: HTMLElement | null
  ): void {
    switch (prop) {
      // Bezel
      case 'bezel-radius':
        this.config.bezel.radius = val;
        if (this.bezelEl) this.bezelEl.style.borderRadius = `${val}px`;
        if (valueSpan) valueSpan.textContent = `${val}px`;
        break;
      case 'bezel-padding':
        this.config.bezel.padding = val;
        if (this.bezelEl) this.bezelEl.style.padding = `${val}px`;
        if (valueSpan) valueSpan.textContent = `${val}px`;
        break;
      case 'bezel-shadow':
        this.config.bezel.shadowDepth = val;
        if (this.bezelEl) this.bezelEl.style.setProperty('--shadow-intensity', String(val / 100));
        if (valueSpan) valueSpan.textContent = `${val}%`;
        break;

      // Face
      case 'face-radius':
        this.config.face.radius = val;
        if (this.faceEl) this.faceEl.style.borderRadius = `${val}px`;
        if (valueSpan) valueSpan.textContent = `${val}px`;
        break;
      case 'face-depth':
        this.config.face.depth = val;
        if (this.faceEl) this.faceEl.style.setProperty('--face-depth', String(val / 100));
        if (valueSpan) valueSpan.textContent = `${val}%`;
        break;
      case 'face-brightness':
        this.config.face.brightness = val;
        if (this.faceEl) this.faceEl.style.setProperty('--face-brightness', String(val / 100));
        if (valueSpan) valueSpan.textContent = `${val}%`;
        break;

      // Highlight
      case 'highlight-opacity':
        this.config.highlight.opacity = val;
        if (this.highlightEl) this.highlightEl.style.opacity = String(val / 100);
        if (valueSpan) valueSpan.textContent = `${val}%`;
        break;
      case 'highlight-height':
        this.config.highlight.height = val;
        if (this.highlightEl) this.highlightEl.style.height = `${val}%`;
        if (valueSpan) valueSpan.textContent = `${val}%`;
        break;

      // Text
      case 'text-size':
        this.config.text.size = val;
        if (this.textEl) this.textEl.style.fontSize = `${val / 16}rem`;
        if (valueSpan) valueSpan.textContent = `${val}px`;
        break;
      case 'text-spacing':
        this.config.text.spacing = val;
        if (this.textEl) this.textEl.style.letterSpacing = `${val}px`;
        if (valueSpan) valueSpan.textContent = `${val}px`;
        break;
      case 'text-weight':
        this.config.text.weight = val;
        if (this.textEl) this.textEl.style.fontWeight = String(val);
        if (valueSpan) valueSpan.textContent = String(val);
        break;
    }
    this.emitChange();
  }

  private setupTextInput(): void {
    if (!this.element) return;

    const textInput = this.element.querySelector(
      '.kwami-cfg-input[data-prop="text-content"]'
    ) as HTMLInputElement;
    if (!textInput) return;

    this.addListener(textInput, 'input', () => {
      this.config.label = textInput.value || 'CLICK';
      if (this.textEl) {
        this.textEl.textContent = this.config.label;
      }
      this.emitChange();
    });
  }

  private setupStyleControls(): void {
    if (!this.element) return;

    // Size selector
    const sizeSelect = this.element.querySelector(
      '.kwami-cfg-select[data-prop="size"]'
    ) as HTMLSelectElement;
    if (sizeSelect) {
      this.addListener(sizeSelect, 'change', () => {
        const size = sizeSelect.value as ButtonConfiguration['size'];
        this.config.size = size;
        this.updateButtonSize(size);
        this.emitChange();
      });
    }
  }

  private updateButtonVariant(variant: ButtonVariant): void {
    if (!this.bezelEl) return;
    // Remove all variant classes
    this.bezelEl.classList.remove(
      'kwami-button-bezel--primary',
      'kwami-button-bezel--secondary',
      'kwami-button-bezel--danger',
      'kwami-button-bezel--mini'
    );
    this.bezelEl.classList.add(`kwami-button-bezel--${variant}`);

    // For mini variant, we need to handle icon-only display
    if (variant === 'mini') {
      // Add an icon if not present
      const faceEl = this.bezelEl.querySelector('.kwami-button-face');
      if (faceEl && !faceEl.querySelector('.kwami-button-icon')) {
        const iconEl = document.createElement('iconify-icon');
        iconEl.className = 'kwami-button-icon';
        iconEl.setAttribute('icon', 'solar:heart-bold');
        iconEl.setAttribute('width', '20');
        iconEl.setAttribute('height', '20');
        iconEl.style.position = 'relative';
        iconEl.style.zIndex = '2';
        const highlightEl = faceEl.querySelector('.kwami-button-highlight');
        if (highlightEl) {
          highlightEl.after(iconEl);
        }
      }
      // Hide text
      if (this.textEl) {
        this.textEl.style.display = 'none';
      }
    } else {
      // Remove mini icon if switching away
      const miniIcon = this.bezelEl.querySelector('.kwami-button-face > iconify-icon');
      if (miniIcon && !this.bezelEl.classList.contains('kwami-button-bezel--mini')) {
        // Only remove if it was added by mini variant
      }
      // Show text
      if (this.textEl) {
        this.textEl.style.display = '';
      }
    }
  }

  private updateButtonSize(size: ButtonConfiguration['size']): void {
    if (!this.bezelEl) return;
    // Remove all size classes
    this.bezelEl.classList.remove(
      'kwami-button-bezel--sm',
      'kwami-button-bezel--md',
      'kwami-button-bezel--lg'
    );
    this.bezelEl.classList.add(`kwami-button-bezel--${size}`);
  }

  private emitChange(): void {
    if (this.props.onChange) {
      this.props.onChange({ ...this.config });
    }
  }

  /** Get the current configuration */
  getConfiguration(): ButtonConfiguration {
    return { ...this.config };
  }

  /** Set configuration programmatically */
  setConfiguration(config: Partial<ButtonConfiguration>): void {
    this.config = { ...this.config, ...config };
    this.applyConfiguration(this.config);
    this.emitChange();
  }

  /** Reset configuration to defaults */
  reset(): void {
    this.config = {
      ...DEFAULT_CONFIG,
      bezel: { ...DEFAULT_CONFIG.bezel },
      face: { ...DEFAULT_CONFIG.face },
      highlight: { ...DEFAULT_CONFIG.highlight },
      text: { ...DEFAULT_CONFIG.text },
    };
    this.applyConfiguration(this.config);
    this.emitChange();

    // Reset part selector to colors
    const colorsTab = this.element?.querySelector(
      '.kwami-button-configurator-part-btn[data-part="colors"]'
    ) as HTMLElement;
    colorsTab?.click();
  }

  /** Apply current configuration to the UI and preview */
  private applyConfiguration(config: ButtonConfiguration): void {
    if (!this.element) return;

    // Update Preview Button Label
    const textInput = this.element.querySelector(
      '.kwami-cfg-input[data-prop="text-content"]'
    ) as HTMLInputElement;
    if (textInput) textInput.value = config.label;
    if (this.textEl) this.textEl.textContent = config.label;

    // Update Variant Bar
    const variantBtns = this.element.querySelectorAll('.kwami-cfg-variant-btn');
    variantBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-variant') === config.variant);
    });
    this.updateButtonVariant(config.variant);

    // Update Size Selector
    const sizeSelect = this.element.querySelector(
      '.kwami-cfg-select[data-prop="size"]'
    ) as HTMLSelectElement;
    if (sizeSelect) sizeSelect.value = config.size;
    this.updateButtonSize(config.size);

    // Update Color Pickers
    const colorTargets = ['bezel', 'face', 'highlight', 'text'] as const;
    colorTargets.forEach((target) => {
      const picker = this.colorPickers.get(target);
      const color = this.getColorForTarget(target);
      if (picker) {
        picker.setColor(color);
        this.handleColorChange(target, color);
      }
    });

    // Update Sliders
    const slidersSpecs = [
      { prop: 'bezel-radius', val: config.bezel.radius },
      { prop: 'bezel-padding', val: config.bezel.padding },
      { prop: 'bezel-shadow', val: config.bezel.shadowDepth },
      { prop: 'face-radius', val: config.face.radius },
      { prop: 'face-depth', val: config.face.depth },
      { prop: 'face-brightness', val: config.face.brightness },
      { prop: 'highlight-opacity', val: config.highlight.opacity },
      { prop: 'highlight-height', val: config.highlight.height },
      { prop: 'text-size', val: config.text.size },
      { prop: 'text-spacing', val: config.text.spacing },
      { prop: 'text-weight', val: config.text.weight },
    ];

    slidersSpecs.forEach((spec) => {
      const slider = this.element?.querySelector(
        `.kwami-cfg-slider[data-prop="${spec.prop}"]`
      ) as HTMLInputElement;
      if (slider) {
        slider.value = spec.val.toString();
        const valueSpan = slider.parentElement?.querySelector('.kwami-cfg-value');
        this.handleSliderChange(spec.prop, spec.val, valueSpan as HTMLElement | null);
      }
    });
  }
}

/** Default configuration export for easy access */
export { DEFAULT_CONFIG as defaultButtonConfig };
