import { useContext, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import { ApiContext } from 'Contexts/Api/ApiContext';
import { getErrMsg } from 'Hooks/errorParser';
import './TicketValidator.css';

interface ITicketData {
  name: string;
  email: string;
  proshow: string;
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

export default function TicketValidator() {
  const { axiosTicketsPrivate } = useContext(ApiContext);
  const [scanHistory, setScanHistory] = useState<IScanHistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<IScanResponse | null>(null);
  const [inlineResult, setInlineResult] = useState<IScanResponse | null>(null); // Full-screen during scan delay
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
        scannerRef.current = new Html5Qrcode(SCANNER_ELEMENT_ID);
      }

      const camIndex = cameraIndex !== undefined ? cameraIndex : currentCameraIndex;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 30,
        qrbox: function (viewfinderWidth, viewfinderHeight) {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.7);
          return {
            width: qrboxSize,
            height: qrboxSize,
          };
        },
        aspectRatio: 1.0,
        disableFlip: false,
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

  async function onScanSuccess(decodedText: string) {
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
      const response = await axiosTicketsPrivate.post<IScanResponse>('/validate', {
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
    <Box
      sx={{
        p: 1,
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Grid
        container
        spacing={1}
        sx={{
          flexGrow: 1,
          minHeight: 0,
          flexWrap: 'nowrap',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Grid
          item
          xs
          md={8}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: '55vh', md: 0 },
            gap: 0.5,
            flex: { xs: '1 1 auto', md: 1 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="h6">Ticket Validator</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {availableCameras.length > 1 && isScanning && (
                <Button
                  variant="outlined"
                  onClick={switchCamera}
                  startIcon={<CameraswitchIcon />}
                  size="small"
                >
                  Switch
                </Button>
              )}
              <Button
                variant={isScanning ? 'outlined' : 'contained'}
                color={isScanning ? 'error' : 'primary'}
                onClick={toggleScan}
                disabled={isInitializing}
                size="small"
              >
                {isInitializing ? 'Starting...' : isScanning ? 'Stop Camera' : 'Start Camera'}
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Paper
            elevation={3}
            sx={{
              bgcolor: '#000',
              borderRadius: 1,
              overflow: 'hidden',
              position: 'relative',
              width: { xs: '100%', md: 'auto' },
              aspectRatio: { xs: '1 / 1', md: 'auto' },
              flexGrow: { xs: 0, md: 1 },
              minHeight: { xs: 'auto', md: '300px' },
            }}
          >
            {!isScanning && !isInitializing && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  zIndex: 1,
                  gap: 2,
                }}
              >
                <Typography variant="h6">Camera is off</Typography>
                <Typography variant="body2" color="grey.400">
                  Click "Start Camera" to begin scanning
                </Typography>
              </Box>
            )}

            {isInitializing && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  zIndex: 1,
                  gap: 2,
                }}
              >
                <CircularProgress sx={{ color: 'white' }} />
                <Typography>Initializing camera...</Typography>
              </Box>
            )}

            <div id={SCANNER_ELEMENT_ID} style={{ width: '100%', height: '100%' }}></div>

            {/* Full-screen result during scan delay */}
            {inlineResult && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: inlineResult.success
                    ? 'rgba(46, 125, 50, 0.95)'
                    : 'rgba(211, 47, 47, 0.95)',
                  color: 'white',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                {inlineResult.success ? (
                  <CheckCircleIcon sx={{ fontSize: 80 }} />
                ) : (
                  <ErrorIcon sx={{ fontSize: 80 }} />
                )}
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {inlineResult.success ? 'SUCCESS' : 'FAILED'}
                </Typography>
                {inlineResult.ticket_data && (
                  <>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {inlineResult.ticket_data.name}
                    </Typography>
                    <Chip
                      label={inlineResult.ticket_data.proshow}
                      sx={{
                        mt: 1,
                        bgcolor: 'white',
                        color: inlineResult.success ? '#2e7d32' : '#d32f2f',
                        fontWeight: 'bold',
                      }}
                    />
                  </>
                )}
                {!inlineResult.success && (
                  <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                    {inlineResult.message}
                  </Typography>
                )}
                {countdown > 0 && (
                  <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>
                    Next scan in {countdown}s
                  </Typography>
                )}
              </Box>
            )}
          </Paper>

          {/* Compact bottom result bar */}
          {currentResult && !inlineResult && (
            <Paper
              elevation={2}
              onClick={dismissResult}
              sx={{
                p: 1.5,
                bgcolor: currentResult.success ? 'success.main' : 'error.main',
                color: 'white',
                borderRadius: 1,
                cursor: 'pointer',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {currentResult.success ? (
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                ) : (
                  <ErrorIcon sx={{ fontSize: 32 }} />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" fontWeight="bold" noWrap>
                      {currentResult.success ? 'SUCCESS' : 'FAILED'}
                    </Typography>
                    {currentResult.ticket_data?.proshow && (
                      <Chip
                        label={currentResult.ticket_data.proshow}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.25)',
                          color: 'white',
                          fontWeight: 'bold',
                          height: 22,
                        }}
                      />
                    )}
                  </Box>
                  {currentResult.ticket_data && (
                    <Typography variant="body2" noWrap sx={{ opacity: 0.9 }}>
                      {currentResult.ticket_data.name} • {currentResult.ticket_data.email}
                    </Typography>
                  )}
                  {!currentResult.success && (
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {currentResult.message}
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.6, whiteSpace: 'nowrap' }}>
                  tap ✕
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid
          item
          xs
          md={4}
          sx={{
            minHeight: 0,
            flex: { xs: '0 0 auto', md: 1 },
            maxHeight: { xs: '35%', md: '100%' },
          }}
        >
          <Paper
            elevation={2}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <Box
              sx={{ px: 1, py: 0.5, bgcolor: 'grey.200', borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography variant="caption" fontWeight="bold">
                History ({scanHistory.length})
              </Typography>
            </Box>
            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
              {scanHistory.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="Ready to scan tickets..."
                    sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}
                  />
                </ListItem>
              )}
              {scanHistory.map((item, index) => (
                <div key={item.id}>
                  <ListItem
                    dense
                    sx={{
                      bgcolor: item.response.success
                        ? 'rgba(76, 175, 80, 0.08)'
                        : 'rgba(244, 67, 54, 0.08)',
                      py: 0.5,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="caption" fontWeight="medium">
                            {item.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </Typography>
                          {item.response.success ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <ErrorIcon color="error" fontSize="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.primary" fontWeight="medium">
                            {item.response.ticket_data?.name || 'Unknown'}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: { xs: 'none', md: 'block' } }}
                          >
                            {item.response.message}
                          </Typography>
                          {item.response.ticket_data?.proshow && (
                            <Chip
                              label={item.response.ticket_data.proshow}
                              size="small"
                              sx={{ height: 16, fontSize: '0.6rem' }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < scanHistory.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
