"use client"

import { useState } from "react"
import { Box, Button, Container, Typography, ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import RouletteWheel from "./components/RouletteWheel"

// テーマの配列（コードで指定）- 各テーマに固定の色を割り当て
const themeItems = [
  { id: 0, text: "スポーツ", color: "#4fc3f7" }, // 青
  { id: 1, text: "音楽", color: "#f06292" }, // ピンク
  { id: 2, text: "映画", color: "#4fc3f7" }, // 青
  { id: 3, text: "料理", color: "#f06292" }, // ピンク
  { id: 4, text: "旅行", color: "#4fc3f7" }, // 青
  { id: 5, text: "ゲーム", color: "#f06292" }, // ピンク
  { id: 6, text: "アート", color: "#4fc3f7" }, // 青
  { id: 7, text: "科学", color: "#f06292" }, // ピンク
  { id: 8, text: "歴史", color: "#4fc3f7" }, // 青
  { id: 9, text: "ファッション", color: "#f06292" }, // ピンク
]

// 止まりそうな要素のインデックス
const fakeStopIndex = 3 // 「料理」で一度止まる

// 実際に止まる要素のインデックス配列
const actualStopIndices = [1, 5, 7, 9] // 音楽、ゲーム、科学、ファッションのいずれかに最終的に止まる

// Create a custom theme with dark blue background
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4fc3f7", // bright blue
    },
    secondary: {
      main: "#f06292", // bright pink/red
    },
    background: {
      default: "#0a1929", // dark blue
      paper: "#0a1929",
    },
  },
})

function App() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<
    "initial" | "first-stop" | "vibration" | "final-move" | "highlight" | "stopped"
  >("stopped")
  const [actualStopIndex, setActualStopIndex] = useState<number | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const handleSpin = () => {
    if (isSpinning) return

    // 実際に止まる要素をランダムに選択
    const actualIndex = actualStopIndices[Math.floor(Math.random() * actualStopIndices.length)]
    setSelectedTheme(null)
    setActualStopIndex(actualIndex)
    setIsSpinning(true)
    setAnimationPhase("initial")
  }

  const handleFirstStop = () => {
    setAnimationPhase("first-stop")

    // 1秒後に振動アニメーションを開始
    setTimeout(() => {
      setAnimationPhase("vibration")
    }, 1000)
  }

  const handleVibrationComplete = () => {
    // 振動が終わったら最終移動へ
    setAnimationPhase("final-move")
  }

  const handleFinalStop = () => {
    if (actualStopIndex !== null) {
      setSelectedTheme(themeItems[actualStopIndex].text)
    }
    setAnimationPhase("highlight")

    // 強調表示のアニメーション後に完全停止
    setTimeout(() => {
      setAnimationPhase("stopped")
      setIsSpinning(false)
    }, 1500)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="md"
        sx={{ py: 4, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}
      >
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            color: "primary.main",
            fontWeight: "bold",
            mb: 4,
          }}
        >
          テーマルーレット
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <RouletteWheel
            items={themeItems}
            isSpinning={isSpinning}
            animationPhase={animationPhase}
            setAnimationPhase={setAnimationPhase}
            fakeStopIndex={fakeStopIndex}
            actualStopIndex={actualStopIndex}
            onFirstStop={handleFirstStop}
            onVibrationComplete={handleVibrationComplete}
            onFinalStop={handleFinalStop}
          />

          {selectedTheme && animationPhase === "stopped" && (
            <Typography
              variant="h4"
              sx={{
                mt: 3,
                mb: 3,
                color: "white",
                textAlign: "center",
              }}
            >
              選ばれたテーマ: <span style={{ fontWeight: "bold" }}>{selectedTheme}</span>
            </Typography>
          )}

          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleSpin}
            disabled={isSpinning}
            sx={{ mt: 4, px: 4, py: 1.5, fontSize: "1.2rem" }}
          >
            {isSpinning ? "回転中..." : "ルーレットを回す"}
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
