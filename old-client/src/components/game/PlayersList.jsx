import { 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Typography,
  Divider 
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

export const PlayerList = ({ players }) => {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Players ({players.length})
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List>
        {players.map((player) => (
          <ListItem key={player.userId}>
            <ListItemIcon>
              <PersonIcon color={player.connected ? "primary" : "disabled"} />
            </ListItemIcon>
            <ListItemText 
              primary={player.name}
              secondary={player.team ? `Team: ${player.team}` : 'No team'}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};