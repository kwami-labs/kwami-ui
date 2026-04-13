import './style.css';
import './components/Button/ButtonDocs.css';
import './components/CodeBlock/CodeBlock.css';
import 'iconify-icon';

import {
  // Theme Control
  ThemeControl,
  // Configurators
  TitleConfigurator,
  TextConfigurator,
  LabelConfigurator,
  IconConfigurator,
  ButtonConfigurator,
  // Simple components
  Title,
  Button,
  Expandable,
  Toggle,
  Activator,
  Switch,
  TextInput,
  TextArea,
  Pin,
  Selector,
  Checkbox,
  Radio,
  ColorPicker,
  DatePicker,
  Slider,
  Stepper,
  Fader,
  Knob,
  // Layout components
  Tabs,
  Accordion,
  Popover,
  Tooltip,
  Modal,
  Toast,
  Depth,
  Shallow,
} from '@kwami/ui';

import { ButtonDocs } from './components/Button/ButtonDocs';

// Store component instances for hydration
const components: {
  expandable: Expandable;
  configurator:
    | TitleConfigurator
    | TextConfigurator
    | LabelConfigurator
    | IconConfigurator
    | ButtonConfigurator;
}[] = [];

// Store simple component instances
const simpleComponents: {
  expandable: Expandable;
  component:
    | Toggle
    | Activator
    | Switch
    | TextInput
    | TextArea
    | Pin
    | Selector
    | Checkbox
    | Radio
    | ColorPicker
    | DatePicker
    | Slider
    | Stepper
    | Fader
    | Knob
    | Tabs
    | Accordion
    | Popover
    | Tooltip
    | Modal
    | Toast
    | Depth
    | Shallow;
}[] = [];

// Store multi-screen expandable instances (like Button with docs + config)
const multiScreenComponents: {
  expandable: Expandable;
  preview?: Button;
  screens: {
    id: string;
    component: ButtonDocs | ButtonConfigurator;
  }[];
}[] = [];

// Store standalone expandables (not wrapped in another expandable)
const standaloneExpandables: Expandable[] = [];

// Store theme control instance
let themeControl: ThemeControl | null = null;

function createExpandable(
  title: string,
  configurator:
    | TitleConfigurator
    | TextConfigurator
    | LabelConfigurator
    | IconConfigurator
    | ButtonConfigurator,
  id: string
): string {
  const expandable = new Expandable({
    title,
    content: configurator.render(),
    expandableId: id,
    expandedWidth: 'min(90vw, 480px)',
    expandedHeight: 'min(90vh, 480px)',
  });

  components.push({ expandable, configurator });
  return expandable.render();
}

function createSimpleExpandable(
  title: string,
  component:
    | Toggle
    | Activator
    | Switch
    | TextInput
    | TextArea
    | Pin
    | Selector
    | Checkbox
    | Radio
    | ColorPicker
    | DatePicker
    | Slider
    | Stepper
    | Fader
    | Knob
    | Tabs
    | Accordion
    | Popover
    | Tooltip
    | Modal
    | Toast
    | Depth
    | Shallow,
  id: string
): string {
  const wrapper = `<div class="simple-component-wrapper">${component.render()}</div>`;
  const expandable = new Expandable({
    title,
    content: wrapper,
    expandableId: id,
    expandedWidth: 'min(90vw, 320px)',
    expandedHeight: 'min(90vh, 280px)',
  });

  simpleComponents.push({ expandable, component });
  return expandable.render();
}

function createButtonExpandable(): string {
  // Create preview button for collapsed state
  const previewButton = new Button({ label: 'CLICK', variant: 'primary' });

  // Create docs and configurator components
  const buttonDocs = new ButtonDocs();
  const buttonConfigurator = new ButtonConfigurator();

  // Create multi-screen expandable
  const expandable = new Expandable({
    title: 'Button',
    preview: `<div class="simple-component-wrapper">${previewButton.render()}</div>`,
    screens: [
      {
        id: 'docs',
        icon: 'solar:document-text-linear',
        title: 'Developer API',
        content: buttonDocs.render(),
        expandedWidth: 'min(95vw, 800px)',
        expandedHeight: 'min(95vh, 850px)',
      },
      {
        id: 'config',
        icon: 'solar:settings-linear',
        title: 'Style Configurator',
        content: buttonConfigurator.render(),
        expandedWidth: 'min(90vw, 480px)',
        expandedHeight: 'min(90vh, 550px)',
        noScroll: true,
      },
    ],
    expandableId: 'button',
  });

  multiScreenComponents.push({
    expandable,
    preview: previewButton,
    screens: [
      { id: 'docs', component: buttonDocs },
      { id: 'config', component: buttonConfigurator },
    ],
  });

  return expandable.render();
}

