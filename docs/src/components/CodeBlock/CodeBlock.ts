/**
 * CodeBlock Component - Syntax highlighted code with copy functionality
 */

import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import './CodeBlock.css';

export interface CodeBlockProps {
  /** The code to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: 'typescript' | 'javascript' | 'html' | 'css';
  /** Optional title/label for the code block */
  title?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
}

export class CodeBlock {
  private props: CodeBlockProps;
  private copyBtn: HTMLButtonElement | null = null;

  constructor(props: CodeBlockProps) {
    this.props = props;
  }

  render(): string {
    const { code, language = 'typescript', title, showLineNumbers = false } = this.props;

    // Highlight code with Prism
    const highlightedCode = Prism.highlight(
      code.trim(),
      Prism.languages[language] || Prism.languages.javascript,
      language
    );

    // Generate line numbers if needed
    const lines = code.trim().split('\n');
    const lineNumbersHtml = showLineNumbers
      ? `<span class="kwami-code-line-numbers">${lines.map((_, i) => `<span>${i + 1}</span>`).join('')}</span>`
      : '';

    const titleHtml = title
      ? `<div class="kwami-code-header"><span class="kwami-code-title">${title}</span></div>`
      : '';

    return `
      <div class="kwami-code-block ${showLineNumbers ? 'kwami-code-block--numbered' : ''}">
        ${titleHtml}
        <div class="kwami-code-content">
          ${lineNumbersHtml}
          <pre class="kwami-code-pre language-${language}"><code class="kwami-code language-${language}">${highlightedCode}</code></pre>
          <button class="kwami-code-copy" title="Copy to clipboard">
            <iconify-icon icon="solar:copy-linear" width="16" height="16"></iconify-icon>
          </button>
        </div>
      </div>
        `;
  }

  hydrate(element: HTMLElement): void {
    this.copyBtn = element.querySelector('.kwami-code-copy');

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => this.handleCopy());
    }
  }

  private async handleCopy(): Promise<void> {
    if (!this.copyBtn) return;

    try {
      await navigator.clipboard.writeText(this.props.code.trim());

      // Visual feedback
      this.copyBtn.classList.add('copied');
      const icon = this.copyBtn.querySelector('iconify-icon');
      if (icon) {
        icon.setAttribute('icon', 'solar:check-circle-linear');
      }

      setTimeout(() => {
        this.copyBtn?.classList.remove('copied');
        if (icon) {
          icon.setAttribute('icon', 'solar:copy-linear');
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }

  destroy(): void {
    this.copyBtn = null;
  }
}
