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
  { id: 0, text: "ずうっといっしょ！、かわいい", color: "#f06292" },
  { id: 1, text: "人とAIの調和と創造", color: "#4fc3f7" },
  { id: 2, text: "コヨーテAI開発", color: "#f06292" },
  { id: 3, text: "AIのある暮らし", color: "#4fc3f7" },
  { id: 4, text: "大阪", color: "#f06292" },
  { id: 5, text: "オリジナルキャラクター", color: "#4fc3f7" },
  { id: 6, text: "ミャクミャク(脈々)と受け継がれるサービス", color: "#f06292" },
  { id: 7, text: "無知でも良いじゃん！", color: "#4fc3f7" },
  { id: 8, text: "シンギュラリティ", color: "#f06292" },
  { id: 9, text: "関税", color: "#4fc3f7" },
  { id: 10, text: "NOTAICODING", color: "#f06292" },
  { id: 11, text: "車内", color: "#4fc3f7" },
  { id: 12, text: "試験", color: "#f06292" },
  { id: 13, text: "高すぎる！", color: "#4fc3f7" },
  { id: 14, text: "のりもの", color: "#f06292" },
  { id: 15, text: "おかし", color: "#4fc3f7" },
  { id: 16, text: "嘘", color: "#f06292" },
  { id: 17, text: "透明", color: "#4fc3f7" },
  { id: 18, text: "キャンセル", color: "#f06292" },
  { id: 19, text: "夜", color: "#4fc3f7" },
  { id: 20, text: "誘惑", color: "#f06292" },
  { id: 21, text: "みかん", color: "#4fc3f7" },
  { id: 22, text: "甘い", color: "#f06292" },
  { id: 23, text: "ハッピー", color: "#4fc3f7" },
  { id: 24, text: "ラッキー", color: "#f06292" },
  { id: 25, text: "キュン", color: "#4fc3f7" },
  { id: 26, text: "無限", color: "#f06292" },
  { id: 27, text: "もう こないからねー", color: "#4fc3f7" },
  { id: 28, text: "安心安全", color: "#f06292" },
  { id: 29, text: "かわいい", color: "#4fc3f7" },
  { id: 30, text: "役立つもの", color: "#f06292" },
  { id: 31, text: "えっほえっほ", color: "#4fc3f7" },
  { id: 32, text: "伝えなきゃ", color: "#f06292" },
  { id: 33, text: "最強", color: "#4fc3f7" },
  { id: 34, text: "伝えなきゃ、ラブロマンス", color: "#f06292" },
  { id: 35, text: "楽しい日本", color: "#4fc3f7"},
];

const fakeStopIndex = 2;
const actualStopIndices = [4, 12, 14, 16, 17, 18, 19, 22, 25];

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
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("stopped");
  const [actualStopIndex, setActualStopIndex] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    const idx = actualStopIndices[Math.floor(Math.random() * actualStopIndices.length)];
    setActualStopIndex(idx);
    setSelectedTheme(null);
    setIsSpinning(true);
    setAnimationPhase("first-stop");
  };

  useEffect(() => {
    if (animationPhase === "pause") {
      const timer = setTimeout(() => setAnimationPhase("second-stop"), 3000);
      return () => clearTimeout(timer);
    }
    if (animationPhase === "highlight") {
      const timer = setTimeout(() => {
        setAnimationPhase("stopped");
        setIsSpinning(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [animationPhase]);

  const handleFirstStop = () => setAnimationPhase("pause");
  const handleFinalStop = () => {
    if (actualStopIndex != null) setSelectedTheme(themeItems[actualStopIndex].text);
    setAnimationPhase("highlight");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ py: 4, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography variant="h2" align="center" sx={{ color: "primary.main", fontWeight: "bold", mb: 4 }}>
          テーマルーレット
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <RouletteWheel
            items={themeItems}
            animationPhase={animationPhase}
            fakeStopIndex={fakeStopIndex}
            actualStopIndex={actualStopIndex}
            onFirstStop={handleFirstStop}
            onFinalStop={handleFinalStop}
          />

          {/* 最初の回転前のみ表示されるボタン */}
          {!isSpinning && !selectedTheme && (
            <Button variant="contained" color="secondary" size="large" onClick={handleSpin} sx={{ mt: 4 }}>
              ルーレットを回す
            </Button>
          )}

          {/* 選ばれたテーマは常に表示 */}
          {selectedTheme && (
            <Typography variant="h4" sx={{ mt: 3 }}>
              選ばれたテーマ: <strong>{selectedTheme}</strong>
            </Typography>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;