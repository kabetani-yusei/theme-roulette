"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Box, Typography } from "@mui/material"

interface ThemeItem {
  id: number
  text: string
  color: string
}

interface RouletteWheelProps {
  items: ThemeItem[]
  isSpinning: boolean
  animationPhase: "initial" | "first-stop" | "vibration" | "final-move" | "highlight" | "stopped"
  setAnimationPhase: React.Dispatch<
    React.SetStateAction<"initial" | "first-stop" | "vibration" | "final-move" | "highlight" | "stopped">
  >
  fakeStopIndex: number
  actualStopIndex: number | null
  onFirstStop: () => void
  onVibrationComplete: () => void
  onFinalStop: () => void
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({
  items,
  isSpinning,
  animationPhase,
  setAnimationPhase,
  fakeStopIndex,
  actualStopIndex,
  onFirstStop,
  onVibrationComplete,
  onFinalStop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [highlightProgress, setHighlightProgress] = useState(0)
  const [vibrationOffset, setVibrationOffset] = useState(0)
  const requestRef = useRef<number | undefined>(undefined)
  const previousTimeRef = useRef<number | undefined>(undefined)
  const vibrationStartTimeRef = useRef<number | undefined>(undefined)
  const finalMoveStartTimeRef = useRef<number | undefined>(undefined)
  const finalMoveCompleteRef = useRef<boolean>(false)

  const itemHeight = 70 // Height of each item in pixels
  const visibleCount = 5 // Number of visible items
  const containerHeight = itemHeight * visibleCount

  // Reset state when spinning starts
  useEffect(() => {
    if (isSpinning && animationPhase === "initial") {
      setHighlightProgress(0)
      setSpeed(0)
      setVibrationOffset(0)
      vibrationStartTimeRef.current = undefined
      finalMoveStartTimeRef.current = undefined
      finalMoveCompleteRef.current = false
    }
  }, [isSpinning, animationPhase])

  // Animation loop
  const animate = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time
    }

    const deltaTime = time - previousTimeRef.current
    previousTimeRef.current = time

    // Different behavior based on animation phase
    if (animationPhase === "initial") {
      // 初期の高速回転
      setSpeed((prev) => Math.min(prev + deltaTime * 0.05, 15))
      setPosition((prev) => (prev + speed) % (items.length * itemHeight))

      // 2秒後に減速開始
      if (speed >= 15) {
        setTimeout(() => {
          startSlowingDown()
        }, 2000)
      }
    } else if (animationPhase === "first-stop") {
      // 最初の停止位置に向けて減速
      setSpeed((prev) => {
        const newSpeed = prev - deltaTime * 0.01
        if (newSpeed <= 0) {
          return 0
        }
        return newSpeed
      })

      setPosition((prev) => (prev + speed) % (items.length * itemHeight))

      // 完全に停止したら指定位置に調整
      if (speed === 0) {
        const targetPosition = calculatePositionForIndex(fakeStopIndex)
        setPosition(targetPosition)
        onFirstStop()
        return
      }
    } else if (animationPhase === "vibration") {
      // 振動アニメーション
      if (vibrationStartTimeRef.current === undefined) {
        vibrationStartTimeRef.current = time
      }

      const vibrationTime = time - vibrationStartTimeRef.current
      const vibrationDuration = 800 // 振動の持続時間（ミリ秒）

      if (vibrationTime < vibrationDuration) {
        // 振動の強さは時間とともに弱まる
        const intensity = 5 * (1 - vibrationTime / vibrationDuration)
        const frequency = 0.05 // 振動の頻度
        setVibrationOffset(Math.sin(vibrationTime * frequency) * intensity)
      } else {
        // 振動終了
        setVibrationOffset(0)
        onVibrationComplete()
        return
      }
    } else if (animationPhase === "final-move") {
      // 最終位置への移動
      if (actualStopIndex === null) return

      if (finalMoveStartTimeRef.current === undefined) {
        finalMoveStartTimeRef.current = time
      }

      const moveTime = time - finalMoveStartTimeRef.current
      const moveDuration = 1000 // 移動の持続時間（ミリ秒）

      if (moveTime < moveDuration && !finalMoveCompleteRef.current) {
        const startPosition = calculatePositionForIndex(fakeStopIndex)
        const targetPosition = calculatePositionForIndex(actualStopIndex)

        // 移動距離を計算
        let distance = targetPosition - startPosition
        const totalLength = items.length * itemHeight

        // ループを考慮して最短距離を計算
        if (Math.abs(distance) > totalLength / 2) {
          distance = distance > 0 ? distance - totalLength : distance + totalLength
        }

        // イージング関数を使用してスムーズな動きを実現
        const progress = moveTime / moveDuration
        const easeOutCubic = 1 - Math.pow(1 - progress, 3) // イージング関数

        // 現在の位置を計算
        const currentPosition = startPosition + distance * easeOutCubic
        setPosition(currentPosition)
      } else {
        // 移動完了
        setPosition(calculatePositionForIndex(actualStopIndex))
        finalMoveCompleteRef.current = true
        onFinalStop()
        return
      }
    } else if (animationPhase === "highlight") {
      // 強調表示のアニメーション
      setHighlightProgress((prev) => Math.min(prev + deltaTime * 0.001, 1))
    }

    requestRef.current = requestAnimationFrame(animate)
  }

