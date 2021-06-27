import React, {useState} from 'react';
import axios from "axios";
import {makeStyles} from '@material-ui/core/styles'
import {
    IconButton, List, ListItem,
    ListItemSecondaryAction, ListItemText,
    Paper, Popover,
    TextField,
    Typography, useMediaQuery
} from '@material-ui/core'
import HourglassFullTwoToneIcon from '@material-ui/icons/HourglassFullTwoTone';
import ContactSupportTwoToneIcon from '@material-ui/icons/ContactSupportTwoTone';
import header from './img/header.png';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    results: {
        width: '100%',
        maxWidth: '500px',
        minHeight: '150px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing(2)
    },
    title: {
        alignSelf: 'center',
    },
    loading: {
        position: 'absolute',
        left: '50%',
    },
    header:{
        width: '100%',
    }

}))


const App = () => {
    const classes = useStyles()
    const renderImage = useMediaQuery('(min-width:800px)');

    const [loading, setLoading] = useState(false)
    const [matches, setMatches] = useState([])
    const [definition, setDefinition] = useState({})

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = async (event, word) => {
        setAnchorEl(event.currentTarget);
        const def = await getDefinition(word)
        setDefinition({...definition, [word]: def})
    };

    const handleClose = () => {
        setDefinition({})
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const findMatches = (e) => {
        setLoading(true)
        const body = JSON.stringify({word: e.target.value});

        try {
            axios.post('/api/match', body, config).then((res) => {
                setLoading(false);
                if (res.data.count) {
                    setMatches(res.data.matches)
                }
            });
        } catch (e) {
            console.log(e)
        }
    }

    const getDefinition = async (word) => {

        try {
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`, config);
            return res.data[0].meanings[0].definitions[0].definition
        } catch (e) {
            console.log(e)
            return 'no definition found'
        }
    }
    return (
        <div className={classes.root}>
            {renderImage && <img src={header} alt="Header" className={classes.header}/>}
            <Typography variant="h6" className={classes.title}>
                Type in a word in the search box..
            </Typography>
            <TextField id="outlined-search" label="Scrabble me!" type="search" variant="outlined"
                       onChange={findMatches}/>
            <Paper className={classes.results} elevation={3}>
                {loading && <HourglassFullTwoToneIcon className={classes.loading}/>}
                {matches && matches.length > 0 && <List>
                    {matches.map((match, i) => {
                            return (<ListItem key={i}>
                                <ListItemText
                                    primary={match.word}
                                    secondary={match.score}
                                />
                                <ListItemSecondaryAction>
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-describedby={id} aria-label="delete"
                                                    onClick={(e) => handleClick(e, match.word)}>
                                            <ContactSupportTwoToneIcon/>
                                        </IconButton>
                                        {definition[match.word] && <Popover
                                            id={id}
                                            open={open}
                                            anchorEl={anchorEl}
                                            onClose={handleClose}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'center',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'center',
                                            }}
                                        >
                                            <Typography className={classes.typography}>{definition[match.word]}</Typography>
                                        </Popover>}

                                    </ListItemSecondaryAction>
                                </ListItemSecondaryAction>
                            </ListItem>)
                        }
                    )}
                </List>}
            </Paper>
        </div>
    );
};

export default App;
