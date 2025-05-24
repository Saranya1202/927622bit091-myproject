import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Speed, Assessment } from '@mui/icons-material';

export default function AIStockSummary({ data }) {
  if (!data) return null;

  const {
    current,
    change,
    volume,
    high,
    low,
  } = data;

  const getVolumeTrend = (volume) => {
    // This would normally come from historical data
    return volume > 1000000 ? 'High' : volume > 500000 ? 'Moderate' : 'Low';
  };

  const getMarketStatus = (change) => {
    if (change > 5) return 'Bullish';
    if (change < -5) return 'Bearish';
    return 'Neutral';
  };

  const generateSummary = () => {
    const volumeTrend = getVolumeTrend(volume);
    const marketStatus = getMarketStatus(change);
    const direction = change >= 0 ? 'up' : 'down';
    
    return `${marketStatus} market sentiment with ${Math.abs(change).toFixed(1)}% ${direction} movement. 
    ${volumeTrend} trading volume indicates ${marketStatus.toLowerCase()} market activity.`;
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">AI Analysis</Typography>
        </Box>
        <Typography variant="body1" paragraph>
          {generateSummary()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={change >= 0 ? <TrendingUp /> : <TrendingDown />}
            label={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
            color={change >= 0 ? 'success' : 'error'}
            size="small"
          />
          <Chip
            icon={<Speed />}
            label={`Volume: ${getVolumeTrend(volume)}`}
            color="primary"
            size="small"
          />
          <Chip
            label={`Range: $${low.toFixed(2)} - $${high.toFixed(2)}`}
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
} 