  // Set up and clean up animation frame
  useEffect(() => {
    if (isSpinning) {
      requestRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isSpinning, animationPhase, speed, position, actualStopIndex])

  const startSlowingDown = () => {
    // 最初の停止位置に向けて減速開始
    const targetPosition = calculatePositionForIndex(fakeStopIndex)

    // 位置を調整して目標に近づける
    setPosition((prev) => {
      const adjustedPosition = prev % (items.length * itemHeight)
      let distanceToTarget = targetPosition - adjustedPosition

      // ループを考慮して最短距離を計算
      const totalLength = items.length * itemHeight
      if (Math.abs(distanceToTarget) > totalLength / 2) {
        distanceToTarget = distanceToTarget > 0 ? distanceToTarget - totalLength : distanceToTarget + totalLength
      }

      return prev + distanceToTarget
    })

    // アニメーションフェーズを更新
    setAnimationPhase("first-stop")
  }

  const calculatePositionForIndex = (index: number): number => {
    // 指定されたインデックスのアイテムが中央に来るように位置を計算
    return index * itemHeight
  }

  // 表示するアイテムを計算
  const getVisibleItems = () => {
    const visibleItems: { item: ThemeItem; position: number }[] = []
    const basePosition = position + vibrationOffset
    const halfCount = Math.floor(visibleCount / 2)

    // 中央のアイテムのインデックス
    const centerItemIndex = Math.floor(basePosition / itemHeight) % items.length

    // 中央のアイテムの前後のアイテムを追加
    for (let i = -halfCount; i <= halfCount; i++) {
      const index = (centerItemIndex + i + items.length * 2) % items.length
      const item = items[index]
      const itemPosition = (basePosition % itemHeight) + i * itemHeight
      visibleItems.push({ item, position: itemPosition })
    }

    return visibleItems
  }

  // 中央に表示されているアイテムのインデックスを取得
  const getCenterItemIndex = () => {
    const basePosition = position + vibrationOffset
    const index = Math.floor(basePosition / itemHeight) % items.length
    return (index + items.length) % items.length
  }

  const visibleItems = getVisibleItems()
  const centerIndex = getCenterItemIndex()
  const isHighlighting = animationPhase === "highlight" || animationPhase === "stopped"

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 500,
        height: containerHeight,
        position: "relative",
        overflow: "hidden",
        border: "4px solid",
        borderColor: "primary.main",
        borderRadius: 16,
        boxShadow: "0 0 30px rgba(79, 195, 247, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.3)",
        background: "linear-gradient(180deg, #0c223a 0%, #0a1929 100%)",
        zIndex: 1,
      }}
      ref={containerRef}
    >
      {/* 装飾的な背景パターン */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          pointerEvents: "none",
        }}
      />

      {/* Center indicator */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: itemHeight,
          transform: "translateY(-50%)",
          background:
            "linear-gradient(90deg, rgba(240, 98, 146, 0.1) 0%, rgba(79, 195, 247, 0.2) 50%, rgba(240, 98, 146, 0.1) 100%)",
          zIndex: 1,
          pointerEvents: "none",
          borderTop: "2px solid rgba(79, 195, 247, 0.3)",
          borderBottom: "2px solid rgba(79, 195, 247, 0.3)",
          opacity: isHighlighting ? 0 : 1,
          transition: "opacity 0.5s",
        }}
      />

      {/* Items container */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {visibleItems.map((visibleItem, index) => {
          const { item, position: itemPosition } = visibleItem
          const isSelected = actualStopIndex !== null && item.id === items[actualStopIndex].id
          const isCentered = Math.abs(itemPosition) < itemHeight / 2

          // 強調表示の計算
          const scale =
            isSelected && isHighlighting
              ? 1 + highlightProgress * 0.8 // 選択されたアイテムは最大1.8倍に拡大
              : 1

          const opacity =
            isHighlighting && !isSelected
              ? 1 - highlightProgress * 0.7 // 選択されていないアイテムは最小0.3の不透明度に
              : 1

          return (
            <Box
              key={index}
              sx={{
                height: itemHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                transition: "all 0.3s",
                transform: `translateY(${itemPosition}px)`,
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                background: isCentered
                  ? "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0) 100%)"
                  : "transparent",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  color: item.color, // 各テーマに固定の色を使用
                  transform: `scale(${scale})`,
                  opacity: opacity,
                  transition: isHighlighting ? "transform 0.5s, opacity 0.5s" : "none",
                  fontSize: isSelected && animationPhase === "stopped" ? "2rem" : undefined,
                  textShadow: isCentered
                    ? `0 0 10px ${item.color === "#4fc3f7" ? "rgba(79, 195, 247, 0.7)" : "rgba(240, 98, 146, 0.7)"}`
                    : "none",
                  letterSpacing: "1px",
                  padding: "0 20px",
                }}
              >
                {item.text}
              </Typography>
            </Box>
          )
        })}
      </Box>

      {/* 左側の装飾 */}
      <Box
        sx={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          height: "80%",
          width: 4,
          borderRadius: 2,
          background: "linear-gradient(to bottom, rgba(79, 195, 247, 0.5), rgba(240, 98, 146, 0.5))",
          opacity: 0.5,
          zIndex: 0,
        }}
      />

      {/* 右側の装飾 */}
      <Box
        sx={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          height: "80%",
          width: 4,
          borderRadius: 2,
          background: "linear-gradient(to bottom, rgba(240, 98, 146, 0.5), rgba(79, 195, 247, 0.5))",
          opacity: 0.5,
          zIndex: 0,
        }}
      />
    </Box>
  )
}

export default RouletteWheel
