import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  Grid,
  Paper,
  Divider,
  Skeleton,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  ShowChart,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import MarketSentimentGauge from '../components/MarketSentimentGauge';
import AIStockSummary from '../components/AIStockSummary';

const TIME_RANGES = [
  { label: '1 Day', value: '1d' },
  { label: '1 Week', value: '1w' },
  { label: '1 Month', value: '1m' },
  { label: '1 Year', value: '1y' },
];

// Calculate moving average
const calculateMovingAverage = (data, windowSize = 5) => {
  return data.map((point, index) => {
    if (index < windowSize - 1) return point;
    const sum = data
      .slice(index - windowSize + 1, index + 1)
      .reduce((acc, curr) => acc + curr.price, 0);
    return {
      ...point,
      movingAverage: sum / windowSize
    };
  });
};

const calculateStats = (data) => {
  if (!data.length) return null;
  const prices = data.map(d => d.price);
  return {
    current: prices[prices.length - 1],
    change: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
    high: Math.max(...prices),
    low: Math.min(...prices),
    volume: data.reduce((sum, d) => sum + (d.volume || 0), 0),
  };
};

export default function StockPage() {
  const theme = useTheme();
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [range, setRange] = useState('1m');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showMA, setShowMA] = useState(true);
  const [sentiment, setSentiment] = useState(65); // Mock sentiment value

  const fetchData = async () => {
    if (!selectedSymbol) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/stock/${selectedSymbol}?range=${range}`);
      const dataWithMA = calculateMovingAverage(res.data);
      setData(dataWithMA);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:3000/stocks')
      .then(res => setSymbols(res.data))
      .catch(() => setSymbols([]));
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedSymbol, range]);

  const stats = calculateStats(data);

  const chartColors = {
    price: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
    ma: theme.palette.mode === 'dark' ? '#ffb74d' : '#ff9800',
    grid: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Stock Selection and Time Range */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Stock Symbol</InputLabel>
                    <Select
                      value={selectedSymbol}
                      label="Stock Symbol"
                      onChange={e => setSelectedSymbol(e.target.value)}
                      startAdornment={<TrendingUp sx={{ mr: 1, color: 'primary.main' }} />}
                    >
                      {symbols.map(symbol => (
                        <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ToggleButtonGroup
                    color="primary"
                    value={range}
                    exclusive
                    onChange={(_, val) => val && setRange(val)}
                    fullWidth
                  >
                    {TIME_RANGES.map(r => (
                      <ToggleButton key={r.value} value={r.value}>{r.label}</ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Sentiment and AI Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <MarketSentimentGauge value={sentiment} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <AIStockSummary data={stats} />
        </Grid>

        {/* Stats Cards */}
        {stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Price
                  </Typography>
                  <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                    ${stats.current.toFixed(2)}
                  </Typography>
                  <Chip
                    icon={stats.change >= 0 ? <ArrowUpward /> : <ArrowDownward />}
                    label={`${Math.abs(stats.change).toFixed(2)}%`}
                    color={stats.change >= 0 ? 'success' : 'error'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Daily High
                  </Typography>
                  <Typography variant="h5" component="div">
                    ${stats.high.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Daily Low
                  </Typography>
                  <Typography variant="h5" component="div">
                    ${stats.low.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Volume
                  </Typography>
                  <Typography variant="h5" component="div">
                    {stats.volume.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Chart */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader
              title="Price Chart"
              subheader={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Toggle Moving Average">
                    <IconButton onClick={() => setShowMA(!showMA)}>
                      <ShowChart color={showMA ? 'primary' : 'action'} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh Data">
                    <IconButton onClick={fetchData} disabled={loading}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 400, position: 'relative' }}>
                {loading ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : data.length === 0 ? (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: 'text.secondary',
                    }}
                  >
                    <ShowChart sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6">No data available</Typography>
                    <Typography variant="body2">Select a stock to view its price chart</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
                      <YAxis domain={['auto', 'auto']} stroke={theme.palette.text.secondary} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={chartColors.price}
                        dot={false}
                        name="Price"
                        strokeWidth={2}
                      />
                      {showMA && (
                        <Line
                          type="monotone"
                          dataKey="movingAverage"
                          stroke={chartColors.ma}
                          dot={false}
                          name="Moving Average"
                          strokeWidth={2}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 