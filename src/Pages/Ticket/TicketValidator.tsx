import { useContext, useEffect, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Card } from '@/Components/ui/card';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Spinner } from '@/Components/ui/spinner';
import { cn } from '@/lib/utils';
import {
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode';
import {
  CameraRotateIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import './TicketValidator.css';

interface ITicketData {
  name: string;
  email: string;
  proshow: string;
  stage?: string;
}

interface IScanResponse {
  success: boolean;
  message: string;
  error_code?: string;
  ticket_data?: ITicketData;
}

interface IScanHistoryItem {
  id: string;
  timestamp: Date;
  response: IScanResponse;
  qrCode: string;
}

type MarathonStage = 'COLLECTION' | 'CHECKIN';

export default function TicketValidator({ marathon = false }: { marathon?: boolean }) {
  const { axiosTicketsPrivate } = useContext(ApiContext);
  const [stage, setStage] = useState<MarathonStage>('CHECKIN');
  const stageRef = useRef<MarathonStage>('CHECKIN');
  const [scanHistory, setScanHistory] = useState<IScanHistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<IScanResponse | null>(null);
  const [inlineResult, setInlineResult] = useState<IScanResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [availableCameras, setAvailableCameras] = useState<any[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTextRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const processingRef = useRef<boolean>(false);
  const SCAN_DELAY_MS = 2000;
  const SCANNER_ELEMENT_ID = 'ticket-validator-scanner';

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cameras && cameras.length > 0) {
          setAvailableCameras(cameras);
          // Prefer back camera
          const backCameraIndex = cameras.findIndex((cam) =>
            cam.label.toLowerCase().includes('back'),
          );
          if (backCameraIndex !== -1) {
            setCurrentCameraIndex(backCameraIndex);
          }
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
      });

    // Start scanning after a short delay
    const timer = setTimeout(() => {
      startScan();
    }, 300);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Cleanup error:', err);
      }
      scannerRef.current = null;
    }
  };

  const startScan = async (cameraIndex?: number) => {
    setError('');
    setIsInitializing(true);

    if (isScanning) {
      await cleanup();
    }

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(SCANNER_ELEMENT_ID, {
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
          ],
        });
      }

      const camIndex = cameraIndex !== undefined ? cameraIndex : currentCameraIndex;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 60,
        qrbox: function (viewfinderWidth, viewfinderHeight) {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.8);
          return {
            width: qrboxSize,
            height: qrboxSize,
          };
        },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const cameraId =
        availableCameras.length > 0 ? availableCameras[camIndex].id : { facingMode: 'environment' };

      await scannerRef.current.start(cameraId, config, onScanSuccess, onScanFailure);

      setIsScanning(true);
      setIsInitializing(false);
    } catch (err: any) {
      console.error('Failed to start scanner', err);
      setError('Failed to start camera. Please check permissions and try again.');
      setIsScanning(false);
      setIsInitializing(false);
    }
  };

  const stopScan = async () => {
    if (!scannerRef.current) return;

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current.clear();
    } catch (err) {
      console.error('Failed to stop scanner', err);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleScan = async () => {
    if (isScanning) {
      await stopScan();
    } else {
      await startScan();
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) return;

    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIndex);

    if (isScanning) {
      await startScan(nextIndex);
    }
  };

  async function onScanSuccess(decodedText: string, _decodedResult: any) {
    const now = Date.now();

    if (processingRef.current) {
      return;
    }

    if (
      decodedText === lastScannedTextRef.current &&
      now - lastScanTimeRef.current < SCAN_DELAY_MS
    ) {
      return;
    }

    processingRef.current = true;
    lastScannedTextRef.current = decodedText;
    lastScanTimeRef.current = now;

    try {
      const response = marathon
        ? await axiosTicketsPrivate.post<IScanResponse>('/marathon/validate', {
            token: decodedText,
            stage: stageRef.current,
          })
        : await axiosTicketsPrivate.post<IScanResponse>('/validate', {
            token: decodedText,
          });
      processResult(response.data, decodedText);
    } catch (err: any) {
      processResult(
        {
          success: false,
          message: getErrMsg(err) || 'Network error. Please try again.',
          error_code: 'NETWORK_ERROR',
        },
        decodedText,
      );
    } finally {
      setTimeout(() => {
        processingRef.current = false;
      }, 400);
    }
  }

  function onScanFailure(_error: any) {}

  const processResult = (result: IScanResponse, qrCode: string) => {
    setInlineResult(result);
    setScanHistory((prev) => [
      { id: crypto.randomUUID(), timestamp: new Date(), response: result, qrCode },
      ...prev.slice(0, 49),
    ]);

    const seconds = Math.ceil(SCAN_DELAY_MS / 1000);
    setCountdown(seconds);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setInlineResult(null);
      setCountdown(0);
      setCurrentResult(result);
    }, SCAN_DELAY_MS - 200);

    setTimeout(() => {
      setCurrentResult((prev) => (prev === result ? null : prev));
    }, 15000);
  };

  const dismissResult = () => {
    setCurrentResult(null);
  };

  return (
    <div className="grid min-h-[calc(100dvh-9rem)] gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {marathon ? 'Marathon ticket validator' : 'Ticket validator'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Point the camera at a ticket QR code to validate it.
            </p>
          </div>
          <div className="flex gap-2">
            {marathon && (
              <>
                {(['COLLECTION', 'CHECKIN'] as const).map((value) => (
                  <Button
                    key={value}
                    variant={stage === value ? 'default' : 'outline'}
                    onClick={() => {
                      setStage(value);
                      stageRef.current = value;
                    }}
                  >
                    {value === 'COLLECTION' ? 'Bib collection' : 'Race check-in'}
                  </Button>
                ))}
              </>
            )}
            {availableCameras.length > 1 && isScanning && (
              <Button variant="outline" onClick={switchCamera}>
                <CameraRotateIcon /> Switch
              </Button>
            )}
            <Button
              variant={isScanning ? 'destructive' : 'default'}
              onClick={toggleScan}
              disabled={isInitializing}
            >
              {isInitializing ? (
                <Spinner />
              ) : isScanning ? (
                <VideoCameraSlashIcon />
              ) : (
                <VideoCameraIcon />
              )}
              {isInitializing ? 'Starting...' : isScanning ? 'Stop camera' : 'Start camera'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <WarningCircleIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative aspect-square min-h-[300px] w-full overflow-hidden rounded-xl border bg-black shadow-sm lg:aspect-auto lg:flex-1">
          {!isScanning && !isInitializing && (
            <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-1 text-white">
              <VideoCameraSlashIcon className="mb-2 size-10 opacity-60" />
              <p className="text-lg font-semibold">Camera is off</p>
              <p className="text-sm text-neutral-400">Click "Start camera" to begin scanning</p>
            </div>
          )}

          {isInitializing && (
            <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 text-white">
              <Spinner className="size-8" />
              <p>Initializing camera...</p>
            </div>
          )}

          <div id={SCANNER_ELEMENT_ID} style={{ width: '100%', height: '100%' }}></div>

          {/* Full-screen result during scan delay */}
          {inlineResult && (
            <div
              className={cn(
                'absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center text-white',
                inlineResult.success ? 'bg-emerald-600/95' : 'bg-red-600/95',
              )}
            >
              {inlineResult.success ? (
                <CheckCircleIcon className="size-20" weight="fill" />
              ) : (
                <XCircleIcon className="size-20" weight="fill" />
              )}
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {inlineResult.success ? 'SUCCESS' : 'FAILED'}
              </p>
              {inlineResult.ticket_data && (
                <>
                  <p className="mt-2 text-xl font-semibold">{inlineResult.ticket_data.name}</p>
                  <Badge
                    className={cn(
                      'mt-2 bg-white px-3 py-1 text-sm font-bold hover:bg-white',
                      inlineResult.success ? 'text-emerald-700' : 'text-red-700',
                    )}
                  >
                    Event: {inlineResult.ticket_data.proshow}
                  </Badge>
                </>
              )}
              {!inlineResult.success && <p className="mt-2 opacity-90">{inlineResult.message}</p>}
              {countdown > 0 && (
                <p className="mt-4 text-sm opacity-70">Next scan in {countdown}s</p>
              )}
            </div>
          )}
        </div>

        {/* Compact bottom result bar */}
        {currentResult && !inlineResult && (
          <button
            type="button"
            onClick={dismissResult}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl p-3 text-left text-white shadow-sm',
              currentResult.success ? 'bg-emerald-600' : 'bg-red-600',
            )}
          >
            {currentResult.success ? (
              <CheckCircleIcon className="size-8 shrink-0" weight="fill" />
            ) : (
              <XCircleIcon className="size-8 shrink-0" weight="fill" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{currentResult.success ? 'SUCCESS' : 'FAILED'}</span>
                {currentResult.ticket_data?.proshow && (
                  <Badge className="bg-white/25 text-white hover:bg-white/25">
                    Event: {currentResult.ticket_data.proshow}
                  </Badge>
                )}
              </div>
              {currentResult.ticket_data && (
                <p className="truncate text-sm opacity-90">
                  {currentResult.ticket_data.name} • {currentResult.ticket_data.email}
                </p>
              )}
              {!currentResult.success && (
                <p className="text-xs opacity-85">{currentResult.message}</p>
              )}
            </div>
            <span className="text-xs whitespace-nowrap opacity-60">tap to dismiss</span>
          </button>
        )}
      </div>

      <Card className="max-h-[70vh] min-h-0 gap-0 overflow-hidden py-0 lg:max-h-none">
        <div className="border-b bg-muted/50 px-4 py-2.5 text-sm font-semibold">
          History ({scanHistory.length})
        </div>
        <ScrollArea className="min-h-0 flex-1">
          {scanHistory.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Ready to scan tickets...
            </p>
          )}
          <ul className="divide-y">
            {scanHistory.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'space-y-1 px-4 py-2.5',
                  item.response.success ? 'bg-emerald-500/5' : 'bg-red-500/5',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tabular-nums">
                    {item.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  {item.response.success ? (
                    <CheckCircleIcon className="size-4 text-emerald-600" weight="fill" />
                  ) : (
                    <XCircleIcon className="size-4 text-red-600" weight="fill" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {item.response.ticket_data?.name || 'Unknown'}
                </p>
                <p className="hidden text-xs text-muted-foreground md:block">
                  {item.response.message}
                </p>
                {item.response.ticket_data?.proshow && (
                  <Badge variant="secondary" className="text-[0.65rem]">
                    Event: {item.response.ticket_data.proshow}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </Card>
    </div>
  );
}