function initApp(): void {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    console.error('App element not found!');
    return;
  }

  // Create header title
  const headerTitle = new Title({ text: 'KWAMI UI', as: 'h1' });

  // Create theme control
  themeControl = new ThemeControl({
    layout: 'horizontal',
    showLabels: true,
  });

  // Create configurators for each section
  // Section 1: Informational
  const titleConfigurator = new TitleConfigurator();
  const textConfigurator = new TextConfigurator();
  const labelConfigurator = new LabelConfigurator();
  const iconConfigurator = new IconConfigurator();

  // Section 2: Input
  const toggle = new Toggle();
  const activator = new Activator({ text: 'PUSH', label: 'MUTE' });
  const switchComponent = new Switch({ label: 'POWER' });
  const textInputComponent = new TextInput({ placeholder: 'Type here...', label: 'TEXT INPUT' });
  const textAreaComponent = new TextArea({
    placeholder: 'Enter text...',
    label: 'TEXT AREA',
    rows: 3,
  });
  const pinComponent = new Pin({ length: 4, label: 'PIN CODE' });
  const selectorComponent = new Selector({ label: 'DROPDOWN' });
  const checkboxComponent = new Checkbox();
  const radioComponent = new Radio();
  const colorPickerComponent = new ColorPicker({ defaultColor: '#ff9500' });
  const datePickerComponent = new DatePicker({ label: 'DATE', placeholder: 'Select date' });
  const stepperComponent = new Stepper({ label: 'QUANTITY', value: 0, min: -10, max: 10 });
  const sliderComponent = new Slider({ label: 'VOLUME', value: 75 });
  const faderComponent = new Fader({ label: 'LEVEL', value: 75 });
  const knobComponent = new Knob({ label: 'GAIN', value: 50 });

  // Section 3: Layout
  const expandableDemo = new Expandable({
    title: 'Expandable',
    content: `<div class="simple-component-wrapper">
      <p style="text-align: center; color: var(--kwami-text-secondary, #666); font-size: 0.85rem; line-height: 1.6;">
        Click the <strong style="color: var(--kwami-accent, #ff9500);">expand icon</strong> in the top-right corner to see the full expanded view with smooth FLIP animations.
      </p>
        </div>`,
    expandableId: 'expandable-demo',
    expandedWidth: 'min(90vw, 400px)',
    expandedHeight: 'min(90vh, 350px)',
  });
  standaloneExpandables.push(expandableDemo);

  const tabsComponent = new Tabs();
  const accordionComponent = new Accordion();
  const popoverComponent = new Popover();
  const tooltipComponent = new Tooltip();
  const modalComponent = new Modal();
  const toastComponent = new Toast({ message: 'Action completed successfully!', type: 'success' });
  const depthComponent = new Depth({
    content:
      'An <strong>inset</strong> container for notes, hints, or subtle information that blends into the surface.',
    icon: 'solar:info-circle-linear',
  });
  const shallowComponent = new Shallow({
    content:
      'A <strong>raised</strong> container for callouts, highlights, or important information that stands out.',
    icon: 'solar:lightbulb-linear',
  });

  // Render the app
  app.innerHTML = `
    <div class="kwami-logo">
      ${headerTitle.render()}
    </div>
  

    <main class="demo-main">

      <!-- Section: Theme -->
      <section class="demo-section demo-section-theme">
        <h2 class="demo-section-title">Theme</h2>
        <div class="theme-control-wrapper">
          ${themeControl.render()}
        </div>
      </section>

      <!-- Section 1: Input -->
      <section class="demo-section">
        <h2 class="demo-section-title">Input</h2>
        <div class="components-grid">
          ${createButtonExpandable()}
          ${createSimpleExpandable('Toggle', toggle, 'toggle')}
          ${createSimpleExpandable('Activator', activator, 'activator')}
          ${createSimpleExpandable('Switch', switchComponent, 'switch')}
          ${createSimpleExpandable('TextInput', textInputComponent, 'textinput')}
          ${createSimpleExpandable('TextArea', textAreaComponent, 'textarea')}
          ${createSimpleExpandable('Pin', pinComponent, 'pin')}
          ${createSimpleExpandable('Selector', selectorComponent, 'selector')}
          ${createSimpleExpandable('Checkbox', checkboxComponent, 'checkbox')}
          ${createSimpleExpandable('Radio', radioComponent, 'radio')}
          ${createSimpleExpandable('ColorPicker', colorPickerComponent, 'colorpicker')}
          ${createSimpleExpandable('DatePicker', datePickerComponent, 'datepicker')}
          ${createSimpleExpandable('Stepper', stepperComponent, 'stepper')}
          ${createSimpleExpandable('Slider', sliderComponent, 'slider')}
          ${createSimpleExpandable('Fader', faderComponent, 'fader')}
          ${createSimpleExpandable('Knob', knobComponent, 'knob')}
        </div>
      </section>

      <!-- Section 2: Layout -->
      <section class="demo-section">
        <h2 class="demo-section-title">Layout</h2>
        <div class="components-grid">
          ${expandableDemo.render()}
          ${createSimpleExpandable('Tabs', tabsComponent, 'tabs')}
          ${createSimpleExpandable('Accordion', accordionComponent, 'accordion')}
          ${createSimpleExpandable('Popover', popoverComponent, 'popover')}
          ${createSimpleExpandable('Tooltip', tooltipComponent, 'tooltip')}
          ${createSimpleExpandable('Modal', modalComponent, 'modal')}
          ${createSimpleExpandable('Toast', toastComponent, 'toast')}
          ${createSimpleExpandable('Depth', depthComponent, 'depth')}
          ${createSimpleExpandable('Shallow', shallowComponent, 'shallow')}
        </div>
      </section>

      <!-- Section 3: Typo -->
      <section class="demo-section">
        <h2 class="demo-section-title">Typo</h2>
        <div class="components-grid">
          ${createExpandable('Title', titleConfigurator, 'title')}
          ${createExpandable('Text', textConfigurator, 'text')}
          ${createExpandable('Label', labelConfigurator, 'label')}
          ${createExpandable('Icon', iconConfigurator, 'icon')}
        </div>
      </section>
    </main>
    `;

  // Hydrate header title
  const headerTitleEl = app.querySelector('.header-logo .kwami-title');
  if (headerTitleEl) headerTitle.hydrate(headerTitleEl as HTMLElement);

  // Hydrate theme control
  const themeControlEl = app.querySelector('.theme-control-wrapper .kwami-theme-control');
  if (themeControlEl && themeControl) {
    themeControl.hydrate(themeControlEl as HTMLElement);
  }

  // Hydrate all expandables and their configurators
  components.forEach(({ expandable, configurator }) => {
    const expandableEl = app.querySelector(
      `[data-expandable-id="${expandable['props'].expandableId}"]`
    );
    if (expandableEl) {
      expandable.hydrate(expandableEl as HTMLElement);

      // Find and hydrate the configurator inside
      const configuratorEl = expandableEl.querySelector(
        '.kwami-title-configurator, .kwami-text-configurator, .kwami-label-configurator, .kwami-icon-configurator, .kwami-button-configurator'
      );
      if (configuratorEl) {
        configurator.hydrate(configuratorEl as HTMLElement);
      }
    }
  });

  // Hydrate simple components
  simpleComponents.forEach(({ expandable, component }) => {
    const expandableEl = app.querySelector(
      `[data-expandable-id="${expandable['props'].expandableId}"]`
    );
    if (expandableEl) {
      expandable.hydrate(expandableEl as HTMLElement);

      // Find and hydrate the component inside
      const componentEl = expandableEl.querySelector(
        '.kwami-toggle, .kwami-activator-container, .kwami-switch-container, .kwami-textinput-container, .kwami-textarea-container, .kwami-pin-container, .kwami-selector-container, .kwami-checkbox-group, .kwami-radio-group, .kwami-colorpicker, .kwami-datepicker-container, .kwami-slider, .kwami-stepper-container, .kwami-fader-container, .kwami-knob-container, .kwami-tabs, .kwami-accordion, .kwami-popover-wrapper, .kwami-tooltip-wrapper, .kwami-modal-wrapper, .kwami-toast-wrapper, .kwami-depth, .kwami-shallow'
      );
      if (componentEl) {
        component.hydrate(componentEl as HTMLElement);
      }
    }
  });

  // Hydrate multi-screen expandables (like Button with docs + config)
  multiScreenComponents.forEach(({ expandable, preview, screens }) => {
    const expandableEl = app.querySelector(
      `[data-expandable-id="${expandable['props'].expandableId}"]`
    );
    if (expandableEl) {
      expandable.hydrate(expandableEl as HTMLElement);

      // Hydrate preview button
      if (preview) {
        const previewEl = expandableEl.querySelector(
          '.kwami-expandable-preview .kwami-button-bezel'
        );
        if (previewEl) {
          preview.hydrate(previewEl as HTMLElement);
        }
      }

      // Hydrate screen components
      screens.forEach(({ id, component }) => {
        const screenEl = expandable.getScreenElement(id);
        if (screenEl) {
          if (component instanceof ButtonDocs) {
            const docsEl = screenEl.querySelector('.kwami-button-docs');
            if (docsEl) {
              component.hydrate(docsEl as HTMLElement);
            }
          } else if (component instanceof ButtonConfigurator) {
            const configEl = screenEl.querySelector('.kwami-button-configurator');
            if (configEl) {
              component.hydrate(configEl as HTMLElement);
            }
          }
        }
      });
    }
  });

  // Hydrate standalone expandables
  standaloneExpandables.forEach((expandable) => {
    const expandableEl = app.querySelector(
      `[data-expandable-id="${expandable['props'].expandableId}"]`
    );
    if (expandableEl) {
      expandable.hydrate(expandableEl as HTMLElement);
    }
  });
}

initApp();
