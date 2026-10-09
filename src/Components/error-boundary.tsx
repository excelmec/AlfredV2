import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ArrowClockwiseIcon, BugIcon } from '@phosphor-icons/react';
import { Button } from '@/Components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/Components/ui/empty';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** A failed lazy chunk (e.g. after a new deploy) needs a full reload, not just a re-render */
const isChunkError = (error: Error) =>
  /dynamically imported module|Importing a module script failed|Loading chunk/i.test(error.message);

/**
 * Catches render errors in a page so the rest of the shell stays usable
 * instead of the whole app turning into a blank white screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page crashed:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunkError = isChunkError(error);

    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BugIcon />
          </EmptyMedia>
          <EmptyTitle>
            {chunkError ? 'This page failed to load' : 'Something went wrong'}
          </EmptyTitle>
          <EmptyDescription>
            {chunkError
              ? 'A new version of the app may be available. Reload to continue.'
              : error.message || 'An unexpected error occurred while showing this page.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            {!chunkError && (
              <Button variant="outline" onClick={() => this.setState({ error: null })}>
                Try again
              </Button>
            )}
            <Button onClick={() => window.location.reload()}>
              <ArrowClockwiseIcon /> Reload
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    );
  }
}
