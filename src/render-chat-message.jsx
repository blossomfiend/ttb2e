import { Suspense } from "solid-js";
import { ErrorBoundary, render } from "solid-js/web";
import FlipChatMessage from "./components/flip-chat-message.jsx";

export default function renderChatMessage(message, html, data) {
  render(
    () => (
      <ErrorBoundary
        fallback={(e) => {
          logger.error(e);
          return <div>Error: {e.toString()}</div>;
        }}
      >
        <Suspense fallback={<div class="h-[132px]"></div>}>
          <FlipChatMessage message={message} />
        </Suspense>
      </ErrorBoundary>
    ),
    html[0],
  );
}
