import { WarningCircleIcon } from '@phosphor-icons/react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/Components/ui/empty';

export default function ErrorPage({ errMsg }: { errMsg?: string }) {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon />
        </EmptyMedia>
        <EmptyTitle>Oops, that's an error</EmptyTitle>
        {errMsg && <EmptyDescription>{errMsg}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  );
}
