import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { resetGame } from '../../redux/slices/gameSlice';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  Fade,
  Grow,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Refresh as RestartIcon,
  ExitToApp as ExitIcon,
  People as TeamIcon
} from '@mui/icons-material';

const WinnerScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const [showStats, setShowStats] = useState(false);

  const {
    winner,
    blueTeamScore,
    redTeamScore,
    currentRound
  } = useSelector(state => state.gameState);
  
  const players = useSelector(state => state.game.players);
  const user = JSON.parse(localStorage.getItem('user'));
  const isHost = players.find(p => p.userId === user?.id)?.isHost;

  useEffect(() => {
    // Show stats after winner announcement animation
    const timer = setTimeout(() => setShowStats(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayAgain = () => {
    if (socket && isHost) {
      socket.emit('restartGame', { roomCode });
    }
  };

  const handleExitGame = () => {
    if (socket) {
      socket.emit('leaveGame', { roomCode });
    }
    dispatch(resetGame());
    navigate('/lobby');
  };

  const getTeamPlayers = (team) => {
    return players.filter(player => player.team === team)
      .sort((a, b) => b.score - a.score);
  };

  const getPlayerStats = (player) => {
    return {
      correctAnswers: player.stats?.correctAnswers || 0,
      averageTime: player.stats?.averageTime || 0,
      totalScore: player.score || 0
    };
  };

  const TeamScoreSection = ({ team, score }) => (
    <Grow in timeout={1000}>
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          bgcolor: team === 'blue' ? 'primary.light' : 'error.light',
          color: 'white',
          height: '100%'
        }}
      >
        <Typography variant="h5" gutterBottom>
          {team.toUpperCase()} TEAM
        </Typography>
        <Typography variant="h3" gutterBottom>
          {score} pts
        </Typography>
        <Box sx={{ mt: 2 }}>
          {getTeamPlayers(team).map((player) => {
            const stats = getPlayerStats(player);
            return (
              <Box 
                key={player.userId} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1 
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'white', 
                    color: team === 'blue' ? 'primary.main' : 'error.main',
                    mr: 1 
                  }}
                >
                  {player.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {player.name}
                  </Typography>
                  <Typography variant="caption">
                    Score: {stats.totalScore}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Grow>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <TrophyIcon 
              sx={{ 
                fontSize: 80, 
                color: 'warning.main',
                animation: 'bounce 1s infinite'
              }} 
            />
            <Typography variant="h2" gutterBottom>
              {winner === 'tie' ? "It's a Tie!" : `${winner} Team Wins!`}
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <TeamScoreSection team="blue" score={blueTeamScore} />
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in={showStats} timeout={1000}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Game Stats
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Stat</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Rounds</TableCell>
                        <TableCell align="right">{currentRound}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Score Difference</TableCell>
                        <TableCell align="right">
                          {Math.abs(blueTeamScore - redTeamScore)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Players</TableCell>
                        <TableCell align="right">{players.length}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <TeamScoreSection team="red" score={redTeamScore} />
          </Grid>
        </Grid>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mt: 4 
          }}
        >
          {isHost && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RestartIcon />}
              onClick={handlePlayAgain}
            >
              Play Again
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<ExitIcon />}
            onClick={handleExitGame}
          >
            Exit Game
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default WinnerScreen;