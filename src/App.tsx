import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import RouletteWheel, { AnimationPhase, ThemeItem } from "./components/RouletteWheel";

const themeItems: ThemeItem[] = [
  { id: 0, text: "スポーツ", color: "#4fc3f7" },
  { id: 1, text: "音楽", color: "#f06292" },
  { id: 2, text: "映画", color: "#4fc3f7" },
  { id: 3, text: "料理", color: "#f06292" },
  { id: 4, text: "旅行", color: "#4fc3f7" },
  { id: 5, text: "ゲーム", color: "#f06292" },
  { id: 6, text: "アート", color: "#4fc3f7" },
  { id: 7, text: "科学", color: "#f06292" },
  { id: 8, text: "歴史", color: "#4fc3f7" },
  { id: 9, text: "ファッション", color: "#f06292" },
];

const fakeStopIndex = 3;
const actualStopIndices = [1, 5, 7, 9];

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#4fc3f7" },
    secondary: { main: "#f06292" },
    background: { default: "#0a1929", paper: "#0a1929" },
  },
});

const App: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [animationPhase, setAnimationPhase] =
    useState<AnimationPhase>("stopped");
  const [actualStopIndex, setActualStopIndex] =
    useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    const idx =
      actualStopIndices[
        Math.floor(Math.random() * actualStopIndices.length)
      ];
    setActualStopIndex(idx);
    setSelectedTheme(null);
    setIsSpinning(true);
    setAnimationPhase("first-stop");
  };

  useEffect(() => {
    if (animationPhase === "pause") {
      // fakeStopIndex 停止後、1秒間静止させてから second-stop へ
      const t = setTimeout(
        () => setAnimationPhase("second-stop"),
        1000
      );
      return () => clearTimeout(t);
    }
    if (animationPhase === "highlight") {
      const t = setTimeout(() => {
        setAnimationPhase("stopped");
        setIsSpinning(false);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [animationPhase]);

  const handleFirstStop = () => setAnimationPhase("pause");
  const handleFinalStop = () => {
    if (actualStopIndex != null)
      setSelectedTheme(themeItems[actualStopIndex].text);
    setAnimationPhase("highlight");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        sx={{
          py: 4,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h2"
          align="center"
          sx={{
            color: "primary.main",
            fontWeight: "bold",
            mb: 4,
          }}
        >
          テーマルーレット
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <RouletteWheel
            items={themeItems}
            isSpinning={isSpinning}
            animationPhase={animationPhase}
            fakeStopIndex={fakeStopIndex}
            actualStopIndex={actualStopIndex}
            onFirstStop={handleFirstStop}
            onFinalStop={handleFinalStop}
          />
          {selectedTheme && animationPhase === "stopped" && (
            <Typography
              variant="h4"
              sx={{ mt: 3, animation: "fadeIn 0.5s" }}
            >
              選ばれたテーマ: <strong>{selectedTheme}</strong>
            </Typography>
          )}
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleSpin}
            disabled={isSpinning}
            sx={{ mt: 4 }}
          >
            {isSpinning ? "回転中..." : "ルーレットを回す"}
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
