import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import UserContext from 'Contexts/User/UserContext';
import { PageHeader } from '@/Components/page-header';
import { Card, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { navGroups } from 'Components/Dashboard/Sidebar/navigation';

const groupDescriptions: Record<string, string> = {
  '/ca': 'Ambassadors, teams and referral points',
  '/events': 'Events, heads, registrations and schedule',
  '/merch': 'Items, orders, pre-orders and stock',
  '/ticket': 'Proshows, attendees and ticket scanning',
};

export default function Home() {
  const { userData } = useContext(UserContext);
  const firstName = userData.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : 'Welcome to Alfred'}
        description="The Excel MEC admin dashboard. Jump into a section to get started."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {navGroups.map((group) => (
          <Link key={group.prefix} to={group.items[0].to} className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <group.icon className="size-5" />
                  </span>
                  <ArrowUpRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <CardTitle>{group.title}</CardTitle>
                <CardDescription>{groupDescriptions[group.prefix]}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
