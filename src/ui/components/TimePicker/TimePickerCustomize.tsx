import React, { useEffect, useState } from "react"
import { Modal } from "@/ui/components/Modal/Modal"
import { THEME } from "@/core/constants/theme"
import { ChevronUp, ChevronDown } from "lucide-react"
import { format24To12Hour } from "@/core/utils/comman"
import ReactDOM from "react-dom"

interface TimePickerCustomizeProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (time: string) => void
  value?: string
  title?: string
  confirmText?: string
}

const formatTime = (hour: string, minute: string) => `${hour}:${minute}`;

export const TimePickerCustomize: React.FC<TimePickerCustomizeProps> = ({
  isOpen,
  onClose,
  onConfirm,
  value = "",
  title = "",
  confirmText = "Save",
}) => {

  const theme = THEME

  const hour = value.split(":")[0].padStart(2, "0")
  const minute = value.split(":")[1].padStart(2, "0")

  const [h, setH] = useState(hour)
  const [m, setM] = useState(minute)

  useEffect(() => {

    setH(value.split(":")[0].padStart(2, "0"))
    setM(value.split(":")[1].padStart(2, "0"))

  }, [value, isOpen])

  const adjustHour = (delta: number) => {
    let num = Number(h)
    num = (num + delta + 24) % 24
    setH(num.toString().padStart(2, "0"))
  }

  const adjustMinute = (delta: number) => {
    let num = Number(m)
    num = ((num + delta) % 60 + 60) % 60
    setM(num.toString().padStart(2, "0"))
  }

  const handleConfirm = () => {
    onConfirm(formatTime(h, m))
  }

  const arrow: React.CSSProperties = {
    cursor: "pointer",
    padding: 2,
    color: '#454545'
  }

  const modalContent = (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleConfirm()
      }}
      title={title}
      saveText={confirmText}
      size="sm"
    >
      <div style={{ padding: 6 }}>
        <div
          style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 6, fontWeight: 500, color: theme.colors.textSecondary }}
        >
          <span>Hours</span>
          <span>Minutes</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, padding: 6, borderRadius: theme.borderRadius.md, boxShadow: "0 0 10px 0 #BFBFBF40" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, }}>

            <button type="button" style={arrow} onClick={() => adjustHour(1)}>
              <ChevronUp size={26} />
            </button>

            <input
              type="text"
              inputMode="numeric"
              value={h}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                let num = Math.min(23, Math.max(0, Number(value)));
                setH(String(num).padStart(2, "0"));
              }}
              style={{ fontSize: 22, color: '#454545', border: 'none', outline: 'none', width: '60px', textAlign: 'center' }}
            />
            <button type="button" style={arrow} onClick={() => adjustHour(-1)}>
              <ChevronDown size={26} />
            </button>

          </div>
          :
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, }}>
            <button type="button" style={arrow} onClick={() => adjustMinute(1)}>
              <ChevronUp size={26} />
            </button>

            <input
              type="text"
              inputMode="numeric"
              value={m}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                let num = Math.min(59, Math.max(0, Number(value)));
                setM(String(num).padStart(2, "0"));
              }}
              style={{ fontSize: 22, color: '#454545', border: 'none', outline: 'none', width: '60px', textAlign: 'center' }}
            />
            <button type="button" style={arrow} onClick={() => adjustMinute(-1)}>
              <ChevronDown size={26} />
            </button>

          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 2, fontWeight: 500 }}>
        Selected Time : {format24To12Hour(h, m)}
      </div>

    </Modal>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}