import { useState, useEffect } from "react";
import { Star, Heart } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
}

const testimonials: Testimonial[] = [
  { quote: "I went from barely any matches to actual conversations in a day.", name: "Alex M." },
  { quote: "The bio rewrite felt like something I would say, just better.", name: "Jordan T." },
  { quote: "This saved me from overthinking every reply.", name: "Sam K." },
  { quote: "Way more useful than asking friends for advice.", name: "Chris L." },
  { quote: "I didn't expect the photo feedback to be this accurate.", name: "Taylor R." },
  { quote: "Finally understood why my profile wasn't working.", name: "Morgan P." },
  { quote: "Replies sounded natural, not AI-ish.", name: "Casey D." },
  { quote: "Worth the $9 instantly.", name: "Riley S." },
  { quote: "I matched with people I actually wanted to talk to.", name: "Jamie W." },
  { quote: "Simple, fast, and weirdly effective.", name: "Drew B." },
];

export function TestimonialsRotator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      timeoutId = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsTransitioning(false);
      }, 300);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  const current = testimonials[currentIndex];

  return (
    <div className="max-w-3xl mx-auto text-center space-y-6">
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-5 h-5 fill-primary text-primary" />
        ))}
      </div>
      
      <div className="min-h-[120px] flex items-center justify-center">
        <blockquote
          className={`text-xl md:text-2xl font-medium italic transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
          data-testid="text-testimonial-quote"
        >
          "{current.quote}"
        </blockquote>
      </div>
      
      <div
        className={`flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="font-semibold" data-testid="text-testimonial-name">{current.name}</p>
          <p className="text-sm text-muted-foreground">SwipeBetter User</p>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 pt-2">
        {testimonials.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
