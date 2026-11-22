import '@/components/lab/overlays.css';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronRight, Copy, File, Folder, FolderOpen, RotateCcw } from 'lucide-react';
import { useMotionAllowed } from '@/components/lab/motion';

/* ─── TreeView ───────────────────────────────────────────────────────── */

export type TreeNode = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Information discrète à droite (taille, nombre d'éléments…). */
  meta?: string;
  disabled?: boolean;
  children?: TreeNode[];
};

type VisibleNode = { node: TreeNode; parentId: string | null };

function visibleNodes(
  nodes: TreeNode[],
  expanded: Set<string>,
  parentId: string | null = null,
): VisibleNode[] {
  return nodes.flatMap(node => [
    { node, parentId },
    ...(node.children?.length && expanded.has(node.id) ? visibleNodes(node.children, expanded, node.id) : []),
  ]);
}

export function TreeView({
  nodes,
  label,
  selected,
  onSelect,
  defaultExpanded = [],
}: {
  nodes: TreeNode[];
  label: string;
  /** Sélection contrôlée ; laissez vide pour une sélection interne. */
  selected?: string | null;
  onSelect?: (node: TreeNode) => void;
  defaultExpanded?: string[];
}) {
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded));
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(selected ?? null);
  const refs = useRef(new Map<string, HTMLLIElement>());
  const current = selected !== undefined ? selected : internalSelected;
  const visible = visibleNodes(nodes, expanded);
  const tabbableId = visible.some(item => item.node.id === focusedId)
    ? focusedId
    : (visible[0]?.node.id ?? null);

  const focusNode = (id: string | undefined) => {
    if (!id) return;
    setFocusedId(id);
    refs.current.get(id)?.focus();
  };
  const setOpen = (ids: string[], open: boolean) =>
    setExpanded(previous => {
      const next = new Set(previous);
      ids.forEach(id => (open ? next.add(id) : next.delete(id)));
      return next;
    });
  const activate = (node: TreeNode) => {
    focusNode(node.id);
    if (node.disabled) return;
    if (node.children?.length) setOpen([node.id], !expanded.has(node.id));
    setInternalSelected(node.id);
    onSelect?.(node);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const index = visible.findIndex(item => item.node.id === tabbableId);
    const item = visible[index];
    if (!item) return;
    const { node, parentId } = item;
    const hasChildren = Boolean(node.children?.length);
    const isOpen = hasChildren && expanded.has(node.id);
    let handled = true;
    switch (event.key) {
      case 'ArrowDown':
        focusNode(visible[index + 1]?.node.id);
        break;
      case 'ArrowUp':
        focusNode(visible[index - 1]?.node.id);
        break;
      case 'Home':
        focusNode(visible[0]?.node.id);
        break;
      case 'End':
        focusNode(visible[visible.length - 1]?.node.id);
        break;
      case 'ArrowRight':
        if (hasChildren && !isOpen) setOpen([node.id], true);
        else if (isOpen) focusNode(visible[index + 1]?.node.id);
        break;
      case 'ArrowLeft':
        if (isOpen) setOpen([node.id], false);
        else if (parentId) focusNode(parentId);
        break;
      case 'Enter':
      case ' ':
        activate(node);
        break;
      case '*':
        setOpen(
          visible
            .filter(entry => entry.parentId === parentId && entry.node.children?.length)
            .map(entry => entry.node.id),
          true,
        );
        break;
      default: {
        handled = false;
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) break;
        const letter = event.key.toLocaleLowerCase();
        const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
        const match = ordered.find(entry => entry.node.label.toLocaleLowerCase().startsWith(letter));
        if (match) {
          focusNode(match.node.id);
          handled = true;
        }
      }
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const renderLevel = (list: TreeNode[], level: number): ReactNode =>
    list.map((node, index) => {
      const hasChildren = Boolean(node.children?.length);
      const isOpen = hasChildren && expanded.has(node.id);
      const isSelected = current === node.id;
      return (
        <li
          key={node.id}
          ref={element => {
            if (element) refs.current.set(node.id, element);
            else refs.current.delete(node.id);
          }}
          role="treeitem"
          aria-level={level}
          aria-setsize={list.length}
          aria-posinset={index + 1}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={isSelected}
          aria-disabled={node.disabled || undefined}
          tabIndex={node.id === tabbableId ? 0 : -1}
          className={`ov-tree-item ${isSelected ? 'selected' : ''} ${node.disabled ? 'disabled' : ''}`}
          onFocus={event => {
            if (event.target === event.currentTarget) setFocusedId(node.id);
          }}
        >
          <div
            className="ov-tree-row"
            style={{ '--ov-level': level - 1 } as CSSProperties}
            onClick={event => {
              event.stopPropagation();
              activate(node);
            }}
          >
            <span className={`ov-tree-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">
              {hasChildren && <ChevronRight size={14} />}
            </span>
            <span className="ov-tree-icon" aria-hidden="true">
              {node.icon ??
                (hasChildren ? isOpen ? <FolderOpen size={15} /> : <Folder size={15} /> : <File size={15} />)}
            </span>
            <span className="ov-tree-label">{node.label}</span>
            {node.meta && <small>{node.meta}</small>}
          </div>
          {isOpen && (
            <ul role="group" className="ov-tree-group">
              {renderLevel(node.children ?? [], level + 1)}
            </ul>
          )}
        </li>
      );
    });

  return (
    <ul role="tree" aria-label={label} className="ov-tree" onKeyDown={onKeyDown}>
      {renderLevel(nodes, 1)}
    </ul>
  );
}

/* ─── CodeBlock ──────────────────────────────────────────────────────── */

export type CodeLanguage = 'ts' | 'tsx' | 'css' | 'bash';

type TokenKind =
  'comment' | 'string' | 'keyword' | 'number' | 'type' | 'function' | 'property' | 'punctuation' | 'plain';
type Token = { kind: TokenKind; value: string };
type ScanContext = { code: string; start: number; end: number; state: Record<string, number> };
type Rule = [RegExp, TokenKind | ((value: string, context: ScanContext) => TokenKind)];

const tsKeywords = new Set(
  'import export from default const let var function return type interface extends implements class new true false null undefined typeof instanceof keyof if else for while do of in async await void as switch case break continue try catch finally throw this super satisfies readonly enum declare'.split(
    ' ',
  ),
);
const bashKeywords = new Set(
  'if then else elif fi for in do done while until case esac function return export local readonly set unset echo printf cd sudo exit source alias time exec'.split(
    ' ',
  ),
);
/** Mots après lesquels on attend encore un nom de commande. */
const bashPrefixes = new Set('if then else elif do while until sudo time exec'.split(' '));

const nextChar = (code: string, end: number) => code.slice(end).match(/^[ \t]*(\S)/)?.[1] ?? '';

const stringRule: Rule = [/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y, 'string'];

const tsRules: Rule[] = [
  [/\/\/[^\n]*/y, 'comment'],
  [/\/\*[\s\S]*?(?:\*\/|$)/y, 'comment'],
  [/`(?:\\[\s\S]|[^`\\])*`?/y, 'string'],
  stringRule,
  [
    /[A-Za-z_$][\w$]*/y,
    (value, { code, start, end }) => {
      if (tsKeywords.has(value)) return 'keyword';
      if (code[start - 1] === '.') return nextChar(code, end) === '(' ? 'function' : 'property';
      if (/^[A-Z]/.test(value)) return 'type';
      if (nextChar(code, end) === '(') return 'function';
      return nextChar(code, end) === ':' && /[{,\s]/.test(code[start - 1] ?? '') ? 'property' : 'plain';
    },
  ],
  [/\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?/iy, 'number'],
  [/\s+/y, 'plain'],
  [/[{}()[\];,.<>:=+\-*/%!&|?^~@]/y, 'punctuation'],
];

const languageRules: Record<CodeLanguage, Rule[]> = {
  ts: tsRules,
  tsx: tsRules,
  css: [
    [/\/\*[\s\S]*?(?:\*\/|$)/y, 'comment'],
    stringRule,
    [/@[\w-]+|!important/y, 'keyword'],
    [/#[0-9a-fA-F]{3,8}\b/y, (_value, { state }) => (state.depth ? 'number' : 'type')],
    [
      /-{0,2}[A-Za-z_][\w-]*/y,
      (_value, { code, end, state }) => {
        if (!state.depth) return 'type';
        const after = nextChar(code, end);
        if (after === ':') return 'property';
        return after === '(' || code[end] === '(' ? 'function' : 'plain';
      },
    ],
    [/-?(?:\d*\.)?\d+(?:%|[a-zA-Z]+)?/y, 'number'],
    [
      /[{}]/y,
      (value, { state }) => {
        state.depth = Math.max(0, (state.depth ?? 0) + (value === '{' ? 1 : -1));
        return 'punctuation';
      },
    ],
    [/\s+/y, 'plain'],
    [/[:;,.>+~*()[\]=&]/y, 'punctuation'],
  ],
  bash: [
    [/\\\n/y, 'plain'],
    [
      /\n/y,
      (_value, { state }) => {
        state.command = 1;
        return 'plain';
      },
    ],
    [/[ \t]+/y, 'plain'],
    [/(?<![^\s])#[^\n]*/y, 'comment'],
    stringRule,
    [/\$(?:\{[^}\n]*\}|\([^)\n]*\)|[A-Za-z_]\w*|[0-9@#?$!*-])/y, 'type'],
    [
      /&&|\|\||[|;&]/y,
      (_value, { state }) => {
        state.command = 1;
        return 'punctuation';
      },
    ],
    [/(?<![^\s])--?[\w-]+/y, 'property'],
    [
      /[^\s|;&$"'#]+/y,
      (value, { state }) => {
        if (bashKeywords.has(value)) {
          state.command = bashPrefixes.has(value) ? 1 : 0;
          return 'keyword';
        }
        if (state.command) {
          state.command = 0;
          return /=/.test(value) ? 'plain' : 'function';
        }
        return /^\d+$/.test(value) ? 'number' : 'plain';
      },
    ],
  ],
};

/** Coloration simple par expressions régulières (inspirée de codeTokenizer.ts de la référence). */
function tokenize(code: string, language: CodeLanguage): Token[] {
  const rules = languageRules[language];
  const state: Record<string, number> = { depth: 0, command: 1 };
  const tokens: Token[] = [];
  const push = (kind: TokenKind, value: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind && (kind === 'plain' || kind === 'punctuation')) last.value += value;
    else tokens.push({ kind, value });
  };
  let index = 0;
  while (index < code.length) {
    let matched = false;
    for (const [pattern, kind] of rules) {
      pattern.lastIndex = index;
      const value = pattern.exec(code)?.[0];
      if (!value) continue;
      const end = index + value.length;
      push(typeof kind === 'function' ? kind(value, { code, start: index, end, state }) : kind, value);
      index = end;
      matched = true;
      break;
    }
    if (!matched) {
      push('plain', code.charAt(index));
      index += 1;
    }
  }
  return tokens;
}

function splitLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokens) {
    token.value.split('\n').forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1]?.push({ kind: token.kind, value: part });
    });
  }
  return lines;
}

const languageNames: Record<CodeLanguage, string> = {
  ts: 'TypeScript',
  tsx: 'TSX',
  css: 'CSS',
  bash: 'Bash',
};

export function CodeBlock({
  code,
  language,
  title,
  showLineNumbers = true,
  highlight = [],
}: {
  code: string;
  language: CodeLanguage;
  /** Nom du fichier ou titre affiché dans l'en-tête. */
  title?: string;
  showLineNumbers?: boolean;
  /** Numéros de ligne (à partir de 1) à mettre en évidence. */
  highlight?: number[];
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const source = code.replace(/^\n+/, '').replace(/\s+$/, '');
  const lines = splitLines(tokenize(source, language));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    window.setTimeout(() => setStatus('idle'), 2000);
  };
  return (
    <figure className="ov-code">
      <figcaption className="ov-code-head">
        <span className="ov-code-title">{title ?? languageNames[language]}</span>
        {title && <span className="ov-code-lang">{languageNames[language]}</span>}
        <button
          type="button"
          className={`ov-code-copy ${status}`}
          onClick={() => void copy()}
          aria-label={status === 'copied' ? 'Code copié' : 'Copier le code'}
        >
          {status === 'copied' ? <Check size={13} /> : <Copy size={13} />}
          <span aria-hidden="true">{status === 'copied' ? 'Copié' : 'Copier'}</span>
        </button>
      </figcaption>
      <pre tabIndex={0} aria-label={`Code ${languageNames[language]}${title ? ` : ${title}` : ''}`}>
        <code>
          {lines.map((line, index) => (
            <span key={index} className={`ov-code-line ${highlight.includes(index + 1) ? 'highlight' : ''}`}>
              {showLineNumbers && (
                <span className="ov-code-number" aria-hidden="true">
                  {index + 1}
                </span>
              )}
              <span className="ov-code-content">
                {line.length
                  ? line.map((token, tokenIndex) => (
                      <span key={tokenIndex} className={`ov-tok-${token.kind}`}>
                        {token.value}
                      </span>
                    ))
                  : ' '}
              </span>
            </span>
          ))}
        </code>
      </pre>
      <span className="sr-only" aria-live="polite">
        {status === 'copied'
          ? 'Code copié dans le presse-papiers.'
          : status === 'error'
            ? 'Copie refusée par le navigateur.'
            : ''}
      </span>
    </figure>
  );
}

/* ─── Terminal ───────────────────────────────────────────────────────── */

export type TerminalLine = {
  kind: 'command' | 'output' | 'success' | 'error' | 'info';
  text: string;
  /** Pause avant la ligne (ms) ; pour une commande, pause avant la frappe. */
  delay?: number;
};

export function Terminal({
  lines,
  title = 'Terminal',
  prompt = '~',
  typingSpeed = 40,
  lineDelay = 450,
}: {
  lines: TerminalLine[];
  title?: string;
  prompt?: string;
  /** Délai entre deux caractères tapés (ms). */
  typingSpeed?: number;
  lineDelay?: number;
}) {
  const [run, setRun] = useState(0);
  return (
    <div className="ov-terminal">
      <div className="ov-terminal-bar">
        <span className="ov-terminal-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="ov-terminal-title">{title}</span>
        <button
          type="button"
          className="ov-terminal-replay"
          aria-label="Rejouer la session"
          onClick={() => setRun(previous => previous + 1)}
        >
          <RotateCcw size={13} />
        </button>
      </div>
      <TerminalScreen
        key={run}
        lines={lines}
        title={title}
        prompt={prompt}
        typingSpeed={typingSpeed}
        lineDelay={lineDelay}
      />
    </div>
  );
}

const terminalMarks: Partial<Record<TerminalLine['kind'], string>> = {
  success: '✓ ',
  error: '✗ ',
  info: 'ℹ ',
};

function TerminalScreen({
  lines,
  title,
  prompt,
  typingSpeed,
  lineDelay,
}: {
  lines: TerminalLine[];
  title: string;
  prompt: string;
  typingSpeed: number;
  lineDelay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(ref);
  const [step, setStep] = useState({ line: 0, chars: 0 });
  const done = !allowed || step.line >= lines.length;
  useEffect(() => {
    if (!allowed) return;
    const current = lines[step.line];
    if (!current) return;
    const typing = current.kind === 'command' && step.chars < current.text.length;
    const delay =
      current.kind === 'command'
        ? step.chars === 0
          ? (current.delay ?? lineDelay)
          : typing
            ? typingSpeed
            : typingSpeed * 6
        : (current.delay ?? lineDelay / 3);
    const timeout = window.setTimeout(
      () => setStep(typing ? { line: step.line, chars: step.chars + 1 } : { line: step.line + 1, chars: 0 }),
      delay,
    );
    return () => window.clearTimeout(timeout);
  }, [allowed, lines, step, typingSpeed, lineDelay]);
  useEffect(() => {
    const element = ref.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [step]);
  const shown = done ? lines : lines.slice(0, step.line);
  const typingLine = done ? undefined : lines[step.line];
  const promptMark = (
    <span className="ov-terminal-prompt" aria-hidden="true">
      {prompt} $
    </span>
  );
  return (
    <div
      ref={ref}
      className="ov-terminal-screen"
      role="log"
      aria-label={title}
      aria-busy={!done}
      tabIndex={0}
    >
      {shown.map((line, index) => (
        <div key={index} className={`ov-terminal-line kind-${line.kind}`}>
          {line.kind === 'command' && promptMark}
          {terminalMarks[line.kind]}
          {line.text}
        </div>
      ))}
      {typingLine?.kind === 'command' ? (
        <div className="ov-terminal-line kind-command">
          {promptMark}
          {typingLine.text.slice(0, step.chars)}
          <span className="ov-terminal-cursor" aria-hidden="true" />
        </div>
      ) : (
        <div className="ov-terminal-line kind-command">
          {done && promptMark}
          <span className="ov-terminal-cursor" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

/* ─── Dock ───────────────────────────────────────────────────────────── */

export type DockItem = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number | string;
  active?: boolean;
  onSelect?: () => void;
};

export function Dock({
  items,
  label,
  size = 44,
  magnification = 1.6,
  range = 120,
}: {
  items: DockItem[];
  label: string;
  /** Taille de base d'une icône (px). */
  size?: number;
  /** Facteur d'agrandissement maximal sous le pointeur. */
  magnification?: number;
  /** Distance (px) sur laquelle l'agrandissement s'estompe. */
  range?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const allowed = useMotionAllowed(ref);
  const [focusIndex, setFocusIndex] = useState(0);
  const magnify = (pointerX: number | null) => {
    buttons.current.forEach(button => {
      if (!button) return;
      if (pointerX === null || !allowed) {
        button.style.removeProperty('--ov-scale');
        return;
      }
      const rect = button.getBoundingClientRect();
      const distance = Math.abs(pointerX - (rect.left + rect.width / 2));
      const scale = Math.max(1, magnification - (distance / range) * (magnification - 1));
      button.style.setProperty('--ov-scale', scale.toFixed(3));
    });
  };
  const focusAt = (index: number) => {
    const next = (index + items.length) % items.length;
    setFocusIndex(next);
    buttons.current[next]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: focusIndex + 1,
      ArrowLeft: focusIndex - 1,
      Home: 0,
      End: items.length - 1,
    };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    focusAt(target);
  };
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={label}
      className="ov-dock"
      style={{ '--ov-dock-size': `${size}px`, '--ov-dock-max': magnification } as CSSProperties}
      onMouseMove={event => magnify(event.clientX)}
      onMouseLeave={() => magnify(null)}
      onKeyDown={onKeyDown}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={element => {
            buttons.current[index] = element;
          }}
          type="button"
          className={`ov-dock-item ${item.active ? 'active' : ''}`}
          tabIndex={index === focusIndex ? 0 : -1}
          aria-label={[
            item.label,
            item.badge !== undefined ? `${item.badge} nouveau${Number(item.badge) > 1 ? 'x' : ''}` : '',
            item.active ? 'ouvert' : '',
          ]
            .filter(Boolean)
            .join(', ')}
          onFocus={() => setFocusIndex(index)}
          onClick={() => item.onSelect?.()}
        >
          <span className="ov-dock-tip" aria-hidden="true">
            {item.label}
          </span>
          <span className="ov-dock-icon" aria-hidden="true">
            {item.icon}
            {item.badge !== undefined && <span className="ov-dock-badge">{item.badge}</span>}
          </span>
          <span className="ov-dock-dot" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
