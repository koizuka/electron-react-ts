import { Box, Button, List, ListItem } from '@material-ui/core';
import React, { useCallback, useState } from 'react';

const { myAPI } = window;

export function App(): JSX.Element {
  const [filelist, setFilelist] = useState<string[]>([]);

  const onClick = useCallback(async () => {
    const getPath = await myAPI.openDialog();

    if (getPath) setFilelist(getPath);
  }, []);

  return (
    <Box>
      <h1>Hello world.</h1>
      <Button onClick={onClick} variant="contained" color="primary">
        Open
      </Button>
      <List>
        {filelist.map((item) => (
          <ListItem key={item}>
            {item}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
