import { type TokenizerExtension, type RendererExtension } from 'marked';
import katex from 'katex';

// Extension for marked to handle Mermaid diagrams
export const mermaidExtension: TokenizerExtension & RendererExtension = {
  name: 'mermaid',
  level: 'block',
  start(src: string) {
    return src.indexOf('```mermaid');
  },
  tokenizer(src: string) {
    const match = src.match(/^```mermaid\n([\s\S]+?)```/);
    if (match) {
      return {
        type: 'mermaid',
        raw: match[0],
        text: match[1].trim()
      };
    }
    return undefined;
  },
  renderer(token: any) {
    return `<div class="mermaid">${token.text}</div>`;
  }
};

// Extension for marked to handle inline KaTeX math
export const inlineMathExtension: TokenizerExtension & RendererExtension = {
  name: 'inlineMath',
  level: 'inline',
  start(src: string) {
    return src.indexOf('$');
  },
  tokenizer(src: string) {
    const match = src.match(/^\$([^$\n]+?)\$/);
    if (match && match[0].charAt(0) === '$' && match[0].charAt(match[0].length - 1) === '$') {
      return {
        type: 'inlineMath',
        raw: match[0],
        text: match[1].trim()
      };
    }
    return undefined;
  },
  renderer(token: any) {
    try {
      return katex.renderToString(token.text, { throwOnError: false, displayMode: false });
    } catch (error) {
      console.error('KaTeX inline render error:', error);
      return `<span class="katex-error">${token.text}</span>`;
    }
  }
};

// Extension for marked to handle block KaTeX math
export const blockMathExtension: TokenizerExtension & RendererExtension = {
  name: 'blockMath',
  level: 'block',
  start(src: string) {
    return src.indexOf('$$');
  },
  tokenizer(src: string) {
    const match = src.match(/^\$\$([\s\S]+?)\$\$/);
    if (match) {
      return {
        type: 'blockMath',
        raw: match[0],
        text: match[1].trim()
      };
    }
    return undefined;
  },
  renderer(token: any) {
    try {
      return katex.renderToString(token.text, { throwOnError: false, displayMode: true });
    } catch (error) {
      console.error('KaTeX block render error:', error);
      return `<div class="katex-error">${token.text}</div>`;
    }
  }
}; 