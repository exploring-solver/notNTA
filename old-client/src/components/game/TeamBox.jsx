import { 
  Paper, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Box
} from '@mui/material';
import { 
  Person as PersonIcon,
  EmojiEvents as TrophyIcon 
} from '@mui/icons-material';
import { useContext } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useSelector } from 'react-redux';

export const TeamBox = ({ team, players, score }) => {
  const {socket} = useSocket();
  const currentUserId = useSelector(state => state.auth.userId);
  const hasJoined = players.some(p => p.userId === currentUserId);

  const handleJoinTeam = () => {
    socket.emit('joinTeam', { team });
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        bgcolor: team === 'blue' ? 'primary.light' : 'error.light',
        color: '#fff'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrophyIcon sx={{ mr: 1 }} />
        <Typography variant="h5">
          {team.toUpperCase()} Team
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Score: {score}
      </Typography>

      <List>
        {players.map(player => (
          <ListItem key={player.userId}>
            <ListItemIcon>
              <PersonIcon sx={{ color: player.connected ? '#fff' : 'rgba(255,255,255,0.5)' }} />
            </ListItemIcon>
            <ListItemText primary={player.name} />
          </ListItem>
        ))}
      </List>

      {!hasJoined && (
        <Button
          variant="contained"
          fullWidth
          onClick={handleJoinTeam}
          sx={{ 
            mt: 2,
            bgcolor: team === 'blue' ? 'primary.main' : 'error.main',
            '&:hover': {
              bgcolor: team === 'blue' ? 'primary.dark' : 'error.dark',
            }
          }}
        >
          Join Team
        </Button>
      )}
    </Paper>
  );
};