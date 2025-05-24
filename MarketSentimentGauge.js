import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const getSentimentColor = (value) => {
  if (value >= 70) return '#4caf50'; // Positive
  if (value >= 40) return '#ff9800'; // Neutral
  return '#f44336'; // Negative
};

const getSentimentIcon = (value) => {
  if (value >= 70) return <SentimentSatisfiedAltIcon sx={{ fontSize: 40, color: '#4caf50' }} />;
  if (value >= 40) return <SentimentNeutralIcon sx={{ fontSize: 40, color: '#ff9800' }} />;
  return <SentimentDissatisfiedIcon sx={{ fontSize: 40, color: '#f44336' }} />;
};

const getSentimentLabel = (value) => {
  if (value >= 70) return 'Positive';
  if (value >= 40) return 'Neutral';
  return 'Negative';
};

export default function MarketSentimentGauge({ value = 65 }) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={120}
          thickness={4}
          sx={{ color: 'grey.200' }}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          size={120}
          thickness={4}
          sx={{
            position: 'absolute',
            left: 0,
            color: getSentimentColor(value),
            '& .MuiCircularProgress-circle': {
              transition: 'stroke-dashoffset 0.5s ease 0s',
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {getSentimentIcon(value)}
        </Box>
      </Box>
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          color: getSentimentColor(value),
          fontWeight: 'bold',
        }}
      >
        {getSentimentLabel(value)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Market Sentiment
      </Typography>
    </Box>
  );
} 