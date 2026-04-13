import { Component } from '../../core/Component';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { Toggle } from '../Toggle/Toggle';
import './ThemeControl.css';

export interface ThemeControlColors {
  /** Primary accent color */
  primary: string;
  /** Secondary accent color */
  secondary: string;
  /** Background/surface color */
  background: string;
  /** Dark shadow color for neumorphic effect */
  shadow: string;
  /** Light shadow color for neumorphic effect */
  light: string;
}

export interface ThemeControlConfig {
  mode: 'light' | 'dark' | 'system';
  colors: {
    light: ThemeControlColors;
    dark: ThemeControlColors;
  };
}

export interface ThemeControlProps {
  /** Initial theme configuration */
  config?: Partial<ThemeControlConfig>;
  /** Controls to show. Defaults to all controls. */
  controls?: ('mode' | 'primary' | 'secondary' | 'background' | 'shadow' | 'light')[];
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
  /** Show labels for color pickers */
  showLabels?: boolean;
  /** Callback when theme changes */
  onChange?: (config: ThemeControlConfig) => void;
  /** LocalStorage key for persistence. Set to null to disable persistence. */
  storageKey?: string | null;
}

const defaultColors: ThemeControlColors = {
  primary: '#ff9500',
  secondary: '#5856d6',
  background: '#1e1e1e',
  shadow: 'rgba(0, 0, 0, 0.5)',
  light: 'rgba(255, 255, 255, 0.03)',
};

const defaultLightColors: ThemeControlColors = {
  primary: '#ff9500',
  secondary: '#007aff',
  background: '#e0e5ec',
  shadow: 'rgba(163, 177, 198, 0.6)',
  light: 'rgba(255, 255, 255, 0.8)',
};

export const defaultThemeControlConfig: ThemeControlConfig = {
  mode: 'dark',
  colors: {
    light: defaultLightColors,
    dark: defaultColors,
  },
};

export class ThemeControl extends Component<ThemeControlProps> {
  private config: ThemeControlConfig;
  private toggle: Toggle | null = null;
  private colorPickers: Map<string, ColorPicker> = new Map();
  private systemThemeListener: (() => void) | null = null;

  constructor(props: ThemeControlProps = {}) {
    super(props);
    this.config = this.loadConfig();
  }

