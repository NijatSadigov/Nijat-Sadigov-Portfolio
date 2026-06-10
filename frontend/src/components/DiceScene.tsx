import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export type DiceDir = 'up' | 'down' | 'left' | 'right' | 'down-left' | 'down-right'

// The rotation the new face starts from before it rolls into place.
function enterRotation(dir: DiceDir) {
  let rotateX = 0
  let rotateY = 0
  if (dir.includes('down')) rotateX = -90
  if (dir === 'up') rotateX = 90
  if (dir.includes('left')) rotateY = 90
  if (dir.includes('right')) rotateY = -90
  return { rotateX, rotateY }
}

/**
 * Rolls its children in like a face of a die whenever `sceneKey` changes.
 * Uses a key-remount (no AnimatePresence) so it can't deadlock on an exit
 * animation — every profile switch mounts a fresh face that rotates into view.
 */
export default function DiceScene({
  sceneKey,
  direction,
  children,
}: {
  sceneKey: string
  direction: DiceDir
  children: ReactNode
}) {
  return (
    <div className="scene">
      <motion.div
        key={sceneKey}
        initial={{ opacity: 0, ...enterRotation(direction) }}
        animate={{ opacity: 1, rotateX: 0, rotateY: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
      >
        {children}
      </motion.div>
    </div>
  )
}
