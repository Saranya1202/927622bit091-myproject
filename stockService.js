import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Calculate Pearson correlation coefficient between two arrays
 * @param {number[]} x - First array of numbers
 * @param {number[]} y - Second array of numbers
 * @returns {number} Correlation coefficient
 */
const calculatePearsonCorrelation = (x, y) => {
  const n = x.length;
  if (n !== y.length) return 0;

  let sum_x = 0;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_x2 = 0;
  let sum_y2 = 0;

  for (let i = 0; i < n; i++) {
    sum_x += x[i];
    sum_y += y[i];
    sum_xy += x[i] * y[i];
    sum_x2 += x[i] * x[i];
    sum_y2 += y[i] * y[i];
  }

  const numerator = n * sum_xy - sum_x * sum_y;
  const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Calculate correlation matrix for multiple stocks
 * @param {Object} stockData - Object containing stock prices by symbol
 * @returns {Array} Correlation matrix data
 */
const calculateCorrelationMatrix = (stockData) => {
  const symbols = Object.keys(stockData);
  const matrix = [];

  for (let i = 0; i < symbols.length; i++) {
    const row = {
      symbol: symbols[i],
      correlations: []
    };

    for (let j = 0; j < symbols.length; j++) {
      const correlation = calculatePearsonCorrelation(
        stockData[symbols[i]],
        stockData[symbols[j]]
      );
      row.correlations.push(correlation);
    }

    matrix.push(row);
  }

  return matrix;
};

export const stockService = {
  /**
   * Fetch stock data and calculate correlations
   * @param {string[]} symbols - Array of stock symbols
   * @param {string} startDate - Start date for historical data
   * @param {string} endDate - End date for historical data
   * @returns {Promise<Array>} Correlation matrix data
   */
  async getCorrelationMatrix(symbols, startDate, endDate) {
    try {
      // Fetch historical data for each symbol
      const stockData = {};
      
      for (const symbol of symbols) {
        const response = await axios.get(`${API_BASE_URL}/stocks/${symbol}/history`, {
          params: { startDate, endDate }
        });
        stockData[symbol] = response.data.prices;
      }

      // Calculate correlation matrix
      return calculateCorrelationMatrix(stockData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw new Error('Failed to fetch stock data. Please try again later.');
    }
  }
}; 