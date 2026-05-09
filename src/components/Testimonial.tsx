import { Quote } from "lucide-react";

interface Props {
  quote: string;
  name: string;
  role: string;
  city: string;
}

const Testimonial = ({ quote, name, role, city }: Props) => (
  <figure className="glass rounded-3xl p-7 h-full flex flex-col">
    <Quote className="h-5 w-5 text-gold mb-4" />
    <blockquote className="font-display italic text-lg leading-snug text-foreground/90 flex-1">
      « {quote} »
    </blockquote>
    <figcaption className="mt-5 pt-4 border-t border-border/40">
      <div className="text-sm font-medium">{name}</div>
      <div className="text-xs text-muted-foreground">{role} · {city}</div>
    </figcaption>
  </figure>
);

export default Testimonial;