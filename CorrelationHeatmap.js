import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Paper, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Plot from 'react-plotly.js';
import { stockService } from '../services/stockService';

// Default stock symbols to analyze
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];

export default function CorrelationHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1M'); // Default to 1 month

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date range based on selected time range
        const endDate = new Date();
        const startDate = new Date();
        switch (timeRange) {
          case '1M':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case '3M':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case '6M':
            startDate.setMonth(startDate.getMonth() - 6);
            break;
          case '1Y':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            startDate.setMonth(startDate.getMonth() - 1);
        }

        const correlationMatrix = await stockService.getCorrelationMatrix(
          DEFAULT_SYMBOLS,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        setData(correlationMatrix);
      } catch (err) {
        setError(err.message || 'Failed to load correlation data. Please try again later.');
        console.error('Error fetching correlation data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading correlation data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        p={2}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        p={2}
      >
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body1">
            There is no correlation data available at the moment.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Prepare data for Plotly heatmap
  const z = data.map(row => row.correlations);
  const x = data.map(row => row.symbol);
  const y = data.map(row => row.symbol);

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      mx: 'auto', 
      mt: 4,
      p: { xs: 1, sm: 2, md: 3 }
    }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h5">
            Stock Correlation Heatmap
          </Typography>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              size="small"
            >
              <MenuItem value="1M">1 Month</MenuItem>
              <MenuItem value="3M">3 Months</MenuItem>
              <MenuItem value="6M">6 Months</MenuItem>
              <MenuItem value="1Y">1 Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ 
          height: { xs: '400px', sm: '500px', md: '600px' },
          width: '100%',
          mt: 2
        }}>
          <Plot
            data={[
              {
                z,
                x,
                y,
                type: 'heatmap',
                colorscale: [
                  [0, '#ff0000'],    // Red for negative correlation
                  [0.5, '#ffffff'],  // White for no correlation
                  [1, '#0000ff']     // Blue for positive correlation
                ],
                zmin: -1,
                zmax: 1,
                showscale: true,
                colorbar: {
                  title: 'Correlation',
                  titleside: 'right',
                  ticksuffix: '',
                  thickness: 15,
                  len: 0.5,
                  y: 0.5
                }
              }
            ]}
            layout={{
              title: 'Stock Price Correlations',
              xaxis: {
                title: 'Stock Symbol',
                tickangle: 45
              },
              yaxis: {
                title: 'Stock Symbol',
                autorange: 'reversed'
              },
              margin: {
                l: 100,
                r: 50,
                b: 100,
                t: 50,
                pad: 4
              },
              height: 600,
              width: 800,
              autosize: true
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false
            }}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </Box>

        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Typography variant="caption" color="text.secondary">
            Correlation Scale: -1 (Negative) to +1 (Positive)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last Updated: {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 