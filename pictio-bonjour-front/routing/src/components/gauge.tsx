import { useState, useEffect } from "react";
import "./gauge.css";

const CuteGauge = ({ value, maxValue }: {value: number, maxValue: number}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setAnimatedValue((prev) => {
        if (prev < value) {
          return Math.min(prev + 1, value); // Increase value step-by-step
        } else if (prev > value) {
          return Math.max(prev - 1, value); // Decrease value step-by-step
        }
        return prev;
      });
      if (animatedValue !== value) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [value, animatedValue]);

  const percentage = (animatedValue / maxValue) * 100;

  return (
    <div id="gauge" className="gauge-container">
      <div className="gauge-bar">
        <div
          className="gauge-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: percentage > 80 ? "#FF6F61" : "#72C3DC",
          }}
        />
      </div>
    </div>
  );
};

export default CuteGauge;
