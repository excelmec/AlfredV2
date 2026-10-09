import { IEventHead } from 'Hooks/Event/eventTypes';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface EventHeadFieldsProps {
  eventHead: IEventHead;
  setEventHead: (eventHead: IEventHead) => void;
  disabled: boolean;
  error?: string;
}

export default function EventHeadFields({
  eventHead,
  setEventHead,
  disabled,
  error,
}: EventHeadFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="head-name">Name</Label>
        <Input
          id="head-name"
          required
          placeholder="Enter name"
          disabled={disabled}
          value={eventHead.name}
          onChange={(e) => setEventHead({ ...eventHead, name: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="head-email">Email</Label>
        <Input
          id="head-email"
          type="email"
          required
          placeholder="Enter email"
          disabled={disabled}
          value={eventHead.email}
          onChange={(e) => setEventHead({ ...eventHead, email: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="head-phone">Phone number</Label>
        <Input
          id="head-phone"
          required
          placeholder="Enter phone number"
          disabled={disabled}
          value={eventHead.phoneNumber}
          onChange={(e) => setEventHead({ ...eventHead, phoneNumber: e.target.value })}
        />
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
