import './fixes.js';
await import('./contentIntegration.js');
await import('./sourcePromptIntegration.js');
await import('./answerAliasPromptEnhancer.js');
await import('./tableGuideEnhancer.js');
await import('./app.js');
await import('./dbNotesEnhancer.js');
await import('./headerReferenceEnhancer.js');
await import('./problemSelectEnhancer.js');
await import('./nextProblemEnhancer.js');
await import('./retryEnhancer.js');

// sqlInputPalette.js performs explicit auto-fit on render and window resize.
// Ignore observing the palette itself so style changes cannot recursively
// trigger ResizeObserver -> fit -> resize -> ResizeObserver loops.
const NativeResizeObserver = globalThis.ResizeObserver;
if (NativeResizeObserver) {
  globalThis.ResizeObserver = class SafeResizeObserver extends NativeResizeObserver {
    observe(target, options) {
      if (target?.classList?.contains('sql-input-palette')) return;
      return super.observe(target, options);
    }
  };
}
try {
  await import('./sqlInputPalette.js');
} finally {
  if (NativeResizeObserver) globalThis.ResizeObserver = NativeResizeObserver;
}

await import('./editorLayoutEnhancer.js');
await import('./hintEnhancer.js');
await import('./answerEnhancer.js');
