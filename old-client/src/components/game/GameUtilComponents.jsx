import { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Badge,
  Tooltip,
  Alert,
  AlertTitle,
  Fade,
  Paper
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Timer as TimerIcon,
  People as PeopleIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import {
  selectGameState,
  selectPlayers,
  selectTeams,
  selectGameStatus
} from '../../redux/slices/gameSlice';

// HostControls Component
const HostControls = ({ roomCode }) => {
  console.log('Rendering HostControls');
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const gameState = useSelector(selectGameState);
  const players = useSelector(selectPlayers);
  const [openSettings, setOpenSettings] = useState(false);

  const handleStartGame = () => {
    console.log('Attempting to start game for room:', roomCode);
    socket.emit('startGame', { roomCode });
  };

  const handleRestartGame = () => {
    console.log('Attempting to restart game for room:', roomCode);
    socket.emit('restartGame', { roomCode });
  };

  const handleSettingChange = (setting, value) => {
    console.log('Updating game settings:', { setting, value });
    socket.emit('updateGameSettings', {
      roomCode,
      newSettings: { [setting]: value }
    });
  };

  const canStartGame = () => {
    const blueTeamCount = players.filter(p => p.team === 'blue').length;
    const redTeamCount = players.filter(p => p.team === 'red').length;
    const canStart = blueTeamCount > 0 && redTeamCount > 0;
    console.log('Can start game check:', { blueTeamCount, redTeamCount, canStart });
    return canStart;
  };

  return (
    <Card sx={{ 
      position: 'fixed', 
      bottom: 24, 
      right: 24, 
      minWidth: 300,
      boxShadow: 3 
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrophyIcon sx={{ color: 'warning.main' }} />
          Host Controls
        </Typography>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!gameState.roundInProgress && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrowIcon />}
              disabled={!canStartGame()}
              onClick={handleStartGame}
              fullWidth
            >
              Start Game
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRestartGame}
            fullWidth
          >
            Restart Game
          </Button>

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSettings(true)}
            fullWidth
          >
            Game Settings
          </Button>
        </div>

        <Dialog open={openSettings} onClose={() => setOpenSettings(false)}>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Time per Question
              </Typography>
              <Select
                value={gameState.settings?.timePerQuestion || 60}
                onChange={(e) => handleSettingChange('timePerQuestion', e.target.value)}
              >
                <MenuItem value={60}>60 seconds</MenuItem>
                <MenuItem value={90}>90 seconds</MenuItem>
                <MenuItem value={120}>120 seconds</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Number of Rounds
              </Typography>
              <Select
                value={gameState.settings?.rounds || 5}
                onChange={(e) => handleSettingChange('rounds', e.target.value)}
              >
                <MenuItem value={3}>3 rounds</MenuItem>
                <MenuItem value={5}>5 rounds</MenuItem>
                <MenuItem value={7}>7 rounds</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSettings(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// WinnerDisplay Component
const WinnerDisplay = ({ winner, onPlayAgain }) => {
  console.log('Rendering WinnerDisplay with winner:', winner);
  const [open, setOpen] = useState(true);
  const teams = useSelector(selectTeams);

  useEffect(() => {
    console.log('Setting up WinnerDisplay timer');
    const timer = setTimeout(() => {
      console.log('Auto-closing WinnerDisplay');
      setOpen(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      TransitionComponent={Fade}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <TrophyIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom>
          {winner === 'tie' ? "It's a Tie!" : `${winner} Team Wins!`}
        </Typography>

        <Alert severity="info" sx={{ my: 3 }}>
          <AlertTitle>Final Scores</AlertTitle>
          <Typography variant="body1">
            Blue Team: {teams.blue.score} points
            <br />
            Red Team: {teams.red.score} points
          </Typography>
        </Alert>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          Congratulations to all players for a great game!
        </Typography>

        {onPlayAgain && (
          <Button
            variant="contained"
            color="primary"
            onClick={onPlayAgain}
            sx={{ mt: 2, mr: 1 }}
          >
            Play Again
          </Button>
        )}

        <Button
          variant="contained"
          onClick={() => setOpen(false)}
          sx={{ mt: 2 }}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// PlayerCount Component
const PlayerCount = ({ count, onClick }) => {
  console.log('Rendering PlayerCount with count:', count);
  return (
    <div>
      <Tooltip title="Click to see all players">
        <Paper 
          elevation={2}
          sx={{ 
            p: 1, 
            display: 'inline-flex', 
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' }
          }}
          onClick={onClick}
        >
          <Badge badgeContent={count} color="primary">
            <PeopleIcon color="primary" />
          </Badge>
          <TimerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </Paper>
      </Tooltip>

      {count === 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'absolute',
            top: '100%',
            mt: 1,
            width: 250
          }}
        >
          <AlertTitle>No Players Yet</AlertTitle>
          Waiting for players to join...
        </Alert>
      )}
    </div>
  );
};

// PlayerCard Component
const PlayerCard = ({ player, isCurrentUser }) => {
  console.log('Rendering PlayerCard:', { player, isCurrentUser });
  return (
    <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
      <div className="absolute top-2 right-2">
        <div className={`h-3 w-3 rounded-full ${player.connected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-white font-medium">
            {player.name[0]}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 flex items-center">
          {player.name}
          {player.isHost && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Host
            </span>
          )}
          {isCurrentUser && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              You
            </span>
          )}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {player.team ? `Team ${player.team}` : 'No team'}
        </p>
      </div>
    </div>
  );
};

export { HostControls, WinnerDisplay, PlayerCount, PlayerCard };