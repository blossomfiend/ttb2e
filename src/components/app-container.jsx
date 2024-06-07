import { createContext, lazy, Show, Suspense, useTransition } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { ErrorBoundary, render } from "solid-js/web";
import BarLoader from "./partial/bar-loader.jsx";

export const AppContainerContext = createContext();

export default function AppContainer(props) {
  const [isPending, start] = useTransition();
  const context = { isPending, start };
  return (
    <ErrorBoundary
      fallback={(e) => {
        logger.error(e);
        return <div>Error: {e.toString()}</div>;
      }}
    >
      <AppContainerContext.Provider value={context}>
        <Show when={isPending()}>
          <BarLoader />
        </Show>
        <Suspense fallback={<BarLoader />}>{props.children}</Suspense>
      </AppContainerContext.Provider>
    </ErrorBoundary>
  );
}

export function createApp(componentLoader, mountElement, initialProps = {}) {
  let store, setStore;
  const Component = lazy(componentLoader);
  const dispose = render(() => {
    [store, setStore] = createStore(initialProps);
    return (
      <AppContainer>
        <Component {...store} />
      </AppContainer>
    );
  }, mountElement);
  const setter = (newProps) => setStore(reconcile(newProps));
  return [store, setter, dispose];
}
