import { useState, useEffect } from "react";
import { Clock, Calendar, Activity } from "lucide-react";

const LiveClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const date = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

  return (
    <div className="flex items-center gap-4 flex-wrap text-sm">
      <div className="flex items-center gap-1.5 text-foreground font-medium">
        <Clock className="h-4 w-4 text-primary" />
        <span className="tabular-nums">{time}</span>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{date}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
        <Activity className="h-3 w-3" />
        System Healthy
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Online
      </div>
    </div>
  );
};

export default LiveClock;
