import React, { useState, useRef } from 'react';
import { Button, Container, Grid } from '@mui/material';
import axios from 'axios';

const App = () => {
  const [imageData, setImageData] = useState(null);
  const canvasRef = useRef(null);
  const [actions, setActions] = useState([]);
  const [currentAction, setCurrentAction] = useState([]);

  const startDraw = (event) => {
    setCurrentAction([]);
    const { offsetX, offsetY } = event.nativeEvent;
    setCurrentAction([{ x: offsetX, y: offsetY }]);
  };

  const draw = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    if (currentAction.length > 0) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(currentAction[currentAction.length - 1].x, currentAction[currentAction.length - 1].y);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      setCurrentAction([...currentAction, { x: offsetX, y: offsetY }]);
    }
  };

  const endDraw = () => {
    setActions([...actions, currentAction]);
    setCurrentAction([]);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setActions([]);
  };

  const undo = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newActions = actions.slice(0, -1);
    setActions(newActions);
    newActions.forEach(action => {
      ctx.beginPath();
      ctx.moveTo(action[0].x, action[0].y);
      action.forEach(point => {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      });
    });
  };

  const calculate = async () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/calculate', { image: dataUrl });
      const answer = response.data.answer;
  
      const ctx = canvas.getContext('2d');
      ctx.font = '50px Noteworthy';
      ctx.fillStyle = '#FF9500';
      ctx.fillText(answer, canvas.width - 200, canvas.height - 50);
    } catch (error) {
      console.error('Error calculating:', error);
    }
  };
  

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            style={{ border: '1px solid black', backgroundColor: 'black' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={clearCanvas}>清空屏幕</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="secondary" onClick={undo}>撤销</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="success" onClick={calculate}>计算结果</Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
