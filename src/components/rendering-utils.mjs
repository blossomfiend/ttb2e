import { createComputed, createMemo, createSignal, onCleanup, untrack } from "solid-js";

/**
 * Create a hook that will automatically be disposed in a SolidJS context.
 * @param {string} hook
 * @param {Function} fn
 */
export function createHook(hook, fn) {
  const hookId = Hooks.on(hook, fn);
  onCleanup(() => Hooks.off(hook, hookId));
}

/**
 * Creates a signal that will update whenever the provided document is updated.
 * @template {Document|null|undefined} T
 * @param {T|(() => T)} document
 */
export function trackDocument(document) {
  const documentGetter =
    typeof document === "function" ? document : () => document;
  const [doc, setDoc] = createSignal(documentGetter(), { equals: false });
  createComputed(() => {
    setDoc(documentGetter());
  });
  const hasDocument = createMemo(() => doc() != null);
  const documentName = createMemo(() => doc()?.constructor?.documentName);
  createComputed(() => {
    if (hasDocument()) {
      const name = documentName();
      untrack(() => {
        createHook(`update${name}`, (document, _updateData, _options, _editorId) => {
          if (document.id === doc().id) setDoc(document);
        });
        createHook(`delete${name}`, (document, _options, _id) => {
          if (document.id === doc().id) setDoc(null);
        });
      });
    }
  });
  return doc;
}
