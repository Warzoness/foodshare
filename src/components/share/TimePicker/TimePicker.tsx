"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./TimePicker.module.css";

interface TimePickerProps {
  value: string; // Format: "HH:mm" (24h)
  onChange: (value: string) => void;
  onClose: () => void;
}

const VN_TZ = "Asia/Ho_Chi_Minh";

function getCurrentTime(): { hour: number; minute: number } {
  const now = new Date();
  const vnTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: VN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  
  const [hour, minute] = vnTime.split(":").map(Number);
  return { hour, minute };
}

export default function TimePicker({ value, onChange, onClose }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Parse initial value (24h format)
  useEffect(() => {
    const [hourStr, minuteStr] = value.split(":").map(Number);
    setSelectedHour(hourStr);
    setSelectedMinute(minuteStr);
  }, [value]);

  // Generate hour options (0-23 for 24h format)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minute options (0-59, step 1)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  // Handle time change
  const handleTimeChange = (hour: number, minute: number) => {
    const newValue = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    onChange(newValue);
  };

  // Scroll to selected item (iOS-style with padding)
  const scrollToSelected = (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
    if (ref.current) {
      const itemHeight = 40; // Height of each item
      const padding = 80; // Top padding to center items
      const scrollTop = index * itemHeight;
      ref.current.scrollTop = scrollTop;
    }
  };

  // Initialize scroll positions
  useEffect(() => {
    setTimeout(() => {
      scrollToSelected(hourRef, selectedHour);
      scrollToSelected(minuteRef, selectedMinute);
    }, 100);
  }, []);

  // Handle scroll events to update selection
  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, type: "hour" | "minute") => {
    if (!ref.current) return;
    
    const scrollTop = ref.current.scrollTop;
    const itemHeight = 40;
    const index = Math.round(scrollTop / itemHeight);
    
    if (type === "hour") {
      const newHour = index;
      if (newHour >= 0 && newHour <= 23) {
        setSelectedHour(newHour);
        handleTimeChange(newHour, selectedMinute);
      }
    } else if (type === "minute") {
      const newMinute = index;
      if (newMinute >= 0 && newMinute <= 59) {
        setSelectedMinute(newMinute);
        handleTimeChange(selectedHour, newMinute);
      }
    }
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.cancelButton} onClick={onClose}>
            Hủy
          </button>
          <h3 className={styles.title}>Thời gian</h3>
          <button className={styles.doneButton} onClick={handleDone}>
            Xong
          </button>
        </div>
        
        <div className={styles.timePicker}>
          {/* Hour Column */}
          <div className={styles.column}>
            <div 
              ref={hourRef}
              className={styles.scrollContainer}
              onScroll={() => handleScroll(hourRef, "hour")}
            >
              {hourOptions.map((hour) => (
                <div 
                  key={hour}
                  className={`${styles.item} ${selectedHour === hour ? styles.selected : ""}`}
                >
                  {hour.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className={styles.separator}>:</div>

          {/* Minute Column */}
          <div className={styles.column}>
            <div 
              ref={minuteRef}
              className={styles.scrollContainer}
              onScroll={() => handleScroll(minuteRef, "minute")}
            >
              {minuteOptions.map((minute) => (
                <div 
                  key={minute}
                  className={`${styles.item} ${selectedMinute === minute ? styles.selected : ""}`}
                >
                  {minute.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* iOS-style Bottom Safe Area */}
        <div className={styles.bottomSafeArea}></div>
      </div>
    </div>
  );
}