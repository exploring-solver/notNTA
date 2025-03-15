import { 
    Typography, 
    Button, 
    Box, 
    LinearProgress,
    Stack 
  } from '@mui/material';
  
  export const GameStatus = ({ currentRound, timeRemaining, question }) => {
    const timePercentage = (timeRemaining / 120) * 100; // Assuming 120s is max time
  
    return (
      <Stack spacing={3}>
        <Typography variant="h4" gutterBottom>
          Round {currentRound}
        </Typography>
  
        {timeRemaining > 0 && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={timePercentage}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {timeRemaining}s remaining
            </Typography>
          </Box>
        )}
  
        {question && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {question.text}
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => handleAnswer(option)}
                  sx={{ justifyContent: 'flex-start', px: 3 }}
                >
                  {option}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    );
  };