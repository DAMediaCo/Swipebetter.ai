import { Button } from "@/components/ui/button";
import { Smile, Heart, Flame } from "lucide-react";

const tones = [
  { id: "flirty", label: "Flirty", icon: Heart, description: "Warm and romantic" },
  { id: "witty", label: "Witty", icon: Smile, description: "Fun and clever" },
  { id: "confident", label: "Confident", icon: Flame, description: "Bold and direct" },
];

interface TonePickerProps {
  selectedTone: string;
  onSelect: (tone: string) => void;
}

export function TonePicker({ selectedTone, onSelect }: TonePickerProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {tones.map((tone) => {
        const Icon = tone.icon;
        const isSelected = selectedTone === tone.id;
        return (
          <Button
            key={tone.id}
            variant={isSelected ? "default" : "outline"}
            onClick={() => onSelect(tone.id)}
            className="h-auto py-4 px-6 flex flex-col gap-1"
            data-testid={`button-tone-picker-${tone.id}`}
          >
            <Icon className={`w-6 h-6 ${isSelected ? "" : "text-muted-foreground"}`} />
            <span className="font-semibold">{tone.label}</span>
            <span className={`text-xs ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {tone.description}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
