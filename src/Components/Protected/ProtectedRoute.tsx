import { useContext } from 'react';
import { LockKeyIcon, ProhibitIcon } from '@phosphor-icons/react';
import UserContext, { UserRoles } from 'Contexts/User/UserContext';
import { PageError, PageLoading } from '@/Components/page-state';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/Components/ui/empty';

interface IProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRoles[];
}

export default function ProtectedRoute(props: IProtectedRouteProps) {
  const { userData, userLoading, userError } = useContext(UserContext);

  if (userLoading) {
    return <PageLoading />;
  }

  if (userError) {
    return <PageError>{userError}</PageError>;
  }

  if (!userData.loggedIn) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LockKeyIcon />
          </EmptyMedia>
          <EmptyTitle>Not logged in</EmptyTitle>
          <EmptyDescription>Log in from the sidebar to view this page.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (
    props.allowedRoles &&
    props.allowedRoles.length > 0 &&
    !userData.roles.some((role) => props.allowedRoles?.includes(role))
  ) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ProhibitIcon />
          </EmptyMedia>
          <EmptyTitle>No permission</EmptyTitle>
          <EmptyDescription>You do not have permission to view this page.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return <>{props.children}</>;
}
