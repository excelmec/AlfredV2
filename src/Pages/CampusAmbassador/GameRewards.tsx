import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { FormField, ToggleRow } from '@/Components/form-layout';
import { PageHeader } from '@/Components/page-header';
import { PageError, PageLoading } from '@/Components/page-state';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';

type RewardConfig = {
  id: number;
  gameCode: string;
  campaignCode: string;
  eventKey: string;
  label: string;
  metric: string;
  threshold: number | null;
  rankFrom: number | null;
  rankTo: number | null;
  points: number;
  enabled: boolean;
};

const gameNames: Record<string, string> = {
  clockwork: 'Clockwork Escape',
  shards: 'Shards of Infinity',
  dalalbull: 'Dalal Bull',
  tetherverse: 'Tetherverse',
};

export default function GameRewardsPage() {
  const { axiosEventsPrivate } = useContext(ApiContext);
  const [configs, setConfigs] = useState<RewardConfig[]>([]);
  const [savedConfigs, setSavedConfigs] = useState<RewardConfig[]>([]);
  const [topTenGame, setTopTenGame] = useState('shards');
  const [topTenPlayers, setTopTenPlayers] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [submittingTopTen, setSubmittingTopTen] = useState(false);
  const [error, setError] = useState('');

  const campaignCode = configs[0]?.campaignCode ?? 'excelplay-2026';

  async function loadConfigs() {
    try {
      setError('');
      const response = await axiosEventsPrivate.get<RewardConfig[]>('/api/game-rewards/configs');
      setConfigs(response.data);
      setSavedConfigs(response.data);
    } catch {
      setError(
        'Could not load reward settings. Check that the Events Service is updated and reachable.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function editConfig(id: number, update: Partial<RewardConfig>) {
    setConfigs((current) => current.map((row) => (row.id === id ? { ...row, ...update } : row)));
  }

  function hasUnsavedChanges(config: RewardConfig) {
    const saved = savedConfigs.find((row) => row.id === config.id);
    return !saved || saved.points !== config.points || saved.enabled !== config.enabled;
  }

  async function saveConfig(config: RewardConfig) {
    setSavingId(config.id);
    try {
      const response = await axiosEventsPrivate.put<RewardConfig>(
        `/api/game-rewards/configs/${config.id}`,
        config,
      );
      const saved = response.data;
      setConfigs((current) => current.map((row) => (row.id === saved.id ? saved : row)));
      setSavedConfigs((current) => current.map((row) => (row.id === saved.id ? saved : row)));
      toast.success(`${saved.label} saved`);
    } catch {
      toast.error(`Could not save ${config.label}`);
    } finally {
      setSavingId(null);
    }
  }

  async function submitTopTen() {
    const players = topTenPlayers
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [rawUserId = '', rankText = ''] = line.split(/[\s,\t]+/);
        return { userId: rawUserId.toLowerCase(), rank: Number(rankText) };
      });
    if (
      players.length < 1 ||
      players.length > 10 ||
      players.some(
        (player) =>
          !player.userId || !Number.isInteger(player.rank) || player.rank < 1 || player.rank > 10,
      )
    ) {
      toast.error('Enter 1–10 lines in the format: account-email, rank');
      return;
    }

    setSubmittingTopTen(true);
    try {
      const response = await axiosEventsPrivate.post<{ claimed: boolean; reason?: string }[]>(
        '/api/game-rewards/claims/top-ten',
        { gameCode: topTenGame, campaignCode, players },
      );
      const awarded = response.data.filter((row) => row.claimed).length;
      toast.success(`Top-ten results processed: ${awarded} new referral awards`);
      if (awarded < players.length) {
        toast.message('Some entries had no enabled reward, no referral, or were already claimed.');
      }
    } catch {
      toast.error('Could not submit top-ten results');
    } finally {
      setSubmittingTopTen(false);
    }
  }

  if (loading) return <PageLoading />;
  if (error) return <PageError>{error}</PageError>;

  const games = [...new Set(configs.map((config) => config.gameCode))];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Excel Play rewards"
        description="Set CA points for verified game milestones. Each configured reward can be claimed once per player."
      />

      <Card size="sm">
        <CardContent className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-medium text-foreground">Campaign</span>
          <Badge variant="secondary">{campaignCode}</Badge>
          <span className="text-muted-foreground">
            Points go to the player’s recorded ambassador. Save each changed reward to publish it.
          </span>
        </CardContent>
      </Card>

      {games.map((gameCode) => (
        <Card key={gameCode}>
          <CardHeader className="border-b">
            <CardTitle>{gameNames[gameCode] ?? gameCode}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {configs
                .filter((config) => config.gameCode === gameCode)
                .map((config) => {
                  const dirty = hasUnsavedChanges(config);
                  const saving = savingId === config.id;
                  return (
                    <div
                      key={config.id}
                      className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(180px,220px)_120px_minmax(100px,auto)] md:items-center"
                    >
                      <div className="min-w-0 space-y-1.5">
                        <div className="font-medium">{config.label}</div>
                        <Badge variant="outline">{config.eventKey}</Badge>
                      </div>
                      <ToggleRow label="Reward enabled">
                        <Switch
                          checked={config.enabled}
                          disabled={saving}
                          aria-label={`Enable ${config.label}`}
                          onCheckedChange={(enabled) => editConfig(config.id, { enabled })}
                        />
                      </ToggleRow>
                      <FormField label="Points" htmlFor={`reward-points-${config.id}`}>
                        <Input
                          id={`reward-points-${config.id}`}
                          type="number"
                          min={0}
                          step={1}
                          value={config.points}
                          disabled={saving}
                          onChange={(event) =>
                            editConfig(config.id, { points: Number(event.target.value) })
                          }
                        />
                      </FormField>
                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        {dirty && <Badge variant="secondary">Unsaved</Badge>}
                        <Button
                          disabled={savingId !== null || !dirty}
                          onClick={() => void saveConfig(config)}
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Award final top 10</CardTitle>
          <CardDescription>
            After checking the final leaderboard, enter one Excel account email and rank per line.
            This action is safe to retry.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField label="Game" htmlFor="top-ten-game">
            <Select value={topTenGame} onValueChange={setTopTenGame}>
              <SelectTrigger id="top-ten-game" className="w-full">
                <SelectValue placeholder="Choose a game" />
              </SelectTrigger>
              <SelectContent>
                {games
                  .filter((game) => game !== 'tetherverse')
                  .map((game) => (
                    <SelectItem key={game} value={game}>
                      {gameNames[game] ?? game}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Players and ranks"
            htmlFor="top-ten-players"
            hint="Enter 1–10 rows in the format account-email, rank (for example, player@example.com, 1)."
          >
            <Textarea
              id="top-ten-players"
              rows={8}
              value={topTenPlayers}
              onChange={(event) => setTopTenPlayers(event.target.value)}
              placeholder={'player@example.com, 1\nplayer2@example.com, 2'}
            />
          </FormField>
          <div>
            <Button disabled={submittingTopTen} onClick={() => void submitTopTen()}>
              {submittingTopTen ? 'Submitting…' : 'Submit final ranks'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
