import { useFloating, FloatingPortal, arrow, shift, offset } from '@floating-ui/react-dom-interactions'
import { useRef, useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  children: React.ReactNode
  renderPopover: React.ReactNode
  className?: string
  initialOpen?: boolean
}

export default function Popover({ children, className, renderPopover, initialOpen }: Props) {
  const [open, setOpen] = useState(initialOpen || false)
  const id = useId()
  const arrowRef = useRef<HTMLElement>(null)
  const { x, y, reference, floating, strategy, middlewareData } = useFloating({
    middleware: [offset(), shift(), arrow({ element: arrowRef })],
    placement: 'bottom-end',
  })
  const showPopover = () => {
    setOpen(true)
  }
  const hidePopover = () => {
    setOpen(false)
  }
  return (
    <div className={className} ref={reference} onMouseEnter={showPopover} onMouseLeave={hidePopover}>
      {children}
      <FloatingPortal id={id}>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={floating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                width: 'max-content',
                transformOrigin: `${middlewareData.arrow?.x}px top`,
              }}
              initial={{ opacity: 0, transform: 'scale(0)' }}
              animate={{ opacity: 1, transform: 'scale(1)' }}
              exit={{ opacity: 0, transform: 'scale(0)' }}
              transition={{ duration: 0.18 }}
            >
              <div className='relative cursor-pointer'>
                <span
                  ref={arrowRef}
                  className='absolute z-10 h-10 w-1 -translate-y-[90%] border-[11px] border-x-transparent border-b-white  border-t-transparent'
                  style={{
                    left: middlewareData.arrow?.x,
                    top: middlewareData.arrow?.y,
                  }}
                />

                {renderPopover}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </div>
  )
}