  private loadConfig(): ThemeControlConfig {
    const { config, storageKey = 'kwami-theme-control' } = this.props;

    // Try to load from localStorage
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.mode && parsed.colors) {
            return this.mergeConfig(parsed, config);
          }
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    // Use provided config or defaults
    return this.mergeConfig(defaultThemeControlConfig, config);
  }

  private mergeConfig(
    base: ThemeControlConfig,
    override?: Partial<ThemeControlConfig>
  ): ThemeControlConfig {
    if (!override) return { ...base };

    return {
      mode: override.mode ?? base.mode,
      colors: {
        light: { ...base.colors.light, ...override.colors?.light },
        dark: { ...base.colors.dark, ...override.colors?.dark },
      },
    };
  }

  private saveConfig(): void {
    const { storageKey = 'kwami-theme-control' } = this.props;
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(this.config));
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  getEffectiveMode(): 'light' | 'dark' {
    if (this.config.mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.config.mode;
  }

  private getControls(): string[] {
    return this.props.controls || ['mode', 'primary', 'secondary', 'background', 'shadow', 'light'];
  }

  render(): string {
    const { layout = 'horizontal', showLabels = true } = this.props;
    const controls = this.getControls();
    const effectiveMode = this.getEffectiveMode();
    const colors = this.config.colors[effectiveMode];

    const modeIndex = this.config.mode === 'light' ? 0 : this.config.mode === 'dark' ? 1 : 2;

    // Create toggle for mode control
    this.toggle = new Toggle({
      states: [
        { icon: 'solar:sun-bold', label: 'Light' },
        { icon: 'solar:moon-bold', label: 'Dark' },
        { icon: 'solar:monitor-bold', label: 'System' },
      ],
      initialState: modeIndex,
    });

    // Create color pickers
    const colorControls: { key: keyof ThemeControlColors; label: string; icon: string }[] = [
      { key: 'background', label: 'Background', icon: 'solar:layers-linear' },
      { key: 'shadow', label: 'Shadow', icon: 'solar:cloud-linear' },
      { key: 'light', label: 'Light', icon: 'solar:sun-fog-linear' },
      { key: 'primary', label: 'Primary', icon: 'solar:palette-linear' },
      { key: 'secondary', label: 'Secondary', icon: 'solar:palette-2-linear' },
    ];

    // Get default colors for reset feature
    const defaultColorsForMode = effectiveMode === 'light' ? defaultLightColors : defaultColors;

    let colorPickersHtml = '';
    for (const { key, label } of colorControls) {
      if (controls.includes(key)) {
        const picker = new ColorPicker({
          defaultColor: colors[key],
          popupDirection: 'down',
          showRandomize: true,
          showReset: true,
          showCopyToOpposite: true,
          showOpacity: true,
        });
        // Set the default color for reset
        picker.setDefaultColor(defaultColorsForMode[key]);
        this.colorPickers.set(key, picker);

        colorPickersHtml += `
     <div class="kwami-theme-control-item" data-control="${key}">
                        ${showLabels ? `<span class="kwami-theme-control-label">${label}</span>` : ''}
      ${picker.render()}
     </div>
                `;
      }
    }

    return `
   <div class="kwami-theme-control kwami-theme-control-${layout}" data-kwami-id="${this.id}">
    ${
      controls.includes('mode')
        ? `
                    <div class="kwami-theme-control-item kwami-theme-control-mode" data-control="mode">
                        ${showLabels ? `<span class="kwami-theme-control-label">Theme</span>` : ''}
                        ${this.toggle.render()}
                    </div>
                `
        : ''
    }
    <div class="kwami-theme-control-item kwami-theme-control-reset">
     ${showLabels ? `<span class="kwami-theme-control-label">Reset</span>` : ''}
     <button class="kwami-reset-btn" title="Reset to defaults">
      <iconify-icon icon="solar:restart-bold" width="18" height="18"></iconify-icon>
     </button>
    </div>
                ${
                  colorPickersHtml
                    ? `
                    <div class="kwami-theme-control-colors">
                        ${colorPickersHtml}
                    </div>
                `
                    : ''
                }
   </div>
        `;
  }

  protected onHydrate(): void {
    if (!this.element) return;

    // Hydrate toggle
    if (this.toggle) {
      const toggleEl = this.element.querySelector('.kwami-toggle');
      if (toggleEl) {
        this.toggle.hydrate(toggleEl as HTMLElement);
      }
    }

    // Hydrate color pickers
    this.colorPickers.forEach((picker, key) => {
      const itemEl = this.element?.querySelector(`[data-control="${key}"] .kwami-colorpicker`);
      if (itemEl) {
        picker.hydrate(itemEl as HTMLElement);
      }
    });

    // Setup event listeners
    this.setupEventListeners();

    // Apply initial theme
    this.applyTheme();

    // Setup system theme listener
    this.setupSystemThemeListener();
  }

  private setupEventListeners(): void {
    // Mode toggle listener
    const toggleEl = this.element?.querySelector('.kwami-toggle');
    if (toggleEl) {
      this.addListener(toggleEl, 'togglechange', (e) => {
        const detail = (e as CustomEvent).detail;
        const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
        this.config.mode = modes[detail.state];
        this.onConfigChange();
        this.updateColorPickerValues();
        this.updateColorPickerDefaults();
      });
    }

    // Reset button listener
    const resetBtn = this.element?.querySelector('.kwami-reset-btn');
    if (resetBtn) {
      this.addListener(resetBtn, 'click', () => {
        this.reset();
      });
    }

    // Color picker listeners
    const colorKeys: (keyof ThemeControlColors)[] = [
      'primary',
      'secondary',
      'background',
      'shadow',
      'light',
    ];
    colorKeys.forEach((key) => {
      const picker = this.colorPickers.get(key);
      if (picker) {
        const pickerEl = this.element?.querySelector(`[data-control="${key}"] .kwami-colorpicker`);
        if (pickerEl) {
          // Color change listener
          this.addListener(pickerEl, 'colorchange', (e) => {
            const color = (e as CustomEvent).detail.color;
            const effectiveMode = this.getEffectiveMode();
            this.config.colors[effectiveMode][key] = color;
            this.onConfigChange();
          });

          // Copy to opposite theme listener
          this.addListener(pickerEl, 'copytoopposite', (e) => {
            const color = (e as CustomEvent).detail.color;
            const effectiveMode = this.getEffectiveMode();
            const oppositeMode = effectiveMode === 'light' ? 'dark' : 'light';
            this.config.colors[oppositeMode][key] = color;
            this.saveConfig();
          });
        }
      }
    });
  }

  /** Update color picker default colors when theme mode changes */
  private updateColorPickerDefaults(): void {
    const effectiveMode = this.getEffectiveMode();
    const defaultColorsForMode = effectiveMode === 'light' ? defaultLightColors : defaultColors;

    this.colorPickers.forEach((picker, key) => {
      const colorKey = key as keyof ThemeControlColors;
      picker.setDefaultColor(defaultColorsForMode[colorKey]);
    });
  }

  private setupSystemThemeListener(): void {
    if (this.config.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        this.applyTheme();
        this.updateColorPickerValues();
      };
      mediaQuery.addEventListener('change', handler);
      this.systemThemeListener = () => mediaQuery.removeEventListener('change', handler);
    }
  }

  private updateColorPickerValues(): void {
    const effectiveMode = this.getEffectiveMode();
    const colors = this.config.colors[effectiveMode];

    this.colorPickers.forEach((picker, key) => {
      const colorKey = key as keyof ThemeControlColors;
      if (colors[colorKey]) {
        picker.setColor(colors[colorKey]);
      }
    });
  }

  private onConfigChange(): void {
    this.saveConfig();
    this.applyTheme();

    // Dispatch event
    this.element?.dispatchEvent(
      new CustomEvent('themechange', {
        detail: { config: this.config },
        bubbles: true,
      })
    );

    // Call onChange callback
    if (this.props.onChange) {
      this.props.onChange(this.config);
    }
  }

  private applyTheme(): void {
    const root = document.documentElement;
    const body = document.body;
    const effectiveMode = this.getEffectiveMode();
    const colors = this.config.colors[effectiveMode];

    // Apply theme mode attribute
    root.setAttribute('data-theme', effectiveMode);
    body.setAttribute('data-theme', effectiveMode);

    // Apply accent colors
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-secondary', colors.secondary);
    root.style.setProperty('--kwami-accent', colors.primary);

    // Apply background color
    root.style.setProperty('--kwami-bg', colors.background);
    root.style.setProperty('--kwami-surface', colors.background);

    // Apply shadow colors for neumorphic effect
    root.style.setProperty('--kwami-shadow-dark', colors.shadow);
    root.style.setProperty('--kwami-shadow-light', colors.light);
  }

  /** Get the current theme configuration */
  getConfig(): ThemeControlConfig {
    return { ...this.config };
  }

  /** Set the theme configuration programmatically */
  setConfig(config: Partial<ThemeControlConfig>): void {
    this.config = this.mergeConfig(this.config, config);
    this.onConfigChange();
    this.updateColorPickerValues();

    // Update toggle if mode changed
    if (config.mode && this.toggle) {
      const modeIndex = config.mode === 'light' ? 0 : config.mode === 'dark' ? 1 : 2;
      this.toggle.setState(modeIndex);
    }
  }

  /** Set the theme mode */
  setMode(mode: 'light' | 'dark' | 'system'): void {
    this.setConfig({ mode });
  }

  /** Reset to default configuration */
  reset(): void {
    this.config = {
      mode: defaultThemeControlConfig.mode,
      colors: {
        light: { ...defaultThemeControlConfig.colors.light },
        dark: { ...defaultThemeControlConfig.colors.dark },
      },
    };
    this.onConfigChange();
    this.updateColorPickerValues();

    // Reset toggle
    if (this.toggle) {
      const modeIndex = this.config.mode === 'light' ? 0 : this.config.mode === 'dark' ? 1 : 2;
      this.toggle.setState(modeIndex);
    }
  }

  destroy(): void {
    if (this.systemThemeListener) {
      this.systemThemeListener();
    }
    this.colorPickers.forEach((picker) => picker.destroy());
    this.toggle?.destroy();
    super.destroy();
  }
}

// Export individual sub-components for modular usage
export { ColorPicker as ThemeColorPicker } from '../ColorPicker/ColorPicker';
export { Toggle as ThemeToggle } from '../Toggle/Toggle';
